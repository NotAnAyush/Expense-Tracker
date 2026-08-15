import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, MessageSquare } from 'lucide-react';
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
          text: 'Operating with deterministic fallback calculations. Please check your connectivity.',
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
          backgroundColor: 'rgba(4, 7, 14, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99,
        }}
        onClick={onClose}
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '460px',
          maxWidth: '100vw',
          background: 'rgba(11, 15, 25, 0.98)',
          backdropFilter: 'blur(25px)',
          borderLeft: '1px solid var(--border-subtle)',
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
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 22, 36, 0.7)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
              }}
            >
              <Bot size={22} color="#00FF87" />
            </div>
            <div>
              <h3 className="heading-md" style={{ color: 'var(--color-text-main)', fontSize: '17px' }}>
                Finance Copilot
              </h3>
              <span style={{ fontSize: '11.5px', color: '#00FF87', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                ⚡ Grounded AI Intelligence
              </span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '999px',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={17} />
          </motion.button>
        </div>

        {/* Quick Suggestion Strip */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            overflowX: 'auto',
            display: 'flex',
            gap: '8px',
            background: 'rgba(15, 22, 36, 0.5)',
          }}
        >
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="filter-chip"
              style={{ fontSize: '12px', padding: '6px 12px' }}
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
            gap: '16px',
            background: 'rgba(8, 11, 17, 0.6)',
          }}
        >
          {messages.map((m, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                gap: '10px',
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '88%',
              }}
            >
              {m.sender === 'bot' && (
                <div
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00FF87',
                    flexShrink: 0,
                    marginTop: '2px',
                  }}
                >
                  <Bot size={15} />
                </div>
              )}

              <div>
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: m.sender === 'user' ? 'var(--grad-mint-emerald)' : 'rgba(18, 26, 44, 0.9)',
                    color: m.sender === 'user' ? '#050811' : '#F8FAFC',
                    border: m.sender === 'bot' ? '1px solid var(--border-light)' : 'none',
                    fontSize: '14px',
                    lineHeight: 1.5,
                    fontWeight: m.sender === 'user' ? 800 : 500,
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {m.text}

                  {m.intent && m.intent !== 'GREETING' && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#00FF87', background: 'rgba(0, 255, 135, 0.1)', border: '1px solid rgba(0, 255, 135, 0.3)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
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
              <Bot size={15} />
              Reviewing spending velocity and calculations...
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
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '10px',
            background: 'rgba(15, 22, 36, 0.9)',
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Copilot anything..."
            className="glass-input"
            style={{ flex: 1, paddingLeft: '18px', paddingRight: '18px', height: '44px' }}
          />
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="btn-primary-mint"
            disabled={loading}
            style={{ width: '44px', height: '44px', padding: 0 }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
