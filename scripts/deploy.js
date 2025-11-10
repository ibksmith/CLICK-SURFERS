const hre = require("hardhat");

async function main() {
  console.log("Deploying ClickRaceGame to Base Network...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy the contract
  const ClickRaceGame = await hre.ethers.getContractFactory("ClickRaceGame");
  console.log("Deploying contract...");
  
  const game = await ClickRaceGame.deploy();
  await game.waitForDeployment();
  
  const contractAddress = await game.getAddress();
  console.log("✅ ClickRaceGame deployed to:", contractAddress);
  console.log("Platform wallet:", deployer.address);
  
  // Display network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  
  // Display deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.chainId === 8453n ? "Base Mainnet" : 
                       network.chainId === 84532n ? "Base Sepolia Testnet" :
                       network.chainId === 84531n ? "Base Goerli Testnet" : "Unknown");
  console.log("Block Explorer:", 
    network.chainId === 8453n ? `https://basescan.org/address/${contractAddress}` :
    network.chainId === 84532n ? `https://sepolia.basescan.org/address/${contractAddress}` :
    network.chainId === 84531n ? `https://goerli.basescan.org/address/${contractAddress}` :
    "N/A");
  
  console.log("\n⚠️  IMPORTANT: Update contract-integration.js with this address:");
  console.log(`const CONTRACT_ADDRESS = '${contractAddress}';`);
  
  // Wait for block confirmations (Base is fast!)
  console.log("\nWaiting for 3 block confirmations...");
  await game.deploymentTransaction().wait(3);
  console.log("✅ Confirmed!");
  
  // Verify contract on BaseScan (if API key is set)
  if (process.env.BASESCAN_API_KEY) {
    console.log("\nVerifying contract on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
