import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LayoutDashboard } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SearchFilter from '../components/SearchFilter';
import ProductModal from '../components/ProductModal';
import StatsBar from '../components/StatsBar';

export default function ProductsPage() {
  const {
    products,
    loading,
    error,
    success,
    pagination,
    filters,
    fetchProducts,
    fetchStats,
    openModal,
    setPage,
    clearMessages,
  } = useProducts();

  const { totalItemsCount } = useCart();

  // Fetch products whenever filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [filters, pagination.page]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Auto-clear success/error after 4s
  useEffect(() => {
    if (success || error) {
      const t = setTimeout(clearMessages, 4000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  return (
    <div className="page-container">
      {/* Toast Notifications */}
      {success && (
        <div className="toast toast-success" role="alert">
          <span>✓</span> {success}
        </div>
      )}
      {error && (
        <div className="toast toast-error" role="alert">
          <span>✕</span> {error}
        </div>
      )}

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Product Management</h1>
          <p className="page-subtitle">Manage your product inventory with ease</p>
        </div>
        <div className="header-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/dashboard" className="btn btn-secondary flex items-center gap-2" title="Go to Dashboard">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/cart" className="btn btn-secondary flex items-center gap-2 relative" title="View Cart">
            <ShoppingCart size={18} />
            <span>Cart</span>
            {totalItemsCount > 0 && (
              <span className="cart-badge-count" style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: '#ff4d4f',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '11px',
                fontWeight: 'bold',
                border: '2px solid var(--card-bg, white)'
              }}>
                {totalItemsCount}
              </span>
            )}
          </Link>
          <button
            id="add-product-btn"
            className="btn btn-primary"
            onClick={() => openModal('create')}
          >
            + Add Product
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <StatsBar />

      {/* Search & Filter Bar */}
      <SearchFilter />

      {/* Results Summary */}
      <div className="results-summary">
        <span>
          Showing <strong>{products.length}</strong> of <strong>{pagination.total}</strong> products
        </span>
        {(filters.search || filters.category !== 'All' || filters.minPrice || filters.maxPrice) && (
          <span className="filter-active-indicator">🔵 Filters active</span>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="loading-grid">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-image" />
              <div className="skeleton-line" />
              <div className="skeleton-line short" />
              <div className="skeleton-line medium" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filters, or add a new product.</p>
          <button className="btn btn-primary" onClick={() => openModal('create')}>
            + Add First Product
          </button>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            id="prev-page-btn"
            className="page-btn"
            onClick={() => setPage(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            ← Prev
          </button>
          <div className="page-numbers">
            {[...Array(pagination.totalPages)].map((_, i) => (
              <button
                key={i + 1}
                id={`page-btn-${i + 1}`}
                className={`page-num ${pagination.page === i + 1 ? 'active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button
            id="next-page-btn"
            className="page-btn"
            onClick={() => setPage(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Modal */}
      <ProductModal />
    </div>
  );
}
