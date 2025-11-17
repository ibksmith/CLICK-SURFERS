// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./IMOG.sol";
import "./Types.sol";

/**
 * @title ClickRaceGame
 * @dev A click race game contract with voting, deposits, and prize distribution
 */
contract ClickRaceGame is IMOG {
    // Deposit value options ($0.25 to $3 in wei equivalent)
    uint256[] public depositOptions = [
        0.00025 ether,  // $0.25
        0.0005 ether,   // $0.5
        0.001 ether,    // $1
        0.003 ether     // $3
    ];
    
    struct Game {
        uint256 gameId;
        uint256 depositAmount;
        uint256 totalPool;
        uint256 startTime;
        uint256 endTime;
        bool votingEnded;
        bool gameEnded;
        address[] contestants;
        mapping(address => bool) hasDeposited;
        mapping(address => uint256) clickCounts;
        mapping(uint256 => uint256) votes; // depositOption index -> vote count
        mapping(address => bool) votedForDeposit;
        address[] winners;
        bool prizesDistributed;
        
        // IMOG room data
        mapping(address => uint256) memberIds; // member address to member id
        uint256 memberCount;
        uint256[] memberList; // list of member addresses
        mapping(uint256 => uint256[]) messageIds; // member id to message ids
    }
    
    // IMOG message data
    struct Message {
        bytes content;
        Types.Type[] types;
        uint256 senderId;
        uint256[] receiverIds;
        uint256 timestamp;
    }
    
    // IMOG global data
    uint256 public roomCount;
    mapping(uint256 => uint256[]) public roomMembers; // room id to member addresses
    mapping(address => uint256[]) public memberRooms; // member address to room ids
    mapping(uint256 => mapping(uint256 => Message)) public roomMessages; // room id -> message id -> Message
    mapping(uint256 => uint256) public messageCount; // room id -> message count
    
    uint256 public currentGameId;
    mapping(uint256 => Game) public games;
    address public platformWallet;
    uint256 public platformFees;
    
    uint256 constant VOTING_DURATION = 20; // 20 seconds
    uint256 constant MAX_CONTESTANTS = 5;
    
    event GameCreated(uint256 indexed gameId, uint256 startTime);
    event VoteCast(uint256 indexed gameId, address indexed voter, uint256 depositOptionIndex);
    event VotingEnded(uint256 indexed gameId, uint256 winningDepositAmount);
    event DepositPaid(uint256 indexed gameId, address indexed contestant, uint256 amount);
    event ClickRegistered(uint256 indexed gameId, address indexed contestant, uint256 clickCount);
    event GameEnded(uint256 indexed gameId, address[] winners);
    event PrizeDistributed(uint256 indexed gameId, address indexed winner, uint256 position, uint256 amount);
    
    // IMOG Events
    event RoomCreated(uint256 indexed roomId);
    event MemberJoined(uint256 indexed roomId, address indexed member, uint256 memberId);
    event MessageSent(uint256 indexed roomId, uint256 indexed messageId, uint256 senderId, uint256[] receiverIds);
    
    constructor() {
        platformWallet = msg.sender;
    }
    
    modifier onlyPlatform() {
        require(msg.sender == platformWallet, "Only platform can call this");
        _;
    }
    
    /**
     * @dev Create a new game and start voting
     */
    function createGame() external onlyPlatform returns (uint256) {
        currentGameId++;
        Game storage game = games[currentGameId];
        game.gameId = currentGameId;
        game.startTime = block.timestamp;
        game.votingEnded = false;
        game.gameEnded = false;
        game.prizesDistributed = false;
        
        // Also create a room for this game
        roomCount++;
        
        emit GameCreated(currentGameId, block.timestamp);
        return currentGameId;
    }
    }
    
    /**
     * @dev Vote for a deposit amount (within 20 seconds)
     */
    function voteForDeposit(uint256 gameId, uint256 depositOptionIndex) external {
        Game storage game = games[gameId];
        require(!game.votingEnded, "Voting has ended");
        require(block.timestamp <= game.startTime + VOTING_DURATION, "Voting period expired");
        require(depositOptionIndex < depositOptions.length, "Invalid deposit option");
        require(!game.votedForDeposit[msg.sender], "Already voted");
        
        game.votes[depositOptionIndex]++;
        game.votedForDeposit[msg.sender] = true;
        
        emit VoteCast(gameId, msg.sender, depositOptionIndex);
    }
    
    /**
     * @dev End voting and determine the winning deposit amount
     */
    function endVoting(uint256 gameId) external {
        Game storage game = games[gameId];
        require(!game.votingEnded, "Voting already ended");
        require(block.timestamp > game.startTime + VOTING_DURATION, "Voting period not expired");
        
        // Find the deposit option with most votes
        uint256 maxVotes = 0;
        uint256 winningIndex = 0;
        
        for (uint256 i = 0; i < depositOptions.length; i++) {
            if (game.votes[i] > maxVotes) {
                maxVotes = game.votes[i];
                winningIndex = i;
            }
        }
        
        game.depositAmount = depositOptions[winningIndex];
        game.votingEnded = true;
        
        emit VotingEnded(gameId, game.depositAmount);
    }
    
    /**
     * @dev Pay deposit to join the game
     */
    function payDeposit(uint256 gameId) external payable {
        Game storage game = games[gameId];
        require(game.votingEnded, "Voting must end first");
        require(!game.gameEnded, "Game already ended");
        require(msg.value == game.depositAmount, "Incorrect deposit amount");
        require(!game.hasDeposited[msg.sender], "Already deposited");
        require(game.contestants.length < MAX_CONTESTANTS, "Game is full");
        
        game.hasDeposited[msg.sender] = true;
        game.contestants.push(msg.sender);
        game.totalPool += msg.value;
        
        emit DepositPaid(gameId, msg.sender, msg.value);
    }
    
    /**
     * @dev Register a click for a contestant
     */
    function registerClick(uint256 gameId, address contestant) external {
        Game storage game = games[gameId];
        require(game.votingEnded, "Game not started");
        require(!game.gameEnded, "Game already ended");
        require(game.hasDeposited[contestant], "Not a contestant");
        
        game.clickCounts[contestant]++;
        
        emit ClickRegistered(gameId, contestant, game.clickCounts[contestant]);
    }
    
    /**
     * @dev End the game and determine winners
     */
    function endGame(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.votingEnded, "Game not started");
        require(!game.gameEnded, "Game already ended");
        require(game.contestants.length > 0, "No contestants");
        
        // Sort contestants by click count (top 5)
        address[] memory sortedContestants = _sortContestantsByClicks(gameId);
        
        // Store top 5 winners
        uint256 winnerCount = sortedContestants.length < 5 ? sortedContestants.length : 5;
        for (uint256 i = 0; i < winnerCount; i++) {
            game.winners.push(sortedContestants[i]);
        }
        
        game.gameEnded = true;
        game.endTime = block.timestamp;
        
        emit GameEnded(gameId, game.winners);
    }
    
    /**
     * @dev Distribute prizes to winners
     */
    function distributePrizes(uint256 gameId) external {
        Game storage game = games[gameId];
        require(game.gameEnded, "Game not ended");
        require(!game.prizesDistributed, "Prizes already distributed");
        require(game.totalPool > 0, "No pool to distribute");
        
        uint256[] memory percentages = new uint256[](5);
        percentages[0] = 35; // 1st place: 35%
        percentages[1] = 25; // 2nd place: 25%
        percentages[2] = 15; // 3rd place: 15%
        percentages[3] = 10; // 4th place: 10%
        percentages[4] = 5;  // 5th place: 5%
        // Platform: 10% (total = 100%)
        
        uint256 platformFee = (game.totalPool * 10) / 100;
        platformFees += platformFee;
        
        for (uint256 i = 0; i < game.winners.length && i < 5; i++) {
            uint256 prize = (game.totalPool * percentages[i]) / 100;
            payable(game.winners[i]).transfer(prize);
            emit PrizeDistributed(gameId, game.winners[i], i + 1, prize);
        }
        
        game.prizesDistributed = true;
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawPlatformFees() external onlyPlatform {
        uint256 amount = platformFees;
        platformFees = 0;
        payable(platformWallet).transfer(amount);
    }
    
    /**
     * @dev Get game details
     */
    function getGameDetails(uint256 gameId) external view returns (
        uint256 depositAmount,
        uint256 totalPool,
        uint256 contestantCount,
        bool votingEnded,
        bool gameEnded,
        bool prizesDistributed
    ) {
        Game storage game = games[gameId];
        return (
            game.depositAmount,
            game.totalPool,
            game.contestants.length,
            game.votingEnded,
            game.gameEnded,
            game.prizesDistributed
        );
    }
    
    /**
     * @dev Get contestant click count
     */
    function getClickCount(uint256 gameId, address contestant) external view returns (uint256) {
        return games[gameId].clickCounts[contestant];
    }
    
    /**
     * @dev Get votes for a deposit option
     */
    function getVotes(uint256 gameId, uint256 depositOptionIndex) external view returns (uint256) {
        return games[gameId].votes[depositOptionIndex];
    }
    
    /**
     * @dev Get game winners
     */
    function getWinners(uint256 gameId) external view returns (address[] memory) {
        return games[gameId].winners;
    }
    
    /**
     * @dev Sort contestants by click count (bubble sort for simplicity)
     */
    function _sortContestantsByClicks(uint256 gameId) private view returns (address[] memory) {
        Game storage game = games[gameId];
        address[] memory sorted = game.contestants;
        uint256 n = sorted.length;
        
        for (uint256 i = 0; i < n - 1; i++) {
            for (uint256 j = 0; j < n - i - 1; j++) {
                if (game.clickCounts[sorted[j]] < game.clickCounts[sorted[j + 1]]) {
                    address temp = sorted[j];
                    sorted[j] = sorted[j + 1];
                    sorted[j + 1] = temp;
                }
            }
        }
        
        return sorted;
    }
    
    // IMOG Interface Implementation
    
    /**
     * @dev Create a new room.
     * @return New room id.
     */
    function createRoom() external override returns (uint256) {
        roomCount++;
        emit RoomCreated(roomCount);
        return roomCount;
    }
    
    /**
     * @dev Get the total number of rooms that have been created.
     * @return Total number of rooms.
     */
    function getRoomCount() external view override returns (uint256) {
        return roomCount;
    }
    
    /**
     * @dev Player joins room.
     * @param _roomId is the id of the room.
     * @return Member id.
     */
    function joinRoom(uint256 _roomId) external override returns (uint256) {
        require(_roomId > 0 && _roomId <= roomCount, "Invalid room id");
        
        // Check if member already exists in room
        if (games[_roomId].memberIds[msg.sender] == 0) {
            // Assign new member id
            games[_roomId].memberCount++;
            uint256 memberId = games[_roomId].memberCount;
            games[_roomId].memberIds[msg.sender] = memberId;
            games[_roomId].memberList.push(msg.sender);
            
            // Add to room members list
            roomMembers[_roomId].push(memberId);
            
            // Add room to member's room list
            memberRooms[msg.sender].push(_roomId);
            
            emit MemberJoined(_roomId, msg.sender, memberId);
            
            return memberId;
        }
        
        return games[_roomId].memberIds[msg.sender];
    }
    
    /**
     * @dev Get the id of a member in a room.
     * @param _roomId is the id of the room.
     * @param _member is the address of a member.
     * @return Member id.
     */
    function getMemberId(uint256 _roomId, address _member) external view override returns (uint256) {
        return games[_roomId].memberIds[_member];
    }
    
    /**
     * @dev Check if a member exists in the room.
     * @param _roomId is the id of the room.
     * @param _member is the address of a member.
     * @return true exists, false does not exist.
     */
    function hasMember(uint256 _roomId, address _member) external view override returns (bool) {
        return games[_roomId].memberIds[_member] != 0;
    }
    
    /**
     * @dev Get all room IDs joined by a member.
     * @param _member is the address of a member.
     * @return An array of room ids.
     */
    function getRoomIds(address _member) external view override returns (uint256[] memory) {
        return memberRooms[_member];
    }
    
    /**
     * @dev Get the total number of members in a room.
     * @param _roomId is the id of the room.
     * @return Total members.
     */
    function getMemberCount(uint256 _roomId) external view override returns (uint256) {
        return games[_roomId].memberCount;
    }
    
    /**
     * @dev A member sends a message to other members.
     * @param _roomId is the id of the room.
     * @param _to is an array of other member ids.
     * @param _message is the content of the message, encoded by abi.encode.
     * @param _messageTypes is data type array of message content.
     * @return Message id.
     */
    function sendMessage(
        uint256 _roomId,
        uint256[] memory _to,
        bytes memory _message,
        Types.Type[] memory _messageTypes
    ) external override returns (uint256) {
        require(_roomId > 0 && _roomId <= roomCount, "Invalid room id");
        require(games[_roomId].memberIds[msg.sender] != 0, "Member not in room");
        
        uint256 senderId = games[_roomId].memberIds[msg.sender];
        
        // Create new message
        messageCount[_roomId]++;
        uint256 messageId = messageCount[_roomId];
        
        Message storage newMessage = roomMessages[_roomId][messageId];
        newMessage.content = _message;
        newMessage.types = _messageTypes;
        newMessage.senderId = senderId;
        newMessage.receiverIds = _to;
        newMessage.timestamp = block.timestamp;
        
        // Add message id to each receiver's message list
        for (uint256 i = 0; i < _to.length; i++) {
            games[_roomId].messageIds[_to[i]].push(messageId);
        }
        
        // Also add to sender's message list
        games[_roomId].messageIds[senderId].push(messageId);
        
        emit MessageSent(_roomId, messageId, senderId, _to);
        
        return messageId;
    }
    
    /**
     * @dev Get all messages received by a member in the room.
     * @param _roomId is the id of the room.
     * @param _memberId is the id of the member.
     * @return An array of message ids.
     */
    function getMessageIds(uint256 _roomId, uint256 _memberId) external view override returns (uint256[] memory) {
        require(_roomId > 0 && _roomId <= roomCount, "Invalid room id");
        return games[_roomId].messageIds[_memberId];
    }
    
    /**
     * @dev Get details of a message.
     * @param _roomId is the id of the room.
     * @param _messageId is the id of the message.
     * @return The content of the message.
     * @return Data type array of message content.
     * @return Sender id.
     * @return An array of receiver ids.
     */
    function getMessage(
        uint256 _roomId,
        uint256 _messageId
    ) external view override returns (
        bytes memory,
        Types.Type[] memory,
        uint256,
        uint256[] memory
    ) {
        require(_roomId > 0 && _roomId <= roomCount, "Invalid room id");
        Message storage message = roomMessages[_roomId][_messageId];
        
        return (
            message.content,
            message.types,
            message.senderId,
            message.receiverIds
        );
    }
}
