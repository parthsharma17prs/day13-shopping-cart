import React from 'react';
import { useProducts } from '../context/ProductContext';

export default function StatsBar() {
  const { stats } = useProducts();

  if (!stats) return null;

  return (
    <div className="stats-bar">
      <div className="stat-card">
        <div className="stat-icon">📦</div>
        <div className="stat-info">
          <span className="stat-value">{stats.totalProducts}</span>
          <span className="stat-label">Total Products</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">✅</div>
        <div className="stat-info">
          <span className="stat-value">{stats.activeProducts}</span>
          <span className="stat-label">Active</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">⛔</div>
        <div className="stat-info">
          <span className="stat-value">{stats.inactiveProducts}</span>
          <span className="stat-label">Inactive</span>
        </div>
      </div>
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <span className="stat-value">₹{parseFloat(stats.avgPrice).toLocaleString('en-IN')}</span>
          <span className="stat-label">Avg Price</span>
        </div>
      </div>
    </div>
  );
}
