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
  onCheckoutSuccess,
  initialPrintedName = "",
}) {
  const hasOutOfStockItems = items.some((item) => item.product.inStock === false);

  // Checkout & Payment Simulation states
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentStep, setPaymentStep] = useState("form"); // "form" | "gateway" | "success" | "failure"
  const [orderId, setOrderId] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [failureReason, setFailureReason] = useState("");
  const [failureCode, setFailureCode] = useState("");

  const [checkoutForm, setCheckoutForm] = useState({
    name: "",
    officialEmail: "",
    rollNumber: "",
    phone: "",
    printedName: initialPrintedName || "",
  });

  const [prevInitial, setPrevInitial] = useState(initialPrintedName);
  if (initialPrintedName !== prevInitial) {
    setPrevInitial(initialPrintedName);
    setCheckoutForm((prev) => ({ ...prev, printedName: initialPrintedName }));
  }

  // Calculate totals (No coupons)
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const total = subtotal;
  const totalItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Check if all three flagship products are in cart (or bundle)
  const hasTshirt = items.some(
    (item) =>
      item.product.id?.startsWith("udgam-tshirt-01") ||
      item.product.title?.toLowerCase().includes("t-shirt")
  );
  const hasHoodie = items.some(
    (item) =>
      item.product.id?.startsWith("-02") ||
      item.product.title?.toLowerCase().includes("hoodie")
  );
  const hasQuarterZip = items.some(
    (item) =>
      item.product.id?.startsWith("udgam-quarterzip-03") ||
      item.product.title?.toLowerCase().includes("quarter zip")
  );
  const hasAllThreeDifferentItems =
    (hasTshirt && hasHoodie && hasQuarterZip) ||
    items.some((item) => item.product.id === "udgam-collection-04" || item.product.isBundle);

  const handleStartCheckout = () => {
    setPaymentStep("form");
    setIsCheckingOut(true);
  };

  // Submit checkout form and open Razorpay simulation
  const handleProceedToGateway = (e) => {
    e.preventDefault();
    setPaymentStep("gateway");
  };

  // Real Razorpay Payment
  const handleRazorpayPayment = async () => {
    try {
      // 1. Create order on backend
      const res = await fetch("https://merch-backend-fn9a.onrender.com/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: total }),
      });
      const order = await res.json();
      if (!order || order.error) throw new Error("Failed to create order");

      // 2. Initialize Razorpay options
      const options = {
        key: "rzp_live_TdSgnhpUJ300ka", // Live Key
        amount: order.amount,
        currency: order.currency,
        name: "Udgam 2026",
        description: "Official Merchandise",
        order_id: order.id,
        handler: async (response) => {
          try {
            // Show verification loading screen while we call backend
            setPaymentStep("verifying");

            // 3. Verify payment on backend
            const verifyRes = await fetch("https://merch-backend-fn9a.onrender.com/api/payments/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderDetails: {
                  itemName: items.map(i => i.product.title).join(', '),
                  size: items.map(i => i.size).join(', '),
                  quantity: items.map(i => i.quantity).reduce((a, b) => a + b, 0),
                  address: 'Campus Pickup',
                  name: checkoutForm.name,
                  email: checkoutForm.officialEmail,
                  rollNo: checkoutForm.rollNumber,
                  phone: checkoutForm.phone || 'N/A',
                  printedName: checkoutForm.printedName || null
                }
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Capture data before any state changes
              const receiptData = {
                orderId: verifyData.orderId || order.id,
                paymentId: response.razorpay_payment_id || verifyData.paymentId,
                name: checkoutForm.name,
                email: checkoutForm.officialEmail,
                rollNo: checkoutForm.rollNumber,
                phone: checkoutForm.phone || 'N/A',
                itemName: items.map(i => i.product.title).join(', '),
                size: items.map(i => i.size).join(', '),
                items: items.map(i => ({
                  id: i.id || i.product?.id,
                  title: i.product?.title || 'Merchandise Item',
                  size: i.size,
                  quantity: i.quantity,
                  price: i.product?.price || 0
                })),
                totalAmount: total,
                printedName: checkoutForm.printedName || null,
                orderDate: new Date().toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }),
                pickupLocation: 'UDGAM Merch Desk, NIT Sikkim Campus'
              };

              // Close cart first, clear cart, then show receipt after a tick
              handleCloseAll();
              onClearCart();
              if (onCheckoutSuccess) {
                setTimeout(() => onCheckoutSuccess(receiptData), 100);
              }
            } else {
              setFailureReason(verifyData.error || "Payment verification failed. Please contact support.");
              setFailureCode("ERR_VERIFICATION_FAILED");
              setPaymentStep("failure");
            }
          } catch (err) {
            console.error("Verification error:", err);
            setFailureReason(err.message || "Server error during verification. Try again.");
            setFailureCode("ERR_SERVER_TIMEOUT");
            setPaymentStep("failure");
          }
        },
        prefill: {
          name: checkoutForm.name,
          email: checkoutForm.officialEmail,
        },
        theme: {
          color: "#01b068",
        },
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        const errCode = response.error.code || "ERR_PAYMENT_FAILED";
        const errDesc = response.error.description || "Payment failed.";

        setFailureReason(errDesc);
        setFailureCode(errCode);
        setPaymentStep("failure");

        // Record the failed attempt in backend (fire & forget — don't await)
        fetch("https://merch-backend-fn9a.onrender.com/api/payments/save-failed-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpay_order_id: response.error.metadata?.order_id || order.id,
            razorpay_payment_id: response.error.metadata?.payment_id || null,
            error_code: errCode,
            error_description: errDesc,
            orderDetails: {
              name: checkoutForm.name,
              email: checkoutForm.officialEmail,
              rollNo: checkoutForm.rollNumber,
              phone: checkoutForm.phone || null,
              itemName: items.map(i => i.product.title).join(', '),
              size: items.map(i => i.size).join(', '),
              quantity: items.reduce((a, i) => a + i.quantity, 0),
            }
          }),
        }).catch(err => console.warn("Could not save failed payment:", err));
      });
      rzp1.open();

    } catch (error) {
      console.error(error);
      setFailureReason("Failed to initialize payment gateway. Please try again later.");
      setFailureCode("ERR_INIT_FAILED");
      setPaymentStep("failure");
    }
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
                  {hasAllThreeDifferentItems && (
                    <div className="cart-perk-unlocked-banner">
                      <Sparkles size={16} className="unlocked-icon" />
                      <div>
                        <strong>Free Custom Name Unlocked!</strong>
                        <p>All 3 pieces added. Free name printing on your Hoodie is included at checkout.</p>
                      </div>
                    </div>
                  )}
                  {items.map((item) => {
                    const itemColor = item.color || item.product.color;
                    const itemKey = `${item.product.id}-${item.size}-${itemColor || ""}`;
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
                              onClick={() => onRemoveItem(item.product.id, item.size, itemColor)}
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
                            {itemColor && (
                              <span className="cart-color-pill">
                                Color: <strong>{itemColor}</strong>
                              </span>
                            )}
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
                                    item.quantity - 1,
                                    itemColor
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
                                    item.quantity + 1,
                                    itemColor
                                  )
                                }
                                aria-label="Increase quantity"
                              >
                                <Plus size={13} />
                              </button>
                            </div>

                            <div className="cart-item-pricing">
                              <span className="item-total-price">
                                ₹{(item.product.price * item.quantity).toLocaleString("en-IN")}
                              </span>
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
                {/* Price Breakdown (No coupons) */}
                <div className="cart-breakdown">
                  <div className="breakdown-row">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

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
                  className={`checkout-primary-btn ${hasOutOfStockItems ? "disabled-checkout" : ""
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

                    {/* Conditional: Name to Print (For all 3 different items / Collection) */}
                    {hasAllThreeDifferentItems && (
                      <div className="form-group" style={{ backgroundColor: "#f3f8f2", padding: "12px 14px", borderRadius: "10px", border: "1.5px solid #a8cfa5" }}>
                        <label className="form-label" style={{ color: "#235c2b", fontWeight: "600" }}>
                          <Sparkles size={14} className="label-icon" style={{ color: "#01b068" }} />
                          <span>Custom Name Print on Hoodie (FREE Offer)</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. RAHUL"
                          maxLength={20}
                          value={checkoutForm.printedName}
                          onChange={(e) =>
                            setCheckoutForm({ ...checkoutForm, printedName: e.target.value.toUpperCase() })
                          }
                          style={{ borderColor: "#a8cfa5" }}
                        />
                        <span className="field-hint" style={{ color: "#2d6335", marginTop: "6px", display: "block", fontSize: "0.78rem" }}>
                          ⚠️ <strong>Please note:</strong> Custom name will <u>only be printed on the Udgam26 Hoodie</u>. Leave blank if you do not want a custom print.
                        </span>
                      </div>
                    )}

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
                      <span className="rzp-pill">Secure Payment</span>
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

                    <div className="gateway-dev-notice" style={{ background: "#f0fdf4", borderColor: "#bbf7d0", color: "#166534" }}>
                      <ShieldCheck size={16} className="notice-icon" style={{ color: "#16a34a" }} />
                      <p>
                        You will be connected to Razorpay's 128-bit encrypted gateway. Supports UPI (GPay, PhonePe, Paytm), NetBanking, and all Cards.
                      </p>
                    </div>

                    {/* RAZORPAY SECURE PAYMENT BUTTON */}
                    <div className="gateway-simulation-actions" style={{ flexDirection: 'column' }}>
                      <button
                        type="button"
                        className="simulate-btn simulate-success-btn"
                        style={{ width: '100%', background: '#01b068', color: '#fff', border: 'none', justifyContent: 'center', padding: '13px', fontSize: '0.95rem', fontWeight: '700' }}
                        onClick={handleRazorpayPayment}
                      >
                        <ShoppingBag size={18} />
                        <span>Pay Securely ₹{total.toLocaleString("en-IN")}</span>
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

              {/* STEP 2.5: VERIFYING SECURE PAYMENT */}
              {paymentStep === "verifying" && (
                <motion.div
                  className="verifying-modal-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: 'center', padding: '40px 20px' }}
                >
                  <div className="loader-spinner" style={{
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #01b068',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 20px auto'
                  }}></div>
                  <style>
                    {`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}
                  </style>
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Verifying Payment...</h3>
                  <p style={{ color: '#666', fontSize: '14px' }}>Please wait while we secure your transaction with Razorpay. Do not close this window.</p>
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
                    {failureCode && <span className="error-code">CODE: {failureCode}</span>}
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
