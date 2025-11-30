
"use client";


import Catalog from './catalog';
import LastOrder from './order';
import VoiceAssistant from './voice-assistant';
import Cart, { CartItem } from './cart';
import { useState } from 'react';

export default function Home() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const handleAddToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex(i => i.productId === item.productId && i.size === item.size && i.color === item.color);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
  };
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter(i => i.productId !== productId));
  };
  const handleCheckout = () => {
    // TODO: Implement checkout logic and order confirmation
    alert('Order placed! (Confirmation UI coming soon)');
    setCart([]);
  };
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, alignItems: 'flex-start' }}>
        <div style={{ flex: 2, minWidth: 340 }}>
          <Catalog onAddToCart={handleAddToCart} />
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <Cart items={cart} onRemove={handleRemoveFromCart} onCheckout={handleCheckout} />
          <VoiceAssistant />
          <LastOrder />
        </div>
      </div>
    </>
  );
}
