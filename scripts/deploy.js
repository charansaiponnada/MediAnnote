const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);

    // 1. Deploy MockUSDC
    const MockUSDC = await ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("MockUSDC deployed to:", usdcAddress);

    // 2. Deploy AnnotationEscrow
    const treasury = deployer.address; // Use deployer as treasury for MVP
    const AnnotationEscrow = await ethers.getContractFactory("AnnotationEscrow");
    const escrow = await AnnotationEscrow.deploy(usdcAddress, treasury);
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("AnnotationEscrow deployed to:", escrowAddress);

    // 3. Deploy DoctorSBT
    const DoctorSBT = await ethers.getContractFactory("DoctorSBT");
    const sbt = await DoctorSBT.deploy();
    await sbt.waitForDeployment();
    const sbtAddress = await sbt.getAddress();
    console.log("DoctorSBT deployed to:", sbtAddress);

    // Mint 1,000,000 USDC to deployer for testing
    const mintAmount = ethers.parseUnits("1000000", 6);
    await usdc.mint(deployer.address, mintAmount);
    console.log("Minted 1,000,000 USDC to deployer");

    // Save deployment info
    const deployments = {
        network: "localhost",
        deployer: deployer.address,
        contracts: {
            MockUSDC: {
                address: usdcAddress,
                abi: "MockUSDC.json",
            },
            AnnotationEscrow: {
                address: escrowAddress,
                abi: "AnnotationEscrow.json",
            },
            DoctorSBT: {
                address: sbtAddress,
                abi: "DoctorSBT.json",
            },
        },
    };

    // Write deployments.json
    const deploymentsPath = path.join(__dirname, "..", "contracts", "deployments.json");
    fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
    console.log("Deployments saved to contracts/deployments.json");

    // Copy ABIs
    const abisDir = path.join(__dirname, "..", "contracts", "abis");
    if (!fs.existsSync(abisDir)) {
        fs.mkdirSync(abisDir, { recursive: true });
    }

    const contractNames = ["MockUSDC", "AnnotationEscrow", "DoctorSBT"];
    for (const name of contractNames) {
        const artifactPath = path.join(
            __dirname,
            "..",
            "contracts",
            "artifacts",
            "contracts",
            `${name}.sol`,
            `${name}.json`
        );
        if (fs.existsSync(artifactPath)) {
            const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
            fs.writeFileSync(
                path.join(abisDir, `${name}.json`),
                JSON.stringify(artifact.abi, null, 2)
            );
            console.log(`ABI saved: ${name}.json`);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
