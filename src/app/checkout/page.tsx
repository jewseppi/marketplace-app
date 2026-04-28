"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Header from "@/app/header";
import { useCart } from "@/app/components/CartProvider";

const CRYPTO_OPTIONS = ["BTC", "ETH", "USDT", "USDC"] as const;

export default function CheckoutPage() {
  const { lines, itemCount, subtotal, setQuantity, removeItem, clear } =
    useCart();
  const [selectedCrypto, setSelectedCrypto] =
    useState<(typeof CRYPTO_OPTIONS)[number]>("BTC");

  if (itemCount === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="pt-32 max-w-3xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-light text-gray-900 mb-4">
            Your cart is empty
          </h1>
          <p className="text-gray-600 mb-8">
            Browse the collection to add something timeless.
          </p>
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
        <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-8">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart lines */}
          <div className="lg:col-span-2 space-y-6">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex gap-4 border-b border-gray-100 pb-6"
              >
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden">
                  <Image
                    src={line.product.images.main}
                    alt={line.product.title}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <Link
                    href={`/product/${line.id}`}
                    className="font-medium text-gray-900 hover:text-gray-700"
                  >
                    {line.product.title}
                  </Link>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                    {line.product.description}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() =>
                          setQuantity(line.id, line.quantity - 1)
                        }
                        className="px-3 py-1 hover:bg-gray-50 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 font-medium text-sm">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(line.id, line.quantity + 1)
                        }
                        className="px-3 py-1 hover:bg-gray-50 transition-colors"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(line.id)}
                      className="text-sm text-gray-500 hover:text-gray-900"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right font-medium text-gray-900">
                  ${(line.product.price * line.quantity).toLocaleString()}
                </div>
              </div>
            ))}

            <button
              onClick={clear}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Clear cart
            </button>
          </div>

          {/* Summary */}
          <aside className="lg:col-span-1">
            <div className="border border-gray-200 rounded-lg p-6 space-y-6 sticky top-24">
              <h2 className="text-lg font-medium text-gray-900">
                Order Summary
              </h2>

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
                        selectedCrypto === crypto
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {crypto}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled
                className="w-full py-3 bg-yellow-400 text-black font-medium rounded-lg opacity-80 cursor-not-allowed"
                title="Crypto payment integration coming soon"
              >
                COMPLETE PURCHASE WITH {selectedCrypto}
              </button>
              <p className="text-xs text-gray-500 text-center">
                Crypto payment integration coming soon.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
