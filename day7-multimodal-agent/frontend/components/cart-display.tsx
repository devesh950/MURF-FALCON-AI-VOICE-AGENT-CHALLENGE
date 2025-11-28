"use client";

import { useState } from "react";
import { ShoppingCart, Trash, Plus, Minus } from "@phosphor-icons/react";

interface CartItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  unit: string;
}

export function CartDisplay() {
  // Mock cart data - will be connected to agent state
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "g002",
      name: "Artisan Bread",
      brand: "Baker's Best",
      price: 2.49,
      quantity: 2,
      unit: "loaf",
    },
  ]);

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items
        .map((item) =>
          item.id === id
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-accent to-accent-dark p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <ShoppingCart size={28} weight="bold" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Your Cart</h3>
            <p className="text-sm text-white/80">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-6 max-h-[500px] overflow-y-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart size={64} weight="duotone" className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-2">
              Start adding items by speaking to the assistant!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-orange-50 to-yellow-50 p-4 rounded-xl border-3 border-orange-300 hover:border-primary hover:shadow-xl transition-all shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-black text-gray-900 text-lg">{item.name}</h4>
                    <p className="text-sm text-gray-700 font-semibold">{item.brand}</p>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-110 transform"
                  >
                    <Trash size={20} weight="fill" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      <Minus size={16} weight="bold" />
                    </button>
                    <span className="font-black text-gray-900 min-w-[3rem] text-center text-lg">
                      {item.quantity} {item.unit}
                      {item.quantity > 1 ? "s" : ""}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-all shadow-md hover:shadow-lg"
                    >
                      <Plus size={16} weight="bold" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                    <p className="font-bold text-primary text-lg">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Total & Checkout */}
      {cartItems.length > 0 && (
        <div className="p-6 bg-gray-50 border-t">
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-semibold text-gray-700">Total</span>
            <span className="text-2xl font-bold text-primary">
              ${total.toFixed(2)}
            </span>
          </div>
          <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-black text-lg shadow-2xl hover:shadow-3xl transition-all border-4 border-green-700 hover:scale-105 transform">
            Proceed to Checkout
          </button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Or say "Place my order" to the assistant
          </p>
        </div>
      )}
    </div>
  );
}
