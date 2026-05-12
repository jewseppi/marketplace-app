"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import Header from "@/app/header";
import { useCart } from "@/app/components/CartProvider";
import { ErrorToast } from "@/components/ui/ErrorToast";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ProductImage } from "@/components/ui/ProductImage";
import { useMockContract, useMockWallet } from "@/lib/mock-contract-context";
import type { PaymentToken } from "@/lib/mock-contract";

type CheckoutOrder = {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  payment: {
    currency: string;
    walletAddress: string;
    expiresAt: string;
  };
  txHashes: string[];
  mockOrderIds: number[];
};

type OrderState = "idle" | "processing" | "error";
type ConfirmationStep = "idle" | "pending" | "confirmed";

const CRYPTO_OPTIONS: PaymentToken[] = ["BTC", "ETH", "USDT", "USDC"];

export default function CheckoutPage() {
  const { lines, itemCount, subtotal, setQuantity, removeItem, clear, refresh, loading } = useCart();
  const { contract } = useMockContract();
  const { connect, connected, address, walletState, getBalance } = useMockWallet();
  const router = useRouter();

  const [selectedCrypto, setSelectedCrypto] = useState<PaymentToken>("BTC");
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [orderState, setOrderState] = useState<OrderState>("idle");
  const [confirmationStep, setConfirmationStep] = useState<ConfirmationStep>("idle");
  const [error, setError] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    let active = true;
    getBalance(selectedCrypto)
      .then((balance) => {
        if (active) {
          setWalletBalance(balance);
        }
      })
      .catch(() => {
        if (active) {
          setWalletBalance(0);
        }
      });

    return () => {
      active = false;
    };
  }, [getBalance, selectedCrypto, walletState]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError("");
    try {
      await connect();
    } catch {
      setError("Wallet connection failed. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  }, [connect]);

  const handleCheckout = useCallback(async () => {
    if (!connected || !address) {
      setError("Connect your wallet to continue");
      return;
    }

    setOrderState("processing");
    setConfirmationStep("pending");
    setError("");

    try {
      const txHashes: string[] = [];
      const mockOrderIds: number[] = [];

      for (const line of lines) {
        const listing = contract.ensureListingForProduct(line.id, selectedCrypto);
        const result = await contract.createOrder(
          listing.itemId,
          selectedCrypto,
          address,
          line.quantity,
        );
        txHashes.push(result.receipt.hash);
        mockOrderIds.push(result.order.orderId);
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cryptoCurrency: selectedCrypto,
          walletAddress: address,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        order?: Omit<CheckoutOrder, "txHashes" | "mockOrderIds">;
      };

      if (!res.ok || !data.order) {
        throw new Error(data.error || "Checkout failed");
      }

      const confirmation: CheckoutOrder = {
        ...data.order,
        txHashes,
        mockOrderIds,
      };

      window.sessionStorage.setItem(
        `crypto-couture-order:${confirmation.id}`,
        JSON.stringify(confirmation),
      );

      setConfirmationStep("confirmed");
      await refresh();
      router.push(`/checkout/confirm/${confirmation.id}`);
    } catch (checkoutError) {
      setError(checkoutError instanceof Error ? checkoutError.message : "Checkout failed");
      setConfirmationStep("idle");
      setOrderState("error");
    }
  }, [address, connected, contract, lines, refresh, router, selectedCrypto]);

  const statusSteps = useMemo(
    () => [
      {
        label: "Payment submitted",
        active: confirmationStep === "pending" || confirmationStep === "confirmed",
        done: confirmationStep === "confirmed",
      },
      {
        label: "Blockchain confirmation",
        active: confirmationStep === "confirmed",
        done: confirmationStep === "confirmed",
      },
    ],
    [confirmationStep],
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="mx-auto flex max-w-5xl items-center justify-center px-6 pt-32">
          <LoadingSpinner size="lg" label="Loading your cart" />
        </div>
      </div>
    );
  }

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 mb-8">Browse the collection to add something timeless.</p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-24 max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-light text-gray-900">Checkout</h1>
            <p className="mt-2 text-sm text-gray-500">Demo crypto checkout with mock wallet + mock contract confirmation.</p>
          </div>
          <span className="rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-gray-600">
            {itemCount} item{itemCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {lines.map((line) => {
              const product = line.product;
              return (
                <div key={line.id} className="flex gap-4 border-b border-gray-100 pb-6">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                    <ProductImage
                      src={product.images.main}
                      alt={product.title}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${line.id}`} className="font-medium text-gray-900 hover:text-gray-700">
                      {product.title}
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">{product.description}</p>

                    <div className="flex items-center justify-between mt-3 gap-4">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setQuantity(line.id, line.quantity - 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className="px-4 py-1 font-medium text-sm">{line.quantity}</span>
                        <button
                          onClick={() => setQuantity(line.id, line.quantity + 1)}
                          className="px-3 py-1 hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                      <button onClick={() => removeItem(line.id)} className="text-sm text-gray-500 hover:text-gray-900">
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="text-right font-medium text-gray-900">${(product.price * line.quantity).toLocaleString()}</div>
                </div>
              );
            })}

            <button onClick={clear} className="text-sm text-gray-500 hover:text-gray-900">
              Clear cart
            </button>
          </div>

          <aside className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 space-y-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900">Order Summary</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Items ({itemCount})</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-gray-900 font-semibold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>${subtotal.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">Pay with</p>
                <div className="grid grid-cols-2 gap-2">
                  {CRYPTO_OPTIONS.map((crypto) => (
                    <button
                      key={crypto}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={`p-2 border rounded-lg text-sm font-medium transition-colors ${
                        selectedCrypto === crypto ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Mock Wallet</p>
                    <p className="text-xs text-gray-500">Simulated MetaMask connection</p>
                  </div>
                  <button
                    onClick={connectWallet}
                    disabled={connected || isConnecting}
                    className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {connected ? "Connected" : isConnecting ? "Connecting..." : "Connect Wallet"}
                  </button>
                </div>

                {connected && address ? (
                  <div className="space-y-2 text-sm text-gray-700">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Wallet address</p>
                      <p className="font-mono text-xs break-all">{address}</p>
                    </div>
                    <div className="flex justify-between">
                      <span>{selectedCrypto} balance</span>
                      <span className="font-medium">{walletBalance.toLocaleString()} {selectedCrypto}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Network</span>
                      <span className="font-medium capitalize">{walletState.network}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Connect your wallet to confirm this mock on-chain purchase.</p>
                )}
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900">Mock payment confirmation</p>
                <div className="space-y-2">
                  {statusSteps.map((step) => (
                    <div key={step.label} className="flex items-center gap-3 text-sm">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${step.done ? "bg-green-500" : step.active ? "bg-yellow-500" : "bg-gray-300"}`}
                      />
                      <span className={step.active ? "text-gray-900" : "text-gray-500"}>{step.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-yellow-900">
                <p className="font-medium">What happens next</p>
                <p className="mt-1 text-yellow-800">After confirmation you’ll land on a demo order page with payment details, mock tx hashes, and fulfillment instructions.</p>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">Review order details</p>
                <p>{lines.length} item type{lines.length === 1 ? "" : "s"} • {itemCount} total piece{itemCount === 1 ? "" : "s"}</p>
                <p>Each cart line is mapped to an in-memory marketplace listing and confirmed with a mock tx hash.</p>
              </div>

              {error ? <ErrorToast message={error} /> : null}

              <button
                onClick={handleCheckout}
                disabled={orderState === "processing" || !connected}
                className="w-full py-3 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {orderState === "processing" ? "CONFIRMING PURCHASE..." : `CONFIRM PURCHASE WITH ${selectedCrypto}`}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
