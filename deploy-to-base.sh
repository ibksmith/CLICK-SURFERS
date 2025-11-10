#!/bin/bash

# Click Race Game - Base Network Deployment Script
# This script helps deploy the game to Base network

echo "🏁 Click Race: Hover Boarders - Base Network Deployment"
echo "========================================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found!"
    echo "Creating from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "📝 Please edit .env file and add your:"
    echo "   - PRIVATE_KEY (without 0x prefix)"
    echo "   - BASESCAN_API_KEY (optional, for verification)"
    echo ""
    read -p "Press Enter after updating .env file..."
fi

echo ""
echo "Select deployment network:"
echo "1) Base Sepolia Testnet (Recommended for testing)"
echo "2) Base Mainnet (Production)"
echo "3) Local Hardhat Network (Development)"
read -p "Enter choice (1-3): " network_choice

case $network_choice in
    1)
        NETWORK="baseSepolia"
        echo "🧪 Deploying to Base Sepolia Testnet"
        echo "Get test ETH: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet"
        ;;
    2)
        NETWORK="base"
        echo "🚀 Deploying to Base Mainnet"
        read -p "⚠️  This will use real ETH. Continue? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            echo "Deployment cancelled"
            exit 0
        fi
        ;;
    3)
        NETWORK="hardhat"
        echo "💻 Deploying to Local Hardhat Network"
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🔨 Compiling contracts..."
npx hardhat compile

if [ $? -ne 0 ]; then
    echo "❌ Compilation failed!"
    exit 1
fi

echo ""
echo "🚀 Deploying to $NETWORK..."
npx hardhat run scripts/deploy.js --network $NETWORK

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Copy the contract address from above"
    echo "2. Update contract-integration.js with the address"
    echo "3. Run 'npm start' to launch the app"
    echo "4. Connect MetaMask and start playing!"
else
    echo ""
    echo "❌ Deployment failed!"
    echo "Check your .env file and network connection"
    exit 1
fi
