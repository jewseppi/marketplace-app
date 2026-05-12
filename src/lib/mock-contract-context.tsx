"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getMockMarketplace,
  type MockListing,
  type MockOrder,
  type PaymentToken,
} from "@/lib/mock-contract";
import {
  getMockWallet,
  type MockWalletState,
} from "@/lib/mock-wallet";

const contract = getMockMarketplace();
const wallet = getMockWallet();

type MockContractContextValue = {
  contract: ReturnType<typeof getMockMarketplace>;
  activeListings: MockListing[];
  orders: MockOrder[];
  refresh: () => void;
};

type MockWalletContextValue = {
  wallet: ReturnType<typeof getMockWallet>;
  walletState: MockWalletState;
  connected: boolean;
  address: string | null;
  connect: () => Promise<{ address: string; network: string }>;
  disconnect: () => void;
  getBalance: (token?: PaymentToken) => Promise<number>;
};

const MockContractContext = createContext<MockContractContextValue | null>(null);
const MockWalletContext = createContext<MockWalletContextValue | null>(null);

function useMarketplaceSnapshot() {
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const unsubscribe = contract.subscribe(() => setVersion((current) => current + 1));
    return () => {
      unsubscribe();
    };
  }, []);

  return useMemo(() => {
    const snapshot = contract.getSnapshot();
    return {
      version,
      activeListings: snapshot.listings.filter((listing) => listing.isActive),
      orders: snapshot.orders,
    };
  }, [version]);
}

function useWalletSnapshot() {
  const [walletState, setWalletState] = useState<MockWalletState>(() => wallet.getState());

  useEffect(() => {
    const unsubscribe = wallet.subscribe(() => setWalletState(wallet.getState()));
    return () => {
      unsubscribe();
    };
  }, []);

  return walletState;
}

export function MockContractProvider({ children }: { children: ReactNode }) {
  const { activeListings, orders } = useMarketplaceSnapshot();
  const walletState = useWalletSnapshot();

  const contractValue = useMemo<MockContractContextValue>(() => ({
    contract,
    activeListings,
    orders,
    refresh: () => {
      // subscription-backed state updates automatically; this allows manual re-sync calls.
      return undefined;
    },
  }), [activeListings, orders]);

  const walletValue = useMemo<MockWalletContextValue>(() => ({
    wallet,
    walletState,
    connected: walletState.connected,
    address: walletState.address,
    connect: async () => wallet.connect(),
    disconnect: () => wallet.disconnect(),
    getBalance: (token?: PaymentToken) => wallet.getBalance(token),
  }), [walletState]);

  return (
    <MockWalletContext.Provider value={walletValue}>
      <MockContractContext.Provider value={contractValue}>
        {children}
      </MockContractContext.Provider>
    </MockWalletContext.Provider>
  );
}

export function useMockContract() {
  const context = useContext(MockContractContext);
  if (!context) {
    throw new Error("useMockContract must be used within MockContractProvider");
  }
  return context;
}

export function useMockWallet() {
  const context = useContext(MockWalletContext);
  if (!context) {
    throw new Error("useMockWallet must be used within MockContractProvider");
  }
  return context;
}
