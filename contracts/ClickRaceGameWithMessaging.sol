// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./ClickRaceGame.sol";
import "./Types.sol";

/**
 * @title ClickRaceGameWithMessaging
 * @dev Example implementation showing how to use the IMOG interface with ClickRaceGame
 */
contract ClickRaceGameWithMessaging {
    ClickRaceGame public gameContract;
    
    constructor(address _gameContractAddress) {
        gameContract = ClickRaceGame(_gameContractAddress);
    }
    
    /**
     * @dev Example of creating a game and a room
     */
    function createGameAndRoom() external returns (uint256 gameId, uint256 roomId) {
        // Create a new game
        gameId = gameContract.createGame();
        
        // Create a room for the game
        roomId = gameContract.createRoom();
        
        return (gameId, roomId);
    }
    
    /**
     * @dev Example of joining a room
     */
    function joinGameRoom(uint256 roomId) external returns (uint256 memberId) {
        memberId = gameContract.joinRoom(roomId);
        return memberId;
    }
    
    /**
     * @dev Example of sending a game action message
     */
    function sendClickAction(uint256 roomId, uint256[] memory toMembers) external returns (uint256 messageId) {
        // Encode click action message
        bytes memory message = abi.encode("click", block.timestamp);
        Types.Type[] memory types = new Types.Type[](2);
        types[0] = Types.Type.STRING;
        types[1] = Types.Type.UINT256;
        
        messageId = gameContract.sendMessage(roomId, toMembers, message, types);
        return messageId;
    }
    
    /**
     * @dev Example of sending a vote message
     */
    function sendVoteMessage(uint256 roomId, uint256[] memory toMembers, uint256 voteOption) external returns (uint256 messageId) {
        // Encode vote message
        bytes memory message = abi.encode("vote", voteOption);
        Types.Type[] memory types = new Types.Type[](2);
        types[0] = Types.Type.STRING;
        types[1] = Types.Type.UINT256;
        
        messageId = gameContract.sendMessage(roomId, toMembers, message, types);
        return messageId;
    }
    
    /**
     * @dev Example of getting messages for a member
     */
    function getMemberMessages(uint256 roomId, uint256 memberId) external view returns (uint256[] memory) {
        return gameContract.getMessageIds(roomId, memberId);
    }
    
    /**
     * @dev Example of reading a message
     */
    function readMessage(uint256 roomId, uint256 messageId) external view returns (
        bytes memory content,
        Types.Type[] memory types,
        uint256 senderId,
        uint256[] memory receiverIds
    ) {
        return gameContract.getMessage(roomId, messageId);
    }
}