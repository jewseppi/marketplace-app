// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title CryptoCoutureMarketplace
/// @notice Mock marketplace contract for luxury fashion marketplace
/// @dev This is a mock implementation for frontend integration testing
contract CryptoCoutureMarketplace {
    address public owner;
    address public admin;

    enum OrderStatus { Pending, Paid, Shipped, Delivered, Refunded }

    struct Order {
        uint256 id;
        address buyer;
        uint256[] productIds;
        uint256 total;
        OrderStatus status;
        uint256 createdAt;
        uint256 paidAt;
        string paymentTxHash;
    }

    struct Product {
        uint256 id;
        string name;
        string description;
        uint256 price;
        string category;
        bool listed;
        address seller;
    }

    uint256 public nextOrderId;
    uint256 public nextProductId;

    mapping(uint256 => Order) public orders;
    mapping(uint256 => Product) public products;
    mapping(address => mapping(uint256 => bool)) public buyerProducts;
    mapping(address => uint256) public buyerBalance;

    event ProductListed(uint256 productId, address seller, uint256 price);
    event ProductPurchased(uint256 orderId, address buyer, uint256 total, string paymentTxHash);
    event OrderStatusUpdated(uint256 orderId, OrderStatus status);
    event Withdrawal(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAdmin() {
        require(msg.sender == owner || msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        owner = msg.sender;
        admin = msg.sender;
        nextProductId = 1;
        nextOrderId = 1;
    }

    function listProduct(
        string memory name,
        string description,
        uint256 price,
        string category
    ) external onlyOwner returns (uint256) {
        require(price > 0, "Price must be > 0");
        uint256 id = nextProductId++;
        products[id] = Product(id, name, description, price, category, true, msg.sender);
        emit ProductListed(id, msg.sender, price);
        return id;
    }

    function getProduct(uint256 id) external view returns (Product memory) {
        return products[id];
    }

    function getListingPrice(uint256 id) external view returns (uint256) {
        return products[id].price;
    }

    function isProductListed(uint256 id) external view returns (bool) {
        return products[id].listed;
    }

    function createOrder(uint256[] calldata productIds, address payable recipient) external payable returns (uint256) {
        require(productIds.length > 0, "Must select products");
        require(msg.value > 0, "Must send payment");

        uint256 total = 0;
        for (uint256 i = 0; i < productIds.length; i++) {
            require(products[productIds[i]].listed, "Product not listed");
            total += products[productIds[i]].price;
        }

        require(msg.value >= total, "Insufficient payment");

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            id: orderId,
            buyer: msg.sender,
            productIds: productIds,
            total: total,
            status: OrderStatus.Pending,
            createdAt: block.timestamp,
            paidAt: 0,
            paymentTxHash: ""
        });

        payable(owner).transfer(msg.value);

        for (uint256 i = 0; i < productIds.length; i++) {
            buyerProducts[msg.sender][productIds[i]] = true;
        }

        emit ProductPurchased(orderId, msg.sender, total, "");
        return orderId;
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }

    function getOrderStatus(uint256 orderId) external view returns (OrderStatus) {
        return orders[orderId].status;
    }

    function getBuyerProducts(address buyer) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i < nextProductId; i++) {
            if (buyerProducts[buyer][i]) count++;
        }
        uint256[] memory result = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i < nextProductId; i++) {
            if (buyerProducts[buyer][i]) result[idx++] = i;
        }
        return result;
    }

    function updateOrderStatus(uint256 orderId, OrderStatus status) external onlyAdmin {
        require(orders[orderId].id > 0, "Order not found");
        orders[orderId].status = status;
        if (status == OrderStatus.Paid) {
            orders[orderId].paidAt = block.timestamp;
        }
        emit OrderStatusUpdated(orderId, status);
    }

    function setAdmin(address newAdmin) external onlyOwner {
        admin = newAdmin;
    }

    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner).transfer(amount);
        emit Withdrawal(owner, amount);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function refund(uint256 orderId) external onlyAdmin {
        Order storage order = orders[orderId];
        require(order.status == OrderStatus.Paid, "Order not paid");
        require(order.buyer == msg.sender || msg.sender == admin, "Not authorized");
        order.status = OrderStatus.Refunded;
        payable(order.buyer).transfer(order.total);
        emit OrderStatusUpdated(orderId, OrderStatus.Refunded);
    }
}
