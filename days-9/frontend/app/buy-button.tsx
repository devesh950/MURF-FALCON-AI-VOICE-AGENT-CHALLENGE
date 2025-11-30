
"use client";
import React, { useState } from 'react';

interface BuyButtonProps {
  productId: string;
  productName: string;
}

export default function BuyButton({ productId, productName }: BuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = () => {
    setLoading(true);
    setError(null);
    fetch('http://localhost:8001/acp/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ line_items: [{ product_id: productId, quantity: 1 }] }),
    })
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.id) {
          setSuccess(true);
        } else {
          setError('Order failed');
        }
      })
      .catch(() => {
        setLoading(false);
        setError('Order failed');
      });
  };

  if (success) return <span style={{ color: 'green' }}>Ordered!</span>;

  return (
    <button onClick={handleBuy} disabled={loading} style={{ marginTop: 8, padding: '6px 12px' }}>
      {loading ? 'Ordering...' : `Buy ${productName}`}
    </button>
  );
}
