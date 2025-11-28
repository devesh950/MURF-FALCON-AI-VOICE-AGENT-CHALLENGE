"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, Truck, CookingPot } from "@phosphor-icons/react";

interface Order {
  id: string;
  date: string;
  items: number;
  total: number;
  status: "received" | "confirmed" | "being_prepared" | "out_for_delivery" | "delivered";
  itemsList: string[];
}

export function OrderHistory() {
  // Mock order data - will be fetched from backend
  const [orders] = useState<Order[]>([
    {
      id: "ORD-20251127143022",
      date: "2025-11-27",
      items: 5,
      total: 24.95,
      status: "out_for_delivery",
      itemsList: ["Bread x2", "Milk x1", "Eggs x1", "Butter x1"],
    },
    {
      id: "ORD-20251126102015",
      date: "2025-11-26",
      items: 3,
      total: 15.47,
      status: "delivered",
      itemsList: ["Pasta x2", "Tomato Sauce x2", "Olive Oil x1"],
    },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received":
        return <Clock size={24} weight="duotone" className="text-blue-500" />;
      case "confirmed":
        return <CheckCircle size={24} weight="duotone" className="text-green-500" />;
      case "being_prepared":
        return <CookingPot size={24} weight="duotone" className="text-orange-500" />;
      case "out_for_delivery":
        return <Truck size={24} weight="duotone" className="text-primary" />;
      case "delivered":
        return <CheckCircle size={24} weight="fill" className="text-green-600" />;
      default:
        return <Package size={24} weight="duotone" className="text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    return status
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "being_prepared":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "out_for_delivery":
        return "bg-primary/10 text-primary border-primary/20";
      case "delivered":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-600 p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Package size={28} weight="bold" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Order History</h2>
              <p className="text-sm text-white/80">Track all your orders</p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="p-6">
          {orders.length === 0 ? (
            <div className="text-center py-12">
              <Package size={64} weight="duotone" className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500 font-medium">No orders yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Start shopping to see your orders here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-50 p-6 rounded-xl border-3 border-orange-300 hover:border-primary transition-all hover:shadow-2xl shadow-lg hover:scale-102 transform"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-black text-gray-900 text-xl mb-1">
                        Order {order.id}
                      </h3>
                      <p className="text-sm text-gray-800 font-semibold">
                        {new Date(order.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ${order.total.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-500">{order.items} items</p>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center gap-3 mb-4">
                    {getStatusIcon(order.status)}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold border-2 ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="bg-gradient-to-r from-white to-orange-50 p-4 rounded-lg border-2 border-orange-200 shadow-inner">
                    <p className="text-sm font-black text-gray-900 mb-2">📦 Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {order.itemsList.map((item, idx) => (
                        <span
                          key={idx}
                          className="bg-gradient-to-r from-orange-100 to-yellow-100 px-3 py-1.5 rounded-full text-sm text-gray-900 border-2 border-orange-300 font-bold shadow-sm"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
                      View Details
                    </button>
                    {order.status !== "delivered" && (
                      <button className="flex-1 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
                        Track Order
                      </button>
                    )}
                    {order.status === "delivered" && (
                      <button className="flex-1 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 transform">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
