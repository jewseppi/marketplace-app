import { ethers } from "ethers";

type EthereumProvider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Contract ABI (will be generated from Hardhat compilation)
const MARKETPLACE_ABI = [
  // Item management
  "function listItems(address _tokenAddress, uint256 _tokenId, uint256 _price)",
  "function purchaseItem(uint256 _itemId) payable",
  "function cancelListing(uint256 _itemId)",
  "function updatePrice(uint256 _itemId, uint256 _newPrice)",
  
  // Queries
  "function getItem(uint256 _itemId) view returns (uint256 itemId, address seller, address tokenAddress, uint256 tokenId, uint256 price, bool isActive, bool isSold, uint256 createdAt)",
  "function getActiveItems() view returns (uint256[] memory)",
  "function getSellerItems(address _seller) view returns (uint256[] memory)",
  "function getTotalItems() view returns (uint256)",
  
  // Order management
  "function createOrder(uint256 _itemId, string memory _paymentToken) payable",
  "function getOrder(uint256 _orderId) view returns (uint256 orderId, uint256 itemId, address buyer, uint256 price, string paymentToken, string status, uint256 createdAt)",
  "function getBuyerOrders(address _buyer) view returns (uint256[] memory)",
  "function updateOrderStatus(uint256 _orderId, string memory _status)",
  
  // Platform
  "function platformFeeBps() view returns (uint256)",
  "function platformFeeRecipient() view returns (address)",
  "function updatePlatformFee(uint256 _newFeeBps)",
  
  // Events
  "event ItemListed(uint256 indexed itemId, address indexed seller, address tokenAddress, uint256 tokenId, uint256 price)",
  "event ItemSold(uint256 indexed itemId, address indexed seller, address indexed buyer, uint256 price)",
  "event OrderCreated(uint256 indexed orderId, uint256 indexed itemId, address indexed buyer, uint256 price)",
  "event OrderStatusUpdated(uint256 indexed orderId, string newStatus)",
];

// Supported payment tokens with their decimals
export const PAYMENT_TOKENS = {
  ETH: { decimals: 18, symbol: "ETH", name: "Ethereum" },
  USDT: { decimals: 6, symbol: "USDT", name: "Tether USD" },
  USDC: { decimals: 6, symbol: "USDC", name: "USD Coin" },
  BTC: { decimals: 8, symbol: "BTC", name: "Bitcoin (wrapped)" },
} as const;

export type PaymentToken = keyof typeof PAYMENT_TOKENS;

// Price conversion utilities
export function toWei(amount: number, decimals: number): bigint {
  return BigInt(Math.floor(amount * Math.pow(10, decimals)));
}

export function fromWei(amount: bigint, decimals: number): number {
  return Number(amount) / Math.pow(10, decimals);
}

// Contract instance manager
export class MarketplaceContract {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer?: ethers.Signer;

  constructor(
    contractAddress: string,
    rpcUrl: string,
    _signerAddress?: string,
    privateKey?: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else {
      // Try to use injected provider (MetaMask, etc.)
      if (typeof window !== "undefined" && window.ethereum) {
        const signer = window.ethereum;
        if (signer.request) {
          signer.request({ method: "eth_requestAccounts" });
        }
      }
    }

    this.contract = new ethers.Contract(contractAddress, MARKETPLACE_ABI, this.signer || this.provider);
  }

  // Item operations
  async listItems(tokenAddress: string, tokenId: number, price: number, paymentToken: PaymentToken = "ETH"): Promise<ethers.TransactionReceipt> {
    const priceInWei = toWei(price, PAYMENT_TOKENS[paymentToken].decimals);
    const tx = await this.contract!.listItems(tokenAddress, tokenId, priceInWei);
    return await tx.wait();
  }

  async purchaseItem(itemId: number, paymentToken: PaymentToken = "ETH"): Promise<ethers.TransactionReceipt> {
    const priceInWei = toWei(
      await this.getItemPrice(itemId),
      PAYMENT_TOKENS[paymentToken].decimals
    );
    
    let value = BigInt(0);
    if (paymentToken === "ETH") {
      value = priceInWei;
    }
    
    const tx = await this.contract!.purchaseItem(itemId, { value });
    return await tx.wait();
  }

  async cancelListing(itemId: number): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract!.cancelListing(itemId);
    return await tx.wait();
  }

  async updatePrice(itemId: number, newPrice: number, paymentToken: PaymentToken = "ETH"): Promise<ethers.TransactionReceipt> {
    const priceInWei = toWei(newPrice, PAYMENT_TOKENS[paymentToken].decimals);
    const tx = await this.contract!.updatePrice(itemId, priceInWei);
    return await tx.wait();
  }

  // Query operations
  async getItem(itemId: number) {
    const item = await this.contract!.getItem(itemId);
    return {
      itemId: Number(item.itemId),
      seller: item.seller,
      tokenAddress: item.tokenAddress,
      tokenId: Number(item.tokenId),
      price: fromWei(item.price, 18), // Default to ETH decimals
      isActive: item.isActive,
      isSold: item.isSold,
      createdAt: Number(item.createdAt),
    };
  }

  async getActiveItems(): Promise<number[]> {
    const activeItemIds = await this.contract!.getActiveItems();
    return activeItemIds.map((id: bigint) => Number(id));
  }

  async getSellerItems(sellerAddress: string): Promise<number[]> {
    const itemIds = await this.contract!.getSellerItems(sellerAddress);
    return itemIds.map((id: bigint) => Number(id));
  }

  async getTotalItems(): Promise<number> {
    return Number(await this.contract!.getTotalItems());
  }

  async getItemPrice(itemId: number): Promise<number> {
    const item = await this.getItem(itemId);
    return item.price;
  }

  // Order operations
  async getOrder(orderId: number) {
    const order = await this.contract!.getOrder(orderId);
    return {
      orderId: Number(order.orderId),
      itemId: Number(order.itemId),
      buyer: order.buyer,
      price: Number(order.price),
      paymentToken: order.paymentToken,
      status: order.status,
      createdAt: Number(order.createdAt),
    };
  }

  async getBuyerOrders(buyerAddress: string): Promise<number[]> {
    const orderIds = await this.contract!.getBuyerOrders(buyerAddress);
    return orderIds.map((id: bigint) => Number(id));
  }

  async createOrder(itemId: number, paymentToken: string): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract!.createOrder(itemId, paymentToken);
    return await tx.wait();
  }

  async updateOrderStatus(orderId: number, status: string): Promise<ethers.TransactionReceipt> {
    const tx = await this.contract!.updateOrderStatus(orderId, status);
    return await tx.wait();
  }

  // Platform operations
  async getPlatformFeeBps(): Promise<number> {
    return Number(await this.contract!.platformFeeBps());
  }

  async getPlatformFeeRecipient(): Promise<string> {
    return await this.contract!.platformFeeRecipient();
  }

  // Event listeners
  onItemListed(callback: (itemId: number, seller: string, tokenAddress: string, tokenId: number, price: number) => void) {
    this.contract!.on("ItemListed", (itemId, seller, tokenAddress, tokenId, price) => {
      callback(
        Number(itemId),
        seller,
        tokenAddress,
        Number(tokenId),
        fromWei(price, 18)
      );
    });
  }

  onItemSold(callback: (itemId: number, seller: string, buyer: string, price: number) => void) {
    this.contract!.on("ItemSold", (itemId, seller, buyer, price) => {
      callback(
        Number(itemId),
        seller,
        buyer,
        fromWei(price, 18)
      );
    });
  }

  onOrderCreated(callback: (orderId: number, itemId: number, buyer: string, price: number) => void) {
    this.contract!.on("OrderCreated", (orderId, itemId, buyer, price) => {
      callback(
        Number(orderId),
        Number(itemId),
        buyer,
        Number(price)
      );
    });
  }

  offItemListed() {
    this.contract!.off("ItemListed");
  }

  offItemSold() {
    this.contract!.off("ItemSold");
  }

  offOrderCreated() {
    this.contract!.off("OrderCreated");
  }

  // Provider access
  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

// Hook for React components
export function useMarketplace(contractAddress: string, rpcUrl: string) {
  const marketplace = new MarketplaceContract(contractAddress, rpcUrl);
  
  return {
    marketplace,
    isConnected: !!marketplace.getSigner(),
    connect: async (privateKey: string) => {
      const newMarketplace = new MarketplaceContract(contractAddress, rpcUrl, undefined, privateKey);
      return newMarketplace;
    },
    disconnect: () => {
      // In a real app, you'd clear the signer
      return new MarketplaceContract(contractAddress, rpcUrl);
    },
  };
}
