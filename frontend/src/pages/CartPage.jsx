import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Minus, Plus } from 'lucide-react';

export default function CartPage() {
  const { cart, loading, error, updateCartQuantity, removeFromCart, clearCart, totalPrice, totalItemsCount } = useCart();
  const navigate = useNavigate();

  const handleQtyChange = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    await updateCartQuantity(productId, newQty);
  };

  const handleCheckout = () => {
    if (totalItemsCount > 0) {
      navigate('/checkout');
    }
  };

  if (loading && !cart) {
    return (
      <div className="cart-loading">
        <div className="spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Shopping Cart</h1>
          <p className="page-subtitle">Manage items you want to purchase</p>
        </div>
        <Link to="/products" className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Products
        </Link>
      </div>

      {error && (
        <div className="toast toast-error" role="alert">
          <span>✕</span> {error}
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Explore our premium product catalog and add items to your cart.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items List */}
          <div className="cart-items-section">
            <div className="cart-items-list">
              {cart.items.map((item) => {
                if (!item.product) return null;
                const { _id, name, description, price, imageUrl, category } = item.product;
                return (
                  <div key={item._id || _id} className="cart-item-card">
                    <div className="cart-item-image-wrap">
                      {imageUrl ? (
                        <img src={imageUrl} alt={name} className="cart-item-image" />
                      ) : (
                        <div className="cart-item-image-fallback">📦</div>
                      )}
                    </div>

                    <div className="cart-item-details">
                      <div className="cart-item-info">
                        <span className="cart-item-category">{category}</span>
                        <h3 className="cart-item-name">{name}</h3>
                        <p className="cart-item-description">{description}</p>
                      </div>

                      <div className="cart-item-actions-price">
                        <div className="cart-item-qty-selector">
                          <button
                            className="qty-btn"
                            onClick={() => handleQtyChange(_id, item.quantity, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleQtyChange(_id, item.quantity, 1)}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <div className="cart-item-pricing">
                          <span className="unit-price">₹{price?.toLocaleString('en-IN')} each</span>
                          <span className="total-item-price">
                            ₹{(price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(_id)}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="cart-actions-footer">
              <button className="btn btn-danger-outline" onClick={clearCart}>
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* Cart Summary Panel */}
          <div className="cart-summary-section">
            <div className="cart-summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal ({totalItemsCount} items)</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              <div className="summary-row">
                <span>Estimated Tax</span>
                <span>₹0.00</span>
              </div>
              <div className="divider"></div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              <button className="btn btn-primary w-full checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
