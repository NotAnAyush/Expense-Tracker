import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, Zap, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../../api/client';

export const CopilotDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Greetings! I am your AI Finance Copilot. I analyze your real-time spend velocity, budget limits, and financial anomalies.',
      intent: 'GREETING',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    "Where did my money go this month?",
    "Why did I spend more than last month?",
    "Am I over budget in any category?",
    "How much do subscriptions cost me?",
    "Show unusual transactions"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await apiFetch('/ai/copilot', {
        method: 'POST',
        body: JSON.stringify({ message: textToSend }),
      });

      const botMsg = {
        sender: 'bot',
        text: res.answer,
        intent: res.intent,
        evidence: res.evidence,
        isAiGenerated: res.isAiGenerated,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'Operating with deterministic fallback intelligence. Check backend connectivity.',
          intent: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(5, 8, 16, 0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 99,
        }}
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '460px',
          maxWidth: '100vw',
          background: 'rgba(10, 13, 20, 0.95)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 40px rgba(0, 0, 0, 0.8)',
          zIndex: 100,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 20, 32, 0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #7928CA 0%, #00FF87 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(0, 255, 135, 0.4)',
              }}
            >
              <Bot size={22} color="#050810" />
            </motion.div>
            <div>
              <h3 className="heading-md" style={{ color: '#F1F5F9', fontSize: '18px' }}>
                Finance Copilot
              </h3>
              <span className="glass-pill" style={{ fontSize: '11px', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)', padding: '2px 8px' }}>
                <Zap size={10} /> Grounded AI Intelligence
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '999px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F1F5F9',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Quick Suggestion Strip */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            overflowX: 'auto',
            display: 'flex',
            gap: '8px',
            background: 'rgba(20, 28, 44, 0.4)',
          }}
        >
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="filter-chip"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Messages Feed */}
        <div
          style={{
            flex: 1,
            padding: '24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
          }}
        >
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                gap: '12px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}
            >
              {m.sender === 'bot' && (
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #7928CA, #00FF87)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#050810',
                    flexShrink: 0,
                    boxShadow: '0 0 10px rgba(0, 255, 135, 0.3)',
                  }}
                >
                  <Bot size={16} />
                </div>
              )}

              <div>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '18px',
                    background: m.sender === 'user' ? 'var(--grad-mint-gold)' : 'rgba(22, 30, 48, 0.85)',
                    color: m.sender === 'user' ? '#050810' : '#F1F5F9',
                    border: m.sender === 'bot' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    fontWeight: m.sender === 'user' ? 700 : 500,
                    boxShadow: m.sender === 'user' ? '0 4px 16px rgba(0, 255, 135, 0.3)' : '0 4px 16px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {m.text}

                  {m.intent && m.intent !== 'GREETING' && (
                    <div style={{ marginTop: '8px' }}>
                      <span className="glass-pill" style={{ fontSize: '10px', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}>
                        INTENT: {m.intent}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {loading && (
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              style={{ display: 'flex', gap: '8px', alignItems: 'center', color: '#00FF87', fontSize: '13px', fontWeight: 600 }}
            >
              <Bot size={16} />
              Analyzing financial calculations & velocity...
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(15, 20, 32, 0.6)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot anything..."
            className="glass-input"
            style={{ flex: 1, paddingLeft: '20px', paddingRight: '20px', height: '46px' }}
          />
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            type="submit"
            className="btn-primary-mint"
            disabled={loading}
            style={{ width: '46px', height: '46px', padding: 0 }}
          >
            <Send size={18} />
          </motion.button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
