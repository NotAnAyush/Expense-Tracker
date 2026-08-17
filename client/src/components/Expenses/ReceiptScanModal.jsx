import React, { useState, useRef } from 'react';
import { X, UploadCloud, Camera, Sparkles, Check, AlertCircle, FileText, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch, getLocalDateString } from '../../api/client';

export const ReceiptScanModal = ({ isOpen, onClose, onSaveExpense, onConfirmScan, categories = [] }) => {
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

    if (onConfirmScan) {
      onConfirmScan(payload);
    } else if (onSaveExpense) {
      await onSaveExpense(payload);
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
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="glass-card"
          style={{
            width: '100%',
            maxWidth: scanResult ? '820px' : '520px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            overflow: 'hidden',
            border: '1.5px solid rgba(0, 240, 255, 0.3)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 35px rgba(0, 240, 255, 0.15)',
            transition: 'max-width 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.06) 0%, transparent 100%)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.25), rgba(121, 40, 202, 0.25))',
                  border: '1px solid rgba(0, 240, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Camera size={18} color="#00F0FF" />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#F1F5F9', fontFamily: 'var(--font-heading)' }}>
                  Multimodal Receipt Scanner
                </h3>
                <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                  Gemini Vision OCR with sub-second parameter extraction
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
            {errorMsg && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#FB7185',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '14px',
                }}
              >
                <AlertCircle size={15} />
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
                  border: `2px dashed ${dragActive ? '#00F0FF' : 'rgba(255, 255, 255, 0.12)'}`,
                  borderRadius: '18px',
                  padding: '40px 20px',
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
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(0, 255, 135, 0.15))',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <UploadCloud size={28} color="#00F0FF" />
                </motion.div>
                <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                  Upload Receipt Image or PDF
                </h4>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px', maxWidth: '300px', margin: '4px auto 14px' }}>
                  Drag & drop, browse files, or snapshot your paper bill
                </p>
                <button
                  type="button"
                  className="btn-primary-mint"
                  style={{ margin: '0 auto', height: '34px', fontSize: '12.5px', padding: '0 16px' }}
                >
                  <Camera size={14} /> Select File
                </button>
              </div>
            )}

            {scanning && (
              /* Scanning Shimmer State */
              <div style={{ padding: '40px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', border: '3px solid rgba(0, 240, 255, 0.2)', borderTopColor: '#00F0FF' }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                    Gemini Vision Scanning Receipt...
                  </h4>
                  <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Detecting merchant, total bill amount, tax codes, and itemized rows
                  </p>
                </div>
              </div>
            )}

            {scanResult && (
              /* Review & Confirm Screen */
              <div style={{ display: 'grid', gridTemplateColumns: previewUrl ? '1fr 1.2fr' : '1fr', gap: '20px', alignItems: 'start' }}>
                {previewUrl && (
                  <div style={{ borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)', maxHeight: '380px', background: '#050810' }}>
                    <img src={previewUrl} alt="Receipt preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label">Merchant / Vendor</label>
                      <input
                        type="text"
                        value={merchant}
                        onChange={(e) => setMerchant(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: '#00FF87' }}>Total (₹) *</label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="glass-input"
                        style={{ color: '#00FF87', fontWeight: 800 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label className="form-label">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="glass-input select-field"
                      >
                        {categoryList.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="glass-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Notes</label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="glass-input"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button type="button" onClick={handleReset} className="btn-glass-secondary" style={{ flex: 1 }}>
                      <RefreshCw size={13} /> Scan Another
                    </button>
                    <button type="button" onClick={handleConfirmSave} className="btn-primary-mint" style={{ flex: 2 }}>
                      <Check size={14} /> Confirm & Save
                    </button>
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
