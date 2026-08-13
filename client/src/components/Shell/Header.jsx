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
        background: 'rgba(10, 13, 20, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 28px',
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
      {/* 1. Branded Logo with Glowing Coin & Sparkle Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        <motion.div
          whileHover={{ scale: 1.06, rotate: 4 }}
          whileTap={{ scale: 0.95 }}
          style={{ position: 'relative', cursor: 'pointer' }}
        >
          {/* Glowing Aura Ring */}
          <div
            style={{
              position: 'absolute',
              inset: '-3px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
              opacity: 0.6,
              filter: 'blur(8px)',
            }}
          />
          <div
            style={{
              position: 'relative',
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: '#0F1420',
              border: '1.5px solid rgba(0, 255, 135, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              className="font-display"
              style={{
                fontSize: '21px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                background: 'linear-gradient(135deg, #FFFFFF 30%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Richy Rich
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#050810',
                background: 'linear-gradient(135deg, #00FF87, #FFD700)',
                padding: '2px 7px',
                borderRadius: '999px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Pro
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '-2px' }}>
            Gamified Wealth Engine
          </span>
        </div>
      </div>

      {/* 2. Floating Sleek Search Bar (Cmd + K Search Pill Style) */}
      <div style={{ flex: 1, maxWidth: '540px', margin: '0 20px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={17}
            color="#00FF87"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              pointerEvents: 'none',
              filter: 'drop-shadow(0 0 6px rgba(0, 255, 135, 0.4))',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            className="glass-input"
            placeholder="Search transactions, merchants, categories..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '44px',
              paddingRight: searchQuery ? '40px' : '88px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
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
                borderRadius: '8px',
                padding: '3px 8px',
                color: '#94A3B8',
                fontSize: '11px',
                fontWeight: 600,
                pointerEvents: 'none',
              }}
            >
              <Command size={11} /> K
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
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F1F5F9',
                cursor: 'pointer',
                transition: 'var(--transition)',
              }}
              title="Clear Search"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* 3. Right Action Cluster: Finance Copilot & High-Priority CTA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
        {/* Finance Copilot Icon Trigger */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCopilot}
          title="Open AI Finance Copilot"
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '999px',
            background: 'rgba(121, 40, 202, 0.2)',
            border: '1px solid rgba(121, 40, 202, 0.4)',
            color: '#9D4EDD',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 0 16px rgba(121, 40, 202, 0.25)',
            position: 'relative',
          }}
        >
          <Bot size={20} color="#00FF87" />
          {/* Active online dot */}
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '10px',
              height: '10px',
              borderRadius: '999px',
              background: '#00FF87',
              boxShadow: '0 0 8px #00FF87',
              border: '2px solid #0A0D14',
            }}
          />
        </motion.button>

        {/* High-Priority "+ Add Expense" Glowing Gradient CTA */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(0, 255, 135, 0.5)' }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddExpense}
          className="btn-primary-mint"
        >
          <Plus size={18} strokeWidth={3} />
          <span>Add Expense</span>
        </motion.button>
      </div>
    </header>
  );
};
