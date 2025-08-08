const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
    console.log("Starting Enhanced Chama deployment...");

    // Get signers
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());

    // Platform configuration
    const platformConfig = {
        groupCreationFee: ethers.utils.parseEther("0.01"), // 0.01 ETH fee to create group
        minGroupSize: 3,
        maxGroupSize: 50,
        platformFeePercentage: 500, // 5% platform fee
        platformTreasury: deployer.address, // Use deployer as treasury for now
        requiresApproval: false // Set to true for moderated platform
    };

    console.log("Platform Configuration:");
    console.log("- Group Creation Fee:", ethers.utils.formatEther(platformConfig.groupCreationFee), "ETH");
    console.log("- Min Group Size:", platformConfig.minGroupSize);
    console.log("- Max Group Size:", platformConfig.maxGroupSize);
    console.log("- Platform Fee:", platformConfig.platformFeePercentage / 100, "%");
    console.log("- Platform Treasury:", platformConfig.platformTreasury);
    console.log("- Requires Approval:", platformConfig.requiresApproval);

    // Deploy ChamaGroupFactory
    console.log("\nDeploying ChamaGroupFactory...");
    const ChamaGroupFactory = await ethers.getContractFactory("ChamaGroupFactory");
    const factory = await ChamaGroupFactory.deploy(platformConfig);
    await factory.deployed();

    console.log("ChamaGroupFactory deployed to:", factory.address);
    console.log("Transaction hash:", factory.deployTransaction.hash);

    // Wait for confirmation
    console.log("Waiting for confirmation...");
    await factory.deployTransaction.wait(1);

    // Create a sample group for testing
    console.log("\nCreating sample group for testing...");
    
    const sampleGroupConfig = {
        name: "Sample Chama Group",
        description: "A sample rotating savings group for testing",
        contributionAmount: ethers.utils.parseEther("0.1"), // 0.1 ETH per contribution
        contributionFrequency: 30 * 24 * 60 * 60, // 30 days in seconds
        maxMembers: 10,
        lateFeePercentage: 1000, // 10% late fee
        gracePeriod: 7 * 24 * 60 * 60, // 7 days grace period
        platformFeePercentage: platformConfig.platformFeePercentage,
        isActive: true,
        requiresKYC: false
    };

    console.log("Sample Group Configuration:");
    console.log("- Name:", sampleGroupConfig.name);
    console.log("- Contribution Amount:", ethers.utils.formatEther(sampleGroupConfig.contributionAmount), "ETH");
    console.log("- Frequency:", sampleGroupConfig.contributionFrequency / (24 * 60 * 60), "days");
    console.log("- Max Members:", sampleGroupConfig.maxMembers);
    console.log("- Late Fee:", sampleGroupConfig.lateFeePercentage / 100, "%");

    const createGroupTx = await factory.createGroup(
        sampleGroupConfig,
        sampleGroupConfig.name,
        sampleGroupConfig.description,
        { value: platformConfig.groupCreationFee }
    );

    const receipt = await createGroupTx.wait();
    
    // Find the GroupCreated event
    const groupCreatedEvent = receipt.events?.find(e => e.event === 'GroupCreated');
    if (groupCreatedEvent) {
        const groupAddress = groupCreatedEvent.args.groupAddress;
        console.log("Sample group created at:", groupAddress);
        
        // Get the group contract instance
        const EnhancedChamaGroup = await ethers.getContractFactory("EnhancedChamaGroup");
        const sampleGroup = EnhancedChamaGroup.attach(groupAddress);
        
        console.log("Sample group contract accessible at:", sampleGroup.address);
    }

    // Verify deployment
    console.log("\nVerifying deployment...");
    const totalGroups = await factory.totalGroups();
    const activeGroups = await factory.activeGroups();
    
    console.log("Total groups created:", totalGroups.toString());
    console.log("Active groups:", activeGroups.toString());

    // Save deployment information
    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        factory: factory.address,
        platformConfig,
        sampleGroup: groupCreatedEvent?.args.groupAddress || "Not created",
        deploymentTime: new Date().toISOString(),
        blockNumber: receipt.blockNumber
    };

    console.log("\n=== DEPLOYMENT COMPLETE ===");
    console.log("Network:", hre.network.name);
    console.log("Factory Address:", factory.address);
    console.log("Sample Group Address:", deploymentInfo.sampleGroup);
    console.log("Block Number:", receipt.blockNumber);
    
    // Return deployment info for further use
    return deploymentInfo;
}

// Error handling
main()
    .then((deploymentInfo) => {
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log(JSON.stringify(deploymentInfo, null, 2));
        process.exit(0);
    })
    .catch((error) => {
        console.error("Deployment failed:");
        console.error(error);
        process.exit(1);
    });

module.exports = main;
