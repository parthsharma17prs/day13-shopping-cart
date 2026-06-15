import React from 'react';
import { useProducts } from '../context/ProductContext';

const CATEGORIES = ['Electronics', 'Clothing', 'Food', 'Books', 'Sports', 'Home', 'Beauty', 'Toys', 'Other'];

export default function SearchFilter() {
  const { filters, setFilter, resetFilters } = useProducts();

  return (
    <div className="search-filter-bar">
      {/* Search Input */}
      <div className="search-input-wrap">
        <span className="search-icon">🔍</span>
        <input
          id="product-search"
          type="text"
          placeholder="Search products by name, description..."
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
          className="search-input"
        />
        {filters.search && (
          <button className="clear-search" onClick={() => setFilter('search', '')}>✕</button>
        )}
      </div>

      {/* Category Filter */}
      <div className="filter-group">
        <label htmlFor="category-filter">Category</label>
        <select
          id="category-filter"
          value={filters.category}
          onChange={(e) => setFilter('category', e.target.value)}
          className="filter-select"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Price Range */}
      <div className="filter-group">
        <label>Price Range</label>
        <div className="price-range">
          <input
            id="min-price"
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            min="0"
            onChange={(e) => setFilter('minPrice', e.target.value)}
            className="price-input"
          />
          <span className="price-sep">—</span>
          <input
            id="max-price"
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            min="0"
            onChange={(e) => setFilter('maxPrice', e.target.value)}
            className="price-input"
          />
        </div>
      </div>

      {/* Sort */}
      <div className="filter-group">
        <label htmlFor="sort-by">Sort By</label>
        <select
          id="sort-by"
          value={`${filters.sort}-${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split('-');
            setFilter('sort', sort);
            setFilter('order', order);
          }}
          className="filter-select"
        >
          <option value="createdAt-desc">Newest First</option>
          <option value="createdAt-asc">Oldest First</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A–Z</option>
          <option value="name-desc">Name: Z–A</option>
          <option value="stock-desc">Stock: High to Low</option>
        </select>
      </div>

      {/* Reset */}
      <button className="btn btn-ghost btn-sm" onClick={resetFilters} title="Reset all filters">
        ↺ Reset
      </button>
    </div>
  );
}
