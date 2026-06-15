import React, { createContext, useContext, useReducer, useCallback } from 'react';

const API_BASE = 'http://localhost:5050/api';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  products: [],
  selectedProduct: null,
  loading: false,
  error: null,
  success: null,
  stats: null,
  filters: {
    search: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt',
    order: 'desc',
  },
  pagination: {
    page: 1,
    limit: 8,
    total: 0,
    totalPages: 1,
  },
  modalOpen: false,
  modalMode: 'create', // 'create' | 'edit' | 'view'
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function productReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    case 'SET_SUCCESS':
      return { ...state, success: action.payload, loading: false };

    case 'CLEAR_MESSAGES':
      return { ...state, error: null, success: null };

    case 'SET_PRODUCTS':
      return {
        ...state,
        products: action.payload.data,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          page: action.payload.page,
        },
        loading: false,
      };

    case 'SET_SELECTED_PRODUCT':
      return { ...state, selectedProduct: action.payload };

    case 'SET_STATS':
      return { ...state, stats: action.payload };

    case 'SET_FILTER':
      return {
        ...state,
        filters: { ...state.filters, [action.key]: action.value },
        pagination: { ...state.pagination, page: 1 },
      };

    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
        pagination: { ...state.pagination, page: 1 },
      };

    case 'SET_PAGE':
      return { ...state, pagination: { ...state.pagination, page: action.payload } };

    case 'OPEN_MODAL':
      return { ...state, modalOpen: true, modalMode: action.mode, selectedProduct: action.product || null };

    case 'CLOSE_MODAL':
      return { ...state, modalOpen: false, selectedProduct: null };

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const ProductContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ProductProvider({ children }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Fetch all products with current filters & pagination
  const fetchProducts = useCallback(async (customFilters = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const filters = { ...state.filters, ...customFilters };
      const params = new URLSearchParams({
        search: filters.search,
        category: filters.category !== 'All' ? filters.category : '',
        minPrice: filters.minPrice || 0,
        ...(filters.maxPrice ? { maxPrice: filters.maxPrice } : {}),
        sort: filters.sort,
        order: filters.order,
        page: state.pagination.page,
        limit: state.pagination.limit,
      });

      const res = await fetch(`${API_BASE}/products?${params}`);
      const data = await res.json();

      if (data.success) {
        dispatch({ type: 'SET_PRODUCTS', payload: data });
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch products. Is the server running?' });
    }
  }, [state.filters, state.pagination.page, state.pagination.limit]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/products/stats/overview`);
      const data = await res.json();
      if (data.success) dispatch({ type: 'SET_STATS', payload: data.data });
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, []);

  // Create product
  const createProduct = useCallback(async (productData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();

      if (data.success) {
        dispatch({ type: 'SET_SUCCESS', payload: 'Product created successfully!' });
        dispatch({ type: 'CLOSE_MODAL' });
        fetchProducts();
        fetchStats();
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message });
        return { success: false, message: data.message };
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create product.' });
      return { success: false };
    }
  }, [fetchProducts, fetchStats]);

  // Update product
  const updateProduct = useCallback(async (id, productData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });
      const data = await res.json();

      if (data.success) {
        dispatch({ type: 'SET_SUCCESS', payload: 'Product updated successfully!' });
        dispatch({ type: 'CLOSE_MODAL' });
        fetchProducts();
        fetchStats();
        return { success: true };
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message });
        return { success: false };
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update product.' });
      return { success: false };
    }
  }, [fetchProducts, fetchStats]);

  // Delete product
  const deleteProduct = useCallback(async (id) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (data.success) {
        dispatch({ type: 'SET_SUCCESS', payload: 'Product deleted successfully!' });
        fetchProducts();
        fetchStats();
      } else {
        dispatch({ type: 'SET_ERROR', payload: data.message });
      }
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete product.' });
    }
  }, [fetchProducts, fetchStats]);

  // Filter actions
  const setFilter = useCallback((key, value) => {
    dispatch({ type: 'SET_FILTER', key, value });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const setPage = useCallback((page) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, []);

  // Modal actions
  const openModal = useCallback((mode, product = null) => {
    dispatch({ type: 'OPEN_MODAL', mode, product });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'CLOSE_MODAL' });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const value = {
    ...state,
    fetchProducts,
    fetchStats,
    createProduct,
    updateProduct,
    deleteProduct,
    setFilter,
    resetFilters,
    setPage,
    openModal,
    closeModal,
    clearMessages,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

// ─── Custom Hook ──────────────────────────────────────────────────────────────
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}

export default ProductContext;
