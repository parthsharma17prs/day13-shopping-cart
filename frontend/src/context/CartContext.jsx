import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setCart({ items: [] });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5050/api/cart', {
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setCart(json.data);
      } else {
        setError(json.message);
      }
    } catch (err) {
      setError('Error fetching cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to add items to cart');
      return false;
    }
    try {
      const res = await fetch('http://localhost:5050/api/cart/add', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      const json = await res.json();
      if (json.success) {
        setCart(json.data);
        return true;
      } else {
        setError(json.message);
        return false;
      }
    } catch (err) {
      setError('Error adding to cart');
      return false;
    }
  };

  const updateCartQuantity = async (productId, quantity) => {
    try {
      const res = await fetch('http://localhost:5050/api/cart/update', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity }),
      });
      const json = await res.json();
      if (json.success) {
        setCart(json.data);
        return true;
      } else {
        setError(json.message);
        return false;
      }
    } catch (err) {
      setError('Error updating cart');
      return false;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      const res = await fetch(`http://localhost:5050/api/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setCart(json.data);
        return true;
      } else {
        setError(json.message);
        return false;
      }
    } catch (err) {
      setError('Error removing item from cart');
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const res = await fetch('http://localhost:5050/api/cart/clear', {
        method: 'POST',
        headers: getHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setCart(json.data);
        return true;
      } else {
        setError(json.message);
        return false;
      }
    } catch (err) {
      setError('Error clearing cart');
      return false;
    }
  };

  useEffect(() => {
    fetchCart();
    // Listen for custom login/logout storage events
    const handleStorageChange = () => {
      fetchCart();
    };
    window.addEventListener('storage', handleStorageChange);
    // Also call fetchCart directly if requested
    window.addEventListener('login-state-change', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('login-state-change', handleStorageChange);
    };
  }, []);

  const totalItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const totalPrice = cart?.items?.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0) || 0;

  return (
    <CartContext.Provider value={{
      cart,
      loading,
      error,
      fetchCart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      totalItemsCount,
      totalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};
export default CartContext;
