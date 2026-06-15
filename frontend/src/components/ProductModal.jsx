import React, { useState, useEffect } from 'react';
import { useProducts } from '../context/ProductContext';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Other'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Electronics',
  stock: '',
  imageUrl: '',
  isActive: true,
};

export default function ProductModal() {
  const { modalOpen, modalMode, selectedProduct, closeModal, createProduct, updateProduct, loading } = useProducts();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (modalMode === 'edit' && selectedProduct) {
      setForm({
        name: selectedProduct.name || '',
        description: selectedProduct.description || '',
        price: selectedProduct.price ?? '',
        category: selectedProduct.category || 'Electronics',
        stock: selectedProduct.stock ?? '',
        imageUrl: selectedProduct.imageUrl || '',
        isActive: selectedProduct.isActive ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setErrors({});
  }, [modalOpen, modalMode, selectedProduct]);

  if (!modalOpen) return null;

  const isView = modalMode === 'view';

  // Client-side validation
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    else if (form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (form.price === '' || isNaN(form.price)) errs.price = 'Valid price is required';
    else if (parseFloat(form.price) < 0) errs.price = 'Price cannot be negative';
    if (form.stock === '' || isNaN(form.stock)) errs.stock = 'Valid stock quantity is required';
    else if (parseInt(form.stock) < 0) errs.stock = 'Stock cannot be negative';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
    };

    if (modalMode === 'create') {
      await createProduct(payload);
    } else {
      await updateProduct(selectedProduct._id, payload);
    }
  };

  const modalTitle = isView ? 'Product Details' : modalMode === 'create' ? '+ Add New Product' : '✏️ Edit Product';

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{modalTitle}</h2>
          <button id="modal-close-btn" className="modal-close" onClick={closeModal}>✕</button>
        </div>

        {isView && selectedProduct ? (
          <div className="product-view">
            {selectedProduct.imageUrl && (
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="view-image" />
            )}
            <div className="view-grid">
              <div className="view-field"><span className="vf-label">Name</span><span className="vf-value">{selectedProduct.name}</span></div>
              <div className="view-field"><span className="vf-label">Category</span><span className="vf-value badge">{selectedProduct.category}</span></div>
              <div className="view-field"><span className="vf-label">Price</span><span className="vf-value price-tag">₹{selectedProduct.price?.toLocaleString()}</span></div>
              <div className="view-field"><span className="vf-label">Stock</span><span className="vf-value">{selectedProduct.stock} units</span></div>
              <div className="view-field"><span className="vf-label">Status</span><span className={`vf-value status-badge ${selectedProduct.isActive ? 'active' : 'inactive'}`}>{selectedProduct.isActive ? 'Active' : 'Inactive'}</span></div>
              <div className="view-field full-width"><span className="vf-label">Description</span><span className="vf-value">{selectedProduct.description}</span></div>
              <div className="view-field"><span className="vf-label">Created</span><span className="vf-value">{new Date(selectedProduct.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="product-form" noValidate>
            <div className="form-grid">
              {/* Name */}
              <div className={`form-group ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="product-name">Product Name *</label>
                <input
                  id="product-name"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. iPhone 15 Pro"
                  className="form-input"
                />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="product-category">Category *</label>
                <select id="product-category" name="category" value={form.category} onChange={handleChange} className="form-input">
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Price */}
              <div className={`form-group ${errors.price ? 'has-error' : ''}`}>
                <label htmlFor="product-price">Price (₹) *</label>
                <input
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="form-input"
                />
                {errors.price && <span className="error-msg">{errors.price}</span>}
              </div>

              {/* Stock */}
              <div className={`form-group ${errors.stock ? 'has-error' : ''}`}>
                <label htmlFor="product-stock">Stock Quantity *</label>
                <input
                  id="product-stock"
                  name="stock"
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="0"
                  className="form-input"
                />
                {errors.stock && <span className="error-msg">{errors.stock}</span>}
              </div>

              {/* Image URL */}
              <div className="form-group full-width">
                <label htmlFor="product-image">Image URL (optional)</label>
                <input
                  id="product-image"
                  name="imageUrl"
                  type="url"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="form-input"
                />
              </div>

              {/* Description */}
              <div className={`form-group full-width ${errors.description ? 'has-error' : ''}`}>
                <label htmlFor="product-description">Description *</label>
                <textarea
                  id="product-description"
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the product..."
                  className="form-input"
                />
                {errors.description && <span className="error-msg">{errors.description}</span>}
              </div>

              {/* Active Toggle */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    id="product-active"
                    name="isActive"
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <span className="checkbox-custom"></span>
                  Mark as Active
                </label>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={closeModal} disabled={loading}>
                Cancel
              </button>
              <button type="submit" id="product-submit-btn" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner-sm" /> : null}
                {modalMode === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
