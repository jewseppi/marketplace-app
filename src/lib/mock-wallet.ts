export type PaymentToken = "ETH" | "USDT" | "USDC" | "BTC";

const PAYMENT_TOKEN_DECIMALS: Record<PaymentToken, number> = {
  ETH: 18,
  USDT: 6,
  USDC: 6,
  BTC: 8,
};

export type MockWalletNetwork = "ethereum" | "polygon" | "base" | "arbitrum";

export type MockWalletState = {
  connected: boolean;
  address: string | null;
  network: MockWalletNetwork;
  balances: Record<PaymentToken, number>;
};

export type MockTransactionRequest = {
  to: string;
  value?: string | number | bigint;
  data?: string;
  token?: PaymentToken;
};

export type MockTransactionReceipt = {
  hash: string;
  status: 0 | 1;
  blockNumber: number;
  from: string;
  to: string;
  confirmations: number;
  network: MockWalletNetwork;
  token: PaymentToken;
};

const DEFAULT_BALANCES: Record<PaymentToken, number> = {
  ETH: 4.25,
  USDT: 12500,
  USDC: 9800,
  BTC: 0.62,
};

const listeners = new Set<() => void>();

let walletState: MockWalletState = {
  connected: false,
  address: null,
  network: "ethereum",
  balances: { ...DEFAULT_BALANCES },
};

let blockNumber = 19_800_000;

function notify() {
  listeners.forEach((listener) => listener());
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function randomDelay() {
  return 500 + Math.floor(Math.random() * 500);
}

function randomHex(bytes: number) {
  const values = new Uint8Array(bytes);
  if (typeof globalThis.crypto !== "undefined") {
    globalThis.crypto.getRandomValues(values);
  } else {
    for (let index = 0; index < bytes; index += 1) {
      values[index] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(values, (value) => value.toString(16).padStart(2, "0")).join("");
}

function generateAddress() {
  return `0x${randomHex(20)}`;
}

function generateHash(seed: string) {
  const prefix = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0).toString(16);
  return `0x${`${prefix}${randomHex(32)}`.slice(0, 64).padEnd(64, "0")}`;
}

export class MockWallet {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }

  getState(): MockWalletState {
    return {
      ...walletState,
      balances: { ...walletState.balances },
    };
  }

  isConnected() {
    return walletState.connected && Boolean(walletState.address);
  }

  async connect() {
    await wait(randomDelay());
    if (!walletState.address) {
      walletState = {
        ...walletState,
        address: generateAddress(),
      };
    }
    walletState = {
      ...walletState,
      connected: true,
    };
    notify();
    return {
      address: walletState.address!,
      network: walletState.network,
    };
  }

  disconnect() {
    walletState = {
      ...walletState,
      connected: false,
    };
    notify();
  }

  async getBalance(token: PaymentToken = "ETH") {
    await wait(150);
    return walletState.balances[token];
  }

  async getAllBalances() {
    await wait(150);
    return { ...walletState.balances };
  }

  async switchNetwork(network: MockWalletNetwork) {
    await wait(randomDelay());
    walletState = {
      ...walletState,
      network,
    };
    notify();
    return network;
  }

  async signMessage(message: string) {
    if (!walletState.address) {
      throw new Error("Wallet not connected");
    }
    await wait(randomDelay());
    return generateHash(`${walletState.address}:${message}`);
  }

  async sendTransaction(request: MockTransactionRequest) {
    if (!walletState.address) {
      throw new Error("Wallet not connected");
    }

    const token = request.token ?? "ETH";
    const rawValue = request.value ?? 0;
    const numericValue =
      typeof rawValue === "bigint"
        ? Number(rawValue) / Math.pow(10, PAYMENT_TOKEN_DECIMALS[token])
        : Number(rawValue);

    if (Number.isFinite(numericValue) && numericValue > walletState.balances[token]) {
      throw new Error(`Insufficient ${token} balance`);
    }

    await wait(randomDelay());
    blockNumber += 1;
    if (Number.isFinite(numericValue) && numericValue > 0) {
      walletState = {
        ...walletState,
        balances: {
          ...walletState.balances,
          [token]: Number((walletState.balances[token] - numericValue).toFixed(8)),
        },
      };
      notify();
    }

    return {
      hash: generateHash(`${request.to}:${request.data ?? ""}`),
      status: 1 as const,
      blockNumber,
      from: walletState.address!,
      to: request.to,
      confirmations: 1,
      network: walletState.network,
      token,
    } satisfies MockTransactionReceipt;
  }
}

const walletSingleton = new MockWallet();

export function getMockWallet() {
  return walletSingleton;
}
