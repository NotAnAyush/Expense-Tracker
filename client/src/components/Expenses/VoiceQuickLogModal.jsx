import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, X, Check, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const VoiceQuickLogModal = ({ isOpen, onClose, onSaveExpense, categories = [] }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const recognitionRef = useRef(null);

  // Category mapping dictionary
  const categoryKeywords = {
    'Food & Dining': ['food', 'lunch', 'dinner', 'breakfast', 'coffee', 'starbucks', 'swiggy', 'zomato', 'pizza', 'burger', 'restaurant', 'cafe'],
    'Transportation': ['uber', 'ola', 'rapido', 'cab', 'taxi', 'petrol', 'fuel', 'metro', 'bus', 'flight', 'ticket'],
    'Shopping': ['amazon', 'flipkart', 'myntra', 'clothes', 'shoes', 'electronics', 'grocery', 'groceries', 'blinkit', 'zepto'],
    'Housing & Utilities': ['rent', 'electricity', 'water', 'gas', 'bill', 'wifi', 'internet', 'broadband'],
    'Subscriptions': ['netflix', 'spotify', 'hotstar', 'prime', 'youtube', 'apple', 'gym', 'membership'],
    'Health & Medical': ['medicine', 'doctor', 'hospital', 'pharmacy', 'clinic', 'dentist'],
    'Entertainment': ['movie', 'cinema', 'pvr', 'concert', 'gaming', 'game'],
  };

  // Payment method keywords
  const paymentKeywords = {
    'UPI': ['upi', 'gpay', 'google pay', 'phonepe', 'paytm'],
    'Card': ['card', 'credit card', 'debit card'],
    'Cash': ['cash'],
    'Bank Transfer': ['bank transfer', 'net banking', 'neft', 'imps'],
  };

  const parseVoiceText = (text) => {
    if (!text || typeof text !== 'string') return null;
    const lower = text.toLowerCase();

    // 1. Extract Amount (e.g. "450", "1500 rupees", "25 dollars", "bucks")
    const amountMatch = lower.match(/(?:(?:rs\.?|inr|₹|\$)\s*(\d+(?:,\d+)*(?:\.\d+)?))|(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:rupees|rs\.?|inr|bucks|dollars)?/);
    let amount = 0;
    if (amountMatch) {
      const rawNum = (amountMatch[1] || amountMatch[2] || '').replace(/,/g, '');
      amount = parseFloat(rawNum) || 0;
    }

    // 2. Infer Category
    let matchedCategory = 'Shopping';
    for (const [cat, kws] of Object.entries(categoryKeywords)) {
      if (kws.some(kw => lower.includes(kw))) {
        matchedCategory = cat;
        break;
      }
    }

    // 3. Infer Payment Method
    let matchedPayment = 'UPI';
    for (const [pm, kws] of Object.entries(paymentKeywords)) {
      if (kws.some(kw => lower.includes(kw))) {
        matchedPayment = pm;
        break;
      }
    }

    // 4. Generate Title
    let cleanTitle = text
      .replace(/paid|spent|bought|for|using|via|on|rupees|rs\.?|inr|\d+/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanTitle || cleanTitle.length < 2) {
      cleanTitle = `${matchedCategory} Expense`;
    } else {
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    return {
      title: cleanTitle,
      amount,
      category: matchedCategory,
      paymentMethod: matchedPayment,
      date: new Date().toISOString().split('T')[0],
      rawVoiceText: text,
    };
  };

  const startListening = () => {
    setErrorMsg('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg('Web Speech API is not supported in this browser. Please use Chrome/Edge or type manually.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN'; // Default to Indian English, also parses global English

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript('');
      };

      recognition.onresult = (event) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        const parsed = parseVoiceText(current);
        if (parsed && parsed.amount > 0) {
          setParsedData(parsed);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          setErrorMsg('No speech detected. Please speak clearly into your microphone.');
        } else if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access blocked. Please allow mic permissions.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setErrorMsg('Could not start microphone. Please check browser permissions.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setParsedData(null);
      setErrorMsg('');
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isOpen]);

  const handleConfirm = () => {
    if (!parsedData || parsedData.amount <= 0) return;
    onSaveExpense(parsedData);
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
          background: 'rgba(5, 8, 16, 0.85)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          style={{
            width: '100%',
            maxWidth: '480px',
            background: 'linear-gradient(135deg, rgba(16, 22, 38, 0.98) 0%, rgba(10, 14, 24, 0.98) 100%)',
            border: '1.5px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(0, 240, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              borderRadius: '999px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              cursor: 'pointer',
            }}
          >
            <X size={16} />
          </button>

          {/* Cyberpunk Pulsing Mic Orb */}
          <div style={{ position: 'relative', margin: '20px 0 16px' }}>
            {isListening && (
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0.1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                style={{
                  position: 'absolute',
                  inset: '-15px',
                  borderRadius: '999px',
                  background: 'radial-gradient(circle, #00F0FF, transparent 70%)',
                }}
              />
            )}
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={isListening ? stopListening : startListening}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '999px',
                background: isListening ? 'linear-gradient(135deg, #00F0FF 0%, #7000FF 100%)' : 'rgba(255, 255, 255, 0.08)',
                border: `2px solid ${isListening ? '#00F0FF' : 'rgba(255, 255, 255, 0.2)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isListening ? '#050810' : '#F8FAFC',
                cursor: 'pointer',
                boxShadow: isListening ? '0 0 30px rgba(0, 240, 255, 0.6)' : 'none',
                position: 'relative',
              }}
            >
              {isListening ? <Mic size={36} /> : <MicOff size={36} />}
            </motion.button>
          </div>

          <h3 className="heading-lg" style={{ margin: 0 }}>
            {isListening ? 'Listening to your voice...' : 'Voice Quick-Log'}
          </h3>
          <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '4px' }}>
            {isListening ? 'Say: "Paid 350 for lunch via UPI" or "Uber 520"' : 'Tap microphone to speak'}
          </p>

          {/* Transcript Box */}
          <div
            style={{
              width: '100%',
              minHeight: '64px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '12px 16px',
              marginTop: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              color: transcript ? '#F8FAFC' : '#64748B',
              fontStyle: transcript ? 'normal' : 'italic',
            }}
          >
            {transcript || 'Live transcription will appear here as you speak...'}
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div style={{ color: '#FF7D7D', fontSize: '12.5px', marginTop: '8px' }}>
              {errorMsg}
            </div>
          )}

          {/* Extracted Structured Card */}
          {parsedData && parsedData.amount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                width: '100%',
                marginTop: '18px',
                padding: '14px 18px',
                borderRadius: '16px',
                background: 'rgba(0, 255, 135, 0.08)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                textAlign: 'left',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '15px' }}>{parsedData.title}</div>
                <div style={{ display: 'flex', gap: '8px', marginTop: '2px', fontSize: '12px', color: '#94A3B8' }}>
                  <span>{parsedData.category}</span>
                  <span>•</span>
                  <span>{parsedData.paymentMethod}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#00FF87', fontFamily: 'var(--font-display)' }}>
                  ₹{parsedData.amount.toLocaleString()}
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '22px' }}>
            <button
              onClick={onClose}
              className="btn-glass-secondary"
              style={{ flex: 1, padding: '12px', justifyContent: 'center' }}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConfirm}
              disabled={!parsedData || parsedData.amount <= 0}
              className="btn-primary-mint"
              style={{ flex: 1, padding: '12px', justifyContent: 'center', opacity: (!parsedData || parsedData.amount <= 0) ? 0.5 : 1 }}
            >
              <Check size={16} /> Confirm & Log
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
