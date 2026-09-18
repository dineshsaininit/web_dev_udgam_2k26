import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  LogOut,
  CheckCircle2,
  ArrowUpRight,
  BarChart3,
  Layers,
  Search
} from "lucide-react";
import ProductEditModal from "./ProductEditModal";
import "./AdminDashboard.css";

export default function AdminDashboard({
  products = [],
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onToggleStock,
  onBackToStore,
  onLogout,
}) {
  const [editingProduct, setEditingProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickPriceEditId, setQuickPriceEditId] = useState(null);
  const [quickPriceVal, setQuickPriceVal] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "analytics" | "orders"

  // Compute live product statistics
  const totalProductsCount = products.length;
  const inStockProductsCount = products.filter((p) => p.inStock !== false).length;
  const inStockRate = totalProductsCount > 0 ? Math.round((inStockProductsCount / totalProductsCount) * 100) : 0;

  // Mock analytics based on catalog
  const totalGrossRevenue = products.reduce((acc, p) => acc + p.price * (p.reviewsCount || 100), 0);
  const totalOrdersCount = products.reduce((acc, p) => acc + (p.reviewsCount || 100), 0);

  // Mock recent campus orders
  const recentOrders = [
    {
      id: "ORD-9428",
      student: "Aarav Sharma",
      rollNo: "B220045CS",
      email: "b220045@nitsikkim.ac.in",
      item: "UDGAM '26 Heavyweight Oversized Hoodie",
      size: "L",
      qty: 1,
      total: 1999,
      status: "Ready for Pickup",
      time: "10 mins ago"
    },
    {
      id: "ORD-9427",
      student: "Priya Lepcha",
      rollNo: "B230018EC",
      email: "b230018@nitsikkim.ac.in",
      item: "UDGAM 'Chase the Bloom' Vintage Tee",
      size: "M",
      qty: 2,
      total: 1798,
      status: "Dispatched",
      time: "45 mins ago"
    },
    {
      id: "ORD-9426",
      student: "Rohit Verma",
      rollNo: "B210082ME",
      email: "b210082@nitsikkim.ac.in",
      item: "UDGAM Retro Athletic Quarter Zip Pullover",
      size: "XL",
      qty: 1,
      total: 1699,
      status: "Ready for Pickup",
      time: "2 hours ago"
    },
    {
      id: "ORD-9425",
      student: "Ananya Bhutia",
      rollNo: "B220091EE",
      email: "b220091@nitsikkim.ac.in",
      item: "UDGAM '26 Heavyweight Oversized Hoodie",
      size: "M",
      qty: 1,
      total: 1999,
      status: "Delivered",
      time: "5 hours ago"
    }
  ];

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (formData) => {
    if (editingProduct) {
      onUpdateProduct(formData);
    } else {
      onAddProduct(formData);
    }
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleStartQuickPrice = (product) => {
    setQuickPriceEditId(product.id);
    setQuickPriceVal(product.price.toString());
  };

  const handleSaveQuickPrice = (productId) => {
    const parsed = Number(quickPriceVal);
    if (!isNaN(parsed) && parsed > 0) {
      const target = products.find((p) => p.id === productId);
      if (target) {
        onUpdateProduct({ ...target, price: parsed });
      }
    }
    setQuickPriceEditId(null);
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="admin-dashboard-container">
      {/* ===================================================
          ADMIN TOP BAR
      =================================================== */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand-logo">
            <span className="admin-badge-pill">NIT SIKKIM</span>
            <span className="admin-portal-title">UDGAM Admin Console</span>
          </div>
        </div>

        <div className="admin-nav-right">
          <button className="nav-store-link" onClick={onBackToStore}>
            <span>View Public Storefront</span>
            <ExternalLink size={15} />
          </button>

          <button className="nav-logout-btn" onClick={onLogout} title="Sign Out">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ===================================================
          KPI STATISTIC CARDS
      =================================================== */}
      <section className="stats-overview-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Merchandise Revenue</span>
            <div className="stat-icon-wrapper revenue-icon">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-val">₹{totalGrossRevenue.toLocaleString("en-IN")}</div>
          <div className="stat-delta positive">
            <TrendingUp size={13} />
            <span>+24.5% vs last summit drop</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Total Summit Orders</span>
            <div className="stat-icon-wrapper orders-icon">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="stat-val">{totalOrdersCount}</div>
          <div className="stat-delta positive">
            <ArrowUpRight size={13} />
            <span>Active student demand</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Active Merch Catalog</span>
            <div className="stat-icon-wrapper catalog-icon">
              <Layers size={20} />
            </div>
          </div>
          <div className="stat-val">{totalProductsCount} Items</div>
          <div className="stat-delta">
            <span>Hoodie, T-Shirt, Quarter Zip</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Stock Availability Rate</span>
            <div className="stat-icon-wrapper stock-icon">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-val">{inStockRate}%</div>
          <div className="stat-delta positive">
            <CheckCircle2 size={13} />
            <span>{inStockProductsCount} of {totalProductsCount} in stock</span>
          </div>
        </div>
      </section>

      {/* ===================================================
          DASHBOARD TABS
      =================================================== */}
      <div className="dashboard-tabs-bar">
        <div className="tabs-left">
          <button
            className={`dash-tab-btn ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
          >
            <Package size={16} />
            <span>Merchandise Inventory ({products.length})</span>
          </button>

          <button
            className={`dash-tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            <BarChart3 size={16} />
            <span>Product Sales Breakdown</span>
          </button>

          <button
            className={`dash-tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            <ShoppingBag size={16} />
            <span>Recent Student Orders</span>
          </button>
        </div>

        {activeTab === "inventory" && (
          <button className="add-merch-primary-btn" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Add New Merch Item</span>
          </button>
        )}
      </div>

      {/* ===================================================
          TAB 1: INVENTORY MANAGEMENT & LIVE PRODUCT CRUD
      =================================================== */}
      {activeTab === "inventory" && (
        <section className="inventory-section">
          {/* Search bar */}
          <div className="inventory-toolbar">
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="text"
                placeholder="Search products by title or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="products-table-container">
            <table className="products-admin-table">
              <thead>
                <tr>
                  <th>Product Asset</th>
                  <th>Category & Info</th>
                  <th>Selling Price (₹)</th>
                  <th>Stock Availability</th>
                  <th>Available Sizes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => {
                  const isQuickPrice = quickPriceEditId === prod.id;
                  const inStock = prod.inStock !== false;

                  return (
                    <tr key={prod.id} className="product-table-row">
                      {/* Image Thumbnail & Hero */}
                      <td className="product-asset-cell">
                        <div className="admin-thumb-wrapper">
                          <img src={prod.image} alt={prod.title} className="admin-prod-thumb" />
                          <span className="gallery-count-pill">
                            {prod.gallery ? prod.gallery.length : 1} photos
                          </span>
                        </div>
                      </td>

                      {/* Info */}
                      <td className="product-meta-cell">
                        <span className="admin-prod-cat">{prod.category}</span>
                        <h4 className="admin-prod-title">{prod.title}</h4>
                        <p className="admin-prod-sub">{prod.subtitle}</p>
                      </td>

                      {/* Price & Quick Price Change */}
                      <td className="product-price-cell">
                        {isQuickPrice ? (
                          <div className="quick-price-form">
                            <span className="quick-currency">₹</span>
                            <input
                              type="number"
                              className="quick-price-input"
                              value={quickPriceVal}
                              onChange={(e) => setQuickPriceVal(e.target.value)}
                              autoFocus
                            />
                            <button
                              className="save-quick-price-btn"
                              onClick={() => handleSaveQuickPrice(prod.id)}
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div
                            className="price-display-wrapper"
                            onClick={() => handleStartQuickPrice(prod)}
                            title="Click to quick-edit price"
                          >
                            <span className="admin-price-tag">
                              ₹{prod.price?.toLocaleString("en-IN")}
                            </span>
                            {prod.originalPrice && (
                              <span className="admin-orig-price">
                                ₹{prod.originalPrice?.toLocaleString("en-IN")}
                              </span>
                            )}
                            <Edit3 size={12} className="edit-hint-icon" />
                          </div>
                        )}
                      </td>

                      {/* Stock Availability Toggle */}
                      <td className="product-stock-cell">
                        <button
                          type="button"
                          className={`stock-badge-toggle ${inStock ? "in-stock" : "out-stock"}`}
                          onClick={() => onToggleStock(prod.id)}
                          title="Click to toggle In Stock / Out of Stock"
                        >
                          <span className="stock-dot" />
                          <span>{inStock ? "In Stock" : "Out of Stock"}</span>
                        </button>
                      </td>

                      {/* Sizes */}
                      <td className="product-sizes-cell">
                        <div className="sizes-pill-list">
                          {prod.sizes &&
                            prod.sizes.map((sz) => (
                              <span key={sz} className="admin-size-chip">
                                {sz}
                              </span>
                            ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="product-actions-cell">
                        <div className="actions-cluster">
                          <button
                            className="action-btn edit-btn"
                            onClick={() => handleOpenEdit(prod)}
                            title="Edit full product details & images"
                          >
                            <Edit3 size={15} />
                            <span>Edit</span>
                          </button>

                          {products.length > 1 && (
                            <button
                              className="action-btn delete-btn"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Are you sure you want to remove "${prod.title}" from the merchandise store?`
                                  )
                                ) {
                                  onDeleteProduct(prod.id);
                                }
                              }}
                              title="Delete product"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ===================================================
          TAB 2: PRODUCT SALES & STATISTICS
      =================================================== */}
      {activeTab === "analytics" && (
        <section className="analytics-section">
          <div className="analytics-cards-grid">
            {products.map((prod) => {
              const estimatedSales = (prod.reviewsCount || 100) * prod.price;
              const unitCount = prod.reviewsCount || 100;

              return (
                <div key={prod.id} className="product-stat-box">
                  <div className="stat-box-media">
                    <img src={prod.image} alt={prod.title} />
                    <span className="box-category-tag">{prod.category}</span>
                  </div>

                  <div className="stat-box-content">
                    <h4 className="stat-box-title">{prod.title}</h4>
                    <div className="stat-box-numbers">
                      <div>
                        <span className="num-sub">Total Revenue</span>
                        <strong className="num-main">₹{estimatedSales.toLocaleString("en-IN")}</strong>
                      </div>
                      <div>
                        <span className="num-sub">Units Sold</span>
                        <strong className="num-main">{unitCount} pcs</strong>
                      </div>
                    </div>

                    <div className="size-distribution-meter">
                      <span className="meter-label">Popular Sizes Demand</span>
                      <div className="meter-bar">
                        <div className="meter-slice s-slice" style={{ width: "20%" }} title="S: 20%" />
                        <div className="meter-slice m-slice" style={{ width: "35%" }} title="M: 35%" />
                        <div className="meter-slice l-slice" style={{ width: "30%" }} title="L: 30%" />
                        <div className="meter-slice xl-slice" style={{ width: "15%" }} title="XL: 15%" />
                      </div>
                      <div className="meter-legend">
                        <span>S (20%)</span>
                        <span>M (35%)</span>
                        <span>L (30%)</span>
                        <span>XL (15%)</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===================================================
          TAB 3: RECENT STUDENT ORDERS
      =================================================== */}
      {activeTab === "orders" && (
        <section className="orders-section">
          <div className="orders-table-wrapper">
            <table className="orders-admin-table">
              <thead>
                <tr>
                  <th>Order Reference</th>
                  <th>Student & Roll No</th>
                  <th>Merchandise Item</th>
                  <th>Size & Qty</th>
                  <th>Amount Paid</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td>
                      <code className="order-id-code">{ord.id}</code>
                    </td>
                    <td>
                      <div className="order-student-info">
                        <strong>{ord.student}</strong>
                        <span>{ord.rollNo} • {ord.email}</span>
                      </div>
                    </td>
                    <td>{ord.item}</td>
                    <td>
                      <span className="order-size-badge">Size {ord.size} × {ord.qty}</span>
                    </td>
                    <td>
                      <strong>₹{ord.total.toLocaleString("en-IN")}</strong>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          ord.status === "Ready for Pickup"
                            ? "status-ready"
                            : ord.status === "Delivered"
                            ? "status-delivered"
                            : "status-dispatched"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="order-time-cell">{ord.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Full Edit Product & Image Assets Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ProductEditModal
            product={editingProduct}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
