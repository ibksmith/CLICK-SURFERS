const hre = require("hardhat");

async function main() {
  console.log("Deploying ClickRaceGame and BuilderCodeRegistry to Base Network...");
  
  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Deploy the BuilderCodeRegistry contract first
  const BuilderCodeRegistry = await hre.ethers.getContractFactory("BuilderCodeRegistry");
  console.log("Deploying BuilderCodeRegistry contract...");
  
  const registry = await BuilderCodeRegistry.deploy();
  await registry.waitForDeployment();
  
  const registryAddress = await registry.getAddress();
  console.log("✅ BuilderCodeRegistry deployed to:", registryAddress);
  
  // Deploy the main contract
  const ClickRaceGame = await hre.ethers.getContractFactory("ClickRaceGame");
  console.log("Deploying ClickRaceGame contract...");
  
  const game = await ClickRaceGame.deploy(registryAddress);
  await game.waitForDeployment();
  
  const contractAddress = await game.getAddress();
  console.log("✅ ClickRaceGame deployed to:", contractAddress);
  console.log("Platform wallet:", deployer.address);
  
  // Deploy the messaging contract
  const ClickRaceGameWithMessaging = await hre.ethers.getContractFactory("ClickRaceGameWithMessaging");
  console.log("Deploying ClickRaceGameWithMessaging contract...");
  
  const messaging = await ClickRaceGameWithMessaging.deploy(contractAddress);
  await messaging.waitForDeployment();
  
  const messagingAddress = await messaging.getAddress();
  console.log("✅ ClickRaceGameWithMessaging deployed to:", messagingAddress);
  
  // Display network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId);
  
  // Display deployment info
  console.log("\n📋 Deployment Summary:");
  console.log("======================");
  console.log("BuilderCodeRegistry Address:", registryAddress);
  console.log("ClickRaceGame Address:", contractAddress);
  console.log("ClickRaceGameWithMessaging Address:", messagingAddress);
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
  await messaging.deploymentTransaction().wait(3);
  await registry.deploymentTransaction().wait(3);
  console.log("✅ Confirmed!");
  
  // Verify contracts on BaseScan (if API key is set)
  if (process.env.BASESCAN_API_KEY) {
    console.log("\nVerifying contracts on BaseScan...");
    try {
      await hre.run("verify:verify", {
        address: registryAddress,
        constructorArguments: [],
      });
      console.log("✅ BuilderCodeRegistry verified!");
      
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [registryAddress],
      });
      console.log("✅ ClickRaceGame verified!");
      
      await hre.run("verify:verify", {
        address: messagingAddress,
        constructorArguments: [contractAddress],
      });
      console.log("✅ ClickRaceGameWithMessaging verified!");
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
