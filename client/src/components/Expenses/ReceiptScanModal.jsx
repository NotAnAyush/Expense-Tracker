import React, { useState, useRef } from 'react';
import { X, UploadCloud, Camera, Sparkles, Check, AlertCircle, FileText, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../../api/client';

export const ReceiptScanModal = ({ isOpen, onClose, onSaveExpense, categories = [] }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Editable Form State after OCR
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');
  const [date, setDate] = useState(getLocalDateString(new Date()));
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [note, setNote] = useState('');
  const [lineItems, setLineItems] = useState([]);

  const fileInputRef = useRef(null);

  const defaultCategories = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions', 'General'];
  const categoryList = categories.length > 0 ? categories.map(c => c.name || c) : defaultCategories;

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

  const compressImage = (file, maxDimension = 1600, quality = 0.85) => {
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
      setErrorMsg('Please upload an image (JPEG, PNG, WebP) or PDF receipt.');
      return;
    }
    setErrorMsg('');
    setSelectedFile(file);

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
      setErrorMsg('Failed to process image receipt.');
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
      setAmount(res.amount ? String(res.amount) : '');
      setCategory(res.category || 'Food & Dining');
      setDate(res.date ? getLocalDateString(new Date(res.date)) : getLocalDateString(new Date()));
      setPaymentMethod(res.paymentMethod || 'Card');
      setLineItems(res.lineItems || []);

      const lineItemsSummary = (res.lineItems || []).map(i => `${i.name} (₹${i.price})`).join(', ');
      setNote(lineItemsSummary ? `Items: ${lineItemsSummary}` : (res.merchant ? `Receipt from ${res.merchant}` : ''));
    } catch (err) {
      console.error('OCR scan failed:', err);
      setErrorMsg(err.message || 'Vision OCR extraction failed. You can still fill in the details manually.');
      // Pre-fill defaults
      setMerchant('Store / Merchant');
      setAmount('');
      setCategory('Food & Dining');
      setDate(getLocalDateString(new Date()));
      setScanResult({ fallback: true });
    } finally {
      setScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setScanResult(null);
    setErrorMsg('');
    setMerchant('');
    setAmount('');
    setCategory('Food & Dining');
    setLineItems([]);
    setNote('');
  };

  const handleConfirmSave = async () => {
    if (!amount || Number(amount) <= 0) {
      setErrorMsg('Please enter a valid expense amount.');
      return;
    }

    const payload = {
      title: merchant ? `Receipt: ${merchant}` : 'Receipt Expense',
      amount: Number(amount),
      category: category || 'Food & Dining',
      merchant: merchant || '',
      date,
      paymentMethod,
      note,
      source: 'ai_suggested',
      tags: ['ReceiptScan', category.replace(/\s+/g, '')],
      splits: lineItems.length > 1 ? lineItems.map(item => ({
        category: category || 'Food & Dining',
        amount: item.price || 0,
        note: item.name || '',
      })) : [],
    };

    await onSaveExpense(payload);
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          style={{
            width: '100%',
            maxWidth: scanResult ? '820px' : '520px',
            background: 'linear-gradient(145deg, rgba(16, 22, 36, 0.98) 0%, rgba(10, 14, 24, 0.99) 100%)',
            border: '1.5px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(0, 240, 255, 0.15)',
            overflow: 'hidden',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            transition: 'max-width 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '18px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(121, 40, 202, 0.2))',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={20} color="#00F0FF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  Multimodal Receipt Scanner
                </h3>
                <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                  Gemini Vision OCR with sub-second parameter extraction
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '10px',
                padding: '8px',
                color: '#94A3B8',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 77, 77, 0.12)',
                  border: '1px solid rgba(255, 77, 77, 0.3)',
                  color: '#FF7D7D',
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

            {!scanResult && !scanning && (
              /* Drag and Drop Zone */
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragActive ? '#00F0FF' : 'rgba(255, 255, 255, 0.15)'}`,
                  borderRadius: '20px',
                  padding: '48px 24px',
                  textAlign: 'center',
                  background: dragActive ? 'rgba(0, 240, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
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
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 255, 135, 0.15))',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <UploadCloud size={32} color="#00F0FF" />
                </motion.div>
                <h4 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#F1F5F9' }}>
                  Drag & Drop Receipt or Click to Browse
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                  Supports JPEG, PNG, WebP photos and PDF invoices (Max 10MB)
                </p>
              </div>
            )}

            {scanning && (
              /* Scanning Animation */
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ position: 'relative', width: '220px', height: '280px', margin: '0 auto 24px', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(0, 240, 255, 0.4)', background: '#0F172A' }}>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Receipt"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                    />
                  )}
                  {/* Laser Scanner Line */}
                  <motion.div
                    animate={{ y: [0, 270, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #00F0FF, #00FF87, transparent)',
                      boxShadow: '0 0 15px #00F0FF',
                      zIndex: 2,
                    }}
                  />
                </div>
                <h4 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 800, color: '#00F0FF', fontFamily: 'var(--font-heading)' }}>
                  Vision AI Analyzing Receipt...
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                  Detecting merchant, amount, taxes, date and line items
                </p>
              </div>
            )}

            {scanResult && !scanning && (
              /* Side by Side Preview & Editable Form */
              <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1.3fr' : '1fr', gap: '20px' }}>
                {/* Left Receipt Visual */}
                {previewUrl && (
                  <div
                    style={{
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: '#0B0F19',
                      maxHeight: '380px',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.05)', fontSize: '11px', color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Scanned Image Preview</span>
                      {scanResult.confidence && (
                        <span style={{ color: '#00FF87', fontWeight: 700 }}>
                          {(scanResult.confidence * 100).toFixed(0)}% Confidence
                        </span>
                      )}
                    </div>
                    <img
                      src={previewUrl}
                      alt="Receipt Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '340px' }}
                    />
                  </div>
                )}

                {/* Right Editable Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                        Merchant / Store
                      </label>
                      <input
                        type="text"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        placeholder="Merchant"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '13px',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#00FF87', marginBottom: '4px' }}>
                        Total Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'rgba(0, 255, 135, 0.08)',
                          border: '1px solid rgba(0, 255, 135, 0.3)',
                          color: '#00FF87',
                          fontSize: '14px',
                          fontWeight: 700,
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                        Category
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: '#0F172A',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '13px',
                        }}
                      >
                        {categoryList.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '10px',
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          color: '#F8FAFC',
                          fontSize: '13px',
                        }}
                      />
                    </div>
                  </div>

                  {/* Line Items Table if Extracted */}
                  {lineItems.length > 0 && (
                    <div
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        maxHeight: '120px',
                        overflowY: 'auto',
                      }}
                    >
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#00F0FF', display: 'block', marginBottom: '6px' }}>
                        Line Items Breakdown ({lineItems.length})
                      </span>
                      {lineItems.map((item, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#E2E8F0', padding: '2px 0' }}>
                          <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{item.name}</span>
                          <span style={{ fontWeight: 700, color: '#00FF87' }}>₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#CBD5E1', marginBottom: '4px' }}>
                      Notes / Description
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Extracted details"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#F8FAFC',
                        fontSize: '13px',
                      }}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={handleReset}
                      style={{
                        flex: 1,
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#94A3B8',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      <RefreshCw size={14} />
                      Scan Another
                    </button>

                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirmSave}
                      style={{
                        flex: 2,
                        padding: '12px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #00FF87 0%, #00F0FF 100%)',
                        border: 'none',
                        color: '#050810',
                        fontSize: '14px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-heading)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 20px rgba(0, 255, 135, 0.4)',
                      }}
                    >
                      <Check size={16} />
                      Confirm & Save Transaction
                    </motion.button>
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
