// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CryptoCoutureMarketplace
 * @dev Marketplace for luxury fashion items with crypto payments
 */
contract CryptoCoutureMarketplace {
    // Item structure
    struct Item {
        uint256 itemId;
        address seller;
        address tokenAddress;      // ERC-721/1155 token address
        uint256 tokenId;           // Token ID for the NFT
        uint256 price;             // Price in wei (or USDT/USDC with 6 decimals)
        bool isActive;
        bool isSold;
        uint256 createdAt;
    }

    // Order structure
    struct Order {
        uint256 orderId;
        uint256 itemId;
        address buyer;
        uint256 price;
        string paymentToken;       // "ETH", "BTC", "USDT", "USDC"
        string status;             // "pending", "confirmed", "shipped", "delivered", "cancelled"
        uint256 createdAt;
    }

    // Platform fee (2.5%)
    uint256 public platformFeeBps = 250; // 250 basis points
    address public platformFeeRecipient;

    // State
    Item[] public items;
    Order[] public orders;
    mapping(uint256 => Item) public itemById;
    mapping(uint256 => Order) public orderById;
    mapping(address => uint256[]) public sellerItems;
    mapping(address => uint256[]) public buyerOrders;

    // Events
    event ItemListed(
        uint256 indexed itemId,
        address indexed seller,
        address tokenAddress,
        uint256 tokenId,
        uint256 price
    );
    event ItemSold(
        uint256 indexed itemId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed itemId,
        address indexed buyer,
        uint256 price
    );
    event OrderStatusUpdated(
        uint256 indexed orderId,
        string newStatus
    );
    event PlatformFeeUpdated(
        uint256 oldFeeBps,
        uint256 newFeeBps
    );

    constructor(address _feeRecipient) {
        platformFeeRecipient = _feeRecipient;
    }

    /**
     * @notice List an item for sale
     * @param _tokenAddress ERC-721/1155 token contract address
     * @param _tokenId Token ID of the item
     * @param _price Price in wei (or token decimals for stablecoins)
     */
    function listItems(
        address _tokenAddress,
        uint256 _tokenId,
        uint256 _price
    ) external {
        require(_price > 0, "Price must be greater than 0");
        
        uint256 itemId = items.length;
        Item memory item = Item({
            itemId: itemId,
            seller: msg.sender,
            tokenAddress: _tokenAddress,
            tokenId: _tokenId,
            price: _price,
            isActive: true,
            isSold: false,
            createdAt: block.timestamp
        });
        
        items.push(item);
        itemById[itemId] = item;
        sellerItems[msg.sender].push(itemId);
        
        emit ItemListed(itemId, msg.sender, _tokenAddress, _tokenId, _price);
    }

    /**
     * @notice Purchase an item
     * @param _itemId ID of the item to purchase
     */
    function purchaseItem(uint256 _itemId) external payable {
        Item storage item = itemById[_itemId];
        require(item.isActive, "Item is not active");
        require(!item.isSold, "Item already sold");
        require(msg.sender != item.seller, "Seller cannot buy own item");
        
        // Check payment (ETH)
        if (item.paymentToken == "ETH") {
            require(msg.value >= item.price, "Insufficient payment");
        }
        
        item.isSold = true;
        item.isActive = false;
        
        uint256 orderId = orders.length;
        Order memory order = Order({
            orderId: orderId,
            itemId: _itemId,
            buyer: msg.sender,
            price: item.price,
            paymentToken: "ETH",
            status: "confirmed",
            createdAt: block.timestamp
        });
        
        orders.push(order);
        orderById[orderId] = order;
        buyerOrders[msg.sender].push(orderId);
        
        // Platform fee
        uint256 fee = (item.price * platformFeeBps) / 10000;
        uint256 sellerAmount = item.price - fee;
        
        // Transfer to seller (simplified - in production would use escrow)
        (bool success, ) = item.seller.call{value: sellerAmount}("");
        require(success, "Transfer failed");
        
        // Transfer fee to platform
        (bool feeSuccess, ) = platformFeeRecipient.call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
        
        emit ItemSold(_itemId, item.seller, msg.sender, item.price);
        emit OrderCreated(orderId, _itemId, msg.sender, item.price);
    }

    /**
     * @notice Cancel an active listing
     * @param _itemId ID of the item to cancel
     */
    function cancelListing(uint256 _itemId) external {
        Item storage item = itemById[_itemId];
        require(item.isActive, "Item is not active");
        require(msg.sender == item.seller, "Only seller can cancel");
        
        item.isActive = false;
        emit OrderStatusUpdated(_itemId, "cancelled");
    }

    /**
     * @notice Update the price of an active listing
     * @param _itemId ID of the item
     * @param _newPrice New price
     */
    function updatePrice(uint256 _itemId, uint256 _newPrice) external {
        Item storage item = itemById[_itemId];
        require(item.isActive, "Item is not active");
        require(msg.sender == item.seller, "Only seller can update price");
        require(_newPrice > 0, "Price must be greater than 0");
        
        item.price = _newPrice;
    }

    /**
     * @notice Update platform fee
     * @param _newFeeBps New fee in basis points
     */
    function updatePlatformFee(uint256 _newFeeBps) external {
        require(msg.sender == platformFeeRecipient, "Only platform can update fee");
        require(_newFeeBps <= 1000, "Fee too high (max 10%)");
        
        uint256 oldFee = platformFeeBps;
        platformFeeBps = _newFeeBps;
        emit PlatformFeeUpdated(oldFee, _newFeeBps);
    }

    /**
     * @notice Get all items for a seller
     * @param _seller Seller address
     * @return Array of item IDs
     */
    function getSellerItems(address _seller) external view returns (uint256[] memory) {
        return sellerItems[_seller];
    }

    /**
     * @notice Get all orders for a buyer
     * @param _buyer Buyer address
     * @return Array of order IDs
     */
    function getBuyerOrders(address _buyer) external view returns (uint256[] memory) {
        return buyerOrders[_buyer];
    }

    /**
     * @notice Get all active items
     * @return Array of active item IDs
     */
    function getActiveItems() external view returns (uint256[] memory) {
        uint256[] memory activeIds = new uint256[](items.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].isActive) {
                activeIds[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = activeIds[i];
        }
        
        return result;
    }

    /**
     * @notice Get item details
     * @param _itemId ID of the item
     * @return Item struct
     */
    function getItem(uint256 _itemId) external view returns (Item memory) {
        return itemById[_itemId];
    }

    /**
     * @notice Get order details
     * @param _orderId ID of the order
     * @return Order struct
     */
    function getOrder(uint256 _orderId) external view returns (Order memory) {
        return orderById[_orderId];
    }

    /**
     * @notice Get total number of items
     */
    function getTotalItems() external view returns (uint256) {
        return items.length;
    }

    /**
     * @notice Get total number of orders
     */
    function getTotalOrders() external view returns (uint256) {
        return orders.length;
    }
}
