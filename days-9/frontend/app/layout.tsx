import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, sans-serif', background: '#f6f7fb' }}>
        <header style={{
          background: 'linear-gradient(90deg, #3f51b5 0%, #2196f3 100%)',
          color: 'white',
          padding: '24px 0 16px 0',
          marginBottom: 32,
          boxShadow: '0 2px 8px rgba(60,60,100,0.08)',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0, letterSpacing: 2 }}>Lipsha Clothing</h1>
          <div style={{ fontSize: 18, fontWeight: 400, marginTop: 8 }}>Trendy Styles. Great Prices. Voice Shopping Enabled.</div>
        </header>
        <main style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>{children}</main>
        <footer style={{ textAlign: 'center', color: '#888', padding: 24, fontSize: 15, marginTop: 40 }}>
          &copy; {new Date().getFullYear()} Lipsha Clothing. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
