import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  Building,
  ShieldCheck,
  Zap,
  Sparkles,
  Edit3,
  Trash2,
  Copy,
  CheckCheck,
  Layers,
  Percent,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  Store,
  Receipt,
  FileText,
  BadgeCheck,
  MapPin,
  Utensils,
  CheckCircle2,
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../api/client';
import { resolveDigitalBill, CATEGORY_ARCHETYPES } from '../../utils/digitalBillResolver';

const MOTIVE_CONFIG = {
  Need: { label: 'Essential Need', icon: '🛡️', color: '#00FF87', bg: 'rgba(0, 255, 135, 0.12)', border: 'rgba(0, 255, 135, 0.3)' },
  Want: { label: 'Lifestyle Want', icon: '✨', color: '#00F0FF', bg: 'rgba(0, 240, 255, 0.12)', border: 'rgba(0, 240, 255, 0.3)' },
  Impulse: { label: 'Quick Impulse', icon: '⚡', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  Work: { label: 'Work & Productivity', icon: '💼', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.12)', border: 'rgba(129, 140, 248, 0.3)' },
  Investment: { label: 'Asset Investment', icon: '📈', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.3)' },
  Emergency: { label: 'Emergency Expense', icon: '🚨', color: '#FB7185', bg: 'rgba(251, 113, 133, 0.12)', border: 'rgba(251, 113, 133, 0.3)' },
  Social: { label: 'Social & Dining', icon: '👥', color: '#C084FC', bg: 'rgba(192, 132, 252, 0.12)', border: 'rgba(192, 132, 252, 0.3)' },
  Other: { label: 'General Transaction', icon: '📦', color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.12)', border: 'rgba(148, 163, 184, 0.3)' },
};

const PLATFORM_ICONS = {
  amazon: { icon: '🛍️', label: 'Amazon India', color: '#FF9900' },
  flipkart: { icon: '📦', label: 'Flipkart', color: '#2874F0' },
  blinkit: { icon: '⚡', label: 'Blinkit (10-Min)', color: '#F7CB05' },
  zepto: { icon: '🛵', label: 'Zepto', color: '#8B5CF6' },
  swiggy: { icon: '🍔', label: 'Swiggy', color: '#FC8019' },
  zomato: { icon: '🍕', label: 'Zomato', color: '#E23744' },
  myntra: { icon: '👗', label: 'Myntra', color: '#FF3F6C' },
  bigbasket: { icon: '🛒', label: 'BigBasket', color: '#84C225' },
};

export const TransactionDetailModal = ({
  isOpen,
  onClose,
  transaction,
  isIncome = false,
  onEdit,
  onDelete,
  onPayUPI,
  onDuplicate,
  onUpdateMotive,
  onUpdateCategory,
}) => {
  const [activeViewTab, setActiveViewTab] = useState('bill'); // 'bill' or 'motive'
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [copiedGstin, setCopiedGstin] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [selectedMotive, setSelectedMotive] = useState(transaction?.motive || 'Need');
  const [updatingMotive, setUpdatingMotive] = useState(false);

  if (!isOpen || !transaction) return null;

  // Resolve comprehensive digital bill representation
  const bill = resolveDigitalBill(transaction);

  const {
    _id,
    title = 'Transaction',
    amount = 0,
    category = 'General',
    merchant = '',
    source = 'manual',
    date,
    paymentMethod = 'UPI',
    note = '',
    tags = [],
    isTaxDeductible = false,
    taxSection = '',
    upiDetails,
    receiptDetails,
    ecommercePlatform = 'none',
    motive = 'Need',
    motiveInsight = '',
  } = transaction;

  const motiveInfo = MOTIVE_CONFIG[selectedMotive] || MOTIVE_CONFIG.Need;
  const platformInfo = PLATFORM_ICONS[ecommercePlatform] || null;

  const handleCopyUtr = () => {
    if (!bill.payment.utr && !upiDetails?.utr) return;
    navigator.clipboard.writeText(bill.payment.utr || upiDetails?.utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleCopyGstin = () => {
    if (!bill.merchant.gstin || bill.merchant.gstin.startsWith('UNREGISTERED')) return;
    navigator.clipboard.writeText(bill.merchant.gstin);
    setCopiedGstin(true);
    setTimeout(() => setCopiedGstin(false), 2000);
  };

  const handleCopySlip = () => {
    const itemsFormatted = bill.items
      .map((item, idx) => `  ${idx + 1}. ${item.name} (${item.subCategory}) x${item.quantity} @ ₹${item.unitPrice} = ₹${item.price}`)
      .join('\n');

    const slipText = `
🧾 DIGITAL TAX INVOICE & FINANCIAL SLIP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Merchant: ${bill.merchant.displayName}
Location: ${bill.merchant.location}
${bill.merchant.hasGstin ? `GSTIN: ${bill.merchant.gstin}\n` : ''}Bill No: #${bill.invoice.number} | Token: #${bill.invoice.token}
Date & Time: ${bill.invoice.date} at ${bill.invoice.time}
Category: ${bill.categorization.hierarchy}
Spending Motive: ${selectedMotive} (${motiveInfo.label})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ITEMIZED PRODUCT MATRIX:
${itemsFormatted}
────────────────────────────────────
Pre-tax Subtotal: ₹${bill.tax.subtotal.toFixed(2)}
Central GST (CGST ${bill.tax.cgstRate}%): ₹${bill.tax.cgstAmount.toFixed(2)}
State GST (SGST ${bill.tax.sgstRate}%): ₹${bill.tax.sgstAmount.toFixed(2)}
${bill.tax.deliveryFee > 0 ? `Delivery Fee: ₹${bill.tax.deliveryFee.toFixed(2)}\n` : ''}${bill.tax.platformFee > 0 ? `Platform Fee: ₹${bill.tax.platformFee.toFixed(2)}\n` : ''}${bill.tax.discount > 0 ? `Discount: -₹${bill.tax.discount.toFixed(2)}\n` : ''}────────────────────────────────────
TOTAL AMOUNT PAID: ₹${bill.tax.grandTotal.toFixed(2)} (${isIncome ? 'Credit' : 'Debit'})
Payment Method: ${bill.payment.method} ${bill.payment.utr ? `| UTR: ${bill.payment.utr}` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated via Richy Personal Financial OS
    `.trim();

    navigator.clipboard.writeText(slipText);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2000);
  };

  const handleMotiveChange = async (newMotive) => {
    setSelectedMotive(newMotive);
    if (onUpdateMotive) {
      setUpdatingMotive(true);
      try {
        await onUpdateMotive(_id, newMotive);
      } catch (err) {
        console.error('Failed to update motive:', err);
      } finally {
        setUpdatingMotive(false);
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: '720px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: isIncome ? '1.5px solid rgba(0, 255, 135, 0.4)' : '1.5px solid rgba(0, 240, 255, 0.4)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 50px rgba(0, 240, 255, 0.15)',
            zIndex: 1000,
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: isIncome
                ? 'linear-gradient(90deg, rgba(0, 255, 135, 0.1) 0%, transparent 100%)'
                : 'linear-gradient(90deg, rgba(0, 240, 255, 0.1) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: isIncome ? 'rgba(0, 255, 135, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                  border: isIncome ? '1.5px solid #00FF87' : '1.5px solid #00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {platformInfo ? platformInfo.icon : bill.merchant.icon || <Receipt size={18} color="#00F0FF" />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  {bill.merchant.displayName}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#94A3B8' }}>
                  <span>{bill.categorization.hierarchy}</span>
                  <span>•</span>
                  <span style={{ color: '#00FF87', fontWeight: 700 }}>#{bill.invoice.number}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Dual Tab Switcher */}
              <div
                style={{
                  display: 'flex',
                  background: 'rgba(0,0,0,0.4)',
                  padding: '3px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <button
                  type="button"
                  onClick={() => setActiveViewTab('bill')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeViewTab === 'bill' ? '#00F0FF' : 'transparent',
                    color: activeViewTab === 'bill' ? '#050810' : '#94A3B8',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FileText size={12} /> Digital Bill
                </button>
                <button
                  type="button"
                  onClick={() => setActiveViewTab('motive')}
                  style={{
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    background: activeViewTab === 'motive' ? '#00FF87' : 'transparent',
                    color: activeViewTab === 'motive' ? '#050810' : '#94A3B8',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Sparkles size={12} /> Motive & Intel
                </button>
              </div>

              <button
                type="button"
                onClick={handleCopySlip}
                title="Copy Full Formatted Slip"
                className="btn-glass-secondary"
                style={{ height: '30px', padding: '0 8px', fontSize: '11px', gap: '4px' }}
              >
                {copiedSlip ? <CheckCheck size={12} color="#00FF87" /> : <Copy size={12} />}
                <span>{copiedSlip ? 'Copied' : 'Slip'}</span>
              </button>
              
              <button
                onClick={onClose}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* TAB 1: AUTHENTIC DETAILED DIGITAL BILL / TAX INVOICE TICKET */}
            {activeViewTab === 'bill' && (
              <div className="digital-bill-card">
                {/* 1. Merchant & Invoice Header */}
                <div className="digital-bill-header">
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <span style={{ fontSize: '16px' }}>{bill.merchant.icon}</span>
                      <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 900, color: '#FFFFFF', letterSpacing: '-0.3px' }}>
                        {bill.merchant.displayName}
                      </h4>
                      <BadgeCheck size={16} color="#00FF87" />
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '4px' }}>
                      {bill.merchant.subtitle}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748B' }}>
                      <MapPin size={11} color="#00F0FF" />
                      <span>{bill.merchant.location}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#00FF87', background: 'rgba(0, 255, 135, 0.1)', padding: '2px 8px', borderRadius: '4px', letterSpacing: '0.6px' }}>
                      TAX INVOICE
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'monospace' }}>
                      INV #{bill.invoice.number}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                      Token #{bill.invoice.token} • {bill.invoice.date} {bill.invoice.time}
                    </div>
                  </div>
                </div>

                {/* 2. GSTIN & Tax Status Pill Bar */}
                <div
                  style={{
                    padding: '8px 22px',
                    background: 'rgba(0, 240, 255, 0.03)',
                    borderBottom: '1px dashed rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '11.5px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ color: '#94A3B8', fontWeight: 600 }}>Merchant GSTIN:</span>
                    <strong style={{ color: '#00F0FF', letterSpacing: '0.6px', fontFamily: 'monospace' }}>
                      {bill.merchant.gstin}
                    </strong>
                    {bill.merchant.hasGstin && (
                      <button
                        type="button"
                        onClick={handleCopyGstin}
                        style={{ background: 'none', border: 'none', color: '#00F0FF', cursor: 'pointer', padding: 0 }}
                        title="Copy GSTIN"
                      >
                        {copiedGstin ? <CheckCheck size={12} color="#00FF87" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(0, 255, 135, 0.1)', color: '#00FF87', fontWeight: 700, fontSize: '10.5px' }}>
                      GST COMPLIANT (5%)
                    </span>
                    <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(129, 140, 248, 0.1)', color: '#818CF8', fontWeight: 700, fontSize: '10.5px' }}>
                      {bill.payment.method}
                    </span>
                  </div>
                </div>

                {/* 3. Detailed Itemized Products Table */}
                <div style={{ padding: '4px 10px', overflowX: 'auto' }}>
                  <table className="digital-bill-table">
                    <thead>
                      <tr>
                        <th style={{ width: '32px', textAlign: 'center' }}>#</th>
                        <th>Item Description</th>
                        <th style={{ width: '170px' }}>Subcategory</th>
                        <th style={{ width: '60px', textAlign: 'center' }}>Qty</th>
                        <th style={{ width: '90px', textAlign: 'right' }}>Unit Rate</th>
                        <th style={{ width: '100px', textAlign: 'right' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bill.items.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ textAlign: 'center', color: '#64748B', fontFamily: 'monospace', fontSize: '11px' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#F1F5F9' }}>
                              {item.name}
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: `1px solid ${item.badgeColor || 'rgba(255,255,255,0.1)'}`,
                                color: item.badgeColor || '#F1F5F9'
                              }}
                            >
                              <span>{item.emoji}</span>
                              <span>{item.subCategory}</span>
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#00F0FF', fontFamily: 'monospace' }}>
                            x{item.quantity}
                          </td>
                          <td style={{ textAlign: 'right', color: '#94A3B8', fontFamily: 'monospace' }}>
                            ₹{Number(item.unitPrice).toFixed(2)}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#00FF87', fontFamily: 'monospace' }}>
                            ₹{Number(item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="digital-bill-dashed-divider" />

                {/* 4. Complete Tax & Financial Decomposition Box */}
                <div style={{ padding: '0 22px 14px 22px', display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{ width: '100%', maxWidth: '340px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div className="digital-tax-summary-row">
                      <span style={{ color: '#94A3B8' }}>Pre-tax Subtotal (Taxable Value):</span>
                      <strong style={{ color: '#F1F5F9', fontFamily: 'monospace' }}>₹{bill.tax.subtotal.toFixed(2)}</strong>
                    </div>
                    
                    {bill.tax.cgstAmount > 0 && (
                      <div className="digital-tax-summary-row">
                        <span style={{ color: '#94A3B8' }}>Central GST (CGST {bill.tax.cgstRate}%):</span>
                        <strong style={{ color: '#00F0FF', fontFamily: 'monospace' }}>+₹{bill.tax.cgstAmount.toFixed(2)}</strong>
                      </div>
                    )}

                    {bill.tax.sgstAmount > 0 && (
                      <div className="digital-tax-summary-row">
                        <span style={{ color: '#94A3B8' }}>State GST (SGST {bill.tax.sgstRate}%):</span>
                        <strong style={{ color: '#00F0FF', fontFamily: 'monospace' }}>+₹{bill.tax.sgstAmount.toFixed(2)}</strong>
                      </div>
                    )}

                    {bill.tax.deliveryFee > 0 && (
                      <div className="digital-tax-summary-row">
                        <span style={{ color: '#94A3B8' }}>Delivery / Shipping:</span>
                        <strong style={{ color: '#F1F5F9', fontFamily: 'monospace' }}>+₹{bill.tax.deliveryFee.toFixed(2)}</strong>
                      </div>
                    )}

                    {bill.tax.platformFee > 0 && (
                      <div className="digital-tax-summary-row">
                        <span style={{ color: '#94A3B8' }}>Platform & Packaging Fee:</span>
                        <strong style={{ color: '#F1F5F9', fontFamily: 'monospace' }}>+₹{bill.tax.platformFee.toFixed(2)}</strong>
                      </div>
                    )}

                    {bill.tax.discount > 0 && (
                      <div className="digital-tax-summary-row">
                        <span style={{ color: '#FB7185' }}>Coupon & Merchant Discount:</span>
                        <strong style={{ color: '#FB7185', fontFamily: 'monospace' }}>-₹{bill.tax.discount.toFixed(2)}</strong>
                      </div>
                    )}

                    <div style={{ height: '1px', background: 'rgba(255, 255, 255, 0.12)', margin: '6px 0' }} />

                    <div className="digital-tax-summary-row" style={{ fontSize: '15px' }}>
                      <span style={{ fontWeight: 800, color: '#FFFFFF' }}>GRAND TOTAL PAID:</span>
                      <strong style={{ fontSize: '18px', fontWeight: 900, color: isIncome ? '#00FF87' : '#00FF87', fontFamily: 'monospace' }}>
                        ₹{bill.tax.grandTotal.toFixed(2)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 5. Barcode & Verification Strip */}
                <div
                  style={{
                    padding: '12px 22px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#00FF87" />
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#F1F5F9' }}>
                        VERIFIED DIGITAL TAX RECORD
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748B' }}>
                        Secured via Richy Double-Entry Cryptographic Ledger
                      </div>
                    </div>
                  </div>

                  <div style={{ width: '120px' }}>
                    <div className="barcode-strip" />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SPENDING MOTIVE & FINANCIAL INTELLIGENCE */}
            {activeViewTab === 'motive' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* 1. High-Precision Motive Card */}
                {!isIncome && (
                  <div
                    style={{
                      padding: '16px 18px',
                      borderRadius: '16px',
                      background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.06) 0%, rgba(0, 255, 135, 0.03) 100%)',
                      border: '1px solid rgba(0, 240, 255, 0.2)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={16} color="#00F0FF" />
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#F1F5F9', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                          Spending Motive & Psychological Intent
                        </span>
                      </div>

                      {/* Motive Chip */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 12px',
                          borderRadius: '999px',
                          background: motiveInfo.bg,
                          border: `1px solid ${motiveInfo.border}`,
                          color: motiveInfo.color,
                          fontSize: '12px',
                          fontWeight: 800,
                        }}
                      >
                        <span>{motiveInfo.icon}</span>
                        <span>{motiveInfo.label}</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.5, margin: 0 }}>
                      {motiveInsight || `This transaction has been classified as an ${motiveInfo.label.toLowerCase()} based on merchant profile (${bill.merchant.displayName}) and itemized dish/goods breakdown.`}
                    </p>

                    {/* Quick Motive Selector */}
                    <div>
                      <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        Adjust Motive Classification:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {Object.keys(MOTIVE_CONFIG).map((mKey) => {
                          const cfg = MOTIVE_CONFIG[mKey];
                          const isSelected = selectedMotive === mKey;
                          return (
                            <button
                              key={mKey}
                              type="button"
                              onClick={() => handleMotiveChange(mKey)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '11.5px',
                                fontWeight: isSelected ? 800 : 500,
                                background: isSelected ? cfg.bg : 'rgba(255, 255, 255, 0.03)',
                                border: isSelected ? `1.5px solid ${cfg.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                                color: isSelected ? cfg.color : '#94A3B8',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <span>{cfg.icon}</span>
                              <span>{cfg.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Categorization & Hierarchy Details */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FolderOpen size={16} color="#A78BFA" />
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#F1F5F9' }}>
                      Category Hierarchy & Taxonomy
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                    <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase', display: 'block' }}>Primary Category</span>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{bill.categorization.emoji}</span>
                        <span>{bill.categorization.primary}</span>
                      </div>
                    </div>

                    <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '10.5px', color: '#94A3B8', textTransform: 'uppercase', display: 'block' }}>Granular Subcategory</span>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: bill.categorization.color || '#00FF87', marginTop: '2px' }}>
                        {bill.categorization.subCategory}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Forensic Payment & Tax Status */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '12px',
                    fontSize: '12.5px',
                  }}
                >
                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Payment Method & UTR
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', fontWeight: 700 }}>
                      <CreditCard size={15} color="#00F0FF" />
                      <span>{bill.payment.method}</span>
                      {upiDetails?.upiApp && (
                        <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' }}>
                          {upiDetails.upiApp.toUpperCase()}
                        </span>
                      )}
                    </div>
                    {bill.payment.utr && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px' }}>
                        <span style={{ color: '#94A3B8' }}>UTR:</span>
                        <strong style={{ color: '#818CF8' }}>{bill.payment.utr}</strong>
                        <button
                          type="button"
                          onClick={handleCopyUtr}
                          style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', padding: 0 }}
                        >
                          {copiedUtr ? <CheckCheck size={11} color="#00FF87" /> : <Copy size={11} />}
                        </button>
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      Tax Deduction Status
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isTaxDeductible ? '#00FF87' : '#94A3B8', fontWeight: 700 }}>
                      <ShieldCheck size={15} />
                      <span>{isTaxDeductible ? `Eligible (${taxSection || 'Section 80C'})` : 'Standard / Non-Deductible'}</span>
                    </div>
                  </div>
                </div>

                {/* Notes & Tags */}
                {(note || tags.length > 0) && (
                  <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    {note && (
                      <p style={{ margin: '0 0 8px 0', fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.4 }}>
                        📝 {note}
                      </p>
                    )}
                    {tags.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {tags.map((t, idx) => (
                          <span
                            key={idx}
                            style={{
                              fontSize: '11px',
                              color: '#00F0FF',
                              background: 'rgba(0, 240, 255, 0.08)',
                              border: '1px solid rgba(0, 240, 255, 0.2)',
                              padding: '2px 8px',
                              borderRadius: '999px',
                            }}
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* Modal Action Bar */}
          <div
            style={{
              padding: '14px 22px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '10px',
              background: 'rgba(10, 14, 24, 0.95)',
            }}
          >
            {onPayUPI && !isIncome && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPayUPI(transaction);
                }}
                className="btn-glass-secondary"
                style={{ flex: 1, color: '#818CF8', gap: '6px' }}
              >
                <QrCode size={14} /> UPI QR
              </button>
            )}

            {onDuplicate && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDuplicate(transaction);
                }}
                className="btn-glass-secondary"
                style={{ flex: 1, gap: '6px' }}
              >
                <RefreshCw size={13} /> Duplicate
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(transaction);
                }}
                className="btn-glass-secondary"
                style={{ flex: 1.2, color: '#00F0FF', gap: '6px' }}
              >
                <Edit3 size={14} /> Edit
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(_id);
                }}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#FB7185',
                  borderRadius: '10px',
                  padding: '0 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
