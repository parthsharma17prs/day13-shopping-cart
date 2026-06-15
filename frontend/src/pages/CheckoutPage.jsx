import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ArrowLeft, CreditCard, Home, CheckCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, totalPrice, totalItemsCount, clearCart } = useCart();
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setShippingInfo({
      ...shippingInfo,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Mock payment API processing
    setTimeout(async () => {
      await clearCart();
      setSuccess(true);
      setLoading(false);
    }, 1500);
  };

  if (success) {
    return (
      <div className="checkout-success-container">
        <div className="success-card">
          <div className="success-icon-wrap">
            <CheckCircle size={64} className="text-success" />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order has been registered.</p>
          <div className="order-details-summary">
            <p><strong>Total Paid:</strong> ₹{totalPrice.toLocaleString('en-IN')}</p>
            <p><strong>Shipping To:</strong> {shippingInfo.fullName}, {shippingInfo.address}, {shippingInfo.city}</p>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Secure Checkout</h1>
          <p className="page-subtitle">Complete your premium purchase</p>
        </div>
        <Link to="/cart" className="btn btn-secondary flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Cart
        </Link>
      </div>

      <div className="checkout-layout">
        <form onSubmit={handleSubmit} className="checkout-form-section">
          {/* Shipping Form */}
          <div className="checkout-card">
            <h2><Home size={18} style={{ marginRight: '8px' }} /> Shipping Information</h2>
            <div className="form-grid">
              <div className="form-group col-span-2">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shippingInfo.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                  className="input-field"
                />
              </div>
              <div className="form-group col-span-2">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Flat, House no., Building, Apartment, Street"
                  className="input-field"
                />
              </div>
              <div className="form-grid col-span-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', margin: 0, padding: 0 }}>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleInputChange}
                    required
                    placeholder="New Delhi"
                    className="input-field"
                  />
                </div>
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={shippingInfo.postalCode}
                    onChange={handleInputChange}
                    required
                    placeholder="110001"
                    className="input-field"
                  />
                </div>
              </div>
              <div className="form-group col-span-2">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={shippingInfo.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+91 XXXXX XXXXX"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-card mt-6">
            <h2><CreditCard size={18} style={{ marginRight: '8px' }} /> Payment Options</h2>
            <div className="payment-options">
              <label className={`payment-option-label ${paymentMethod === 'card' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span>Credit / Debit Card</span>
              </label>
              <label className={`payment-option-label ${paymentMethod === 'cod' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <span>Cash on Delivery (COD)</span>
              </label>
            </div>
            {paymentMethod === 'card' && (
              <div className="card-input-details mt-4">
                <div className="form-group">
                  <label>Card Number</label>
                  <input type="text" placeholder="XXXX XXXX XXXX XXXX" required className="input-field" />
                </div>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label>Expiry Date</label>
                    <input type="text" placeholder="MM/YY" required className="input-field" />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input type="password" placeholder="***" required className="input-field" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary w-full mt-6" disabled={loading}>
            {loading ? 'Processing Transaction...' : `Pay ₹${totalPrice.toLocaleString('en-IN')}`}
          </button>
        </form>

        {/* Checkout Items Summary */}
        <div className="checkout-summary-section">
          <div className="checkout-summary-card">
            <h2>Checkout Summary</h2>
            <div className="checkout-items-preview">
              {cart?.items?.map((item) => (
                <div key={item._id} className="checkout-item-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <p className="item-name" style={{ fontWeight: 600, margin: 0 }}>{item.product?.name}</p>
                    <p className="item-qty" style={{ fontSize: '13px', color: '#666', margin: 0 }}>Qty: {item.quantity}</p>
                  </div>
                  <span className="item-price" style={{ fontWeight: 600 }}>₹{(item.product?.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            <div className="divider"></div>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
              <span>Items Total ({totalItemsCount})</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0' }}>
              <span>Shipping Fee</span>
              <span className="text-success" style={{ color: 'green', fontWeight: 600 }}>FREE</span>
            </div>
            <div className="divider"></div>
            <div className="summary-row total-row" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 700 }}>
              <span>Grand Total</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
