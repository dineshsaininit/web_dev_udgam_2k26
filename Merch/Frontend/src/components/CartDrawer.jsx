import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
  Tag,
  ShieldCheck,
  CreditCard,
  RefreshCw,
  Mail,
  User,
  Hash,
  Phone,
  AlertTriangle
} from "lucide-react";
import "./CartDrawer.css";

/**
 * Slide-over Cart Drawer Component
 * - Manages items, quantities, size breakdown
 * - Promo code application
 * - Compulsory checkout fields: Name, Official Email, Roll No, Phone
 * - Razorpay payment simulation with both Payment Success and Payment Failure flows
 */
export default function CartDrawer({
  isOpen,
  onClose,
  items = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSelectProduct,
}) {
  const hasOutOfStockItems = items.some((item) => item.product.inStock === false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState("");
  const [promoError, setPromoError] = useState("");

  // Checkout & Payment Simulation states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState("form"); // "form" | "gateway" | "success" | "failure"
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [failureReason, setFailureReason] = useState("");

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    officialEmail: "",
    rollNumber: "",
    phone: "",
  });

  // Calculate totals
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const discountAmount = Math.round(subtotal * appliedDiscount);
  const total = Math.max(0, subtotal - discountAmount);
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "UDGAM10" || code === "FEST10") {
      setAppliedDiscount(0.1);
      setPromoMessage("10% Fest discount applied successfully!");
      setPromoError("");
    } else if (code === "VIP20") {
      setAppliedDiscount(0.2);
      setPromoMessage("20% VIP Summit discount applied!");
      setPromoError("");
    } else {
      setPromoError("Invalid code. Try 'UDGAM10' for 10% off.");
      setPromoMessage("");
    }
  };

  const handleStartCheckout = () => {
    setPaymentStep("form");
    setIsCheckingOut(true);
  };

  // Submit checkout form and open Razorpay simulation
  const handleProceedToGateway = (e) => {
    e.preventDefault();
    setPaymentStep("gateway");
  };

  // Simulate Payment Success
  const handleSimulateSuccess = () => {
    const generatedOrderId = `UDGAM-26-${Math.floor(100000 + Math.random() * 900000)}`;
    const generatedPayId = `pay_rzp_${Math.random().toString(36).substring(2, 11)}`;
    setOrderId(generatedOrderId);
    setPaymentId(generatedPayId);
    setPaymentStep("success");
    onClearCart();
  };

  // Simulate Payment Failure
  const handleSimulateFailure = () => {
    setFailureReason("Transaction declined: Bank server timeout or insufficient balance simulation.");
    setPaymentStep("failure");
  };

  const handleRetryPayment = () => {
    setPaymentStep("gateway");
  };

  const handleCloseAll = () => {
    setIsCheckingOut(false);
    setPaymentStep("form");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="cart-portal-wrapper">
          {/* Backdrop Blur */}
          <motion.div
            className="cart-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Slide-over Drawer */}
          <motion.div
            className="cart-drawer-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            {/* Header */}
            <div className="cart-drawer-header">
              <div className="cart-header-title-group">
                <ShoppingBag size={20} className="cart-header-icon" />
                <h2 className="cart-header-title">Your Merch Bag</h2>
                <span className="cart-header-count">({totalItemCount})</span>
              </div>

              <button
                className="cart-close-btn"
                onClick={onClose}
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="cart-drawer-body">
              {items.length === 0 ? (
                /* Empty State */
                <div className="cart-empty-state">
                  <div className="empty-cart-icon-bubble">
                    <ShoppingBag size={38} className="empty-bag-icon" />
                  </div>
                  <h3 className="empty-state-title">Your bag is empty</h3>
                  <p className="empty-state-desc">
                    Explore the official UDGAM '26 merchandise line and grab your summit essentials before stocks run out.
                  </p>
                  <button
                    className="explore-merch-btn"
                    onClick={onClose}
                  >
                    <span>Browse Collection</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              ) : (
                /* Items List */
                <div className="cart-items-list">
                  {items.map((item) => {
                    const itemKey = `${item.product.id}-${item.size}`;
                    return (
                      <motion.div
                        key={itemKey}
                        className="cart-item-row"
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                      >
                        {/* Thumbnail */}
                        <button
                          className="cart-item-thumb-btn"
                          onClick={() => {
                            if (onSelectProduct) onSelectProduct(item.product);
                            onClose();
                          }}
                          title="View product details"
                        >
                          <img
                            src={item.product.image}
                            alt={item.product.title}
                            className="cart-item-thumb-img"
                          />
                        </button>

                        {/* Info */}
                        <div className="cart-item-info">
                          <div className="cart-item-top">
                            <span className="cart-item-category">
                              {item.product.category}
                            </span>
                            <button
                              className="cart-item-remove-btn"
                              onClick={() => onRemoveItem(item.product.id, item.size)}
                              title="Remove item"
                              aria-label="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>

                          <h4
                            className="cart-item-name"
                            onClick={() => {
                              if (onSelectProduct) onSelectProduct(item.product);
                              onClose();
                            }}
                          >
                            {item.product.title}
                          </h4>

                          <div className="cart-item-meta-tags">
                            <span className="cart-size-pill">
                              Size: <strong>{item.size}</strong>
                            </span>
                            {item.product.inStock === false && (
                              <span className="cart-item-out-of-stock-pill">Out of Stock</span>
                            )}
                          </div>

                          {/* Stepper and Price */}
                          <div className="cart-item-bottom">
                            <div className="cart-stepper">
                              <button
                                className="stepper-btn"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity - 1
                                  )
                                }
                                aria-label="Decrease quantity"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="stepper-count">
                                {item.quantity}
                              </span>
                              <button
                                className="stepper-btn"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    item.size,
                                    item.quantity + 1
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="cart-item-price">
                              {item.product.currency}
                              {(item.product.price * item.quantity).toLocaleString(
                                "en-IN"
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Summary & Checkout (Only when items exist) */}
            {items.length > 0 && (
              <div className="cart-drawer-footer">
                {/* Promo Code Form */}
                <form className="promo-form" onSubmit={handleApplyPromo}>
                  <div className="promo-input-wrapper">
                    <Tag size={15} className="promo-icon" />
                    <input
                      type="text"
                      placeholder="Coupon (e.g. UDGAM10)"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="promo-input"
                    />
                    <button type="submit" className="promo-submit-btn">
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <span className="promo-success-text">{promoMessage}</span>
                  )}
                  {promoError && (
                    <span className="promo-error-text">{promoError}</span>
                  )}
                </form>

                {/* Price Breakdown */}
                <div className="cart-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {appliedDiscount > 0 && (
                    <div className="breakdown-row discount-row">
                      <span>Discount ({appliedDiscount * 100}%)</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="breakdown-row">
                    <span>Campus Distribution</span>
                    <span className="free-shipping-tag">FREE</span>
                  </div>

                  <div className="breakdown-divider" />

                  <div className="breakdown-row total-row">
                    <span>Total Amount</span>
                    <span className="total-amount">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Out of Stock Warning if any */}
                {hasOutOfStockItems && (
                  <div className="cart-out-of-stock-warning">
                    <AlertTriangle size={15} className="warning-icon" />
                    <span>Please remove out-of-stock item(s) to proceed</span>
                  </div>
                )}

                {/* Checkout CTA */}
                <button
                  className={`checkout-primary-btn ${
                    hasOutOfStockItems ? "disabled-checkout" : ""
                  }`}
                  onClick={hasOutOfStockItems ? undefined : handleStartCheckout}
                  disabled={hasOutOfStockItems}
                  title={
                    hasOutOfStockItems
                      ? "Remove out of stock items to proceed"
                      : "Proceed to Checkout"
                  }
                >
                  <span>
                    {hasOutOfStockItems
                      ? "Remove Out of Stock Items to Checkout"
                      : "Proceed to Checkout"}
                  </span>
                  <ArrowRight size={17} />
                </button>

                <div className="cart-guarantee-note">
                  <ShieldCheck size={14} />
                  <span>NIT Sikkim • Official UDGAM Merchandise</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* ===================================================
              CHECKOUT FLOW MODAL
          =================================================== */}
          {isCheckingOut && (
            <motion.div
              className="checkout-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* STEP 1: STUDENT DETAILS FORM (ALL COMPULSORY) */}
              {paymentStep === "form" && (
                <motion.div
                  className="checkout-modal-card"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="modal-header">
                    <div>
                      <h3 className="checkout-title">NIT Sikkim Merch Checkout</h3>
                      <p className="checkout-subtitle">
                        Please provide your institute credentials for order verification
                      </p>
                    </div>
                    <button
                      className="modal-close-btn"
                      onClick={() => setIsCheckingOut(false)}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleProceedToGateway} className="checkout-form">
                    {/* Full Name */}
                    <div className="form-group">
                      <label className="form-label">
                        <User size={13} className="label-icon" />
                        <span>Full Name *</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Rahul Sharma"
                        required
                        value={checkoutForm.name}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, name: e.target.value })
                        }
                      />
                    </div>

                    {/* Official Institute Email */}
                    <div className="form-group">
                      <label className="form-label">
                        <Mail size={13} className="label-icon" />
                        <span>Official Email (Institute) *</span>
                      </label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. b220045@nitsikkim.ac.in"
                        required
                        value={checkoutForm.officialEmail}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            officialEmail: e.target.value,
                          })
                        }
                      />
                      <span className="field-hint">
                        Order slip and pickup token will be sent to this email
                      </span>
                    </div>

                    {/* Roll Number */}
                    <div className="form-group">
                      <label className="form-label">
                        <Hash size={13} className="label-icon" />
                        <span>Roll Number *</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. B220045CS"
                        required
                        value={checkoutForm.rollNumber}
                        onChange={(e) =>
                          setCheckoutForm({
                            ...checkoutForm,
                            rollNumber: e.target.value.toUpperCase(),
                          })
                        }
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="form-group">
                      <label className="form-label">
                        <Phone size={13} className="label-icon" />
                        <span>Phone / WhatsApp *</span>
                      </label>
                      <input
                        type="tel"
                        className="form-input"
                        placeholder="e.g. +91 98765 43210"
                        required
                        value={checkoutForm.phone}
                        onChange={(e) =>
                          setCheckoutForm({ ...checkoutForm, phone: e.target.value })
                        }
                      />
                    </div>

                    <div className="order-final-summary">
                      <span>Total Payable:</span>
                      <strong>₹{total.toLocaleString("en-IN")}</strong>
                    </div>

                    <button type="submit" className="confirm-order-btn">
                      <span>Proceed to Payment (Razorpay)</span>
                      <ArrowRight size={16} />
                    </button>
                  </form>
                </motion.div>
              )}

              {/* STEP 2: RAZORPAY GATEWAY SIMULATION (TEST SUCCESS & FAILURE) */}
              {paymentStep === "gateway" && (
                <motion.div
                  className="checkout-modal-card razorpay-gateway-card"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="razorpay-header-banner">
                    <div className="razorpay-logo-badge">
                      <CreditCard size={18} className="rzp-icon" />
                      <strong>Razorpay</strong>
                      <span className="rzp-pill">Gateway Simulation</span>
                    </div>
                    <button
                      className="modal-close-btn"
                      onClick={() => setPaymentStep("form")}
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="gateway-order-info">
                    <div className="gateway-amount-display">
                      <span className="amount-label">Amount to Pay</span>
                      <h2 className="amount-val">₹{total.toLocaleString("en-IN")}</h2>
                    </div>

                    <div className="gateway-buyer-card">
                      <div className="buyer-field">
                        <span>Student:</span>
                        <strong>{checkoutForm.name}</strong>
                      </div>
                      <div className="buyer-field">
                        <span>Roll No:</span>
                        <strong>{checkoutForm.rollNumber}</strong>
                      </div>
                      <div className="buyer-field">
                        <span>Email:</span>
                        <span>{checkoutForm.officialEmail}</span>
                      </div>
                    </div>

                    <div className="gateway-dev-notice">
                      <Sparkles size={14} className="notice-icon" />
                      <p>
                        Razorpay payment gateway integration will connect here. For development verification, test both states below:
                      </p>
                    </div>

                    {/* TWO TEST TRIGGERS: SUCCESS & FAILURE */}
                    <div className="gateway-simulation-actions">
                      <button
                        type="button"
                        className="simulate-btn simulate-success-btn"
                        onClick={handleSimulateSuccess}
                      >
                        <CheckCircle2 size={18} />
                        <span>Simulate Payment Success</span>
                      </button>

                      <button
                        type="button"
                        className="simulate-btn simulate-failure-btn"
                        onClick={handleSimulateFailure}
                      >
                        <XCircle size={18} />
                        <span>Simulate Payment Failure</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      className="back-to-details-btn"
                      onClick={() => setPaymentStep("form")}
                    >
                      ← Back to Student Details
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PAYMENT SUCCESS CONFIRMATION */}
              {paymentStep === "success" && (
                <motion.div
                  className="success-modal-card"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="success-icon-bubble">
                    <CheckCircle2 size={44} className="success-check-icon" />
                  </div>

                  <h3 className="success-title">Payment Successful!</h3>
                  <p className="success-subtitle">
                    Your official UDGAM merchandise order has been confirmed.
                  </p>

                  <div className="order-id-pill">
                    <span>Order Reference:</span>
                    <strong>{orderId}</strong>
                  </div>

                  <div className="payment-receipt-box">
                    <div className="receipt-row">
                      <span>Transaction ID:</span>
                      <code>{paymentId}</code>
                    </div>
                    <div className="receipt-row">
                      <span>Student:</span>
                      <strong>{checkoutForm.name} ({checkoutForm.rollNumber})</strong>
                    </div>
                    <div className="receipt-row">
                      <span>Institute Email:</span>
                      <span>{checkoutForm.officialEmail}</span>
                    </div>
                    <div className="receipt-row">
                      <span>Amount Paid:</span>
                      <strong>₹{total.toLocaleString("en-IN")} (Razorpay)</strong>
                    </div>
                  </div>

                  <div className="success-instructions">
                    <Sparkles size={16} className="sparkle-accent" />
                    <span>
                      Order slip and pick-up voucher have been dispatched to <strong>{checkoutForm.officialEmail}</strong>. Present your roll number at the fest merchandise desk for distribution!
                    </span>
                  </div>

                  <button
                    className="continue-shopping-btn"
                    onClick={handleCloseAll}
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              )}

              {/* STEP 4: PAYMENT FAILURE SCREEN */}
              {paymentStep === "failure" && (
                <motion.div
                  className="failure-modal-card"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <div className="failure-icon-bubble">
                    <XCircle size={44} className="failure-cross-icon" />
                  </div>

                  <h3 className="failure-title">Payment Failed</h3>
                  <p className="failure-subtitle">
                    The transaction could not be completed via Razorpay gateway.
                  </p>

                  <div className="failure-reason-box">
                    <div className="reason-title">Error Details:</div>
                    <p className="reason-text">{failureReason}</p>
                    <span className="error-code">CODE: ERR_RAZORPAY_USER_OR_BANK_DECLINED</span>
                  </div>

                  <p className="failure-cart-safety-note">
                    Don't worry! Your items are still saved in your merchandise bag.
                  </p>

                  <div className="failure-actions-row">
                    <button
                      className="retry-payment-btn"
                      onClick={handleRetryPayment}
                    >
                      <RefreshCw size={16} />
                      <span>Retry Payment</span>
                    </button>

                    <button
                      className="cancel-failure-btn"
                      onClick={() => setIsCheckingOut(false)}
                    >
                      Return to Bag
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
}
