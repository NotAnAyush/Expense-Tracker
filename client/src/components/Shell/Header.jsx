import React, { useEffect } from 'react';
import { Search, Plus, Bot, X, Sparkles, Command, Eye, EyeOff, Mic, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePrivacy } from '../../context/PrivacyContext';

export const Header = ({
  onAddExpense,
  onAddIncome,
  onOpenReceiptScan,
  onOpenVoiceLog,
  onOpenBankImport,
  onOpenCopilot,
  searchQuery,
  setSearchQuery,
}) => {
  const { user } = useAuth();
  const { isPrivacyMaskActive, togglePrivacyMask } = usePrivacy();
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
        padding: '0 24px',
        height: '76px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
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
                background: 'linear-gradient(135deg, #00FF87, #00F0FF)',
                color: '#050810',
                padding: '2px 6px',
                borderRadius: '6px',
                letterSpacing: '0.4px',
              }}
            >
              v2.4
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
            <Sparkles size={11} color="#FFD700" />
            <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 600 }}>
              AI Personal Wealth Platform
            </span>
          </div>
        </div>
      </div>

      {/* 2. Global Universal Search Input */}
      <div style={{ flex: 1, maxWidth: '400px' }}>
        <div style={{ position: 'relative' }}>
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#64748B',
              pointerEvents: 'none',
            }}
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search transactions, merchants, #tags, income..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 42px 10px 38px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#F8FAFC',
              fontSize: '13px',
              outline: 'none',
              transition: 'all 0.2s ease',
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

      {/* 3. Action Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {/* Privacy Shield Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={togglePrivacyMask}
          title={isPrivacyMaskActive ? 'Privacy Mask ON (Alt+P) — Click to show numbers' : 'Privacy Mask OFF (Alt+P) — Click to hide numbers'}
          style={{
            padding: '8px 12px',
            borderRadius: '12px',
            background: isPrivacyMaskActive ? 'rgba(255, 77, 77, 0.15)' : 'rgba(255, 255, 255, 0.05)',
            border: `1px solid ${isPrivacyMaskActive ? 'rgba(255, 77, 77, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
            color: isPrivacyMaskActive ? '#FF7D7D' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          {isPrivacyMaskActive ? <EyeOff size={14} /> : <Eye size={14} />}
          <span>{isPrivacyMaskActive ? 'Masked' : 'Privacy'}</span>
        </motion.button>

        {/* Voice Quick-Log Button */}
        {onOpenVoiceLog && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenVoiceLog}
            title="Voice Quick-Log ('Paid 450 Uber')"
            style={{
              padding: '8px 11px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <Mic size={14} />
            <span>Voice</span>
          </motion.button>
        )}

        {/* Bank Statement CSV Importer Button */}
        {onOpenBankImport && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenBankImport}
            title="Import Bank Statement CSV"
            style={{
              padding: '8px 11px',
              borderRadius: '12px',
              background: 'rgba(255, 215, 0, 0.12)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              color: '#FFD700',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            <FileSpreadsheet size={14} />
            <span>CSV</span>
          </motion.button>
        )}

        {/* Receipt Scanner Quick Button */}
        {onOpenReceiptScan && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onOpenReceiptScan}
            title="Scan Receipt / Invoice"
            style={{
              padding: '8px 11px',
              borderRadius: '12px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid rgba(0, 240, 255, 0.35)',
              color: '#00F0FF',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
          >
            📸 Scan
          </motion.button>
        )}

        {/* Add Income Quick Button */}
        {onAddIncome && (
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={onAddIncome}
            title="Log Income"
            style={{
              padding: '8px 12px',
              borderRadius: '12px',
              background: 'rgba(0, 255, 135, 0.12)',
              border: '1px solid rgba(0, 255, 135, 0.35)',
              color: '#00FF87',
              fontSize: '12px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={14} /> Income
          </motion.button>
        )}

        {/* Finance Copilot Icon Trigger */}
        <motion.button
          whileHover={{ scale: 1.08, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCopilot}
          title="Open AI Finance Copilot"
          style={{
            width: '40px',
            height: '40px',
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
          <Bot size={18} color="#00FF87" />
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              width: '8px',
              height: '8px',
              borderRadius: '999px',
              background: '#00FF87',
              boxShadow: '0 0 8px #00FF87',
              border: '2px solid #0A0D14',
            }}
          />
        </motion.button>

        {/* Add Expense Button */}
        <motion.button
          whileHover={{ scale: 1.04, boxShadow: '0 0 25px rgba(0, 255, 135, 0.5)' }}
          whileTap={{ scale: 0.96 }}
          onClick={onAddExpense}
          className="btn-primary-mint"
          style={{ padding: '8px 16px', fontSize: '13px' }}
        >
          <Plus size={15} strokeWidth={3} />
          <span>Expense</span>
        </motion.button>
      </div>
    </header>
  );
};
