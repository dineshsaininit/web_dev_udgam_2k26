import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Printer, CheckCircle } from 'lucide-react';
import './OrderReceipt.css';

export default function OrderReceipt({ orderData, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  // Trigger animation after a brief delay
  React.useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-overlay no-print">
      <div className="receipt-container">
        
        <div className={`envelope-wrapper ${isOpen ? 'open' : ''}`}>
          {/* Back of the envelope */}
          <div className="envelope-back"></div>

          {/* The Receipt Card that slides out */}
          <motion.div 
            className="receipt-card printable-receipt"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: isOpen ? -100 : 50, opacity: isOpen ? 1 : 0, zIndex: isOpen ? 10 : 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          >
            <div className="receipt-header">
              <CheckCircle className="success-icon" size={48} />
              <h1>UDGAM MERCH 2026</h1>
              <h2>Order Confirmed!</h2>
            </div>
            
            <div className="receipt-body">
              <div className="receipt-row">
                <span className="label">Order ID:</span>
                <span className="value">{orderData.orderId || 'UDG-MERCH-XYZ123'}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Name:</span>
                <span className="value">{orderData.name}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Email:</span>
                <span className="value">{orderData.email}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Roll No:</span>
                <span className="value">{orderData.rollNo || 'N/A'}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Item:</span>
                <span className="value">{orderData.itemName || 'Classic Udgam Hoodie'}</span>
              </div>
              <div className="receipt-row">
                <span className="label">Size:</span>
                <span className="value">{orderData.size || 'L'}</span>
              </div>
              {orderData.printedName && (
                <div className="receipt-row" style={{ marginTop: '5px', padding: '5px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
                  <span className="label" style={{ color: '#444' }}>Custom Print:</span>
                  <span className="value" style={{ fontWeight: 'bold' }}>"{orderData.printedName}"</span>
                </div>
              )}
            </div>

            <div className="receipt-footer no-print">
              <button className="print-btn" onClick={handlePrint}>
                <Printer size={20} /> Print Receipt
              </button>
              <button className="close-btn" onClick={onClose}>
                Close
              </button>
            </div>
          </motion.div>

          {/* Front of the envelope */}
          <div className="envelope-front"></div>
          
          {/* Flap of the envelope */}
          <div className={`envelope-flap ${isOpen ? 'open-flap' : ''}`}></div>
        </div>

      </div>
    </div>
  );
}
