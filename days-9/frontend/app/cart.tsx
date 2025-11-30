"use client";
import React, { useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
  image?: string;
  size?: string;
  color?: string;
}

export default function Cart({ items, onRemove, onCheckout }: {
  items: CartItem[];
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return (
    <section style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(60,60,100,0.08)', padding: 24, marginTop: 32 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: '#3f51b5' }}>Your Cart</h2>
      {items.length === 0 ? (
        <div style={{ color: '#888', fontSize: 16 }}>Your cart is empty.</div>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map(item => (
              <li key={item.productId} style={{ display: 'flex', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
                {item.image && <img src={item.image} alt={item.name} style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8, marginRight: 12 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: 14, color: '#555' }}>{item.price} {item.currency} x {item.quantity}</div>
                  {item.size && <div style={{ fontSize: 13, color: '#888' }}>Size: {item.size}</div>}
                  {item.color && <div style={{ fontSize: 13, color: '#888' }}>Color: {item.color}</div>}
                </div>
                <button onClick={() => onRemove(item.productId)} style={{ background: '#ff7043', color: 'white', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer' }}>Remove</button>
              </li>
            ))}
          </ul>
          <div style={{ fontWeight: 700, fontSize: 18, marginTop: 12 }}>Total: {total} {items[0]?.currency}</div>
          <button onClick={onCheckout} style={{ marginTop: 18, background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)', color: 'white', border: 'none', borderRadius: 8, padding: '12px 28px', fontSize: 18, fontWeight: 600, cursor: 'pointer' }}>Checkout</button>
        </>
      )}
    </section>
  );
}
