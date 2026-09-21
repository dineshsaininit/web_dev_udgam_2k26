import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Printer, CheckCircle2, X, MapPin } from 'lucide-react';
import './OrderReceipt.css';

export default function OrderReceipt({ orderData, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  // Trigger animation after a brief delay
  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 400);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!orderData) return null;

  const items = orderData.items && orderData.items.length > 0 ? orderData.items : [
    {
      title: orderData.itemName || 'UDGAM Merchandise',
      size: orderData.size || 'L',
      quantity: 1,
      price: orderData.totalAmount || 0
    }
  ];

  return (
    <div className="receipt-overlay">
      <div className="receipt-container">
        
        <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`}>
          {/* Back of the envelope (screen only) */}
          <div className="envelope-back no-print"></div>

          {/* The Receipt Card that slides out */}
          <motion.div 
            className="receipt-card printable-receipt"
            initial={{ y: 80, opacity: 0, scale: 0.95 }}
            animate={{ 
              y: isOpen ? 0 : 80, 
              opacity: isOpen ? 1 : 0, 
              scale: isOpen ? 1 : 0.95,
              zIndex: isOpen ? 10 : 1 
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          >
            {/* Close button for screen */}
            <button 
              className="receipt-modal-close-btn no-print" 
              onClick={onClose}
              title="Close receipt"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Receipt Header */}
            <div className="receipt-header">
              <div className="receipt-brand-badge">
                <span className="cherry-icon">🌸</span>
                <span className="fest-title">UDGAM 2026</span>
                <span className="brand-dot">•</span>
                <span className="inst-title">NIT SIKKIM</span>
              </div>
              <h1 className="receipt-heading">MERCHANDISE ORDER RECEIPT</h1>
              <div className="payment-confirmed-chip">
                <CheckCircle2 size={16} className="check-icon" />
                <span>Payment Confirmed & Verified</span>
              </div>
            </div>
            
            {/* Meta Info Grid */}
            <div className="receipt-meta-grid">
              <div className="meta-box">
                <span className="meta-label">ORDER ID</span>
                <span className="meta-value order-id-highlight">{orderData.orderId || 'UDG-2026-ONLINE'}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">TRANSACTION ID</span>
                <span className="meta-value tx-id-highlight">{orderData.paymentId || 'ONLINE_PAYMENT'}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">DATE & TIME</span>
                <span className="meta-value">{orderData.orderDate || new Date().toLocaleString('en-IN')}</span>
              </div>
              <div className="meta-box">
                <span className="meta-label">PAYMENT STATUS</span>
                <span className="meta-value status-success">PAID (Razorpay)</span>
              </div>
            </div>

            {/* Student Details Section */}
            <div className="receipt-section student-section">
              <div className="section-title">
                <span>Customer & Student Details</span>
              </div>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Student Name:</span>
                  <strong className="detail-val">{orderData.name || 'Student'}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Roll Number:</span>
                  <strong className="detail-val">{orderData.rollNo || 'N/A'}</strong>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Institute Email:</span>
                  <span className="detail-val">{orderData.email || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Phone:</span>
                  <span className="detail-val">{orderData.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="receipt-section items-section">
              <div className="section-title">
                <span>Purchased Merchandise</span>
              </div>
              <table className="receipt-items-table">
                <thead>
                  <tr>
                    <th className="th-item">Item Description</th>
                    <th className="th-size">Size</th>
                    <th className="th-qty">Qty</th>
                    <th className="th-price">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="item-row">
                      <td className="td-item">
                        <div className="item-title">{item.title}</div>
                      </td>
                      <td className="td-size">
                        <span className="size-pill">{item.size || 'Standard'}</span>
                      </td>
                      <td className="td-qty">x{item.quantity || 1}</td>
                      <td className="td-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Order Total */}
            <div className="receipt-total-bar">
              <span className="total-label">Total Amount Paid:</span>
              <span className="total-amount">₹{Number(orderData.totalAmount || 0).toLocaleString('en-IN')}</span>
            </div>

            {/* Pickup & Verification Instructions */}
            <div className="receipt-pickup-notice">
              <div className="pickup-header">
                <MapPin size={15} />
                <strong>Collection / Pickup Instructions:</strong>
              </div>
              <p>
                Present your Roll No. and this receipt (digital or printed) at the <strong>{orderData.pickupLocation || 'UDGAM Merchandise Desk (Campus)'}</strong> to collect your merchandise package.
              </p>
            </div>

            {/* Print Footer / Action Buttons */}
            <div className="receipt-actions no-print">
              <button className="receipt-btn print-primary-btn" onClick={handlePrint}>
                <Printer size={18} />
                <span>Print Official Receipt</span>
              </button>
              <button className="receipt-btn close-secondary-btn" onClick={onClose}>
                Done & Close
              </button>
            </div>

            <div className="print-watermark-note">
              Official UDGAM 2026 Merchandise Voucher • National Institute of Technology Sikkim
            </div>
          </motion.div>

          {/* Front of the envelope (screen only) */}
          <div className="envelope-front no-print"></div>
          
          {/* Flap of the envelope (screen only) */}
          <div className={`envelope-flap no-print ${isOpen ? 'open-flap' : ''}`}></div>
        </div>

      </div>
    </div>
  );
}
