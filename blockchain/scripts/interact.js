const { ethers } = require("hardhat");

async function main() {
    console.log("=== Enhanced Chama Contract Interaction Script ===\n");

    // Get signers
    const [deployer, user1, user2, user3, user4] = await ethers.getSigners();
    console.log("Available accounts:");
    console.log("Deployer (Admin):", deployer.address);
    console.log("User 1:", user1.address);
    console.log("User 2:", user2.address);
    console.log("User 3:", user3.address);
    console.log("User 4:", user4.address);

    // Deploy factory first
    console.log("\n1. Deploying Factory Contract...");
    const platformConfig = {
        groupCreationFee: ethers.utils.parseEther("0.01"),
        minGroupSize: 3,
        maxGroupSize: 50,
        platformFeePercentage: 500, // 5%
        platformTreasury: deployer.address,
        requiresApproval: false
    };

    const ChamaGroupFactory = await ethers.getContractFactory("ChamaGroupFactory");
    const factory = await ChamaGroupFactory.deploy(platformConfig);
    await factory.deployed();
    console.log("Factory deployed at:", factory.address);

    // Create a test group
    console.log("\n2. Creating Test Group...");
    
    // First approve user1 as a creator (only deployer can approve)
    console.log("Approving user1 as group creator...");
    await factory.connect(deployer).approveCreator(user1.address);
    console.log("User1 approved as creator");
    
    const groupConfig = {
        name: "Test Chama Group",
        description: "Test group for demonstration",
        contributionAmount: ethers.utils.parseEther("0.05"), // 0.05 ETH
        contributionFrequency: 60, // 1 minute for testing
        maxMembers: 5,
        lateFeePercentage: 1000, // 10%
        gracePeriod: 30, // 30 seconds for testing
        platformFeePercentage: 500,
        isActive: true,
        requiresKYC: false
    };

    const createTx = await factory.connect(user1).createGroup(
        groupConfig,
        groupConfig.name,
        groupConfig.description,
        { value: platformConfig.groupCreationFee }
    );
    const receipt = await createTx.wait();
    
    const groupCreatedEvent = receipt.events?.find(e => e.event === 'GroupCreated');
    const groupAddress = groupCreatedEvent.args.groupAddress;
    console.log("Group created at:", groupAddress);

    // Get group contract instance
    const EnhancedChamaGroup = await ethers.getContractFactory("EnhancedChamaGroup");
    const group = EnhancedChamaGroup.attach(groupAddress);

    // Add members to the group
    console.log("\n3. Adding Members to Group...");
    
    // User1 is already admin, add other members
    await group.connect(user1).addMember(user2.address, "Alice", true);
    console.log("Added Alice (user2) to group");
    
    await group.connect(user1).addMember(user3.address, "Bob", true);
    console.log("Added Bob (user3) to group");
    
    await group.connect(user1).addMember(user4.address, "Charlie", true);
    console.log("Added Charlie (user4) to group");

    // Assign roles
    console.log("\n4. Assigning Roles...");
    const TREASURER_ROLE = await group.TREASURER_ROLE();
    const SECRETARY_ROLE = await group.SECRETARY_ROLE();
    
    await group.connect(user1).assignRole(user2.address, TREASURER_ROLE);
    console.log("Assigned Treasurer role to Alice");
    
    await group.connect(user1).assignRole(user3.address, SECRETARY_ROLE);
    console.log("Assigned Secretary role to Bob");

    // Start first cycle
    console.log("\n5. Starting First Cycle...");
    await group.connect(user2).startNewCycle(); // Treasurer starts cycle
    console.log("First cycle started");
    
    const currentCycle = await group.currentCycle();
    const cycleInfo = await group.getCycleInfo(currentCycle);
    console.log("Current cycle:", currentCycle.toString());
    console.log("Cycle recipient:", cycleInfo.recipient);

    // Make contributions
    console.log("\n6. Making Contributions...");
    const contributionAmount = await group.groupConfig().then(config => config.contributionAmount);
    
    console.log(`Contribution amount: ${ethers.utils.formatEther(contributionAmount)} ETH`);
    
    // Each member makes contribution
    console.log("User1 making contribution...");
    await group.connect(user1).makeContribution({ value: contributionAmount });
    
    console.log("User2 making contribution...");
    await group.connect(user2).makeContribution({ value: contributionAmount });
    
    console.log("User3 making contribution...");
    await group.connect(user3).makeContribution({ value: contributionAmount });
    
    console.log("User4 making contribution...");
    await group.connect(user4).makeContribution({ value: contributionAmount });

    // Check cycle completion
    console.log("\n7. Checking Cycle Status...");
    const updatedCycleInfo = await group.getCycleInfo(currentCycle);
    console.log("Cycle completed:", updatedCycleInfo.isCompleted);
    console.log("Total amount collected:", ethers.utils.formatEther(updatedCycleInfo.totalAmount));
    console.log("Payout amount:", ethers.utils.formatEther(updatedCycleInfo.payoutAmount));

    // Process payout
    if (updatedCycleInfo.isCompleted && !updatedCycleInfo.isPaidOut) {
        console.log("\n8. Processing Payout...");
        const recipientBalanceBefore = await ethers.provider.getBalance(updatedCycleInfo.recipient);
        console.log("Recipient balance before payout:", ethers.utils.formatEther(recipientBalanceBefore));
        
        await group.connect(user2).processPayout(currentCycle); // Treasurer processes payout
        
        const recipientBalanceAfter = await ethers.provider.getBalance(updatedCycleInfo.recipient);
        console.log("Recipient balance after payout:", ethers.utils.formatEther(recipientBalanceAfter));
        console.log("Payout processed successfully!");
    }

    // Get member performance
    console.log("\n9. Member Performance Summary...");
    const members = await group.getAllMembers();
    for (let i = 0; i < members.length; i++) {
        const memberInfo = await group.getMemberInfo(members[i]);
        console.log(`\nMember: ${memberInfo.name} (${members[i]})`);
        console.log(`- Contributions Made: ${memberInfo.contributionsMade}`);
        console.log(`- Total Contributed: ${ethers.utils.formatEther(memberInfo.totalContributed)} ETH`);
        console.log(`- Performance Score: ${memberInfo.performanceScore / 100}%`);
        console.log(`- Missed Payments: ${memberInfo.missedPayments}`);
    }

    // Get group statistics
    console.log("\n10. Group Statistics...");
    const groupStats = await group.getGroupStats();
    console.log("Total members:", groupStats._memberCount.toString());
    console.log("Current cycle:", groupStats._currentCycle.toString());
    console.log("Total contributions:", ethers.utils.formatEther(groupStats._totalContributions));
    console.log("Total payouts:", ethers.utils.formatEther(groupStats._totalPayouts));
    console.log("Contract balance:", ethers.utils.formatEther(groupStats._contractBalance));

    // Test late fee scenario
    console.log("\n11. Testing Late Fee Scenario...");
    await group.connect(user2).startNewCycle();
    const newCycleNumber = await group.currentCycle();
    console.log("Started cycle:", newCycleNumber.toString());
    
    // Wait for cycle to expire (in real scenario, this would be much longer)
    console.log("Waiting for cycle to expire...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    
    // Make a late contribution
    const lateContributionAmount = contributionAmount.add(
        contributionAmount.mul(1000).div(10000) // Add 10% late fee
    );
    
    console.log("Making late contribution with fee...");
    console.log("Late contribution amount:", ethers.utils.formatEther(lateContributionAmount));
    await group.connect(user1).makeContribution({ value: lateContributionAmount });
    
    const lateMemberInfo = await group.getMemberInfo(user1.address);
    console.log("Updated performance score after late payment:", lateMemberInfo.performanceScore / 100, "%");

    console.log("\n=== Interaction Script Completed Successfully ===");
    
    return {
        factory: factory.address,
        group: groupAddress,
        members: members.length,
        cyclesCompleted: currentCycle.toString()
    };
}

main()
    .then((result) => {
        console.log("\n=== FINAL SUMMARY ===");
        console.log("Factory Address:", result.factory);
        console.log("Group Address:", result.group);
        console.log("Total Members:", result.members);
        console.log("Cycles Completed:", result.cyclesCompleted);
        process.exit(0);
    })
    .catch((error) => {
        console.error("Error in interaction script:");
        console.error(error);
        process.exit(1);
    });
