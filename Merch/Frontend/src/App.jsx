import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Header from "./components/Header";
import Carousel from "./components/Carousel";
import ProductDetail from "./components/ProductDetail";
import CartDrawer from "./components/CartDrawer";
import OrderReceipt from "./components/OrderReceipt";
import { merchItems } from "./data/merchData";
import PetalsOverlay from "./components/PetalsOverlay";
import "./App.css";

const CART_STORAGE_KEY = "udgam_merch_cart_v2";
const PRODUCTS_STORAGE_KEY = "udgam_products_catalog_v6";

export default function App() {
  // Products catalog with localStorage persistence
  const [products] = useState(() => {
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

  // Navigation view state: 'showcase' | 'product'
  const [currentView, setCurrentView] = useState("showcase");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [successfulOrderData, setSuccessfulOrderData] = useState(null);
  const [initialPrintedName, setInitialPrintedName] = useState("");

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

  // Save products catalog changes
  useEffect(() => {
    try {
      localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage", e);
    }
  }, [products]);

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

      if (hash.startsWith("#product-")) {
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
  }, [products]);

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

  // Cart operations
  const handleAddToCart = (product, size, quantity, customName = "") => {
    if (customName) {
      setInitialPrintedName(customName);
    }

    // Strictly prevent adding out of stock product to cart
    const liveProd = products.find((p) => p.id === product.id) || product;
    if (liveProd.inStock === false) {
      return;
    }

    // If Udgam26 Collection is added, add all 3 individual items to the cart
    if (liveProd.id === "udgam-collection-04" || liveProd.isBundle) {
      const tshirt = products.find((p) => p.id === "udgam-tshirt-01") || merchItems.find((p) => p.id === "udgam-tshirt-01");
      const hoodie = products.find((p) => p.id === "udgam-hoodie-02") || merchItems.find((p) => p.id === "udgam-hoodie-02");
      const quarterzip = products.find((p) => p.id === "udgam-quarterzip-03") || merchItems.find((p) => p.id === "udgam-quarterzip-03");

      const bundleItems = [
        { prod: tshirt, size, qty: quantity },
        { prod: hoodie, size, qty: quantity },
        { prod: quarterzip, size, qty: quantity }
      ].filter((b) => b.prod && b.prod.inStock !== false);

      setCart((prevCart) => {
        let updated = [...prevCart];
        bundleItems.forEach(({ prod, size: s, qty }) => {
          const existingIdx = updated.findIndex(
            (item) => item.product.id === prod.id && item.size === s
          );
          if (existingIdx > -1) {
            updated[existingIdx] = {
              ...updated[existingIdx],
              quantity: updated[existingIdx].quantity + qty,
            };
          } else {
            updated.push({ product: prod, size: s, quantity: qty });
          }
        });
        return updated;
      });
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
      {/* Decorative Subtle Cherry Blossom Branches in Top Corners */}
      <div className="sakura-corner sakura-corner-left" aria-hidden="true">
        <img
          src="/sakura-branch-left.png"
          alt=""
          className="sakura-branch-img"
          draggable={false}
        />
      </div>
      <div className="sakura-corner sakura-corner-right" aria-hidden="true">
        <img
          src="/sakura-branch-right.png"
          alt=""
          className="sakura-branch-img"
          draggable={false}
        />
      </div>

      {/* Subtle Floating Petals Across All Views */}
      <PetalsOverlay />

      {/* Centered UDGAM Branding, Top-Right Cart */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
      />

      {/* Main View Area with Animated Transitions */}
      <main className="app-main-content">
        <AnimatePresence mode="wait">
          {/* PRODUCT DETAIL PAGE */}
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

          {/* SHOWCASE CAROUSEL (HOME) */}
          {currentView === "showcase" && (
            <motion.section
              key="showcase-view"
              className="carousel-showcase-section"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.35 }}
            >
              {/* Home Page Announcement Banner: Free Custom Name on Hoodie Perk */}
              <motion.div
                className="home-customization-hero-banner"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                onClick={() => {
                  const collection = products.find((p) => p.id === "udgam-collection-04");
                  if (collection) handleSelectProduct(collection);
                }}
                role="button"
                tabIndex={0}
                title="Click to view Udgam26 Collection with Free Hoodie Customization"
              >
                <div className="banner-sparkle-pill">
                  <Sparkles size={14} className="banner-sparkle-icon" />
                  <span>SPECIAL FEST OFFER</span>
                </div>
                <div className="banner-message">
                  Buy all 3 items (T-Shirt, Hoodie & Quarter Zip) or the <strong>Udgam26 Collection</strong> to get <strong>Free Name Customization printed on your Hoodie!</strong>
                </div>
                <div className="banner-action-link">
                  <span>View Bundle</span>
                  <ArrowRight size={13} />
                </div>
              </motion.div>

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
        initialPrintedName={initialPrintedName}
      />

      {/* Envelope Receipt Animation */}
      {successfulOrderData && (
        <OrderReceipt 
          orderData={successfulOrderData} 
          onClose={() => setSuccessfulOrderData(null)} 
        />
      )}

      {/* Bottom Footer */}
      <footer className="app-footer">
        <div className="footer-branding">
          <span className="footer-inst">NIT Sikkim</span>
          <span className="footer-dot">•</span>
          <span className="footer-fest">Udgam</span>
          <span className="footer-dot">•</span>
          <span className="footer-theme">🌸 Chase the Bloom</span>
        </div>
      </footer>
    </div>
  );
}
