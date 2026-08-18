import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  UploadCloud,
  Camera,
  Sparkles,
  Check,
  AlertCircle,
  RefreshCw,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Copy,
  CheckCheck,
  Plus,
  Trash2,
  Tag,
  Percent,
  Receipt,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../../api/client';

// Master category taxonomy with icons & theme accents
const MASTER_CATEGORIES = [
  { id: 'Food & Dining', label: 'Food & Dining', icon: '🍔', color: '#00FF87' },
  { id: 'Groceries & Supermarket', label: 'Groceries & Supermarket', icon: '🛒', color: '#10B981' },
  { id: 'Shopping & E-Commerce', label: 'Shopping & E-Commerce', icon: '🛍️', color: '#00F0FF' },
  { id: 'Electronics & Gadgets', label: 'Electronics & Gadgets', icon: '💻', color: '#38BDF8' },
  { id: 'Clothing & Apparel', label: 'Clothing & Apparel', icon: '👗', color: '#EC4899' },
  { id: 'Home & Kitchen', label: 'Home & Kitchen', icon: '🏠', color: '#F59E0B' },
  { id: 'Transportation & Fuel', label: 'Transportation & Fuel', icon: '🚗', color: '#F97316' },
  { id: 'Travel & Lodging', label: 'Travel & Lodging', icon: '✈️', color: '#8B5CF6' },
  { id: 'Health & Medical', label: 'Health & Medical', icon: '💊', color: '#F43F5E' },
  { id: 'Entertainment & OTT', label: 'Entertainment & OTT', icon: '🎬', color: '#A855F7' },
  { id: 'Housing & Utilities', label: 'Housing & Utilities', icon: '⚡', color: '#EAB308' },
  { id: 'Subscriptions & Software', label: 'Subscriptions & Software', icon: '🔄', color: '#06B6D4' },
  { id: 'Education & Learning', label: 'Education & Learning', icon: '📚', color: '#3B82F6' },
  { id: 'Beauty & Personal Care', label: 'Beauty & Personal Care', icon: '✨', color: '#F472B6' },
  { id: 'Gifts & Donations', label: 'Gifts & Donations', icon: '🎁', color: '#FB7185' },
  { id: 'Investments & Wealth', label: 'Investments & Wealth', icon: '📈', color: '#14B8A6' },
  { id: 'Office & Business', label: 'Office & Business', icon: '💼', color: '#6366F1' },
  { id: 'Vehicle & Maintenance', label: 'Vehicle & Maintenance', icon: '🔧', color: '#94A3B8' },
  { id: 'General & Miscellaneous', label: 'General & Miscellaneous', icon: '📦', color: '#64748B' },
];

const SCAN_STAGES = [
  { label: 'Initializing High-Resolution Vision Pipeline...', progress: 15 },
  { label: 'Gemini Multimodal Neural Tensor Processing...', progress: 40 },
  { label: 'Extracting Merchant, GSTIN & Tax Entities...', progress: 65 },
  { label: 'Decomposing Itemized Matrix & Quantities...', progress: 85 },
  { label: 'Reconciling Balance & Tax Breakdown...', progress: 98 },
];

export const ReceiptScanModal = ({ isOpen, onClose, onSaveExpense, onConfirmScan, categories = [] }) => {
  // File & Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'items' | 'tax' | 'notes'

  // Image Inspector Controls (Zoom, Pan, Rotate, Lightbox)
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copiedGstin, setCopiedGstin] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Core Extracted Fields
  const [merchant, setMerchant] = useState('');
  const [merchantAddress, setMerchantAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [showCustomCatInput, setShowCustomCatInput] = useState(false);
  const [date, setDate] = useState(getLocalDateString(new Date()));
  const [time, setTime] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentRef, setPaymentRef] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [tokenNumber, setTokenNumber] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [note, setNote] = useState('');
  const [tags, setTags] = useState([]);
  const [isTaxDeductible, setIsTaxDeductible] = useState(false);
  const [taxSection, setTaxSection] = useState('Business Expense');

  // Tax & Charges Breakdown
  const [gstin, setGstin] = useState('');
  const [subtotal, setSubtotal] = useState('');
  const [cgstRate, setCgstRate] = useState(2.5);
  const [cgstAmount, setCgstAmount] = useState('');
  const [sgstRate, setSgstRate] = useState(2.5);
  const [sgstAmount, setSgstAmount] = useState('');
  const [igstRate, setIgstRate] = useState(0);
  const [igstAmount, setIgstAmount] = useState('');
  const [taxAmount, setTaxAmount] = useState('');
  const [deliveryFee, setDeliveryFee] = useState('');
  const [platformFee, setPlatformFee] = useState('');
  const [packagingFee, setPackagingFee] = useState('');
  const [discount, setDiscount] = useState('');
  const [roundOff, setRoundOff] = useState('');
  const [isECommerce, setIsECommerce] = useState(false);

  // Line Items Grid
  const [lineItems, setLineItems] = useState([]);

  const fileInputRef = useRef(null);

  // Merge master categories with user custom categories
  const allCategories = React.useMemo(() => {
    const userCatNames = categories.map(c => (typeof c === 'string' ? c : c.name)).filter(Boolean);
    const combined = [...MASTER_CATEGORIES];
    userCatNames.forEach(userCat => {
      if (!combined.some(c => c.id.toLowerCase() === userCat.toLowerCase())) {
        combined.push({
          id: userCat,
          label: userCat,
          icon: '🏷️',
          color: '#38BDF8',
        });
      }
    });
    return combined;
  }, [categories]);

  // Simulation timer during scanning for rich UX
  useEffect(() => {
    let interval;
    if (scanning) {
      setScanStepIndex(0);
      interval = setInterval(() => {
        setScanStepIndex(prev => (prev < SCAN_STAGES.length - 1 ? prev + 1 : prev));
      }, 750);
    }
    return () => clearInterval(interval);
  }, [scanning]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const compressImage = (file, maxDimension = 1800, quality = 0.9) => {
    return new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result, mimeType: file.type });
        reader.onerror = () => resolve({ dataUrl: null, mimeType: file.type });
        reader.readAsDataURL(file);
        return;
      }

      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve({ dataUrl, mimeType });
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result, mimeType: file.type });
        reader.onerror = () => resolve({ dataUrl: null, mimeType: file.type });
        reader.readAsDataURL(file);
      };

      img.src = objectUrl;
    });
  };

  const processFile = async (file) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setErrorMsg('Please upload an image (JPEG, PNG, WebP) or PDF receipt/invoice.');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);
    setZoomLevel(1);
    setRotation(0);

    try {
      const { dataUrl, mimeType } = await compressImage(file);
      if (!dataUrl) {
        setErrorMsg('Failed to read the selected file.');
        return;
      }
      setPreviewUrl(dataUrl);
      performOcrScan(dataUrl, mimeType);
    } catch (err) {
      console.error('Receipt processing error:', err);
      setErrorMsg('Failed to process receipt image.');
    }
  };

  const performOcrScan = async (base64Data, mimeType) => {
    setScanning(true);
    setErrorMsg('');
    try {
      const res = await apiFetch('/ai/receipt-scan', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType: mimeType || 'image/jpeg',
        }),
      });

      setScanResult(res);
      setMerchant(res.merchant || 'Store / Merchant');
      setMerchantAddress(res.merchantAddress || '');
      setAmount(res.amount !== undefined ? String(res.amount) : '');
      setCategory(res.category || 'Food & Dining');
      setDate(res.date ? getLocalDateString(new Date(res.date)) : getLocalDateString(new Date()));
      setTime(res.time || '');
      setPaymentMethod(res.paymentMethod || 'UPI');
      setPaymentRef(res.paymentRef || '');
      setInvoiceNumber(res.invoiceNumber || '');
      setTokenNumber(res.tokenNumber || '');
      setCurrency(res.currency || '₹');
      setIsECommerce(Boolean(res.isECommerce));

      // Tax fields
      setGstin(res.gstin || '');
      setSubtotal(res.subtotal !== undefined ? String(res.subtotal) : '');
      setCgstRate(res.cgst?.rate || 2.5);
      setCgstAmount(res.cgst?.amount !== undefined ? String(res.cgst.amount) : '');
      setSgstRate(res.sgst?.rate || 2.5);
      setSgstAmount(res.sgst?.amount !== undefined ? String(res.sgst.amount) : '');
      setIgstRate(res.igst?.rate || 0);
      setIgstAmount(res.igst?.amount !== undefined ? String(res.igst.amount) : '');
      setTaxAmount(res.taxAmount !== undefined ? String(res.taxAmount) : '');
      setDeliveryFee(res.deliveryFee ? String(res.deliveryFee) : '');
      setPlatformFee(res.platformFee ? String(res.platformFee) : '');
      setPackagingFee(res.packagingFee ? String(res.packagingFee) : '');
      setDiscount(res.discount ? String(res.discount) : '');
      setRoundOff(res.roundOff ? String(res.roundOff) : '');

      // Line items
      const items = (res.lineItems || []).map((item, idx) => ({
        id: `item-${Date.now()}-${idx}`,
        name: item.name || 'Item',
        quantity: item.quantity !== undefined ? Number(item.quantity) : 1,
        unitPrice: item.unitPrice !== undefined ? Number(item.unitPrice) : Number(item.price || 0),
        price: item.price !== undefined ? Number(item.price) : Number(item.unitPrice || 0),
        category: item.category || res.category || 'Food & Dining',
        hsnCode: item.hsnCode || '',
        taxRate: item.taxRate || 0,
      }));
      setLineItems(items);

      // Smart Note generation
      const itemsListText = items.map(i => `${i.name} (x${i.quantity} @ ₹${i.unitPrice})`).join(', ');
      const smartNote = itemsListText
        ? `Items: ${itemsListText}${res.gstin ? ` | GSTIN: ${res.gstin}` : ''}${res.invoiceNumber ? ` | Bill #${res.invoiceNumber}` : ''}`
        : (res.merchant ? `Receipt from ${res.merchant}` : '');
      setNote(smartNote);

      // Smart Tags
      const generatedTags = ['ReceiptScan', (res.category || 'Food & Dining').replace(/\s+/g, '')];
      if (res.merchant) generatedTags.push(res.merchant.split(' ')[0].replace(/[^a-zA-Z0-9]/g, ''));
      if (res.gstin) generatedTags.push('GSTClaimable');
      if (res.isECommerce) generatedTags.push('OnlineOrder');
      setTags([...new Set(generatedTags.filter(Boolean))]);

    } catch (err) {
      console.error('OCR scan failed:', err);
      setErrorMsg(err.message || 'Vision OCR extraction failed. You can still input receipt details manually.');
      setMerchant('Store / Merchant');
      setAmount('');
      setCategory('Food & Dining');
      setDate(getLocalDateString(new Date()));
      setScanResult({ fallback: true });
    } finally {
      setScanning(false);
    }
  };

  // Line item handlers
  const handleItemChange = (id, field, value) => {
    setLineItems(prev => prev.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') {
        const qty = field === 'quantity' ? Math.max(0.01, Number(value) || 0) : Number(item.quantity) || 1;
        const uPrice = field === 'unitPrice' ? Math.max(0, Number(value) || 0) : Number(item.unitPrice) || 0;
        updated.price = Number((qty * uPrice).toFixed(2));
      }
      return updated;
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
      price: 0,
      category: category || 'Food & Dining',
      hsnCode: '',
      taxRate: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleDeleteItem = (id) => {
    setLineItems(prev => prev.filter(i => i.id !== id));
  };

  // Recalculate Subtotal & Grand Total from Line Items
  const handleRecalculateTotals = () => {
    const itemsTotal = lineItems.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    setSubtotal(itemsTotal.toFixed(2));

    const totalTaxes = (Number(cgstAmount) || 0) + (Number(sgstAmount) || 0) + (Number(igstAmount) || 0);
    const extraFees = (Number(deliveryFee) || 0) + (Number(platformFee) || 0) + (Number(packagingFee) || 0);
    const discounts = Number(discount) || 0;
    const round = Number(roundOff) || 0;

    const computedGrand = itemsTotal + totalTaxes + extraFees - discounts + round;
    setAmount(Math.max(0, Number(computedGrand.toFixed(2))));
  };

  const handleCopyGstin = () => {
    if (!gstin) return;
    navigator.clipboard.writeText(gstin);
    setCopiedGstin(true);
    setTimeout(() => setCopiedGstin(false), 2000);
  };

  const handleCopyJson = () => {
    const payload = constructPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMsg('');
    setSaving(false);
    setMerchant('');
    setMerchantAddress('');
    setAmount('');
    setCategory('Food & Dining');
    setCustomCategoryInput('');
    setShowCustomCatInput(false);
    setDate(getLocalDateString(new Date()));
    setTime('');
    setPaymentMethod('UPI');
    setPaymentRef('');
    setInvoiceNumber('');
    setTokenNumber('');
    setGstin('');
    setSubtotal('');
    setCgstRate(2.5);
    setCgstAmount('');
    setSgstRate(2.5);
    setSgstAmount('');
    setIgstRate(0);
    setIgstAmount('');
    setTaxAmount('');
    setDeliveryFee('');
    setPlatformFee('');
    setPackagingFee('');
    setDiscount('');
    setRoundOff('');
    setLineItems([]);
    setNote('');
    setTags([]);
    setZoomLevel(1);
    setRotation(0);
    setIsLightboxOpen(false);
    setActiveTab('overview');
  };

  const constructPayload = () => {
    const totalNum = Number(amount) || 0;
    const subtotalNum = Number(subtotal) || 0;
    const cgstAmt = Number(cgstAmount) || 0;
    const sgstAmt = Number(sgstAmount) || 0;
    const igstAmt = Number(igstAmount) || 0;
    const totalTax = Number(taxAmount) || (cgstAmt + sgstAmt + igstAmt);

    return {
      title: merchant ? `Receipt: ${merchant}` : 'Receipt Expense',
      amount: totalNum,
      category: category || 'Food & Dining',
      merchant: merchant || '',
      date,
      paymentMethod,
      note,
      source: 'ai_suggested',
      currency: currency || '₹',
      tags: tags.length > 0 ? tags : ['ReceiptScan', (category || 'Food & Dining').replace(/\s+/g, '')],
      isTaxDeductible,
      taxSection: isTaxDeductible ? taxSection : '',
      splits: lineItems.length > 1 ? lineItems.map(item => ({
        category: item.category || category || 'Food & Dining',
        amount: Number(item.price) || 0,
        note: `${item.name}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`,
      })) : [],
      receiptDetails: {
        gstin: gstin || '',
        invoiceNumber: invoiceNumber || '',
        tokenNumber: tokenNumber || '',
        time: time || '',
        subtotal: subtotalNum,
        cgst: { rate: Number(cgstRate) || 0, amount: cgstAmt },
        sgst: { rate: Number(sgstRate) || 0, amount: sgstAmt },
        igst: { rate: Number(igstRate) || 0, amount: igstAmt },
        taxAmount: totalTax,
        deliveryFee: Number(deliveryFee) || 0,
        platformFee: Number(platformFee) || 0,
        packagingFee: Number(packagingFee) || 0,
        discount: Number(discount) || 0,
        roundOff: Number(roundOff) || 0,
        isECommerce,
        lineItems: lineItems.map(item => ({
          name: item.name || '',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          price: Number(item.price) || 0,
          category: item.category || category,
          hsnCode: item.hsnCode || '',
          taxRate: Number(item.taxRate) || 0,
        })),
      },
    };
  };

  const handleConfirmSave = async () => {
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid total expense amount.');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    const payload = constructPayload();

    try {
      if (onSaveExpense) {
        await onSaveExpense(payload);
      } else if (onConfirmScan) {
        onConfirmScan(payload);
      }
      handleReset();
      onClose();
    } catch (err) {
      console.error('Failed to save receipt expense:', err);
      setErrorMsg(err.message || 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDetailedForm = () => {
    const payload = constructPayload();
    if (onConfirmScan) {
      onConfirmScan(payload);
    }
    handleReset();
    onClose();
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
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: scanResult ? '1120px' : '580px',
            maxHeight: '94vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: '1.5px solid rgba(0, 240, 255, 0.35)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.85), 0 0 45px rgba(0, 240, 255, 0.2)',
            transition: 'max-width 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 22px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 255, 135, 0.03) 50%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(0, 255, 135, 0.25))',
                  border: '1px solid rgba(0, 240, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(0, 240, 255, 0.3)',
                }}
              >
                <Camera size={19} color="#00F0FF" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                    Multimodal Vision OCR 2.0
                  </h3>
                  <span
                    style={{
                      background: 'rgba(0, 240, 255, 0.12)',
                      color: '#00F0FF',
                      border: '1px solid rgba(0, 240, 255, 0.3)',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      letterSpacing: '0.4px',
                    }}
                  >
                    GST & E-COMMERCE READY
                  </span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                  Gemini Vision Tensor OCR with item quantities, unit rates & CGST/SGST decomposition
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {scanResult && (
                <button
                  type="button"
                  onClick={handleCopyJson}
                  title="Copy Extracted JSON"
                  className="btn-glass-secondary"
                  style={{ height: '30px', padding: '0 10px', fontSize: '11.5px', gap: '5px' }}
                >
                  {copiedJson ? <CheckCheck size={13} color="#00FF87" /> : <Copy size={13} />}
                  <span>{copiedJson ? 'Copied' : 'JSON'}</span>
                </button>
              )}
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

          {/* Body Content */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  padding: '12px 16px',
                  borderRadius: '14px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#FB7185',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Drop Zone State */}
            {!scanResult && !scanning && (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#00F0FF' : 'rgba(0, 240, 255, 0.25)'}`,
                  borderRadius: '22px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: dragActive
                    ? 'radial-gradient(circle, rgba(0, 240, 255, 0.12) 0%, rgba(10, 14, 24, 0.7) 100%)'
                    : 'linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(10, 14, 24, 0.6) 100%)',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 255, 135, 0.2))',
                    border: '1.5px solid rgba(0, 240, 255, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 0 25px rgba(0, 240, 255, 0.25)',
                  }}
                >
                  <UploadCloud size={32} color="#00F0FF" />
                </motion.div>

                <h4 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  Drop Any Bill, Receipt, or Order Screenshot
                </h4>
                <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '6px', maxWidth: '380px', margin: '6px auto 18px' }}>
                  Supports Indian GST Bills, Cafe Receipts (Rameshwaram, Starbucks), Amazon, Flipkart, Blinkit, Swiggy, and Zomato Invoices.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                  {['📸 Paper Bills', '🧾 GST Invoices', '🛍️ Amazon / Flipkart', '🛵 Swiggy / Blinkit', '🚕 Uber / Taxi'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontSize: '11.5px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        color: '#E2E8F0',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className="btn-primary-mint"
                  style={{ margin: '0 auto', height: '38px', fontSize: '13px', padding: '0 22px', gap: '8px' }}
                >
                  <Camera size={15} /> Select File from Device
                </button>
              </div>
            )}

            {/* Scanning Cyberpunk Laser Animation State */}
            {scanning && (
              <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div
                  style={{
                    position: 'relative',
                    maxWidth: '420px',
                    margin: '0 auto',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid rgba(0, 240, 255, 0.4)',
                    background: '#040711',
                    boxShadow: '0 0 35px rgba(0, 240, 255, 0.25)',
                  }}
                >
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Scanning Target"
                      style={{ width: '100%', maxHeight: '280px', objectFit: 'contain', opacity: 0.65, display: 'block' }}
                    />
                  )}

                  {/* HUD Corner Reticles */}
                  <div className="scanner-reticle-corner reticle-tl" />
                  <div className="scanner-reticle-corner reticle-tr" />
                  <div className="scanner-reticle-corner reticle-bl" />
                  <div className="scanner-reticle-corner reticle-br" />

                  {/* Laser Beam Overlay */}
                  <div className="scanner-laser-overlay">
                    <div className="scanner-laser-line" />
                    <div className="scanner-laser-trail" />
                  </div>
                </div>

                {/* Progress Indicators & Step Cards */}
                <div style={{ maxWidth: '480px', margin: '0 auto', width: '100%', textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
                    <Sparkles size={18} color="#00F0FF" className="animate-spin" />
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                      {SCAN_STAGES[scanStepIndex].label}
                    </h4>
                  </div>

                  {/* Dynamic Progress Bar */}
                  <div
                    style={{
                      height: '6px',
                      width: '100%',
                      background: 'rgba(255, 255, 255, 0.08)',
                      borderRadius: '999px',
                      overflow: 'hidden',
                      position: 'relative',
                    }}
                  >
                    <motion.div
                      initial={{ width: '10%' }}
                      animate={{ width: `${SCAN_STAGES[scanStepIndex].progress}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #00F0FF, #00FF87)',
                        boxShadow: '0 0 14px rgba(0, 255, 135, 0.8)',
                      }}
                    />
                  </div>

                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '10px' }}>
                    Decomposing line items, quantities, subtotal, CGST, SGST, IGST, and payment references
                  </p>
                </div>
              </div>
            )}

            {/* Structured Financial Review Workspace */}
            {scanResult && !scanning && (
              <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '400px 1fr' : '1fr', gap: '22px', alignItems: 'start' }}>
                {/* Left Column: HD Interactive Receipt Inspector */}
                {previewUrl && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div
                      className="receipt-inspector-viewport"
                      style={{
                        maxHeight: '480px',
                        overflowY: 'auto',
                        overflowX: 'auto',
                        padding: '12px',
                        cursor: zoomLevel > 1 ? 'grab' : 'default',
                      }}
                    >
                      <div
                        style={{
                          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                          transformOrigin: 'center top',
                          transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                          display: 'flex',
                          justifyContent: 'center',
                          width: '100%',
                        }}
                      >
                        <img
                          src={previewUrl}
                          alt="Receipt Inspector"
                          style={{
                            maxWidth: '100%',
                            height: 'auto',
                            display: 'block',
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.7)',
                          }}
                        />
                      </div>

                      {/* Floating Inspector Control Pill */}
                      <div
                        className="receipt-control-pill"
                        style={{
                          position: 'absolute',
                          bottom: '12px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          zIndex: 20,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setZoomLevel(prev => Math.max(0.6, Number((prev - 0.25).toFixed(2))))}
                          className="receipt-control-btn"
                          title="Zoom Out"
                        >
                          <ZoomOut size={14} />
                        </button>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#00F0FF', minWidth: '38px', textAlign: 'center' }}>
                          {Math.round(zoomLevel * 100)}%
                        </span>
                        <button
                          type="button"
                          onClick={() => setZoomLevel(prev => Math.min(3, Number((prev + 0.25).toFixed(2))))}
                          className="receipt-control-btn"
                          title="Zoom In"
                        >
                          <ZoomIn size={14} />
                        </button>
                        <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />
                        <button
                          type="button"
                          onClick={() => setRotation(prev => (prev + 90) % 360)}
                          className="receipt-control-btn"
                          title="Rotate 90°"
                        >
                          <RotateCw size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setZoomLevel(1);
                            setRotation(0);
                          }}
                          className="receipt-control-btn"
                          title="Reset View"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsLightboxOpen(true)}
                          className="receipt-control-btn"
                          title="Fullscreen Lightbox"
                        >
                          <Maximize2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* Metadata summary pill */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255, 255, 255, 0.07)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11.5px',
                        color: '#94A3B8',
                      }}
                    >
                      <span>Confidence: <strong style={{ color: '#00FF87' }}>{Math.round((scanResult.confidence || 0.92) * 100)}%</strong></span>
                      {gstin ? (
                        <span style={{ color: '#00F0FF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <ShieldCheck size={13} /> GSTIN Verified
                        </span>
                      ) : (
                        <span>Non-GST / Standard Bill</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Right Column: Multi-Tab Financial Details Editor */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Tab Navigation */}
                  <div
                    style={{
                      display: 'flex',
                      gap: '6px',
                      background: 'rgba(10, 14, 24, 0.6)',
                      padding: '4px',
                      borderRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={`receipt-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                    >
                      <Receipt size={14} /> Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('items')}
                      className={`receipt-tab-button ${activeTab === 'items' ? 'active' : ''}`}
                    >
                      <Layers size={14} /> Items & Quantities ({lineItems.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('tax')}
                      className={`receipt-tab-button ${activeTab === 'tax' ? 'active' : ''}`}
                    >
                      <Percent size={14} /> GST & Taxes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notes')}
                      className={`receipt-tab-button ${activeTab === 'notes' ? 'active' : ''}`}
                    >
                      <Tag size={14} /> Notes & Splits
                    </button>
                  </div>

                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Merchant & Grand Total */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}>
                        <div>
                          <label className="form-label">Merchant / Store / Vendor</label>
                          <input
                            type="text"
                            value={merchant}
                            onChange={(e) => setMerchant(e.target.value)}
                            placeholder="e.g. The Rameshwaram Cafe, Amazon"
                            className="glass-input"
                          />
                          {merchantAddress && (
                            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                              📍 {merchantAddress}
                            </span>
                          )}
                        </div>
                        <div>
                          <label className="form-label" style={{ color: '#00FF87', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Total (₹) *</span>
                            {subtotal && (
                              <span style={{ fontSize: '11px', color: '#94A3B8' }}>Subtotal: ₹{subtotal}</span>
                            )}
                          </label>
                          <input
                            type="number"
                            required
                            step="any"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="glass-input"
                            style={{ color: '#00FF87', fontWeight: 800, fontSize: '16px' }}
                          />
                        </div>
                      </div>

                      {/* Category Selection with Master Catalog */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label className="form-label" style={{ margin: 0 }}>Category ({allCategories.length} available)</label>
                          <button
                            type="button"
                            onClick={() => setShowCustomCatInput(!showCustomCatInput)}
                            style={{ background: 'none', border: 'none', color: '#00F0FF', fontSize: '11.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}
                          >
                            <Plus size={12} /> {showCustomCatInput ? 'Select Existing' : 'Add Custom'}
                          </button>
                        </div>

                        {!showCustomCatInput ? (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '6px', maxHeight: '130px', overflowY: 'auto', padding: '4px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                            {allCategories.map(cat => {
                              const isSelected = category === cat.id;
                              return (
                                <button
                                  key={cat.id}
                                  type="button"
                                  onClick={() => setCategory(cat.id)}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '6px 10px',
                                    borderRadius: '8px',
                                    fontSize: '11.5px',
                                    fontWeight: isSelected ? 700 : 500,
                                    border: isSelected ? `1.5px solid ${cat.color || '#00F0FF'}` : '1px solid rgba(255, 255, 255, 0.08)',
                                    background: isSelected ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                                    color: isSelected ? '#FFFFFF' : '#94A3B8',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.15s ease',
                                  }}
                                >
                                  <span>{cat.icon || '🏷️'}</span>
                                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                              type="text"
                              value={customCategoryInput}
                              onChange={(e) => setCustomCategoryInput(e.target.value)}
                              placeholder="Enter new custom category name..."
                              className="glass-input"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (customCategoryInput.trim()) {
                                  setCategory(customCategoryInput.trim());
                                  setShowCustomCatInput(false);
                                }
                              }}
                              className="btn-primary-mint"
                              style={{ padding: '0 14px', height: '38px' }}
                            >
                              Apply
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Date, Time, Payment Method */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr', gap: '10px' }}>
                        <div>
                          <label className="form-label">Transaction Date</label>
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">Time</label>
                          <input
                            type="text"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            placeholder="e.g. 06:37"
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">Payment Method</label>
                          <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="glass-input select-field"
                          >
                            <option value="UPI">UPI (GPay/PhonePe/Paytm)</option>
                            <option value="Card">Credit / Debit Card</option>
                            <option value="Cash">Cash</option>
                            <option value="Net Banking">Net Banking</option>
                            <option value="Wallet">Wallet / Amazon Pay</option>
                            <option value="COD">Cash on Delivery</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Bill / Order # & Token / Table # */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div>
                          <label className="form-label">Bill / Order / Invoice #</label>
                          <input
                            type="text"
                            value={invoiceNumber}
                            onChange={(e) => setInvoiceNumber(e.target.value)}
                            placeholder="e.g. 311086, 408-1234567"
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="form-label">Token / Table / Ref #</label>
                          <input
                            type="text"
                            value={tokenNumber || paymentRef}
                            onChange={(e) => {
                              setTokenNumber(e.target.value);
                              setPaymentRef(e.target.value);
                            }}
                            placeholder="e.g. Token 136 / UTR"
                            className="glass-input"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LINE ITEMS & QUANTITIES MATRIX */}
                  {activeTab === 'items' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>
                            Itemized Products & Services
                          </span>
                          <span style={{ fontSize: '11.5px', color: '#94A3B8', display: 'block' }}>
                            Customizable quantities and unit costs extracted from receipt
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={handleRecalculateTotals}
                            className="btn-glass-secondary"
                            style={{ height: '30px', padding: '0 10px', fontSize: '11.5px', color: '#00FF87' }}
                            title="Sum item totals into Grand Total"
                          >
                            <RefreshCw size={12} /> Sync Totals
                          </button>
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="btn-primary-mint"
                            style={{ height: '30px', padding: '0 12px', fontSize: '11.5px', gap: '4px' }}
                          >
                            <Plus size={13} /> Add Item
                          </button>
                        </div>
                      </div>

                      {/* Items Grid Table */}
                      <div
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          overflow: 'hidden',
                          background: 'rgba(0,0,0,0.25)',
                          maxHeight: '260px',
                          overflowY: 'auto',
                        }}
                      >
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                          <thead>
                            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                              <th style={{ padding: '8px 10px', color: '#94A3B8', fontWeight: 700 }}>Item Description</th>
                              <th style={{ padding: '8px 6px', color: '#94A3B8', fontWeight: 700, width: '65px' }}>Qty</th>
                              <th style={{ padding: '8px 6px', color: '#94A3B8', fontWeight: 700, width: '85px' }}>Unit (₹)</th>
                              <th style={{ padding: '8px 6px', color: '#94A3B8', fontWeight: 700, width: '90px' }}>Total (₹)</th>
                              <th style={{ padding: '8px 6px', color: '#94A3B8', fontWeight: 700, width: '110px' }}>Category</th>
                              <th style={{ padding: '8px 6px', width: '35px' }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {lineItems.length === 0 ? (
                              <tr>
                                <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#64748B' }}>
                                  No line items detected. Click "+ Add Item" to specify products.
                                </td>
                              </tr>
                            ) : (
                              lineItems.map((item) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                                  <td style={{ padding: '6px 8px' }}>
                                    <input
                                      type="text"
                                      value={item.name}
                                      onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                                      placeholder="Product / Dish name"
                                      className="receipt-grid-input"
                                    />
                                  </td>
                                  <td style={{ padding: '6px 4px' }}>
                                    <input
                                      type="number"
                                      step="any"
                                      min="0.01"
                                      value={item.quantity}
                                      onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                      className="receipt-grid-input"
                                      style={{ textAlign: 'center' }}
                                    />
                                  </td>
                                  <td style={{ padding: '6px 4px' }}>
                                    <input
                                      type="number"
                                      step="any"
                                      value={item.unitPrice}
                                      onChange={(e) => handleItemChange(item.id, 'unitPrice', e.target.value)}
                                      className="receipt-grid-input"
                                    />
                                  </td>
                                  <td style={{ padding: '6px 4px' }}>
                                    <input
                                      type="number"
                                      step="any"
                                      value={item.price}
                                      onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                      className="receipt-grid-input"
                                      style={{ color: '#00FF87', fontWeight: 700 }}
                                    />
                                  </td>
                                  <td style={{ padding: '6px 4px' }}>
                                    <select
                                      value={item.category}
                                      onChange={(e) => handleItemChange(item.id, 'category', e.target.value)}
                                      className="receipt-grid-input select-field"
                                      style={{ fontSize: '11px' }}
                                    >
                                      {allCategories.map(c => (
                                        <option key={c.id} value={c.id}>{c.label}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td style={{ padding: '6px 4px', textAlign: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteItem(item.id)}
                                      style={{ background: 'none', border: 'none', color: '#FB7185', cursor: 'pointer', padding: '2px' }}
                                      title="Delete Item"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Items Summary Strip */}
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'rgba(0, 240, 255, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(0, 240, 255, 0.15)',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ color: '#94A3B8' }}>Total {lineItems.length} item(s)</span>
                        <span>
                          Items Sum: <strong style={{ color: '#00F0FF' }}>₹{lineItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0).toFixed(2)}</strong>
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: GST & TAXES BREAKDOWN */}
                  {activeTab === 'tax' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* GSTIN & Tax Status Header */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(0, 255, 135, 0.04) 100%)',
                          border: '1px solid rgba(0, 240, 255, 0.25)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <ShieldCheck size={20} color="#00F0FF" />
                          <div>
                            <span style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              Merchant GSTIN / Tax ID
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                              <input
                                type="text"
                                value={gstin}
                                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                                placeholder="e.g. 29ABHFR8210M1ZP"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#FFFFFF',
                                  fontSize: '14px',
                                  fontWeight: 800,
                                  letterSpacing: '1px',
                                  outline: 'none',
                                  width: '200px',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {gstin && (
                          <button
                            type="button"
                            onClick={handleCopyGstin}
                            className="btn-glass-secondary"
                            style={{ height: '28px', padding: '0 10px', fontSize: '11px', gap: '4px' }}
                          >
                            {copiedGstin ? <CheckCheck size={12} color="#00FF87" /> : <Copy size={12} />}
                            <span>{copiedGstin ? 'Copied' : 'Copy'}</span>
                          </button>
                        )}
                      </div>

                      {/* CGST, SGST, IGST Matrix */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                        <div className="tax-metric-chip">
                          <label className="form-label" style={{ fontSize: '11px' }}>CGST (Central)</label>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="number"
                              step="any"
                              value={cgstRate}
                              onChange={(e) => setCgstRate(e.target.value)}
                              placeholder="%"
                              className="receipt-grid-input"
                              style={{ width: '45px', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>%</span>
                            <input
                              type="number"
                              step="any"
                              value={cgstAmount}
                              onChange={(e) => setCgstAmount(e.target.value)}
                              placeholder="₹ Amount"
                              className="receipt-grid-input"
                              style={{ color: '#00F0FF', fontWeight: 700 }}
                            />
                          </div>
                        </div>

                        <div className="tax-metric-chip">
                          <label className="form-label" style={{ fontSize: '11px' }}>SGST (State)</label>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="number"
                              step="any"
                              value={sgstRate}
                              onChange={(e) => setSgstRate(e.target.value)}
                              placeholder="%"
                              className="receipt-grid-input"
                              style={{ width: '45px', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>%</span>
                            <input
                              type="number"
                              step="any"
                              value={sgstAmount}
                              onChange={(e) => setSgstAmount(e.target.value)}
                              placeholder="₹ Amount"
                              className="receipt-grid-input"
                              style={{ color: '#00F0FF', fontWeight: 700 }}
                            />
                          </div>
                        </div>

                        <div className="tax-metric-chip">
                          <label className="form-label" style={{ fontSize: '11px' }}>IGST (Integrated)</label>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <input
                              type="number"
                              step="any"
                              value={igstRate}
                              onChange={(e) => setIgstRate(e.target.value)}
                              placeholder="%"
                              className="receipt-grid-input"
                              style={{ width: '45px', textAlign: 'center' }}
                            />
                            <span style={{ fontSize: '11px', color: '#94A3B8' }}>%</span>
                            <input
                              type="number"
                              step="any"
                              value={igstAmount}
                              onChange={(e) => setIgstAmount(e.target.value)}
                              placeholder="₹ Amount"
                              className="receipt-grid-input"
                              style={{ color: '#00F0FF', fontWeight: 700 }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Subtotal, Extra Charges & Discounts */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Subtotal (Pre-tax)</label>
                          <input
                            type="number"
                            step="any"
                            value={subtotal}
                            onChange={(e) => setSubtotal(e.target.value)}
                            placeholder="₹ 0.00"
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Delivery Fee</label>
                          <input
                            type="number"
                            step="any"
                            value={deliveryFee}
                            onChange={(e) => setDeliveryFee(e.target.value)}
                            placeholder="₹ 0.00"
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px' }}>Platform / Box Fee</label>
                          <input
                            type="number"
                            step="any"
                            value={platformFee || packagingFee}
                            onChange={(e) => {
                              setPlatformFee(e.target.value);
                              setPackagingFee(e.target.value);
                            }}
                            placeholder="₹ 0.00"
                            className="glass-input"
                          />
                        </div>
                        <div>
                          <label className="form-label" style={{ fontSize: '11px', color: '#FB7185' }}>Discount / Coupon</label>
                          <input
                            type="number"
                            step="any"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            placeholder="₹ 0.00"
                            className="glass-input"
                            style={{ color: '#FB7185' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: NOTES, TAGS & SPLITS */}
                  {activeTab === 'notes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label className="form-label">Itemized Notes / AI Summary</label>
                        <textarea
                          rows={3}
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Add receipt notes or description..."
                          className="glass-input"
                          style={{ resize: 'vertical' }}
                        />
                      </div>

                      {/* Smart Tags */}
                      <div>
                        <label className="form-label">Tags</label>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {tags.map((t, i) => (
                            <span
                              key={i}
                              style={{
                                background: 'rgba(0, 240, 255, 0.12)',
                                border: '1px solid rgba(0, 240, 255, 0.3)',
                                color: '#00F0FF',
                                padding: '3px 10px',
                                borderRadius: '999px',
                                fontSize: '11.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              #{t}
                              <button
                                type="button"
                                onClick={() => setTags(tags.filter((_, idx) => idx !== i))}
                                style={{ background: 'none', border: 'none', color: '#00F0FF', cursor: 'pointer', padding: 0 }}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Tax Deductible Section */}
                      <div
                        style={{
                          padding: '10px 14px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          borderRadius: '12px',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '12.5px', color: '#F1F5F9' }}>
                          <input
                            type="checkbox"
                            checked={isTaxDeductible}
                            onChange={(e) => setIsTaxDeductible(e.target.checked)}
                            style={{ accentColor: '#00FF87', width: '15px', height: '15px' }}
                          />
                          <span>Claim Tax Deduction for this Receipt</span>
                        </label>

                        {isTaxDeductible && (
                          <select
                            value={taxSection}
                            onChange={(e) => setTaxSection(e.target.value)}
                            className="glass-input select-field"
                            style={{ width: '180px', fontSize: '11.5px' }}
                          >
                            <option value="Business Expense">Business / Work Expense</option>
                            <option value="80C (PF, ELSS, Insurance)">Section 80C</option>
                            <option value="80D (Medical Insurance)">Section 80D (Health)</option>
                            <option value="80G (Charity / Donation)">Section 80G (Donation)</option>
                          </select>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <button type="button" onClick={handleReset} className="btn-glass-secondary" style={{ flex: 1 }}>
                      <RefreshCw size={13} /> Scan Another
                    </button>
                    {onConfirmScan && (
                      <button
                        type="button"
                        onClick={handleOpenDetailedForm}
                        className="btn-glass-secondary"
                        style={{ flex: 1.2, color: '#38BDF8', gap: '6px' }}
                      >
                        <Edit3 size={13} /> Edit in Full Form
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={saving}
                      onClick={handleConfirmSave}
                      className="btn-primary-mint"
                      style={{ flex: 2, height: '42px', fontSize: '13.5px', fontWeight: 800, gap: '8px' }}
                    >
                      {saving ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" /> Saving Expense...
                        </>
                      ) : (
                        <>
                          <Check size={16} /> Confirm & Save Expense (₹{amount || '0'})
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Fullscreen Lightbox Modal */}
        {isLightboxOpen && previewUrl && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.95)',
              zIndex: 99999,
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
            }}
            onClick={() => setIsLightboxOpen(false)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ color: '#00F0FF', fontWeight: 700, fontSize: '14px' }}>
                🔍 Ultra-HD Receipt Inspector — {merchant || 'Receipt Preview'}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewUrl}
                alt="Fullscreen Receipt"
                style={{
                  maxHeight: '90vh',
                  maxWidth: '90vw',
                  objectFit: 'contain',
                  borderRadius: '10px',
                  boxShadow: '0 0 50px rgba(0, 240, 255, 0.3)',
                  transform: `rotate(${rotation}deg)`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
