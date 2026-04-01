// file: blockchain/scripts/deploy.ts (UPDATED)

import { ethers } from "hardhat";

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    // Deploy LandRegistry
    const LandRegistry = await ethers.getContractFactory("LandRegistry");
    const landRegistry = await LandRegistry.deploy();
    await landRegistry.waitForDeployment();
    const landRegistryAddress = await landRegistry.getAddress();
    console.log("LandRegistry deployed to:", landRegistryAddress);

    // Deploy Acquisition
    const Acquisition = await ethers.getContractFactory("Acquisition");
    const acquisition = await Acquisition.deploy(landRegistryAddress);
    await acquisition.waitForDeployment();
    const acquisitionAddress = await acquisition.getAddress();
    console.log("Acquisition deployed to:", acquisitionAddress);

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();
    const escrowAddress = await escrow.getAddress();
    console.log("Escrow deployed to:", escrowAddress);

    console.log("\nAdd these to your .env file:");
    console.log(`NEXT_PUBLIC_LAND_REGISTRY_ADDRESS=${landRegistryAddress}`);
    console.log(`NEXT_PUBLIC_ACQUISITION_ADDRESS=${acquisitionAddress}`);
    console.log(`NEXT_PUBLIC_ESCROW_ADDRESS=${escrowAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});