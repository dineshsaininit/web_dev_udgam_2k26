import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Save,
  Plus,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Check
} from "lucide-react";
import "./ProductEditModal.css";

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function ProductEditModal({
  product = null,
  isOpen,
  onClose,
  onSave,
}) {
  const isEditing = Boolean(product && product.id);

  const [formData, setFormData] = useState(() => {
    if (product) {
      return {
        id: product.id,
        title: product.title || "",
        subtitle: product.subtitle || "",
        category: product.category || "Hoodies",
        tag: product.tag || "OFFICIAL MERCH",
        price: product.price || 999,
        originalPrice: product.originalPrice || 1499,
        currency: product.currency || "₹",
        inStock: product.inStock !== false,
        image: product.image || "",
        gallery: product.gallery && product.gallery.length > 0 ? [...product.gallery] : [product.image || ""],
        description: product.description || "",
        features: product.features && product.features.length > 0 ? [...product.features] : [],
        sizes: product.sizes && product.sizes.length > 0 ? [...product.sizes] : ["S", "M", "L", "XL"],
        badgeText: product.badgeText || "NEW",
        badgeColor: product.badgeColor || "#18181b",
        rating: product.rating || 4.9,
        reviewsCount: product.reviewsCount || 100,
        fitNote: product.fitNote || "Relaxed fit. True to size."
      };
    } else {
      return {
        id: `udgam-custom-${Date.now()}`,
        title: "",
        subtitle: "",
        category: "Hoodies",
        tag: "04 • NEW DROP",
        price: 1299,
        originalPrice: 1799,
        currency: "₹",
        inStock: true,
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80",
        gallery: [
          "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1200&q=80"
        ],
        description: "",
        features: ["100% Combed Cotton", "Pre-shrunk fabric", "Official UDGAM Fest Crest"],
        sizes: ["S", "M", "L", "XL"],
        badgeText: "NEW",
        badgeColor: "#18181b",
        rating: 5.0,
        reviewsCount: 1,
        fitNote: "Contemporary relaxed streetwear fit."
      };
    }
  });

  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [newFeatureText, setNewFeatureText] = useState("");

  if (!isOpen) return null;

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Image assets CRUD
  const handleAddGalleryImage = (e) => {
    e.preventDefault();
    if (!newGalleryUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      gallery: [...prev.gallery, newGalleryUrl.trim()],
    }));
    setNewGalleryUrl("");
  };

  const handleRemoveGalleryImage = (indexToRemove) => {
    setFormData((prev) => {
      const updated = prev.gallery.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        gallery: updated,
        image: updated.length > 0 ? updated[0] : prev.image,
      };
    });
  };

  const handleSetMainImage = (url) => {
    setFormData((prev) => ({ ...prev, image: url }));
  };

  // Features bullet points CRUD
  const handleAddFeature = (e) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeatureText.trim()],
    }));
    setNewFeatureText("");
  };

  const handleRemoveFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, idx) => idx !== index),
    }));
  };

  // Size toggling
  const handleToggleSize = (size) => {
    setFormData((prev) => {
      const exists = prev.sizes.includes(size);
      if (exists) {
        return { ...prev, sizes: prev.sizes.filter((s) => s !== size) };
      } else {
        return { ...prev, sizes: [...prev.sizes, size] };
      }
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="edit-modal-backdrop" onClick={onClose}>
      <motion.div
        className="edit-modal-card"
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="edit-modal-header">
          <div>
            <span className="modal-top-tag">INVENTORY EDITOR</span>
            <h2 className="edit-modal-title">
              {isEditing ? `Edit "${formData.title || 'Product'}"` : "Add New Merchandise Item"}
            </h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close editor">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="edit-product-form">
          <div className="form-sections-grid">
            {/* ===================================================
                SECTION 1: PRODUCT BASICS (NAME, CATEGORY, SUBTITLE)
            =================================================== */}
            <div className="form-panel">
              <h3 className="panel-heading">
                <Tag size={16} />
                <span>Product Identification</span>
              </h3>

              <div className="form-field">
                <label className="field-label">Product Name / Title *</label>
                <input
                  type="text"
                  className="field-input"
                  required
                  value={formData.title}
                  onChange={(e) => handleFieldChange("title", e.target.value)}
                  placeholder="e.g. UDGAM '26 Heavyweight Oversized Hoodie"
                />
              </div>

              <div className="form-field">
                <label className="field-label">Subtitle / Catchphrase</label>
                <input
                  type="text"
                  className="field-input"
                  value={formData.subtitle}
                  onChange={(e) => handleFieldChange("subtitle", e.target.value)}
                  placeholder="e.g. 380 GSM French Terry cotton with puff-print"
                />
              </div>

              <div className="field-row-2">
                <div className="form-field">
                  <label className="field-label">Category</label>
                  <select
                    className="field-input"
                    value={formData.category}
                    onChange={(e) => handleFieldChange("category", e.target.value)}
                  >
                    <option value="Hoodies">Hoodies</option>
                    <option value="T-Shirt">T-Shirt</option>
                    <option value="Quarter Zip">Quarter Zip</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>

                <div className="form-field">
                  <label className="field-label">Badge Tag (Ribbon)</label>
                  <input
                    type="text"
                    className="field-input"
                    value={formData.badgeText}
                    onChange={(e) => handleFieldChange("badgeText", e.target.value)}
                    placeholder="e.g. BESTSELLER, NEW"
                  />
                </div>
              </div>

              <div className="form-field">
                <label className="field-label">Full Product Description *</label>
                <textarea
                  className="field-textarea"
                  rows={4}
                  required
                  value={formData.description}
                  onChange={(e) => handleFieldChange("description", e.target.value)}
                  placeholder="Describe the garment fabric, drape, and festival relevance..."
                />
              </div>
            </div>

            {/* ===================================================
                SECTION 2: PRICING & STOCK MANAGEMENT
            =================================================== */}
            <div className="form-panel">
              <h3 className="panel-heading">
                <DollarSign size={16} />
                <span>Price & Stock Availability</span>
              </h3>

              <div className="field-row-2">
                <div className="form-field">
                  <label className="field-label">Selling Price (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    className="field-input price-highlight-input"
                    required
                    value={formData.price}
                    onChange={(e) => handleFieldChange("price", Number(e.target.value))}
                  />
                </div>

                <div className="form-field">
                  <label className="field-label">Original Price (₹) [Strike-through]</label>
                  <input
                    type="number"
                    min="1"
                    className="field-input"
                    value={formData.originalPrice}
                    onChange={(e) => handleFieldChange("originalPrice", Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Stock Status Toggle */}
              <div className="stock-toggle-card">
                <div className="stock-toggle-info">
                  <strong>Inventory Availability</strong>
                  <p>When turned off, customers will see "Out of Stock" badges across the store.</p>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => handleFieldChange("inStock", e.target.checked)}
                  />
                  <span className="slider round" />
                </label>
              </div>

              {/* Size Availability */}
              <div className="form-field">
                <label className="field-label">Available Sizes</label>
                <div className="sizes-checkbox-row">
                  {ALL_SIZES.map((sz) => {
                    const isSelected = formData.sizes.includes(sz);
                    return (
                      <button
                        key={sz}
                        type="button"
                        className={`size-toggle-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => handleToggleSize(sz)}
                      >
                        {isSelected && <Check size={12} className="check-icon" />}
                        <span>{sz}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bullet Features Manager */}
              <div className="form-field">
                <label className="field-label">Key Specifications & Features</label>
                <div className="features-builder">
                  <div className="features-add-row">
                    <input
                      type="text"
                      className="field-input"
                      placeholder="Add feature (e.g. 380 GSM Organic Cotton)"
                      value={newFeatureText}
                      onChange={(e) => setNewFeatureText(e.target.value)}
                    />
                    <button
                      type="button"
                      className="add-sub-item-btn"
                      onClick={handleAddFeature}
                    >
                      <Plus size={15} />
                      <span>Add</span>
                    </button>
                  </div>

                  <ul className="features-chips-list">
                    {formData.features.map((feat, idx) => (
                      <li key={idx} className="feature-chip">
                        <span>{feat}</span>
                        <button
                          type="button"
                          className="remove-chip-btn"
                          onClick={() => handleRemoveFeature(idx)}
                        >
                          <X size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* ===================================================
                SECTION 3: IMAGE ASSET CRUD (FULL WIDTH)
            =================================================== */}
            <div className="form-panel full-width-panel">
              <h3 className="panel-heading">
                <ImageIcon size={16} />
                <span>Merchandise Photography & Gallery Assets</span>
              </h3>

              {/* Main Image URL & Preview */}
              <div className="main-image-crud-group">
                <div className="form-field flex-1">
                  <label className="field-label">Primary Hero Image URL *</label>
                  <input
                    type="url"
                    className="field-input"
                    required
                    value={formData.image}
                    onChange={(e) => handleFieldChange("image", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                  />
                  <span className="field-subtext">
                    This is the centerpiece photo displayed in the 3-card carousel and primary detail viewport.
                  </span>
                </div>

                <div className="main-image-thumb-preview">
                  <img src={formData.image} alt="Hero preview" />
                  <span className="thumb-label">Primary Hero</span>
                </div>
              </div>

              {/* Angle Gallery Manager */}
              <div className="gallery-manager-block">
                <label className="field-label">
                  Angle Gallery Assets ({formData.gallery.length} images)
                </label>

                <div className="add-gallery-row">
                  <input
                    type="url"
                    className="field-input"
                    placeholder="Enter additional angle / fabric detail photo URL..."
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                  />
                  <button
                    type="button"
                    className="add-gallery-btn"
                    onClick={handleAddGalleryImage}
                  >
                    <Plus size={15} />
                    <span>Add to Gallery</span>
                  </button>
                </div>

                {/* Gallery Thumbnails List */}
                <div className="gallery-grid-preview">
                  {formData.gallery.map((url, idx) => {
                    const isMain = formData.image === url;
                    return (
                      <div key={idx} className={`gallery-asset-card ${isMain ? "is-hero" : ""}`}>
                        <img src={url} alt={`Angle ${idx + 1}`} className="gallery-asset-img" />
                        <div className="asset-card-actions">
                          {!isMain && (
                            <button
                              type="button"
                              className="set-hero-btn"
                              onClick={() => handleSetMainImage(url)}
                              title="Set as Primary Hero"
                            >
                              Make Hero
                            </button>
                          )}
                          <button
                            type="button"
                            className="delete-asset-btn"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            title="Delete image asset"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                        {isMain && <span className="hero-star-pill">Primary</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="edit-modal-footer">
            <button type="button" className="cancel-modal-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-modal-btn">
              <Save size={16} />
              <span>{isEditing ? "Save & Update Storefront" : "Publish to Store"}</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
