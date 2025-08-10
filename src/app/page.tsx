import Image from "next/image";
import Link from "next/link";
import { products } from "@/data/products";
import { Button } from "./components/ui/button";
import FeaturedProducts from "./components/FeaturedProducts";
import Header from "./header";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />

      {/* Hero Section with enhanced luxury feel */}
      <section className="relative w-full h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
        {/* Animated background overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <Image
          src="/images/hero.png"
          alt="Luxury Designer Collection"
          fill
          className="object-cover opacity-30"
          priority
        />

        <div className="relative z-10 text-center text-white px-4 max-w-4xl">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-sm font-medium mb-4">
              ✨ Exclusive Luxury Collection
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-thin mb-6 tracking-wider">
            <span className="font-light">CRYPTO</span>
            <br />
            <span className="font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-600 bg-clip-text text-transparent">
              COUTURE
            </span>
          </h1>

          <p className="text-xl md:text-2xl font-light mb-8 text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Curated luxury fashion, bags, and jewelry.
            <br />
            <span className="text-yellow-400 font-medium">
              BTC • ETH • USDT • USDC accepted
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="px-8 py-4 text-lg bg-white text-black hover:bg-gray-100 transition-all duration-300 rounded-none border-none font-medium">
              EXPLORE COLLECTION
            </Button>
            <Button className="px-8 py-4 text-lg bg-transparent text-white border-2 border-white/30 hover:border-white hover:bg-white/10 transition-all duration-300 rounded-none backdrop-blur-sm">
              WATCH LOOKBOOK
            </Button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60">
          <div className="flex flex-col items-center animate-bounce">
            <span className="text-sm mb-2">SCROLL</span>
            <div className="w-px h-8 bg-white/40"></div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Enhanced Store Section */}
      <section className="w-full py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4 text-gray-900">
              Our <span className="font-semibold">Collection</span>
            </h2>
            <div className="w-24 h-px bg-gray-900 mx-auto mb-8"></div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Discover handpicked luxury items from the world's most prestigious
              designers
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="flex justify-center mb-12">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search luxury items..."
                className="w-full px-6 py-4 bg-white border border-gray-200 rounded-none focus:outline-none focus:border-gray-400 transition-colors text-gray-900 placeholder-gray-500"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation */}
          <nav className="flex justify-center mb-16">
            <div className="flex space-x-12 border-b border-gray-200">
              {[
                { name: "All", href: "/all", active: true },
                { name: "Bags", href: "/bags" },
                { name: "Shoes", href: "/shoes" },
                { name: "Clothing", href: "/clothes" },
                { name: "Jewelry", href: "/jewelry" },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={category.href}
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    category.active
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </nav>

          {/* Enhanced Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative overflow-hidden">
                    <Image
                      src={product.images.main}
                      alt={product.title}
                      width={400}
                      height={400}
                      className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button className="bg-white text-black hover:bg-gray-100 rounded-none px-6 py-2 text-sm font-medium">
                          VIEW DETAILS
                        </Button>
                      </div>
                    </div>

                    {/* Wishlist button */}
                    <button className="absolute top-4 right-4 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white">
                      <svg
                        className="w-4 h-4 text-gray-700"
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
                    </button>
                  </div>

                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-semibold text-gray-900">
                        ${product.price.toLocaleString()}
                      </p>
                      <div className="flex items-center text-xs text-gray-400">
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5L12 14l-4.5-4.5L9 8l3 3 6-6 1.5 1.5z" />
                        </svg>
                        Crypto Accepted
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          <div className="text-center mt-16">
            <Button className="px-12 py-4 bg-gray-900 text-white hover:bg-gray-800 rounded-none font-medium">
              LOAD MORE ITEMS
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Authenticity Guaranteed
              </h3>
              <p className="text-gray-600 text-sm">
                Every item verified by luxury experts
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Crypto Payments</h3>
              <p className="text-gray-600 text-sm">
                Bitcoin, Ethereum, and stablecoins accepted
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Worldwide Shipping</h3>
              <p className="text-gray-600 text-sm">
                Insured delivery to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
