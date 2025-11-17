# ClickRaceGame with Multiplayer Game Communication (EIP-7566)

This implementation integrates the Multiplayer Game Communication standard (EIP-7566) into the ClickRaceGame contract, enabling on-chain multiplayer communication capabilities.

## Files Added

1. `Types.sol` - Library containing Solidity type enumerations
2. `IMOG.sol` - Interface for Multiplayer Game Communication standard
3. `ClickRaceGame.sol` - Updated contract implementing the IMOG interface
4. `ClickRaceGameWithMessaging.sol` - Example contract demonstrating usage

## IMOG Interface Implementation

The ClickRaceGame contract now implements all required functions from the IMOG interface:

### Core Functions

- `createRoom()` - Create a new game room
- `joinRoom(uint256 _roomId)` - Join an existing room
- `sendMessage(...)` - Send messages between players
- `getMessage(...)` - Retrieve message details
- `getRoomCount()` - Get total number of rooms
- `getMemberId(...)` - Get member ID in a room
- `hasMember(...)` - Check if member exists in room
- `getRoomIds(...)` - Get all rooms for a member
- `getMemberCount(...)` - Get member count in a room
- `getMessageIds(...)` - Get all messages for a member

### Events

- `RoomCreated(uint256 indexed roomId)`
- `MemberJoined(uint256 indexed roomId, address indexed member, uint256 memberId)`
- `MessageSent(uint256 indexed roomId, uint256 indexed messageId, uint256 senderId, uint256[] receiverIds)`

## Usage Example

The `ClickRaceGameWithMessaging.sol` contract demonstrates how to use the IMOG interface:

```solidity
// Create a game and room
(uint256 gameId, uint256 roomId) = gameContract.createGameAndRoom();

// Join the room
uint256 memberId = gameContract.joinGameRoom(roomId);

// Send a click action message
uint256[] memory receivers = new uint256[](1);
receivers[0] = opponentMemberId;
uint256 messageId = gameContract.sendClickAction(roomId, receivers);
```

## Integration with ClickRaceGame

The implementation maintains full compatibility with the existing ClickRaceGame functionality while adding multiplayer communication capabilities:

1. Each game automatically creates a corresponding room
2. Players can join rooms to communicate during games
3. Game actions can be communicated via messages
4. All existing game functionality remains unchanged

## Deployment

To deploy the updated contracts:

1. Install dependencies: `npm install`
2. Compile contracts: `npx hardhat compile`
3. Deploy: `npx hardhat run scripts/deploy.js --network baseSepolia`

Update the contract address in `contract-integration.js` after deployment.