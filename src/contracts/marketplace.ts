import { ethers } from "ethers";
import {
  getMockMarketplace,
  MOCK_PAYMENT_TOKENS,
  type MockTransactionReceipt,
} from "@/lib/mock-contract";

export type EthereumProvider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export const MARKETPLACE_ABI = [
  "function listItems(address _tokenAddress, uint256 _tokenId, uint256 _price)",
  "function purchaseItem(uint256 _itemId) payable",
  "function cancelListing(uint256 _itemId)",
  "function updatePrice(uint256 _itemId, uint256 _newPrice)",
  "function getItem(uint256 _itemId) view returns (uint256 itemId, address seller, address tokenAddress, uint256 tokenId, uint256 price, bool isActive, bool isSold, uint256 createdAt)",
  "function getActiveItems() view returns (uint256[] memory)",
  "function getSellerItems(address _seller) view returns (uint256[] memory)",
  "function getTotalItems() view returns (uint256)",
  "function createOrder(uint256 _itemId, string memory _paymentToken) payable",
  "function getOrder(uint256 _orderId) view returns (uint256 orderId, uint256 itemId, address buyer, uint256 price, string paymentToken, string status, uint256 createdAt)",
  "function getBuyerOrders(address _buyer) view returns (uint256[] memory)",
  "function updateOrderStatus(uint256 _orderId, string memory _status)",
  "function platformFeeBps() view returns (uint256)",
  "function platformFeeRecipient() view returns (address)",
  "function updatePlatformFee(uint256 _newFeeBps)",
  "event ItemListed(uint256 indexed itemId, address indexed seller, address tokenAddress, uint256 tokenId, uint256 price)",
  "event ItemSold(uint256 indexed itemId, address indexed seller, address indexed buyer, uint256 price)",
  "event OrderCreated(uint256 indexed orderId, uint256 indexed itemId, address indexed buyer, uint256 price)",
  "event OrderStatusUpdated(uint256 indexed orderId, string newStatus)",
] as const;

export const PAYMENT_TOKENS = MOCK_PAYMENT_TOKENS;
export type PaymentToken = keyof typeof PAYMENT_TOKENS;

export function toWei(amount: number, decimals: number): bigint {
  return BigInt(Math.round(amount * Math.pow(10, decimals)));
}

export function fromWei(amount: bigint, decimals: number): number {
  return Number(amount) / Math.pow(10, decimals);
}

type ContractEventMap = {
  ItemListed: Set<(itemId: number, seller: string, tokenAddress: string, tokenId: number, price: number) => void>;
  ItemSold: Set<(itemId: number, seller: string, buyer: string, price: number) => void>;
  OrderCreated: Set<(orderId: number, itemId: number, buyer: string, price: number) => void>;
};

function asReceipt(receipt: MockTransactionReceipt): ethers.TransactionReceipt {
  return receipt as unknown as ethers.TransactionReceipt;
}

export class MockMarketplaceContract {
  private readonly mock = getMockMarketplace();
  private readonly events: ContractEventMap = {
    ItemListed: new Set(),
    ItemSold: new Set(),
    OrderCreated: new Set(),
  };

  async listItems(
    tokenAddress: string,
    tokenId: number,
    price: bigint,
    paymentToken: PaymentToken = "ETH",
    seller = "0x000000000000000000000000000000000000dEaD",
  ): Promise<ethers.TransactionReceipt> {
    const result = await this.mock.listItem({
      productId: tokenId,
      seller,
      tokenAddress,
      tokenId,
      price: fromWei(price, PAYMENT_TOKENS[paymentToken].decimals),
      paymentToken,
    });
    this.events.ItemListed.forEach((listener) => {
      listener(result.listing.itemId, result.listing.seller, result.listing.tokenAddress, result.listing.tokenId, result.listing.price);
    });
    return asReceipt(result.receipt);
  }

  async purchaseItem(itemId: number, paymentToken: PaymentToken = "ETH", buyer = "0x000000000000000000000000000000000000bEEF"): Promise<ethers.TransactionReceipt> {
    const result = await this.mock.purchaseItem(itemId, buyer, paymentToken);
    this.events.ItemSold.forEach((listener) => {
      listener(result.listing.itemId, result.order.seller, result.order.buyer, result.order.price);
    });
    this.events.OrderCreated.forEach((listener) => {
      listener(result.order.orderId, result.order.itemId, result.order.buyer, result.order.price);
    });
    return asReceipt(result.receipt);
  }

  async cancelListing(itemId: number, actorAddress = "0x000000000000000000000000000000000000dEaD"): Promise<ethers.TransactionReceipt> {
    const receipt = await this.mock.cancelListing(itemId, actorAddress);
    return asReceipt(receipt);
  }

  async updatePrice(itemId: number, newPrice: number, paymentToken: PaymentToken = "ETH", actorAddress = "0x000000000000000000000000000000000000dEaD"): Promise<ethers.TransactionReceipt> {
    const receipt = await this.mock.updatePrice(itemId, toWei(newPrice, PAYMENT_TOKENS[paymentToken].decimals), actorAddress, paymentToken);
    return asReceipt(receipt);
  }

  async getItem(itemId: number) {
    const item = this.mock.getItem(itemId);
    return {
      itemId: item.itemId,
      seller: item.seller,
      tokenAddress: item.tokenAddress,
      tokenId: item.tokenId,
      price: item.price,
      isActive: item.isActive,
      isSold: item.isSold,
      createdAt: item.createdAt,
    };
  }

  async getActiveItems(): Promise<number[]> {
    return this.mock.getActiveItems();
  }

  async getSellerItems(sellerAddress: string): Promise<number[]> {
    return this.mock.getSellerItems(sellerAddress);
  }

  async getTotalItems(): Promise<number> {
    return this.mock.getTotalItems();
  }

  async getItemPrice(itemId: number): Promise<number> {
    const item = await this.getItem(itemId);
    return item.price;
  }

  async getOrder(orderId: number) {
    const order = this.mock.getOrder(orderId);
    return {
      orderId: order.orderId,
      itemId: order.itemId,
      buyer: order.buyer,
      price: order.price,
      paymentToken: order.paymentToken,
      status: order.status,
      createdAt: order.createdAt,
    };
  }

  async getBuyerOrders(buyerAddress: string): Promise<number[]> {
    return this.mock.getBuyerOrders(buyerAddress);
  }

  async createOrder(itemId: number, paymentToken: string, buyer = "0x000000000000000000000000000000000000bEEF"): Promise<ethers.TransactionReceipt> {
    const result = await this.mock.createOrder(itemId, paymentToken as PaymentToken, buyer);
    this.events.OrderCreated.forEach((listener) => {
      listener(result.order.orderId, result.order.itemId, result.order.buyer, result.order.price);
    });
    return asReceipt(result.receipt);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<ethers.TransactionReceipt> {
    const receipt = await this.mock.updateOrderStatus(orderId, status as "pending" | "confirmed" | "cancelled");
    return asReceipt(receipt);
  }

  async getPlatformFeeBps(): Promise<number> {
    return 250;
  }

  async getPlatformFeeRecipient(): Promise<string> {
    return "0x000000000000000000000000000000000000FEE1";
  }

  onItemListed(callback: (itemId: number, seller: string, tokenAddress: string, tokenId: number, price: number) => void) {
    this.events.ItemListed.add(callback);
  }

  onItemSold(callback: (itemId: number, seller: string, buyer: string, price: number) => void) {
    this.events.ItemSold.add(callback);
  }

  onOrderCreated(callback: (orderId: number, itemId: number, buyer: string, price: number) => void) {
    this.events.OrderCreated.add(callback);
  }

  offItemListed() {
    this.events.ItemListed.clear();
  }

  offItemSold() {
    this.events.ItemSold.clear();
  }

  offOrderCreated() {
    this.events.OrderCreated.clear();
  }

  getProvider() {
    return null;
  }

  getSigner() {
    return null;
  }
}

export class MarketplaceContract {
  private contract: ethers.Contract | MockMarketplaceContract;
  private provider: ethers.JsonRpcProvider | null;
  private signer?: ethers.Signer;
  readonly isMock: boolean;

  constructor(
    contractAddress?: string,
    rpcUrl?: string,
    _signerAddress?: string,
    privateKey?: string,
  ) {
    this.isMock = !contractAddress || !rpcUrl;

    if (this.isMock) {
      this.provider = null;
      this.contract = new MockMarketplaceContract();
      return;
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (privateKey) {
      this.signer = new ethers.Wallet(privateKey, this.provider);
    } else if (typeof window !== "undefined" && window.ethereum?.request) {
      void window.ethereum.request({ method: "eth_requestAccounts" });
    }

    this.contract = new ethers.Contract(contractAddress as string, MARKETPLACE_ABI, this.signer || this.provider);
  }

  async listItems(tokenAddress: string, tokenId: number, price: number, paymentToken: PaymentToken = "ETH"): Promise<ethers.TransactionReceipt> {
    const priceInWei = toWei(price, PAYMENT_TOKENS[paymentToken].decimals);
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.listItems(tokenAddress, tokenId, priceInWei, paymentToken);
    }
    const tx = await this.contract.listItems(tokenAddress, tokenId, priceInWei);
    return await tx.wait();
  }

  async purchaseItem(itemId: number, paymentToken: PaymentToken = "ETH"): Promise<ethers.TransactionReceipt> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.purchaseItem(itemId, paymentToken);
    }

    const priceInWei = toWei(
      await this.getItemPrice(itemId),
      PAYMENT_TOKENS[paymentToken].decimals,
    );

    const value = paymentToken === "ETH" ? priceInWei : BigInt(0);
    const tx = await this.contract.purchaseItem(itemId, { value });
    return await tx.wait();
  }

  async cancelListing(itemId: number): Promise<ethers.TransactionReceipt> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.cancelListing(itemId);
    }
    const tx = await this.contract.cancelListing(itemId);
    return await tx.wait();
  }

  async updatePrice(itemId: number, newPrice: number, paymentToken: PaymentToken = "ETH"): Promise<ethers.TransactionReceipt> {
    const priceInWei = toWei(newPrice, PAYMENT_TOKENS[paymentToken].decimals);
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.updatePrice(itemId, newPrice, paymentToken);
    }
    const tx = await this.contract.updatePrice(itemId, priceInWei);
    return await tx.wait();
  }

  async getItem(itemId: number) {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getItem(itemId);
    }

    const item = await this.contract.getItem(itemId);
    return {
      itemId: Number(item.itemId),
      seller: item.seller,
      tokenAddress: item.tokenAddress,
      tokenId: Number(item.tokenId),
      price: fromWei(item.price, 18),
      isActive: item.isActive,
      isSold: item.isSold,
      createdAt: Number(item.createdAt),
    };
  }

  async getActiveItems(): Promise<number[]> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getActiveItems();
    }
    const activeItemIds = await this.contract.getActiveItems();
    return activeItemIds.map((id: bigint) => Number(id));
  }

  async getSellerItems(sellerAddress: string): Promise<number[]> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getSellerItems(sellerAddress);
    }
    const itemIds = await this.contract.getSellerItems(sellerAddress);
    return itemIds.map((id: bigint) => Number(id));
  }

  async getTotalItems(): Promise<number> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getTotalItems();
    }
    return Number(await this.contract.getTotalItems());
  }

  async getItemPrice(itemId: number): Promise<number> {
    const item = await this.getItem(itemId);
    return item.price;
  }

  async getOrder(orderId: number) {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getOrder(orderId);
    }
    const order = await this.contract.getOrder(orderId);
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
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getBuyerOrders(buyerAddress);
    }
    const orderIds = await this.contract.getBuyerOrders(buyerAddress);
    return orderIds.map((id: bigint) => Number(id));
  }

  async createOrder(itemId: number, paymentToken: string): Promise<ethers.TransactionReceipt> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.createOrder(itemId, paymentToken);
    }
    const tx = await this.contract.createOrder(itemId, paymentToken);
    return await tx.wait();
  }

  async updateOrderStatus(orderId: number, status: string): Promise<ethers.TransactionReceipt> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.updateOrderStatus(orderId, status);
    }
    const tx = await this.contract.updateOrderStatus(orderId, status);
    return await tx.wait();
  }

  async getPlatformFeeBps(): Promise<number> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getPlatformFeeBps();
    }
    return Number(await this.contract.platformFeeBps());
  }

  async getPlatformFeeRecipient(): Promise<string> {
    if (this.contract instanceof MockMarketplaceContract) {
      return this.contract.getPlatformFeeRecipient();
    }
    return await this.contract.platformFeeRecipient();
  }

  onItemListed(callback: (itemId: number, seller: string, tokenAddress: string, tokenId: number, price: number) => void) {
    if (this.contract instanceof MockMarketplaceContract) {
      this.contract.onItemListed(callback);
      return;
    }
    this.contract.on("ItemListed", (itemId, seller, tokenAddress, tokenId, price) => {
      callback(Number(itemId), seller, tokenAddress, Number(tokenId), fromWei(price, 18));
    });
  }

  onItemSold(callback: (itemId: number, seller: string, buyer: string, price: number) => void) {
    if (this.contract instanceof MockMarketplaceContract) {
      this.contract.onItemSold(callback);
      return;
    }
    this.contract.on("ItemSold", (itemId, seller, buyer, price) => {
      callback(Number(itemId), seller, buyer, fromWei(price, 18));
    });
  }

  onOrderCreated(callback: (orderId: number, itemId: number, buyer: string, price: number) => void) {
    if (this.contract instanceof MockMarketplaceContract) {
      this.contract.onOrderCreated(callback);
      return;
    }
    this.contract.on("OrderCreated", (orderId, itemId, buyer, price) => {
      callback(Number(orderId), Number(itemId), buyer, Number(price));
    });
  }

  offItemListed() {
    if (this.contract instanceof MockMarketplaceContract) {
      this.contract.offItemListed();
      return;
    }
    this.contract.off("ItemListed");
  }

  offItemSold() {
    if (this.contract instanceof MockMarketplaceContract) {
      this.contract.offItemSold();
      return;
    }
    this.contract.off("ItemSold");
  }

  offOrderCreated() {
    if (this.contract instanceof MockMarketplaceContract) {
      this.contract.offOrderCreated();
      return;
    }
    this.contract.off("OrderCreated");
  }

  getProvider() {
    return this.provider;
  }

  getSigner() {
    return this.signer;
  }
}

export function useMarketplace(contractAddress?: string, rpcUrl?: string) {
  const marketplace = new MarketplaceContract(contractAddress, rpcUrl);

  return {
    marketplace,
    isConnected: !!marketplace.getSigner() || marketplace.isMock,
    connect: async (privateKey: string) => new MarketplaceContract(contractAddress, rpcUrl, undefined, privateKey),
    disconnect: () => new MarketplaceContract(contractAddress, rpcUrl),
  };
}
