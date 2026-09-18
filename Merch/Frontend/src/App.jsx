import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "./components/Header";
import Carousel from "./components/Carousel";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import OrderReceipt from "./components/OrderReceipt";
import { merchItems } from "./data/merchData";
import { ShieldCheck } from "lucide-react";
import "./App.css";

const CART_STORAGE_KEY = "udgam_merch_cart_v1";
const PRODUCTS_STORAGE_KEY = "udgam_products_catalog_v1";
const ADMIN_AUTH_KEY = "udgam_admin_auth_v1";

export default function App() {
  // Products catalog with localStorage persistence
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return merchItems;
  });

  // Admin authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem(ADMIN_AUTH_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Navigation view state: 'showcase' | 'product' | 'admin' | 'admin-login'
  const [currentView, setCurrentView] = useState(() => {
    return window.location.hash === '#admin' ? (
      // If we directly go to #admin, determine if we should show login or dashboard
      // Note: we can't read the lazy isAdminAuthenticated state easily here without duplicating logic,
      // so we'll just check localStorage directly.
      localStorage.getItem(ADMIN_AUTH_KEY) === "true" ? "admin" : "admin-login"
    ) : "showcase";
  });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successfulOrderData, setSuccessfulOrderData] = useState(null);

  // Cart state with localStorage persistence
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Hash-based admin routing
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView(isAdminAuthenticated ? "admin" : "admin-login");
      } else {
        setCurrentView("showcase");
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAdminAuthenticated]);

  // Save products catalog changes
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage", e);
    }
  }, [products]);

  // Save admin auth
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, isAdminAuthenticated ? "true" : "false");
    } catch (e) {
      console.error("Failed to save admin auth to localStorage", e);
    }
  }, [isAdminAuthenticated]);

  // Save cart changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cart]);

  // Sync hash routing for natural browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      let isAuth = isAdminAuthenticated;
      try {
        if (!isAuth && localStorage.getItem(ADMIN_AUTH_KEY) === "true") {
          isAuth = true;
        }
      } catch {}

      if (hash === "#admin") {
        if (isAuth) {
          setCurrentView("admin");
        } else {
          setCurrentView("admin-login");
        }
      } else if (hash === "#admin-login") {
        setCurrentView("admin-login");
      } else if (hash.startsWith("#product-")) {
        const prodId = hash.replace("#product-", "");
        const found = products.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
          setCurrentView("product");
        }
      } else {
        setCurrentView("showcase");
        setSelectedProduct(null);
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener("popstate", handleHashChange);
    return () => window.removeEventListener("popstate", handleHashChange);
  }, [isAdminAuthenticated, products]);

  // Handler to open product detail view
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentView("product");
    window.location.hash = `product-${product.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handler to return to merchandise carousel showcase
  const handleNavigateHome = () => {
    setCurrentView("showcase");
    setSelectedProduct(null);
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };


  const handleAdminLoginSuccess = () => {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, "true");
    } catch {}
    setIsAdminAuthenticated(true);
    setCurrentView("admin");
    window.location.hash = "admin";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAdminLogout = () => {
    try {
      localStorage.setItem(ADMIN_AUTH_KEY, "false");
    } catch {}
    setIsAdminAuthenticated(false);
    setCurrentView("showcase");
    window.location.hash = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===================================================
  // PRODUCT CRUD HANDLERS (ADMIN)
  // ===================================================
  const handleUpdateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );

    // Keep selectedProduct in sync if open
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }

    // Keep cart item product details in sync
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );
  };

  const handleAddProduct = (newProduct) => {
    setProducts((prev) => [newProduct, ...prev]);
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      handleNavigateHome();
    }
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const handleToggleStock = (productId) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, inStock: p.inStock === false ? true : false } : p
      )
    );
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct((prev) => ({
        ...prev,
        inStock: prev.inStock === false ? true : false,
      }));
    }

    // Synchronize stock state in cart items
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId
          ? {
              ...item,
              product: {
                ...item.product,
                inStock: item.product.inStock === false ? true : false,
              },
            }
          : item
      )
    );
  };

  // Cart operations
  const handleAddToCart = (product, size, quantity) => {
    // Strictly prevent adding out of stock product to cart
    const liveProd = products.find((p) => p.id === product.id) || product;
    if (liveProd.inStock === false) {
      return;
    }

    setCart((prevCart) => {
      const existingIdx = prevCart.findIndex(
        (item) => item.product.id === product.id && item.size === size
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: updated[existingIdx].quantity + quantity,
        };
        return updated;
      } else {
        return [...prevCart, { product: liveProd, size, quantity }];
      }
    });
  };

  const handleUpdateQuantity = (productId, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size);
      return;
    }

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (productId, size) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.size === size)
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="app-container">
      {/* Centered UDGAM Branding, Top-Right Cart */}
      {currentView !== "admin" && (
        <Header
          cartCount={totalCartCount}
          onOpenCart={() => setIsCartOpen(true)}
          currentView={currentView}
          onNavigateHome={handleNavigateHome}
        />
      )}

      {/* Main View Area with Animated Transitions */}
      <main className="app-main-content">
        <AnimatePresence mode="wait">
          {/* 1. ADMIN DASHBOARD */}
          {currentView === "admin" && (
            <motion.div
              key="admin-dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="admin-view-wrapper"
            >
              <AdminDashboard
                products={products}
                onUpdateProduct={handleUpdateProduct}
                onAddProduct={handleAddProduct}
                onDeleteProduct={handleDeleteProduct}
                onToggleStock={handleToggleStock}
                onBackToStore={handleNavigateHome}
                onLogout={handleAdminLogout}
              />
            </motion.div>
          )}

          {/* 2. ADMIN LOGIN PAGE */}
          {currentView === "admin-login" && (
            <motion.div
              key="admin-login-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="admin-view-wrapper"
            >
              <AdminLogin
                onLoginSuccess={handleAdminLoginSuccess}
                onBackToStore={handleNavigateHome}
              />
            </motion.div>
          )}

          {/* 3. PRODUCT DETAIL PAGE */}
          {currentView === "product" && selectedProduct && (
            <ProductDetail
              key={selectedProduct.id}
              product={
                products.find((p) => p.id === selectedProduct.id) || selectedProduct
              }
              onAddToCart={handleAddToCart}
              onBack={handleNavigateHome}
              onOpenCart={() => setIsCartOpen(true)}
            />
          )}

          {/* 4. SHOWCASE CAROUSEL (HOME) */}
          {currentView === "showcase" && (
            <motion.section
              key="showcase-view"
              className="carousel-showcase-section"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.35 }}
            >
              {/* Core 3-Card Continuous Merchandise Carousel */}
              <Carousel
                items={products}
                autoPlayInterval={4000}
                enableAutoPlay={true}
                onSelectProduct={handleSelectProduct}
              />
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onSelectProduct={handleSelectProduct}
        onCheckoutSuccess={(orderData) => setSuccessfulOrderData(orderData)}
      />

      {/* Envelope Receipt Animation */}
      {successfulOrderData && (
        <OrderReceipt 
          orderData={successfulOrderData} 
          onClose={() => setSuccessfulOrderData(null)} 
        />
      )}

      {/* Bottom Footer */}
      {currentView !== "admin" && (
        <footer className="app-footer">
          <div className="footer-branding">
            <span className="footer-inst">NIT Sikkim</span>
            <span className="footer-dot">•</span>
            <span className="footer-fest">Udgam</span>
            <span className="footer-dot">•</span>
            <span className="footer-theme">Chase the bloom</span>
          </div>
        </footer>
      )}
    </div>
  );
}
