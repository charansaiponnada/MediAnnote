// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

/**
 * @title DoctorSBT (Soulbound Token)
 * @dev Non-transferable ERC-721 representing a verified doctor's on-chain identity.
 *      Stores specialty, tier, reputation score, and annotation count as on-chain metadata.
 */
contract DoctorSBT is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _nextTokenId = 1;

    struct DoctorProfile {
        string specialty;
        uint8 tier;              // 0=Bronze, 1=Silver, 2=Gold, 3=Platinum
        uint256 reputationScore; // 0-100
        uint256 annotationCount;
    }

    mapping(uint256 => DoctorProfile) public profiles;
    mapping(address => uint256) public doctorToToken;

    event DoctorMinted(
        uint256 indexed tokenId,
        address indexed doctor,
        string specialty,
        uint8 tier,
        uint256 timestamp
    );

    event ReputationUpdated(
        uint256 indexed tokenId,
        uint256 oldScore,
        uint256 newScore,
        uint256 timestamp
    );

    constructor() ERC721("MediAnnote Doctor SBT", "MEDSBT") Ownable(msg.sender) {}

    /**
     * @notice Soulbound: block all transfers except minting (from == address(0))
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0)) {
            revert("SBT: non-transferable");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @notice Mint a new SBT to a verified doctor
     * @param doctor Wallet address of the doctor
     * @param specialty e.g. "Radiology", "Pathology"
     * @param tier Initial tier (0-3)
     */
    function mint(
        address doctor,
        string calldata specialty,
        uint8 tier
    ) external onlyOwner returns (uint256) {
        require(doctorToToken[doctor] == 0, "Doctor already has SBT");
        require(tier <= 3, "Invalid tier");

        uint256 tokenId = _nextTokenId++;
        _safeMint(doctor, tokenId);

        profiles[tokenId] = DoctorProfile({
            specialty: specialty,
            tier: tier,
            reputationScore: 50, // Start at 50
            annotationCount: 0
        });

        doctorToToken[doctor] = tokenId;

        emit DoctorMinted(tokenId, doctor, specialty, tier, block.timestamp);
        return tokenId;
    }

    /**
     * @notice Update doctor's reputation score and annotation count
     */
    function updateReputation(
        uint256 tokenId,
        uint256 newScore,
        uint256 newAnnotationCount
    ) external onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        require(newScore <= 100, "Score out of range");

        uint256 oldScore = profiles[tokenId].reputationScore;
        profiles[tokenId].reputationScore = newScore;
        profiles[tokenId].annotationCount = newAnnotationCount;

        // Auto-update tier based on score
        if (newScore >= 90) {
            profiles[tokenId].tier = 3; // Platinum
        } else if (newScore >= 80) {
            profiles[tokenId].tier = 2; // Gold
        } else if (newScore >= 60) {
            profiles[tokenId].tier = 1; // Silver
        } else {
            profiles[tokenId].tier = 0; // Bronze
        }

        emit ReputationUpdated(tokenId, oldScore, newScore, block.timestamp);
    }

    /**
     * @notice Returns fully on-chain JSON metadata
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");

        DoctorProfile memory profile = profiles[tokenId];

        string memory tierName;
        if (profile.tier == 0) tierName = "Bronze";
        else if (profile.tier == 1) tierName = "Silver";
        else if (profile.tier == 2) tierName = "Gold";
        else tierName = "Platinum";

        string memory json = string(abi.encodePacked(
            '{"name":"MediAnnote Doctor #', tokenId.toString(),
            '","description":"Verified Medical Annotator Soulbound Token",',
            '"attributes":[',
            '{"trait_type":"Specialty","value":"', profile.specialty, '"},',
            '{"trait_type":"Tier","value":"', tierName, '"},',
            '{"trait_type":"Reputation Score","value":', profile.reputationScore.toString(), '},',
            '{"trait_type":"Annotation Count","value":', profile.annotationCount.toString(), '}',
            ']}'
        ));

        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(json))
        ));
    }

    /**
     * @notice Get profile by doctor address
     */
    function getProfileByAddress(address doctor) external view returns (DoctorProfile memory) {
        uint256 tokenId = doctorToToken[doctor];
        require(tokenId != 0, "Doctor has no SBT");
        return profiles[tokenId];
    }
}
