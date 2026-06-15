import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

const CATEGORY_EMOJIS = {
  Electronics: '💻',
  Clothing: '👗',
  Food: '🍎',
  Books: '📚',
  Sports: '⚽',
  Home: '🏠',
  Beauty: '💄',
  Toys: '🧸',
  Other: '📦',
};

export default function ProductCard({ product }) {
  const { openModal, deleteProduct } = useProducts();
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    const success = await addToCart(product._id, 1);
    if (success) {
      alert(`"${product.name}" added to cart successfully!`);
    } else {
      alert("Could not add item to cart. Make sure you are logged in.");
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      await deleteProduct(product._id);
    }
  };

  const stockColor =
    product.stock === 0 ? 'out-of-stock' : product.stock < 10 ? 'low-stock' : 'in-stock';

  return (
    <div className={`product-card ${!product.isActive ? 'inactive-card' : ''}`}>
      {/* Image */}
      <div className="card-image-wrap">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="card-image" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
        ) : null}
        <div className="card-image-fallback" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
          <span className="category-emoji">{CATEGORY_EMOJIS[product.category] || '📦'}</span>
        </div>
        <div className="card-badges">
          <span className={`badge category-badge`}>{product.category}</span>
          {!product.isActive && <span className="badge inactive-badge">Inactive</span>}
        </div>
      </div>

      {/* Content */}
      <div className="card-content">
        <h3 className="card-title">{product.name}</h3>
        <p className="card-description">{product.description}</p>

        <div className="card-meta">
          <span className="card-price">₹{product.price?.toLocaleString('en-IN')}</span>
          <span className={`stock-badge ${stockColor}`}>
            {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="card-actions">
        <button
          id={`add-to-cart-btn-${product._id}`}
          className="action-btn add-to-cart-btn"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || !product.isActive}
          title="Add to Cart"
          style={{ background: 'var(--primary-color, #6b46c1)', color: 'white' }}
        >
          🛒
        </button>
        <button
          id={`view-btn-${product._id}`}
          className="action-btn view-btn"
          onClick={() => openModal('view', product)}
          title="View Details"
        >
          👁
        </button>
        <button
          id={`edit-btn-${product._id}`}
          className="action-btn edit-btn"
          onClick={() => openModal('edit', product)}
          title="Edit Product"
        >
          ✏️
        </button>
        <button
          id={`delete-btn-${product._id}`}
          className="action-btn delete-btn"
          onClick={handleDelete}
          title="Delete Product"
        >
          🗑
        </button>
      </div>
    </div>
  );
}
