import React, { useState, useEffect } from 'react';
import {
  X,
  ShoppingBag,
  Sparkles,
  RefreshCw,
  Layers,
  Check,
  AlertCircle,
  Copy,
  CheckCheck,
  Plus,
  ArrowRight,
  ExternalLink,
  Percent,
  ShieldCheck,
  Store,
  Clock,
  Zap,
  Mail,
  HelpCircle,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../api/client';

const PLATFORMS = [
  { id: 'amazon', label: 'Amazon India', icon: '🛍️', color: '#FF9900', bg: 'rgba(255, 153, 0, 0.1)', border: 'rgba(255, 153, 0, 0.3)', domain: 'amazon.in' },
  { id: 'blinkit', label: 'Blinkit (10-Min)', icon: '⚡', color: '#F7CB05', bg: 'rgba(247, 203, 5, 0.1)', border: 'rgba(247, 203, 5, 0.3)', domain: 'blinkit.com' },
  { id: 'swiggy', label: 'Swiggy & Instamart', icon: '🍔', color: '#FC8019', bg: 'rgba(252, 128, 25, 0.1)', border: 'rgba(252, 128, 25, 0.3)', domain: 'swiggy.in' },
  { id: 'zepto', label: 'Zepto', icon: '🛵', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.3)', domain: 'zeptonow.com' },
  { id: 'flipkart', label: 'Flipkart', icon: '📦', color: '#2874F0', bg: 'rgba(40, 116, 240, 0.1)', border: 'rgba(40, 116, 240, 0.3)', domain: 'flipkart.com' },
  { id: 'zomato', label: 'Zomato', icon: '🍕', color: '#E23744', bg: 'rgba(226, 55, 68, 0.1)', border: 'rgba(226, 55, 68, 0.3)', domain: 'zomato.com' },
  { id: 'myntra', label: 'Myntra Fashion', icon: '👗', color: '#FF3F6C', bg: 'rgba(255, 63, 108, 0.1)', border: 'rgba(255, 63, 108, 0.3)', domain: 'myntra.com' },
  { id: 'bigbasket', label: 'BigBasket', icon: '🛒', color: '#84C225', bg: 'rgba(132, 194, 37, 0.1)', border: 'rgba(132, 194, 37, 0.3)', domain: 'bigbasket.com' },
];

const SAMPLE_ORDERS = [
  {
    name: '🛍️ Amazon Prime Gadget & Fast Charger',
    text: `Amazon.in Order # 408-9876543-1234567
Sold by: Appario Retail Private Ltd
GSTIN: 29AABCA1234M1ZP
1x Anker 65W Fast Charger Type-C ₹2,499.00
1x Braided Nylon USB-C Cable 2M ₹499.00
Delivery Fee: ₹0.00
CGST (9%): ₹269.82
SGST (9%): ₹269.82
Order Total: ₹3,537.64`,
  },
  {
    name: '⚡ Blinkit 10-Min Groceries Restock',
    text: `Blinkit Instant Delivery (10 Mins)
Order # BLN-778899
2x Nandini Toned Milk 1L ₹84.00
1x Modern Brown Bread 400g ₹45.00
1x Farm Fresh Eggs Pack of 6 ₹54.00
Platform Fee: ₹4.00
Delivery Fee: ₹15.00
Discount: ₹10.00
Total Paid: ₹192.00`,
  },
  {
    name: '🍔 Swiggy Weekend Biryani Dining',
    text: `Swiggy Order SW-88442211
Restaurant: Meghana Foods, Indiranagar
2x Meghana Special Chicken Biryani ₹640.00
1x Guntur Chicken Dry ₹320.00
Delivery Fee: ₹40.00
Platform Fee: ₹6.00
Restaurant GST (5%): ₹48.00
Grand Total: ₹1,054.00`,
  },
];

export const EcommerceSyncModal = ({
  isOpen,
  onClose,
  onExpenseSynced,
}) => {
  const [activeTab, setActiveTab] = useState('import'); // 'platforms' | 'import' | 'samples' | 'webhook'
  const [platformData, setPlatformData] = useState([]);
  const [rawText, setRawText] = useState('');
  const [selectedPlatformHint, setSelectedPlatformHint] = useState('auto');
  const [parsing, setParsing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [parsedOrder, setParsedOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch connected platform metrics
  const fetchPlatforms = async () => {
    try {
      const res = await apiFetch('/ecommerce/platforms');
      setPlatformData(res.platforms || []);
    } catch (err) {
      console.error('Failed to load platforms:', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlatforms();
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen]);

  const handleParse = async () => {
    if (!rawText.trim()) {
      setErrorMsg('Please enter or paste your order confirmation text.');
      return;
    }

    setParsing(true);
    setErrorMsg('');
    setSuccessMsg('');
    setParsedOrder(null);

    try {
      const res = await apiFetch('/ecommerce/parse-order', {
        method: 'POST',
        body: JSON.stringify({
          text: rawText,
          platformHint: selectedPlatformHint,
        }),
      });

      setParsedOrder(res);
    } catch (err) {
      console.error('Parse order error:', err);
      setErrorMsg(err.message || 'Failed to parse order text. Please check format.');
    } finally {
      setParsing(false);
    }
  };

  const handleCommitSync = async () => {
    if (!parsedOrder) return;

    setSyncing(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await apiFetch('/ecommerce/sync-order', {
        method: 'POST',
        body: JSON.stringify(parsedOrder),
      });

      if (res.isDuplicate) {
        setErrorMsg(res.message);
      } else {
        setSuccessMsg(res.message || 'Order synced successfully!');
        if (onExpenseSynced) onExpenseSynced(res.expense);
        fetchPlatforms();
        setTimeout(() => {
          setParsedOrder(null);
          setRawText('');
          onClose();
        }, 1200);
      }
    } catch (err) {
      console.error('Sync commit error:', err);
      setErrorMsg(err.message || 'Failed to save expense from e-commerce order.');
    } finally {
      setSyncing(false);
    }
  };

  const loadSample = (sample) => {
    setRawText(sample.text);
    setActiveTab('import');
    setErrorMsg('');
    setSuccessMsg('');
    setParsedOrder(null);
  };

  if (!isOpen) return null;

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
            maxWidth: '860px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: '1.5px solid rgba(255, 153, 0, 0.4)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 50px rgba(255, 153, 0, 0.15)',
            zIndex: 1000,
          }}
        >
          {/* Modal Header */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(255, 153, 0, 0.1) 0%, rgba(247, 203, 5, 0.05) 50%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.25), rgba(247, 203, 5, 0.25))',
                  border: '1px solid rgba(255, 153, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                }}
              >
                🛍️
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                    E-Commerce & Quick-Commerce Sync
                  </h3>
                  <span
                    style={{
                      background: 'rgba(255, 153, 0, 0.15)',
                      color: '#FF9900',
                      border: '1px solid rgba(255, 153, 0, 0.35)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                    }}
                  >
                    8 PLATFORMS
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                  Instant order sync for Amazon, Blinkit, Swiggy, Zepto, Flipkart, Zomato, Myntra & BigBasket
                </span>
              </div>
            </div>

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

          {/* Navigation Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              padding: '8px 24px',
              background: 'rgba(10, 14, 24, 0.6)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('import')}
              className={`receipt-tab-button ${activeTab === 'import' ? 'active' : ''}`}
            >
              <Zap size={14} /> 1-Click Order Importer
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('platforms')}
              className={`receipt-tab-button ${activeTab === 'platforms' ? 'active' : ''}`}
            >
              <Store size={14} /> Connected Platforms ({platformData.filter(p => p.status === 'Connected').length}/8)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('samples')}
              className={`receipt-tab-button ${activeTab === 'samples' ? 'active' : ''}`}
            >
              <Play size={14} /> Live Demo Samples
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('webhook')}
              className={`receipt-tab-button ${activeTab === 'webhook' ? 'active' : ''}`}
            >
              <Mail size={14} /> Email Auto-Forwarding
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#FB7185',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(0, 255, 135, 0.12)',
                  border: '1px solid rgba(0, 255, 135, 0.3)',
                  color: '#00FF87',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                <Check size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* TAB 1: 1-CLICK ORDER IMPORTER */}
            {activeTab === 'import' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Paste Order Confirmation Text / Invoice / Email Body</span>
                    <span style={{ color: '#00F0FF', fontSize: '11.5px', cursor: 'pointer' }} onClick={() => loadSample(SAMPLE_ORDERS[0])}>
                      Paste Sample Order
                    </span>
                  </label>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste order confirmation text from Amazon, Blinkit, Swiggy, Zepto, Flipkart, or invoice details..."
                    className="glass-input"
                    style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '12.5px' }}
                  />
                </div>

                {/* Actions & Platform hint */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#94A3B8' }}>Platform:</span>
                    <select
                      value={selectedPlatformHint}
                      onChange={(e) => setSelectedPlatformHint(e.target.value)}
                      className="glass-input select-field"
                      style={{ width: '180px', height: '34px', fontSize: '12px' }}
                    >
                      <option value="auto">✨ Auto-Detect Platform</option>
                      {PLATFORMS.map(p => (
                        <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    disabled={parsing || !rawText.trim()}
                    onClick={handleParse}
                    className="btn-primary-mint"
                    style={{ height: '36px', padding: '0 20px', fontSize: '13px', gap: '6px' }}
                  >
                    {parsing ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    <span>{parsing ? 'Decomposing Order...' : 'Decompose & Preview Order'}</span>
                  </button>
                </div>

                {/* Parsed Preview Card */}
                {parsedOrder && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card"
                    style={{
                      padding: '18px',
                      borderRadius: '16px',
                      border: '1.5px solid rgba(0, 255, 135, 0.4)',
                      background: 'rgba(0, 255, 135, 0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '22px' }}>{parsedOrder.platformIcon || '🛍️'}</span>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                            {parsedOrder.platformLabel}
                          </h4>
                          <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                            Order #{parsedOrder.orderId} • {parsedOrder.orderDate}
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: '#00FF87' }}>
                          ₹{parsedOrder.totalAmount?.toLocaleString()}
                        </span>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Grand Total</div>
                      </div>
                    </div>

                    {/* Motive Banner */}
                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(0, 240, 255, 0.08)',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={14} color="#00F0FF" />
                        <span style={{ fontSize: '12px', color: '#E2E8F0' }}>
                          Motive: <strong style={{ color: '#00F0FF' }}>{parsedOrder.motive}</strong> — {parsedOrder.motiveInsight}
                        </span>
                      </div>
                    </div>

                    {/* Line Items Table */}
                    {parsedOrder.lineItems && parsedOrder.lineItems.length > 0 && (
                      <div style={{ marginBottom: '14px', borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94A3B8' }}>
                              <th style={{ padding: '6px 10px', textAlign: 'left' }}>Item Description</th>
                              <th style={{ padding: '6px 8px', textAlign: 'center' }}>Qty</th>
                              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Unit Rate</th>
                              <th style={{ padding: '6px 10px', textAlign: 'right' }}>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parsedOrder.lineItems.map((item, i) => (
                              <tr key={i} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.03)' }}>
                                <td style={{ padding: '6px 10px', color: '#F1F5F9' }}>{item.name}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'center', color: '#00F0FF', fontWeight: 700 }}>x{item.quantity}</td>
                                <td style={{ padding: '6px 8px', textAlign: 'right', color: '#94A3B8' }}>₹{item.unitPrice}</td>
                                <td style={{ padding: '6px 10px', textAlign: 'right', color: '#00FF87', fontWeight: 700 }}>₹{item.price}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Tax & Fee Chips */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', fontSize: '11.5px' }}>
                      {parsedOrder.subtotal > 0 && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>Pre-tax: ₹{parsedOrder.subtotal}</span>}
                      {parsedOrder.deliveryFee > 0 && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>Delivery: ₹{parsedOrder.deliveryFee}</span>}
                      {parsedOrder.platformFee > 0 && <span style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px' }}>Platform Fee: ₹{parsedOrder.platformFee}</span>}
                      {parsedOrder.discount > 0 && <span style={{ background: 'rgba(244,63,94,0.15)', color: '#FB7185', padding: '3px 8px', borderRadius: '6px' }}>Discount: -₹{parsedOrder.discount}</span>}
                      {parsedOrder.gstin && <span style={{ background: 'rgba(0,255,135,0.12)', color: '#00FF87', padding: '3px 8px', borderRadius: '6px' }}>GSTIN: {parsedOrder.gstin}</span>}
                    </div>

                    <button
                      type="button"
                      disabled={syncing}
                      onClick={handleCommitSync}
                      className="btn-primary-mint"
                      style={{ width: '100%', height: '40px', fontSize: '13.5px', fontWeight: 800, gap: '8px' }}
                    >
                      {syncing ? <RefreshCw size={14} className="animate-spin" /> : <Check size={16} />}
                      <span>{syncing ? 'Syncing into Expenses...' : `Confirm & Save to Expenses (₹${parsedOrder.totalAmount})`}</span>
                    </button>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 2: CONNECTED PLATFORMS HUB */}
            {activeTab === 'platforms' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                  {PLATFORMS.map((platform) => {
                    const stats = platformData.find(p => p.id === platform.id);
                    const isConnected = stats?.status === 'Connected';

                    return (
                      <div
                        key={platform.id}
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: isConnected ? `1.5px solid ${platform.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          position: 'relative',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>{platform.icon}</span>
                            <div>
                              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#F1F5F9' }}>
                                {platform.label}
                              </h4>
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>{platform.domain}</span>
                            </div>
                          </div>

                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '999px',
                              fontSize: '10.5px',
                              fontWeight: 700,
                              background: isConnected ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                              color: isConnected ? '#00FF87' : '#94A3B8',
                              border: isConnected ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                            }}
                          >
                            {isConnected ? '● Synced' : 'Ready'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94A3B8' }}>
                          <span>Synced Orders: <strong style={{ color: '#F1F5F9' }}>{stats?.totalOrders || 0}</strong></span>
                          <span>Spent: <strong style={{ color: platform.color }}>₹{stats?.totalSpent?.toLocaleString() || '0'}</strong></span>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPlatformHint(platform.id);
                            setActiveTab('import');
                          }}
                          className="btn-glass-secondary"
                          style={{ height: '30px', fontSize: '11.5px', gap: '4px' }}
                        >
                          <Plus size={12} /> Sync {platform.label.split(' ')[0]} Order
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: SAMPLES */}
            {activeTab === 'samples' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '13px', color: '#94A3B8' }}>
                  Click any realistic sample below to load and test the multi-platform parsing and motive decomposition immediately:
                </span>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {SAMPLE_ORDERS.map((sample, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 18px',
                        borderRadius: '14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F1F5F9' }}>
                          {sample.name}
                        </h4>
                        <span style={{ fontSize: '11.5px', color: '#64748B' }}>
                          Includes line items, itemized rates, platform fees & tax decomposition
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => loadSample(sample)}
                        className="btn-primary-mint"
                        style={{ height: '32px', padding: '0 14px', fontSize: '12px', gap: '4px' }}
                      >
                        <Play size={12} /> Load & Test
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: WEBHOOK & EMAIL */}
            {activeTab === 'webhook' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(0, 240, 255, 0.05)', border: '1px solid rgba(0, 240, 255, 0.2)' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '14.5px', fontWeight: 800, color: '#00F0FF' }}>
                    📬 Automated Email Order Forwarding
                  </h4>
                  <p style={{ margin: 0, fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.45 }}>
                    You can set up a simple auto-forwarding filter in Gmail or Apple Mail to forward order confirmations from Amazon, Blinkit, Swiggy, and Zepto to your personal sync endpoint.
                  </p>
                </div>

                <div>
                  <label className="form-label">Your Dedicated Personal Webhook Endpoint</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      readOnly
                      value="https://api.richy.app/api/ecommerce/webhook/usr_sec_8912739"
                      className="glass-input"
                      style={{ color: '#00FF87', fontFamily: 'monospace' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText('https://api.richy.app/api/ecommerce/webhook/usr_sec_8912739');
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="btn-glass-secondary"
                      style={{ padding: '0 14px' }}
                    >
                      {copiedToken ? <CheckCheck size={14} color="#00FF87" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                  <strong style={{ color: '#F1F5F9' }}>Supported Senders:</strong>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {['auto-confirm@amazon.in', 'orders@flipkart.com', 'orders@blinkit.com', 'noreply@swiggy.in', 'noreply@zomato.com', 'order-update@zepto.com'].map((email) => (
                      <span key={email} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', color: '#CBD5E1' }}>
                        {email}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
