import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Sparkles } from 'lucide-react';
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
      backgroundColor: 'var(--color-primary)',
      borderLeft: '1px solid var(--color-border)',
      boxShadow: 'var(--shadow-xl)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'var(--color-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--color-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#020617',
            boxShadow: 'var(--glow-accent)'
          }}>
            <Bot size={20} fontWeight={700} />
          </div>
          <div>
            <h3 className="heading-md" style={{ fontSize: '18px', color: 'var(--color-foreground)' }}>Finance Copilot</h3>
            <span className="pin-overlay-pill" style={{ fontSize: '11px', marginTop: '2px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-accent)', borderColor: 'var(--color-border)' }}>AI Grounded</span>
          </div>
        </div>
        <button onClick={onClose} className="button-icon-circular">
          <X size={18} />
        </button>
      </div>

      {/* Quick Suggestions Chips */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--color-border)',
        overflowX: 'auto',
        display: 'flex',
        gap: '8px',
        whiteSpace: 'nowrap',
        backgroundColor: 'var(--color-secondary)'
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
        backgroundColor: 'var(--color-background)'
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
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-secondary)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent)',
                flexShrink: 0
              }}>
                <Bot size={16} />
              </div>
            )}

            <div>
              <div style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: m.sender === 'user' ? 'var(--color-accent)' : 'var(--color-primary)',
                color: m.sender === 'user' ? '#020617' : 'var(--color-foreground)',
                border: m.sender === 'bot' ? '1px solid var(--color-border)' : 'none',
                fontSize: '14px',
                lineHeight: 1.5,
                fontWeight: m.sender === 'user' ? 600 : 400
              }}>
                {m.text}

                {m.intent && m.intent !== 'GREETING' && (
                  <div style={{ marginTop: '8px' }}>
                    <span className="pin-overlay-pill" style={{ fontSize: '10px', backgroundColor: 'var(--color-secondary)', color: 'var(--color-accent)', borderColor: 'var(--color-border)' }}>
                      INTENT: {m.intent}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--color-muted-text)', fontSize: '14px' }}>
            <Bot size={16} color="var(--color-accent)" />
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
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'var(--color-primary)'
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your financial data..."
          className="text-input"
          style={{ flex: 1, backgroundColor: 'var(--color-secondary)', color: 'var(--color-foreground)' }}
        />
        <button type="submit" className="button-primary" disabled={loading} style={{ width: '44px', height: '44px', padding: 0 }}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
