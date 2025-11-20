// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ERC8021 Builder Code Registry
 * @dev Registry for builder codes that allows developers to register codes and receive revenue
 */
contract BuilderCodeRegistry {
    // Mapping from builder code to developer address
    mapping(string => address) public builderCodeToAddress;
    
    // Mapping from developer address to builder code
    mapping(address => string) public addressToBuilderCode;
    
    // Mapping to track if a builder code is registered
    mapping(string => bool) public isBuilderCodeRegistered;
    
    // Owner of the registry (platform)
    address public owner;
    
    // Event emitted when a builder code is registered
    event BuilderCodeRegistered(string indexed builderCode, address indexed developer);
    
    // Event emitted when revenue is distributed
    event RevenueDistributed(string indexed builderCode, address indexed developer, uint256 amount);
    
    // Event emitted when a builder code is updated
    event BuilderCodeUpdated(string indexed oldBuilderCode, string indexed newBuilderCode, address indexed developer);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Register a builder code for a developer
     * @param builderCode The builder code to register
     * @param developer The developer's address
     */
    function registerBuilderCode(string memory builderCode, address developer) external onlyOwner {
        require(bytes(builderCode).length > 0, "Builder code cannot be empty");
        require(developer != address(0), "Developer address cannot be zero");
        require(!isBuilderCodeRegistered[builderCode], "Builder code already registered");
        
        builderCodeToAddress[builderCode] = developer;
        addressToBuilderCode[developer] = builderCode;
        isBuilderCodeRegistered[builderCode] = true;
        
        emit BuilderCodeRegistered(builderCode, developer);
    }
    
    /**
     * @dev Update a builder code for a developer
     * @param oldBuilderCode The current builder code
     * @param newBuilderCode The new builder code
     */
    function updateBuilderCode(string memory oldBuilderCode, string memory newBuilderCode) external {
        require(isBuilderCodeRegistered[oldBuilderCode], "Old builder code not registered");
        require(!isBuilderCodeRegistered[newBuilderCode], "New builder code already registered");
        require(builderCodeToAddress[oldBuilderCode] == msg.sender, "Only builder code owner can update");
        
        // Remove old mappings
        delete builderCodeToAddress[oldBuilderCode];
        delete addressToBuilderCode[msg.sender];
        delete isBuilderCodeRegistered[oldBuilderCode];
        
        // Add new mappings
        builderCodeToAddress[newBuilderCode] = msg.sender;
        addressToBuilderCode[msg.sender] = newBuilderCode;
        isBuilderCodeRegistered[newBuilderCode] = true;
        
        emit BuilderCodeUpdated(oldBuilderCode, newBuilderCode, msg.sender);
    }
    
    /**
     * @dev Get developer address by builder code
     * @param builderCode The builder code
     * @return The developer's address
     */
    function getDeveloperByBuilderCode(string memory builderCode) external view returns (address) {
        return builderCodeToAddress[builderCode];
    }
    
    /**
     * @dev Get builder code by developer address
     * @param developer The developer's address
     * @return The builder code
     */
    function getBuilderCodeByDeveloper(address developer) external view returns (string memory) {
        return addressToBuilderCode[developer];
    }
    
    /**
     * @dev Check if a builder code is registered
     * @param builderCode The builder code
     * @return Whether the builder code is registered
     */
    function isRegistered(string memory builderCode) external view returns (bool) {
        return isBuilderCodeRegistered[builderCode];
    }
    
    /**
     * @dev Distribute revenue to a developer by builder code
     * @param builderCode The builder code
     * @param amount The amount to distribute
     */
    function distributeRevenue(string memory builderCode, uint256 amount) external onlyOwner {
        require(isBuilderCodeRegistered[builderCode], "Builder code not registered");
        
        address developer = builderCodeToAddress[builderCode];
        require(developer != address(0), "Invalid developer address");
        
        // Transfer ETH to developer
        payable(developer).transfer(amount);
        
        emit RevenueDistributed(builderCode, developer, amount);
    }
    
    /**
     * @dev Withdraw any accidentally sent ETH
     */
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive ETH
     */
    receive() external payable {}
}