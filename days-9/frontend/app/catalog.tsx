"use client";
import React, { useEffect, useState } from 'react';
import BuyButton from './buy-button';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  color?: string;
  size?: string[];
  image?: string;
}

export default function Catalog({ onAddToCart }: { onAddToCart: (item: any) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<{ [id: string]: string }>({});
  const [selectedColor, setSelectedColor] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    fetch('http://localhost:8001/acp/catalog')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ fontSize: 20, color: '#888', textAlign: 'center', marginTop: 40 }}>Loading products...</div>;

  return (
    <section>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24, color: '#222', letterSpacing: 1 }}>Shop the Latest</h2>
      <div className="product-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: 28,
      }}>
        {products.map((p) => (
          <div key={p.id} className="product-card" style={{
            background: 'linear-gradient(135deg, #e3f0ff 0%, #fceabb 100%)',
            borderRadius: 18,
            boxShadow: '0 4px 18px rgba(60,60,100,0.13)',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            minHeight: 360,
            position: 'relative',
            border: '2px solid #fff',
            overflow: 'hidden',
            transition: 'transform 0.15s',
          }}>
            <div style={{ width: '100%', height: 180, background: '#fff', borderBottom: '1px solid #e3e6ef', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              {p.image ? (
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span role="img" aria-label="product" style={{ fontSize: 48, color: '#b0b3c6' }}>🛍️</span>
              )}
            </div>
            <div style={{ padding: '18px 20px 12px 20px', width: '100%' }}>
              <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 4, color: '#2d2d2d' }}>{p.name}</div>
              <div style={{ color: '#666', fontSize: 15, marginBottom: 8 }}>{p.description}</div>
              <div style={{ fontWeight: 600, fontSize: 18, color: '#ff7043', marginBottom: 8 }}>{p.price} {p.currency}</div>
              {p.color && (
                <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                  <b>Color:</b> {p.color}
                </div>
              )}
              {p.size && (
                <div style={{ fontSize: 14, color: '#555', marginBottom: 4 }}>
                  <b>Sizes:</b> {p.size.map(size => (
                    <button
                      key={size}
                      style={{
                        marginLeft: 6,
                        padding: '2px 8px',
                        borderRadius: 6,
                        border: selectedSize[p.id] === size ? '2px solid #3f51b5' : '1px solid #bbb',
                        background: selectedSize[p.id] === size ? '#e3f0ff' : '#fff',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      onClick={() => setSelectedSize(s => ({ ...s, [p.id]: size }))}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 12, width: '100%' }}>
                <button
                  style={{
                    background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 8,
                    padding: '10px 22px',
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  onClick={() => onAddToCart({
                    productId: p.id,
                    name: p.name,
                    price: p.price,
                    currency: p.currency,
                    quantity: 1,
                    image: p.image,
                    size: selectedSize[p.id] || (p.size && p.size[0]),
                    color: p.color,
                  })}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
