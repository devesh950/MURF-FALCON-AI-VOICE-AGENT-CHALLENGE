
"use client";
import React, { useState } from 'react';

interface Order {
  id: string;
  items: { product_id: string; name: string; quantity: number; price: number }[];
  total: number;
  currency: string;
  created_at: string;
}

export default function LastOrder() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLastOrder = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8001/acp/orders/last')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrder(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to fetch last order');
        setLoading(false);
      });
  };

  return (
    <section style={{ marginTop: 32 }}>
      <button onClick={fetchLastOrder} style={{ padding: '8px 16px', fontWeight: 'bold' }}>
        View Last Order
      </button>
      {loading && <div>Loading...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {order && (
        <div style={{ marginTop: 16, border: '1px solid #aaa', borderRadius: 8, padding: 16 }}>
          <h3>Last Order</h3>
          <div><b>Order ID:</b> {order.id}</div>
          <div><b>Date:</b> {new Date(order.created_at).toLocaleString()}</div>
          <ul>
            {order.items.map((item) => (
              <li key={item.product_id}>
                {item.name} x{item.quantity} – {item.price} {order.currency}
              </li>
            ))}
          </ul>
          <div><b>Total:</b> {order.total} {order.currency}</div>
        </div>
      )}
    </section>
  );
}
