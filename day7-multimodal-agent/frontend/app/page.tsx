"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Microphone, Package, Clock, CheckCircle } from "@phosphor-icons/react";
import { VoiceAgent } from "@/components/voice-agent";
import { CartDisplay } from "@/components/cart-display";
import { OrderHistory } from "@/components/order-history";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [currentView, setCurrentView] = useState<"home" | "agent" | "orders">("home");
  const [cartItems, setCartItems] = useState<number>(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Swiggy-style Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <ShoppingCart size={32} weight="bold" className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">QuickMart Express</h1>
                <p className="text-sm text-gray-500">Voice-Powered Grocery Shopping</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("orders")}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform border-2 border-orange-600"
              >
                <Package size={24} weight="fill" className="text-white" />
                <span className="font-bold text-white">Orders</span>
              </button>
              
              {cartItems > 0 && (
                <div className="relative">
                  <ShoppingCart size={24} weight="fill" className="text-primary" />
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentView === "home" && (
          <div className="max-w-4xl mx-auto">
            {/* Hero Section - Swiggy Style */}
            <div className="text-center mb-12 animate-slide-in">
              <div className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 rounded-full mb-4 shadow-lg">
                <span className="text-white font-bold text-lg">🎤 Voice Ordering Available</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-4 drop-shadow-sm">
                Order Groceries with Your Voice
              </h2>
              <p className="text-xl text-gray-800 mb-8 font-medium max-w-2xl mx-auto">
                Simply speak to our AI assistant and get your groceries delivered fast!
              </p>
              
              <button
                onClick={() => setCurrentView("agent")}
                className="group bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center gap-3 mx-auto border-4 border-orange-700 hover:scale-110 transform"
              >
                <Microphone size={32} weight="fill" />
                <span>Start Voice Ordering</span>
                <div className="w-0 group-hover:w-4 transition-all duration-300 overflow-hidden">
                  →
                </div>
              </button>
            </div>

            {/* Features Grid - Swiggy Style */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-gradient-to-br from-orange-400 to-orange-500 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Microphone size={32} weight="fill" className="text-orange-500" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Voice Commands</h3>
                <p className="text-white text-base font-medium">
                  Just say what you need - "Add 2 loaves of bread" or "I need pasta ingredients"
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-400 to-green-500 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <Clock size={32} weight="fill" className="text-green-600" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Fast Delivery</h3>
                <p className="text-white text-base font-medium">
                  Track your order in real-time from preparation to doorstep delivery
                </p>
              </div>

              <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:scale-105 transform">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-md">
                  <CheckCircle size={32} weight="fill" className="text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Smart Shopping</h3>
                <p className="text-white text-base font-medium">
                  Get recipe suggestions and automatic ingredient bundling for meals
                </p>
              </div>
            </div>

            {/* Popular Items - Swiggy Style Cards */}
            <div className="bg-gradient-to-br from-white to-orange-50 p-8 rounded-2xl shadow-2xl border-2 border-orange-200">
              <h3 className="text-3xl font-black text-gray-900 mb-6">🔥 Popular Items</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { name: "Fresh Bread", emoji: "🍞", price: "$2.49", color: "from-yellow-100 to-yellow-200" },
                  { name: "Farm Eggs", emoji: "🥚", price: "$3.99", color: "from-amber-100 to-amber-200" },
                  { name: "Whole Milk", emoji: "🥛", price: "$3.49", color: "from-blue-100 to-blue-200" },
                  { name: "Pasta", emoji: "🍝", price: "$1.99", color: "from-orange-100 to-orange-200" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className={`bg-gradient-to-br ${item.color} p-5 rounded-xl border-3 border-gray-800 hover:scale-105 hover:shadow-xl transition-all cursor-pointer`}
                  >
                    <div className="text-5xl mb-3">{item.emoji}</div>
                    <div className="font-black text-gray-900 text-base">{item.name}</div>
                    <div className="text-primary font-black text-xl">{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentView === "agent" && (
          <div className="max-w-6xl mx-auto">
            <button
              onClick={() => setCurrentView("home")}
              className="mb-6 text-primary hover:text-primary-600 font-semibold flex items-center gap-2"
            >
              ← Back to Home
            </button>
            <VoiceAgent onCartUpdate={setCartItems} />
          </div>
        )}

        {currentView === "orders" && (
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setCurrentView("home")}
              className="mb-6 text-primary hover:text-primary-600 font-semibold flex items-center gap-2"
            >
              ← Back to Home
            </button>
            <OrderHistory />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 QuickMart Express. Powered by AI Voice Technology.</p>
        </div>
      </footer>
    </div>
  );
}
