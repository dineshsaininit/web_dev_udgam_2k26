import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ArrowLeft,
  Star,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Ruler,
  Info,
  X,
  ZoomIn,
  Sparkles,
  AlertTriangle,
  Ban
} from "lucide-react";
import "./ProductDetail.css";

/**
 * Product Detail Page Component
 * - Left column: High-res merchandise photography with Amazon-style interactive hover zoom
 * - Right column: Title, pricing, rich description, size selection, quantity selector, and Add to Cart action
 */
export default function ProductDetail({
  product,
  onAddToCart,
  onBack,
  onOpenCart,
}) {
  const isOutOfStock = product.inStock === false;

  const [selectedSize, setSelectedSize] = useState(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : "M"
  );
  const [selectedImage, setSelectedImage] = useState(
    product.image || (product.gallery && product.gallery[0])
  );
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  // Amazon-style zoom states
  const [isZooming, setIsZooming] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50, lensX: 0, lensY: 0 });
  const [showLightbox, setShowLightbox] = useState(false);
  const imageViewportRef = useRef(null);

  // Calculate discount percentage
  const discountPercent = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, selectedSize, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2200);
  };

  const incrementQty = () => {
    if (isOutOfStock) return;
    setQuantity((q) => Math.min(10, q + 1));
  };
  const decrementQty = () => {
    if (isOutOfStock) return;
    setQuantity((q) => Math.max(1, q - 1));
  };

  // Amazon-style mouse move tracker for zoom lens & window
  const handleMouseMove = (e) => {
    if (!imageViewportRef.current) return;
    const rect = imageViewportRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const percentX = Math.max(0, Math.min(100, (clientX / rect.width) * 100));
    const percentY = Math.max(0, Math.min(100, (clientY / rect.height) * 100));

    // Lens dimensions
    const lensW = 140;
    const lensH = 140;
    const lensX = Math.max(0, Math.min(rect.width - lensW, clientX - lensW / 2));
    const lensY = Math.max(0, Math.min(rect.height - lensH, clientY - lensH / 2));

    setZoomCoords({ x: percentX, y: percentY, lensX, lensY });
  };

  return (
    <motion.div
      className="product-detail-container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Top Breadcrumb & Back Bar */}
      <div className="product-top-bar">
        <button
          className="product-back-btn"
          onClick={onBack}
          aria-label="Return to merchandise carousel"
        >
          <ArrowLeft size={16} />
          <span>Back to Merch</span>
        </button>

        <div className="product-breadcrumb">
          <span className="breadcrumb-muted">NIT Sikkim</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-muted">Udgam</span>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{product.title}</span>
        </div>
      </div>

      {/* Main 2-Column Product Layout */}
      <div className="product-detail-grid">
        {/* ===================================================
            LEFT COLUMN: MERCH PHOTO & AMAZON-STYLE ZOOM
        =================================================== */}
        <div className="product-gallery-column">
          <div
            ref={imageViewportRef}
            className={`main-image-viewport ${isZooming ? "is-zooming" : ""}`}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setShowLightbox(true)}
            title="Click to view full-screen image"
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={selectedImage}
                src={selectedImage}
                alt={product.title}
                className="main-product-image"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>

            {/* Amazon-style rectangular Zoom Lens */}
            {isZooming && (
              <div
                className="amazon-zoom-lens"
                style={{
                  left: `${zoomCoords.lensX}px`,
                  top: `${zoomCoords.lensY}px`,
                }}
              />
            )}

            {/* Subtle overlay badges */}
            <div className="image-badge-row">
              <span
                className="image-badge-pill"
                style={{
                  backgroundColor: product.badgeColor || "#18181b",
                }}
              >
                {product.badgeText || "OFFICIAL MERCH"}
              </span>

              {isOutOfStock ? (
                <span className="image-stock-pill out-of-stock">
                  <span className="stock-dot-red" />
                  Out of Stock
                </span>
              ) : (
                <span className="image-stock-pill in-stock">
                  <span className="stock-pulse-dot" />
                  In Stock • Campus Pickup
                </span>
              )}
            </div>

            {/* Hover to Zoom Hint Pill */}
            {!isZooming && (
              <div className="zoom-hint-badge">
                <ZoomIn size={13} />
                <span>Hover to zoom • Click to expand</span>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {product.gallery && product.gallery.length > 1 && (
            <div className="gallery-thumbnails">
              {product.gallery.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  className={`thumbnail-card ${
                    selectedImage === thumbUrl ? "active" : ""
                  }`}
                  onClick={() => setSelectedImage(thumbUrl)}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <img src={thumbUrl} alt="" className="thumb-img" />
                </button>
              ))}
            </div>
          )}

          {/* Amazon-style Side Zoom Preview Window */}
          <AnimatePresence>
            {isZooming && (
              <motion.div
                className="amazon-zoom-window"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                style={{
                  backgroundImage: `url(${selectedImage})`,
                  backgroundPosition: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  backgroundSize: "280%",
                }}
              >
                <div className="zoom-window-header">
                  <Sparkles size={13} className="zoom-header-icon" />
                  <span>2.8x Ultra-HD Fabric Inspection</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ===================================================
            RIGHT COLUMN: DESCRIPTION, SIZE CHOICE & ADD TO CART
        =================================================== */}
        <div className="product-info-column">
          {/* Header Metadata */}
          <div className="product-meta-header">
            <span className="product-series-tag">
              NIT SIKKIM • {product.tag || "OFFICIAL UDGAM DROP"}
            </span>
            <h1 className="product-headline">{product.title}</h1>
            <p className="product-tagline">{product.subtitle}</p>

            {/* Ratings & Orders */}
            <div className="product-rating-row">
              <div className="rating-badge">
                <Star size={14} className="star-icon filled" />
                <span className="rating-value">{product.rating || 4.9}</span>
              </div>
              <span className="reviews-count">
                ({product.reviewsCount || 120} verified campus orders)
              </span>
              <span className="rating-divider">•</span>
              <span className="fest-stamp">Chase the bloom</span>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="product-price-section">
            <span className="current-price">
              {product.currency}
              {product.price.toLocaleString("en-IN")}
            </span>
            {product.originalPrice && (
              <span className="original-price">
                {product.currency}
                {product.originalPrice.toLocaleString("en-IN")}
              </span>
            )}
            {discountPercent && (
              <span className="discount-tag">{discountPercent}% OFF</span>
            )}
            <span className="tax-note">All taxes included</span>
          </div>

          {/* Out of Stock Warning Banner */}
          {isOutOfStock && (
            <div className="product-out-of-stock-alert">
              <AlertTriangle size={18} className="stock-alert-icon" />
              <div className="stock-alert-body">
                <strong className="stock-alert-title">Currently Out of Stock</strong>
                <p className="stock-alert-text">
                  This item is temporarily sold out. It cannot be added to your bag at this time. Please check back for campus restocks.
                </p>
              </div>
            </div>
          )}

          <div className="divider-line" />

          {/* Description */}
          <div className="product-description-block">
            <h3 className="section-subtitle">Garment Specifications</h3>
            <p className="description-paragraph">{product.description}</p>

            {/* Key Feature Specs */}
            {product.features && product.features.length > 0 && (
              <ul className="features-list">
                {product.features.map((feat, i) => (
                  <li key={i} className="feature-item">
                    <Check size={14} className="feature-check" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="divider-line" />

          {/* ===================================================
              SIZE CHOICE SELECTOR
          =================================================== */}
          <div className="size-selector-section">
            <div className="size-header-row">
              <label className="size-label">
                Select Size: <strong className="active-size-name">{selectedSize}</strong>
              </label>

              <button
                type="button"
                className="size-guide-trigger"
                onClick={() => setShowSizeGuide(true)}
              >
                <Ruler size={14} />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="size-pill-grid">
              {product.sizes &&
                product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`size-choice-btn ${
                      selectedSize === size ? "selected" : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
            </div>

            {product.fitNote && (
              <div className="fit-note-banner">
                <Info size={14} className="fit-note-icon" />
                <span>{product.fitNote}</span>
              </div>
            )}
          </div>

          {/* ===================================================
              QUANTITY SELECTOR & ADD TO CART
          =================================================== */}
          <div className="purchase-actions-row">
            {/* Quantity Stepper */}
            <div className={`quantity-stepper ${isOutOfStock ? "is-disabled" : ""}`}>
              <button
                type="button"
                className="qty-btn"
                onClick={decrementQty}
                disabled={isOutOfStock || quantity <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="qty-display">{quantity}</span>
              <button
                type="button"
                className="qty-btn"
                onClick={incrementQty}
                disabled={isOutOfStock || quantity >= 10}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Primary Add to Cart Button */}
            <motion.button
              type="button"
              className={`add-to-cart-cta ${
                isOutOfStock ? "disabled-out-of-stock" : isAdded ? "success-state" : ""
              }`}
              onClick={isOutOfStock ? undefined : handleAddToCart}
              disabled={isOutOfStock}
              whileTap={isOutOfStock ? undefined : { scale: 0.97 }}
              aria-disabled={isOutOfStock}
              title={isOutOfStock ? "This item is currently out of stock" : "Add to Cart"}
            >
              {isOutOfStock ? (
                <>
                  <Ban size={19} className="cta-icon" />
                  <span>Out of Stock • Cannot Add to Cart</span>
                </>
              ) : isAdded ? (
                <>
                  <Check size={19} className="cta-icon" />
                  <span>Added to Cart!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={19} className="cta-icon" />
                  <span>
                    Add to Cart • {product.currency}
                    {(product.price * quantity).toLocaleString("en-IN")}
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* Quick View Cart link if already added */}
          {isAdded && (
            <motion.div
              className="quick-cart-notice"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
            >
              <span>Added to your bag with size <strong>{selectedSize}</strong>.</span>
              <button className="view-bag-link" onClick={onOpenCart}>
                View Cart →
              </button>
            </motion.div>
          )}

          {/* Assurance / Trust Badges */}
          <div className="trust-perks-grid">
            <div className="trust-item">
              <Truck size={17} className="trust-icon" />
              <div>
                <strong>NIT Sikkim Campus Distribution</strong>
                <p>Pick up at festival merchandise counter or hostel drop</p>
              </div>
            </div>

            <div className="trust-item">
              <RotateCcw size={17} className="trust-icon" />
              <div>
                <strong>Instant Size Exchange</strong>
                <p>On-spot size exchanges available during fest days</p>
              </div>
            </div>

            <div className="trust-item">
              <ShieldCheck size={17} className="trust-icon" />
              <div>
                <strong>Official Merchandise</strong>
                <p>100% certified official Udgam '26 product</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================
          SIZE GUIDE MODAL
      =================================================== */}
      <AnimatePresence>
        {showSizeGuide && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSizeGuide(false)}
          >
            <motion.div
              className="size-guide-card"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <div className="modal-title-group">
                  <Ruler size={20} className="modal-icon" />
                  <h3 className="modal-title">UDGAM Size Specifications</h3>
                </div>
                <button
                  className="modal-close-btn"
                  onClick={() => setShowSizeGuide(false)}
                  aria-label="Close size guide"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="modal-body">
                <p className="size-guide-intro">
                  All measurements are in inches. Garments feature a contemporary relaxed silhouette.
                </p>

                <div className="size-table-wrapper">
                  <table className="size-table">
                    <thead>
                      <tr>
                        <th>Size</th>
                        <th>Chest (in)</th>
                        <th>Length (in)</th>
                        <th>Shoulder (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>XS</strong></td>
                        <td>38</td>
                        <td>26.5</td>
                        <td>18</td>
                      </tr>
                      <tr>
                        <td><strong>S</strong></td>
                        <td>40</td>
                        <td>27.5</td>
                        <td>19</td>
                      </tr>
                      <tr>
                        <td><strong>M</strong></td>
                        <td>42</td>
                        <td>28.5</td>
                        <td>20</td>
                      </tr>
                      <tr>
                        <td><strong>L</strong></td>
                        <td>44</td>
                        <td>29.5</td>
                        <td>21</td>
                      </tr>
                      <tr>
                        <td><strong>XL</strong></td>
                        <td>46</td>
                        <td>30.5</td>
                        <td>22</td>
                      </tr>
                      <tr>
                        <td><strong>XXL</strong></td>
                        <td>48</td>
                        <td>31.5</td>
                        <td>23</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="measure-tip">
                  <strong>How to measure:</strong> Lay your favorite relaxed fitting garment flat and measure from armpit to armpit for chest width.
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================================================
          FULL-SCREEN LIGHTBOX MODAL
      =================================================== */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div
            className="lightbox-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLightbox(false)}
          >
            <button
              className="lightbox-close-btn"
              onClick={() => setShowLightbox(false)}
              aria-label="Close full view"
            >
              <X size={24} />
            </button>
            <motion.img
              src={selectedImage}
              alt={product.title}
              className="lightbox-image"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
