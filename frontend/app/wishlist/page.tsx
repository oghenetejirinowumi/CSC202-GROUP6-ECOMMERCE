'use client';

export default function WishlistPage() {
  return (
    <div style={{ 
      padding: '20px',
      width: '100%'
    }}>
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '20px',
        color: '#1f2937'
      }}>
        Wishlist
      </h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px'
      }}>
        <p style={{
          fontSize: '18px',
          color: '#6b7280'
        }}>
          Nothing in wishlist
        </p>
      </div>
    </div>
  );
}