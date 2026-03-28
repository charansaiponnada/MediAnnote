// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AnnotationEscrow
 * @dev Holds USDC in escrow for annotation batches and releases to annotators 
 *      minus a 10% platform fee.
 */
contract AnnotationEscrow is Ownable, ReentrancyGuard {
    IERC20 public paymentToken; // Mock USDC
    address public treasury;
    uint256 public platformFeeBps = 1000; // 10% = 1000 bps

    struct Batch {
        address company;
        uint256 totalAmount;
        address[] annotators;
        bool released;
        bool exists;
    }

    mapping(bytes32 => Batch) public batches;
    mapping(bytes32 => bytes32[]) public annotationHashes; // batchId => array of hashes

    event FundsDeposited(
        bytes32 indexed batchId,
        address indexed company,
        uint256 amount,
        address[] annotators,
        uint256 timestamp
    );

    event FundsReleased(
        bytes32 indexed batchId,
        uint256 amountPerAnnotator,
        uint256 platformFee,
        uint256 timestamp
    );

    event AnnotationRecorded(
        bytes32 indexed batchId,
        address indexed annotator,
        bytes32 annotationHash,
        uint256 timestamp
    );

    constructor(
        address _paymentToken,
        address _treasury
    ) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
        treasury = _treasury;
    }

    /**
     * @notice Company deposits funds for a batch of annotations
     * @param batchId Unique batch identifier
     * @param amount Total USDC amount to deposit (must be pre-approved)
     */
    function deposit(
        bytes32 batchId,
        uint256 amount
    ) external {
        require(!batches[batchId].exists, "Batch already exists");
        require(amount > 0, "Amount must be > 0");

        // Transfer USDC from company to this contract
        require(
            paymentToken.transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );

        batches[batchId] = Batch({
            company: msg.sender,
            totalAmount: amount,
            annotators: new address[](0),
            released: false,
            exists: true
        });

        emit FundsDeposited(batchId, msg.sender, amount, new address[](0), block.timestamp);
    }

    /**
     * @notice Release payment for a batch — splits funds equally to annotators minus 10% platform fee
     * @param batchId Batch to release
     * @param annotators Final list of annotators to distribute funds to
     */
    function releasePayment(bytes32 batchId, address[] calldata annotators) external nonReentrant {
        Batch storage batch = batches[batchId];
        require(batch.exists, "Batch does not exist");
        require(msg.sender == batch.company, "Only the company that deposited can release funds");
        require(!batch.released, "Already released");
        require(annotators.length > 0, "Need at least one annotator");

        batch.released = true;
        batch.annotators = annotators;

        uint256 totalAmount = batch.totalAmount;
        uint256 fee = (totalAmount * platformFeeBps) / 10000;
        uint256 distributable = totalAmount - fee;
        uint256 perAnnotator = distributable / annotators.length;

        // Send platform fee to treasury
        require(
            paymentToken.transfer(treasury, fee),
            "Fee transfer failed"
        );

        // Distribute to each annotator
        for (uint256 i = 0; i < batch.annotators.length; i++) {
            require(
                paymentToken.transfer(batch.annotators[i], perAnnotator),
                "Annotator transfer failed"
            );
        }

        emit FundsReleased(batchId, perAnnotator, fee, block.timestamp);
    }

    /**
     * @notice Record an annotation hash on-chain for auditability
     * @param batchId Associated batch
     * @param annotationHash SHA-256 hash of the annotation JSON
     */
    function recordAnnotation(
        bytes32 batchId,
        bytes32 annotationHash
    ) external {
        require(batches[batchId].exists, "Batch does not exist");
        annotationHashes[batchId].push(annotationHash);

        emit AnnotationRecorded(batchId, msg.sender, annotationHash, block.timestamp);
    }

    // View helpers
    function getBatchAnnotators(bytes32 batchId) external view returns (address[] memory) {
        return batches[batchId].annotators;
    }

    function getAnnotationHashes(bytes32 batchId) external view returns (bytes32[] memory) {
        return annotationHashes[batchId];
    }

    function isBatchFunded(bytes32 batchId) external view returns (bool) {
        return batches[batchId].exists && !batches[batchId].released;
    }
}
