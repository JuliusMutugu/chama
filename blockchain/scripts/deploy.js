const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying ChamaContract...");

  // Get the contract factory
  const ChamaContract = await ethers.getContractFactory("ChamaContract");

  // Deploy parameters
  const contributionAmount = ethers.utils.parseEther("0.1"); // 0.1 ETH
  const cycleDuration = 7 * 24 * 60 * 60; // 7 days in seconds
  const memberAddresses = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Example addresses
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
  ];
  const platformWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Platform fee wallet

  // Deploy the contract
  const chamaContract = await ChamaContract.deploy(
    contributionAmount,
    cycleDuration,
    memberAddresses,
    platformWallet
  );

  await chamaContract.deployed();

  console.log("ChamaContract deployed to:", chamaContract.address);
  console.log("Transaction hash:", chamaContract.deployTransaction.hash);

  // Verify deployment
  console.log("Verifying deployment...");
  const totalMembers = await chamaContract.totalMembers();
  const contributionAmt = await chamaContract.contributionAmount();
  
  console.log("Total members:", totalMembers.toString());
  console.log("Contribution amount:", ethers.utils.formatEther(contributionAmt), "ETH");

  // Save deployment info
  const deploymentInfo = {
    address: chamaContract.address,
    transactionHash: chamaContract.deployTransaction.hash,
    contributionAmount: ethers.utils.formatEther(contributionAmt),
    cycleDuration: cycleDuration,
    totalMembers: totalMembers.toString(),
    memberAddresses: memberAddresses,
    platformWallet: platformWallet
  };

  console.log("\nDeployment completed successfully!");
  console.log("Deployment info:", JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
