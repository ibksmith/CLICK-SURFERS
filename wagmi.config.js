import { createConfig, http } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'
import { injected } from '@wagmi/connectors'

// Farcaster MiniApp configuration
export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp({
      enableSigning: true, // Enable signing for transactions
      rpcUrl: 'https://sepolia.base.org', // Default to Base Sepolia
    }),
    injected({
      shimDisconnect: true, // Maintain connection state
    }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  // Enable auto-connect for better user experience
  autoConnect: true,
  // Enable polling for faster state updates
  pollingInterval: 5000,
})

// Make config globally available for debugging
if (typeof window !== 'undefined') {
  window.wagmiConfig = config;
}
