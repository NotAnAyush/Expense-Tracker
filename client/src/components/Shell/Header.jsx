import React, { useEffect } from 'react';
import { Search, Plus, Bot, X, Sparkles, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onAddExpense, onOpenCopilot, searchQuery, setSearchQuery }) => {
  const { user } = useAuth();
  const searchInputRef = React.useRef(null);

  // Global Cmd+K / Ctrl+K keyboard shortcut handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header
      style={{
        background: 'rgba(8, 11, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0 32px',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
      }}
    >
      {/* 1. Branded Logo with Emerald Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <motion.div
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          <div
            style={{
              position: 'relative',
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'rgba(15, 22, 36, 0.9)',
              border: '1.5px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
            }}
          >
            <img
              src="/logo.jpg"
              alt="Richy Rich Logo"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </motion.div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className="font-display"
              style={{
                fontSize: '20px',
                fontWeight: 800,
                letterSpacing: '-0.4px',
                color: 'var(--color-text-main)',
              }}
            >
              Richy Rich
            </span>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#050811',
                background: 'var(--grad-mint-emerald)',
                padding: '2px 7px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.4px',
              }}
            >
              Pro
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', display: 'block', marginTop: '-1px' }}>
            Autonomous Wealth Engine
          </span>
        </div>
      </div>

      {/* 2. Sleek Dark Search Bar */}
      <div style={{ flex: 1, maxWidth: '520px', margin: '0 20px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={16}
            color="#00FF87"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 4px rgba(0, 255, 135, 0.4))',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            className="glass-input"
            placeholder="Search transactions, categories, notes..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '42px',
              paddingLeft: '42px',
              paddingRight: searchQuery ? '40px' : '84px',
              boxShadow: 'var(--shadow-sm)',
            }}
          />

          {/* Cmd + K Badge Pill */}
          {!searchQuery ? (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '2px 7px',
                color: 'var(--color-text-muted)',
                fontSize: '11px',
                fontWeight: 600,
                pointerEvents: 'none',
              }}
            >
              <Command size={10} /> K
            </div>
          ) : (
            <button
              onClick={() => setSearchQuery && setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '999px',
                width: '22px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-main)',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              title="Clear Search"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Right Action Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        {/* Finance Copilot Icon Trigger */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCopilot}
          title="Open AI Finance Copilot"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '999px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#00FF87',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 12px rgba(16, 185, 129, 0.25)',
            position: 'relative',
          }}
        >
          <Bot size={19} color="#00FF87" />
          {/* Active online dot */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '9px',
              height: '9px',
              borderRadius: '999px',
              background: '#00FF87',
              border: '2px solid #080B11',
              boxShadow: '0 0 6px #00FF87',
            }}
          />
        </motion.button>

        {/* High-Priority "+ Add Expense" Glowing CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAddExpense}
          className="btn-primary-mint"
        >
          <Plus size={17} strokeWidth={3} />
          <span>Add Expense</span>
        </motion.button>
      </div>
    </header>
  );
};
