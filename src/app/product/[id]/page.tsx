"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import Header from "@/app/header";

interface ProductPageProps {
  params: { id: string };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedCrypto, setSelectedCrypto] = useState("BTC");

  const productId = parseInt(params.id, 10);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-light mb-4 text-gray-900">
            Product Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            We couldn't find the product you're looking for.
          </p>
          <Link
            href="/"
            className="px-8 py-3 bg-gray-900 text-white hover:bg-gray-800 transition-colors font-medium"
          >
            RETURN TO STORE
          </Link>
        </div>
      </div>
    );
  }

  const allImages = [product.images.main, ...product.images.additional];
  const cryptoPrices = {
    BTC: (product.price / 45000).toFixed(6),
    ETH: (product.price / 2500).toFixed(4),
    USDT: product.price.toFixed(2),
    USDC: product.price.toFixed(2),
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="pt-20 max-w-7xl mx-auto px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-gray-900">
              Home
            </Link>
            <span>/</span>
            <Link href="/collections" className="hover:text-gray-900">
              Collections
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.title}</span>
          </div>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden bg-gray-50 rounded-lg">
              <Image
                src={allImages[selectedImage]}
                alt={product.title}
                width={600}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            </div>

            {/* Thumbnail Images */}
            <div className="flex space-x-4">
              {allImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index
                      ? "border-gray-900"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.title} view ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center mb-4">
                <div className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700 mr-3">
                  LUXURY
                </div>
                <div className="flex items-center text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-600 text-sm">
                    (127 reviews)
                  </span>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
                {product.title}
              </h1>

              <p className="text-gray-600 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Pricing */}
            <div className="border-t border-b border-gray-100 py-8">
              <div className="mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${product.price.toLocaleString()}
                </div>
                <p className="text-gray-500">
                  Free worldwide shipping • Authenticity guaranteed
                </p>
              </div>

              {/* Crypto Payment Options */}
              <div className="space-y-4">
                <h3 className="font-medium text-gray-900">
                  Pay with Cryptocurrency
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(cryptoPrices).map(([crypto, price]) => (
                    <button
                      key={crypto}
                      onClick={() => setSelectedCrypto(crypto)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedCrypto === crypto
                          ? "border-gray-900 bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{crypto}</span>
                        <div className="text-right">
                          <div className="text-sm font-mono">{price}</div>
                          <div className="text-xs text-gray-500">{crypto}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-6">
              {/* Quantity Selector */}
              <div className="flex items-center space-x-4">
                <label className="font-medium text-gray-900">Quantity:</label>
                <div className="flex items-center border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 hover:bg-gray-50 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full py-4 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors rounded-lg">
                  ADD TO CART
                </button>

                <button className="w-full py-4 bg-yellow-400 text-black font-medium hover:bg-yellow-500 transition-colors rounded-lg">
                  BUY NOW WITH {selectedCrypto}
                </button>

                <div className="flex space-x-4">
                  <button className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    SAVE
                  </button>
                  <button className="flex-1 py-3 border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                      />
                    </svg>
                    SHARE
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="space-y-6 pt-8 border-t border-gray-100">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Product Details
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex justify-between">
                    <span>Material:</span>
                    <span>Premium Leather</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Origin:</span>
                    <span>Made in Italy</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Care:</span>
                    <span>Professional cleaning recommended</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authenticity:</span>
                    <span>Certificate included</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">
                  Shipping & Returns
                </h3>
                <div className="space-y-2 text-gray-600 text-sm">
                  <p>• Free worldwide shipping on all orders</p>
                  <p>• 30-day return policy</p>
                  <p>• Fully insured delivery</p>
                  <p>• Signature required on delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-24">
          <h2 className="text-3xl font-light text-center mb-12">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products
              .filter((p) => p.id !== product.id)
              .slice(0, 4)
              .map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/product/${relatedProduct.id}`}
                >
                  <div className="group cursor-pointer">
                    <div className="aspect-square overflow-hidden bg-gray-50 rounded-lg mb-4">
                      <Image
                        src={relatedProduct.images.main}
                        alt={relatedProduct.title}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {relatedProduct.title}
                    </h3>
                    <p className="text-gray-600">
                      ${relatedProduct.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
