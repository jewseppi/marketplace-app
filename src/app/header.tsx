"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg text-gray-900"
          : "bg-transparent text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="text-2xl font-light tracking-wider">
              <span className="font-light">CRYPTO</span>
              <span className="font-bold ml-1">COUTURE</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/collections"
              className={`font-medium hover:opacity-70 transition-opacity ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Collections
            </Link>
            <Link
              href="/bags"
              className={`font-medium hover:opacity-70 transition-opacity ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Bags
            </Link>
            <Link
              href="/jewelry"
              className={`font-medium hover:opacity-70 transition-opacity ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              Jewelry
            </Link>
            <Link
              href="/about"
              className={`font-medium hover:opacity-70 transition-opacity ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
            >
              About
            </Link>
          </nav>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              className={`p-2 hover:opacity-70 transition-opacity ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
              aria-label="Search"
            >
              <svg
                className="w-5 h-5"
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
            </button>

            {/* Account */}
            <button
              className={`p-2 hover:opacity-70 transition-opacity ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
              aria-label="Account"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </button>

            {/* Crypto Wallet */}
            <button
              className={`p-2 hover:opacity-70 transition-opacity flex items-center ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
              aria-label="Connect Wallet"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.5 7.5L12 14l-4.5-4.5L9 8l3 3 6-6 1.5 1.5z" />
              </svg>
              <span className="text-xs font-medium hidden lg:block">
                WALLET
              </span>
            </button>

            {/* Cart */}
            <button
              className={`p-2 hover:opacity-70 transition-opacity relative ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
              aria-label="Shopping Cart"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v5a2 2 0 002 2h8.5M17 13v5a2 2 0 002 2H21M9 19v.01M20 19v.01"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                2
              </span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`md:hidden p-2 ${
                isScrolled ? "text-gray-900" : "text-white"
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            className={`md:hidden py-4 border-t ${
              isScrolled ? "border-gray-200" : "border-white/20"
            }`}
          >
            <div className="flex flex-col space-y-4">
              <Link
                href="/collections"
                className={`font-medium ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Collections
              </Link>
              <Link
                href="/bags"
                className={`font-medium ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Bags
              </Link>
              <Link
                href="/jewelry"
                className={`font-medium ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Jewelry
              </Link>
              <Link
                href="/about"
                className={`font-medium ${
                  isScrolled ? "text-gray-900" : "text-white"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-4 border-t border-gray-200/20">
                <button className="w-full text-left py-2 px-4 bg-yellow-400 text-black font-medium rounded">
                  Connect Wallet
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
