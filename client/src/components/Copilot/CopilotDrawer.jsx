import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles, User as UserIcon } from 'lucide-react';
import { apiFetch } from '../../api/client';

export const CopilotDrawer = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your Finance Copilot. Ask me anything about your spending, budgets, trends, or goals.',
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
          text: 'I am currently operating with deterministic analytics fallback. Check backend connection.',
          intent: 'ERROR',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '420px',
      maxWidth: '100vw',
      backgroundColor: 'var(--canvas)',
      borderLeft: '1px solid var(--hairline)',
      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.18)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--canvas)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff'
          }}>
            <Bot size={20} />
          </div>
          <div>
            <h3 className="heading-md" style={{ fontSize: '18px' }}>Finance Copilot</h3>
            <span className="pin-overlay-pill" style={{ fontSize: '11px', marginTop: '2px' }}>AI Grounded</span>
          </div>
        </div>
        <button onClick={onClose} className="button-icon-circular">
          <X size={18} />
        </button>
      </div>

      {/* Quick Suggestions Chips */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--hairline)',
        overflowX: 'auto',
        display: 'flex',
        gap: '8px',
        whiteSpace: 'nowrap',
        backgroundColor: 'var(--surface-card)'
      }}>
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
      <div style={{
        flex: 1,
        padding: '20px 24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        backgroundColor: 'var(--surface-soft)'
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              gap: '12px',
              alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%'
            }}
          >
            {m.sender === 'bot' && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--ink)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                flexShrink: 0
              }}>
                <Bot size={16} />
              </div>
            )}

            <div>
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: m.sender === 'user' ? 'var(--primary)' : 'var(--canvas)',
                color: m.sender === 'user' ? '#ffffff' : 'var(--ink)',
                border: m.sender === 'bot' ? '1px solid var(--hairline)' : 'none',
                fontSize: '15px',
                lineHeight: 1.45
              }}>
                {m.text}

                {m.intent && m.intent !== 'GREETING' && (
                  <div style={{ marginTop: '8px' }}>
                    <span className="pin-overlay-pill" style={{ fontSize: '10px' }}>
                      INTENT: {m.intent}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--mute)', fontSize: '14px' }}>
            <Bot size={16} color="var(--primary)" />
            Analyzing backend financial data...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--hairline)',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--canvas)'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your financial data..."
          className="text-input"
          style={{ flex: 1 }}
        />
        <button type="submit" className="button-primary" disabled={loading} style={{ width: '44px', height: '44px', padding: 0 }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
