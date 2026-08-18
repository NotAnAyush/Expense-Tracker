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
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../api/client';

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
}) => {
  const [copiedUtr, setCopiedUtr] = useState(false);
  const [copiedGstin, setCopiedGstin] = useState(false);
  const [copiedSlip, setCopiedSlip] = useState(false);
  const [selectedMotive, setSelectedMotive] = useState(transaction?.motive || 'Need');
  const [updatingMotive, setUpdatingMotive] = useState(false);

  if (!isOpen || !transaction) return null;

  const {
    _id,
    title = 'Transaction',
    amount = 0,
    category = 'General',
    merchant = '',
    source = 'manual',
    date,
    paymentMethod = 'Card',
    note = '',
    tags = [],
    splits = [],
    isTaxDeductible = false,
    taxSection = '',
    reimbursementStatus = 'none',
    upiDetails,
    receiptDetails,
    ecommercePlatform = 'none',
    motive = 'Need',
    motiveInsight = '',
  } = transaction;

  const lineItems = receiptDetails?.lineItems || [];
  const motiveInfo = MOTIVE_CONFIG[selectedMotive] || MOTIVE_CONFIG.Need;
  const platformInfo = PLATFORM_ICONS[ecommercePlatform] || null;

  const handleCopyUtr = () => {
    if (!upiDetails?.utr) return;
    navigator.clipboard.writeText(upiDetails.utr);
    setCopiedUtr(true);
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleCopyGstin = () => {
    if (!receiptDetails?.gstin) return;
    navigator.clipboard.writeText(receiptDetails.gstin);
    setCopiedGstin(true);
    setTimeout(() => setCopiedGstin(false), 2000);
  };

  const handleCopySlip = () => {
    const slipText = `
🧾 FINANCIAL TRANSACTION SLIP
━━━━━━━━━━━━━━━━━━━━━━━━━━
Title: ${title}
Amount: ₹${Number(amount).toLocaleString()} (${isIncome ? 'Income' : 'Expense'})
Category: ${category}
Merchant / Vendor: ${merchant || 'N/A'}
Date: ${new Date(date).toLocaleDateString()}
Motive: ${selectedMotive} (${motiveInfo.label})
Payment Method: ${paymentMethod}
${upiDetails?.utr ? `UTR: ${upiDetails.utr}\n` : ''}${receiptDetails?.gstin ? `GSTIN: ${receiptDetails.gstin}\n` : ''}${lineItems.length > 0 ? `Line Items:\n${lineItems.map(i => ` • ${i.name} (x${i.quantity}) - ₹${i.price}`).join('\n')}\n` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated via Richy Expense Tracker
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
            maxWidth: '680px',
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
              padding: '18px 24px',
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
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: isIncome ? 'rgba(0, 255, 135, 0.15)' : 'rgba(0, 240, 255, 0.15)',
                  border: isIncome ? '1.5px solid #00FF87' : '1.5px solid #00F0FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                {platformInfo ? platformInfo.icon : isIncome ? <ArrowDownLeft size={20} color="#00FF87" /> : <Store size={20} color="#00F0FF" />}
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  Transaction Intelligence
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Deep financial motive, taxes, itemization & forensic details
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCopySlip}
                title="Copy Financial Slip"
                className="btn-glass-secondary"
                style={{ height: '32px', padding: '0 10px', fontSize: '11.5px', gap: '5px' }}
              >
                {copiedSlip ? <CheckCheck size={13} color="#00FF87" /> : <Copy size={13} />}
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
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* 1. HERO FINANCIAL CARD */}
            <div
              style={{
                padding: '20px',
                borderRadius: '18px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(10, 14, 24, 0.7) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '14px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: isIncome ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 77, 77, 0.15)',
                      color: isIncome ? '#00FF87' : '#FF7D7D',
                      border: isIncome ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid rgba(255, 77, 77, 0.3)',
                    }}
                  >
                    {isIncome ? '+ Credit Inflow' : '- Debit Outflow'}
                  </span>
                  <span
                    style={{
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#E2E8F0',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    {category}
                  </span>
                  {source === 'ecommerce_sync' && (
                    <span style={{ fontSize: '11.5px', color: platformInfo?.color || '#00F0FF', fontWeight: 700 }}>
                      {platformInfo?.icon} {platformInfo?.label || 'E-Commerce Sync'}
                    </span>
                  )}
                  {source === 'upi_sync' && (
                    <span style={{ fontSize: '11px', color: '#818CF8', fontWeight: 700 }}>
                      ⚡ UPI SYNC
                    </span>
                  )}
                </div>

                <h2 style={{ margin: '4px 0', fontSize: '20px', fontWeight: 800, color: '#F8FAFC', fontFamily: 'var(--font-heading)' }}>
                  {title}
                </h2>
                {merchant && (
                  <div style={{ fontSize: '13px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building size={14} /> <span>Vendor / Merchant: <strong>{merchant}</strong></span>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <div
                  className="font-display"
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    color: isIncome ? '#00FF87' : '#FF7D7D',
                    letterSpacing: '-0.5px',
                  }}
                >
                  {isIncome ? '+' : '-'}₹{Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                  {receiptDetails?.time ? ` at ${receiptDetails.time}` : ''}
                </div>
              </div>
            </div>

            {/* 2. AI MOTIVE & INTENT REASONING ENGINE */}
            {!isIncome && (
              <div
                style={{
                  padding: '16px',
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
                      Spending Motive & Intent
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

                <p style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.45, margin: 0 }}>
                  {motiveInsight || `This transaction has been classified as an ${motiveInfo.label.toLowerCase()} based on merchant profile and item analysis.`}
                </p>

                {/* Quick Motive Selector */}
                <div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                    Adjust / Customize Motive:
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

            {/* 3. ITEMIZATION & LINE ITEMS MATRIX (If present) */}
            {lineItems.length > 0 && (
              <div
                style={{
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.25)',
                }}
              >
                <div
                  style={{
                    padding: '10px 14px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'rgba(255, 255, 255, 0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9' }}>
                    <Layers size={14} color="#00F0FF" />
                    <span>Itemized Products & Quantities ({lineItems.length} items)</span>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#00FF87', fontWeight: 700 }}>
                    Subtotal: ₹{receiptDetails?.subtotal ? receiptDetails.subtotal.toLocaleString() : amount.toLocaleString()}
                  </span>
                </div>

                <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ color: '#94A3B8', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', fontSize: '11px', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 12px' }}>Product</th>
                        <th style={{ padding: '8px 8px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px 8px', textAlign: 'right' }}>Unit Rate</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lineItems.map((item, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                          <td style={{ padding: '8px 12px', color: '#F1F5F9', fontWeight: 600 }}>{item.name}</td>
                          <td style={{ padding: '8px 8px', textAlign: 'center', color: '#00F0FF', fontWeight: 700 }}>x{item.quantity}</td>
                          <td style={{ padding: '8px 8px', textAlign: 'right', color: '#94A3B8' }}>₹{Number(item.unitPrice || item.price).toLocaleString()}</td>
                          <td style={{ padding: '8px 12px', textAlign: 'right', color: '#00FF87', fontWeight: 700 }}>₹{Number(item.price).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 4. GST & TAX BREAKDOWN */}
            {receiptDetails && (receiptDetails.gstin || receiptDetails.taxAmount > 0 || receiptDetails.deliveryFee > 0) && (
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Percent size={15} color="#00F0FF" />
                    <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9' }}>Tax & Charges Breakdown</span>
                  </div>
                  {receiptDetails.gstin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>GSTIN:</span>
                      <strong style={{ fontSize: '11.5px', color: '#00FF87', letterSpacing: '0.5px' }}>{receiptDetails.gstin}</strong>
                      <button
                        type="button"
                        onClick={handleCopyGstin}
                        style={{ background: 'none', border: 'none', color: '#00F0FF', cursor: 'pointer', padding: '2px' }}
                      >
                        {copiedGstin ? <CheckCheck size={12} color="#00FF87" /> : <Copy size={12} />}
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '8px', fontSize: '11.5px' }}>
                  {receiptDetails.subtotal > 0 && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ color: '#94A3B8', display: 'block' }}>Pre-tax Subtotal</span>
                      <strong style={{ color: '#F1F5F9' }}>₹{receiptDetails.subtotal}</strong>
                    </div>
                  )}
                  {receiptDetails.cgst?.amount > 0 && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ color: '#94A3B8', display: 'block' }}>CGST ({receiptDetails.cgst.rate}%)</span>
                      <strong style={{ color: '#00F0FF' }}>₹{receiptDetails.cgst.amount}</strong>
                    </div>
                  )}
                  {receiptDetails.sgst?.amount > 0 && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ color: '#94A3B8', display: 'block' }}>SGST ({receiptDetails.sgst.rate}%)</span>
                      <strong style={{ color: '#00F0FF' }}>₹{receiptDetails.sgst.amount}</strong>
                    </div>
                  )}
                  {receiptDetails.deliveryFee > 0 && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ color: '#94A3B8', display: 'block' }}>Delivery Fee</span>
                      <strong style={{ color: '#F1F5F9' }}>₹{receiptDetails.deliveryFee}</strong>
                    </div>
                  )}
                  {receiptDetails.platformFee > 0 && (
                    <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ color: '#94A3B8', display: 'block' }}>Platform Fee</span>
                      <strong style={{ color: '#F1F5F9' }}>₹{receiptDetails.platformFee}</strong>
                    </div>
                  )}
                  {receiptDetails.discount > 0 && (
                    <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '6px 10px', borderRadius: '8px' }}>
                      <span style={{ color: '#FB7185', display: 'block' }}>Discount</span>
                      <strong style={{ color: '#FB7185' }}>-₹{receiptDetails.discount}</strong>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. PAYMENT & FORENSICS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '12.5px',
              }}
            >
              {/* Payment Method & UTR */}
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Payment Method
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#F1F5F9', fontWeight: 700 }}>
                  <CreditCard size={15} color="#00F0FF" />
                  <span>{paymentMethod}</span>
                  {upiDetails?.upiApp && (
                    <span style={{ fontSize: '10.5px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(99, 102, 241, 0.2)', color: '#818CF8' }}>
                      {upiDetails.upiApp.toUpperCase()}
                    </span>
                  )}
                </div>
                {upiDetails?.utr && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '11.5px' }}>
                    <span style={{ color: '#94A3B8' }}>UTR:</span>
                    <strong style={{ color: '#818CF8' }}>{upiDetails.utr}</strong>
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

              {/* Tax Deduction Status */}
              <div style={{ padding: '12px 14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span style={{ color: '#94A3B8', fontSize: '11px', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                  Tax Claim Status
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

          {/* Modal Action Bar */}
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              gap: '10px',
              background: 'rgba(10, 14, 24, 0.8)',
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
