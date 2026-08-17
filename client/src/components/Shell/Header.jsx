import React, { useEffect, useState, useRef } from 'react';
import { 
  Search, 
  Plus, 
  Bot, 
  X, 
  Sparkles, 
  Command, 
  Eye, 
  EyeOff, 
  Mic, 
  FileSpreadsheet, 
  Camera,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { usePrivacy } from '../../context/PrivacyContext';

export const Header = ({
  onAddExpense,
  onAddIncome,
  onOpenReceiptScan,
  onOpenVoiceLog,
  onOpenBankImport,
  onOpenCopilot,
  onOpenProfile,
  searchQuery,
  setSearchQuery,
}) => {
  const { user } = useAuth();
  const { isPrivacyMaskActive, togglePrivacyMask } = usePrivacy();
  const searchInputRef = useRef(null);
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Global Keyboard Shortcuts (Cmd+K / Ctrl+K and Alt+P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.altKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        togglePrivacyMask();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePrivacyMask]);

  // Click outside to close quick menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setQuickMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      style={{
        background: 'rgba(8, 11, 17, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        padding: '0 28px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* 1. Left: Universal Search Bar */}
      <div style={{ flex: 1, maxWidth: '420px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search
            size={15}
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
            placeholder="Search transactions, merchants, #tags... (Cmd+K)"
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '38px',
              padding: '0 40px 0 38px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.09)',
              color: '#F8FAFC',
              fontSize: '13px',
              fontFamily: 'var(--font-body)',
              outline: 'none',
              transition: 'all 0.15s ease',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(0, 255, 135, 0.4)';
              e.target.style.background = 'rgba(255, 255, 255, 0.07)';
              e.target.style.boxShadow = '0 0 0 3px rgba(0, 255, 135, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.09)';
              e.target.style.background = 'rgba(255, 255, 255, 0.04)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Shortcut Pill / Clear Button */}
          {!searchQuery ? (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.09)',
                borderRadius: '5px',
                padding: '2px 6px',
                color: '#64748B',
                fontSize: '10.5px',
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
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '999px',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#F1F5F9',
                cursor: 'pointer',
              }}
              title="Clear Search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* 2. Right: Action Cluster & Tools */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        
        {/* Privacy Mask Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePrivacyMask}
          title={isPrivacyMaskActive ? 'Privacy Mask ON (Alt+P) — Click to reveal' : 'Privacy Mask OFF (Alt+P) — Click to hide balances'}
          style={{
            height: '36px',
            padding: '0 11px',
            borderRadius: '999px',
            background: isPrivacyMaskActive ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${isPrivacyMaskActive ? 'rgba(244, 63, 94, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
            color: isPrivacyMaskActive ? '#FB7185' : '#94A3B8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'var(--transition)',
          }}
        >
          {isPrivacyMaskActive ? <EyeOff size={14} /> : <Eye size={14} />}
          <span className="hidden-mobile">{isPrivacyMaskActive ? 'Masked' : 'Privacy'}</span>
        </motion.button>

        {/* Quick Tools: Voice Log */}
        {onOpenVoiceLog && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenVoiceLog}
            title="Voice Quick-Log ('Paid 450 Uber')"
            className="btn-icon-soft"
          >
            <Mic size={15} color="#00F0FF" />
          </motion.button>
        )}

        {/* Quick Tools: Receipt OCR Scan */}
        {onOpenReceiptScan && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenReceiptScan}
            title="Scan Receipt / Invoice OCR"
            className="btn-icon-soft"
          >
            <Camera size={15} color="#A78BFA" />
          </motion.button>
        )}

        {/* Quick Tools: Bank Statement CSV */}
        {onOpenBankImport && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenBankImport}
            title="Import Bank Statement CSV"
            className="btn-icon-soft"
          >
            <FileSpreadsheet size={15} color="#FFD700" />
          </motion.button>
        )}

        <div style={{ width: '1px', height: '22px', background: 'rgba(255, 255, 255, 0.08)', margin: '0 2px' }} />

        {/* Primary Action Button: + Record with Dropdown */}
        <div style={{ position: 'relative' }} ref={menuRef}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onAddExpense}
              className="btn-primary-mint"
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                paddingRight: '12px',
              }}
            >
              <Plus size={14} strokeWidth={3} />
              <span>Expense</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="btn-primary-mint"
              style={{
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
                padding: '0 8px',
                borderLeft: '1px solid rgba(5, 8, 16, 0.2)',
              }}
              title="More Actions"
            >
              <ChevronDown size={13} strokeWidth={3} />
            </motion.button>
          </div>

          {/* Quick Dropdown Menu */}
          <AnimatePresence>
            {quickMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '180px',
                  background: 'rgba(15, 20, 32, 0.95)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '12px',
                  padding: '6px',
                  boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6)',
                  zIndex: 50,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {onAddIncome && (
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      onAddIncome();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#00FF87',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0, 255, 135, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <Plus size={14} /> + Log Income
                  </button>
                )}
                {onOpenVoiceLog && (
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      onOpenVoiceLog();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#00F0FF',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(0, 240, 255, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <Mic size={14} /> Voice Quick Log
                  </button>
                )}
                {onOpenReceiptScan && (
                  <button
                    onClick={() => {
                      setQuickMenuOpen(false);
                      onOpenReceiptScan();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: 'transparent',
                      border: 'none',
                      color: '#A78BFA',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(167, 139, 250, 0.1)'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <Camera size={14} /> Scan Receipt OCR
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Copilot Orb Trigger */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenCopilot}
          title="Open Finance Copilot AI"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'rgba(139, 92, 246, 0.15)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            color: '#A78BFA',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bot size={17} color="#00FF87" />
          <span
            style={{
              position: 'absolute',
              top: '3px',
              right: '3px',
              width: '6px',
              height: '6px',
              borderRadius: '999px',
              background: '#00FF87',
              boxShadow: '0 0 6px #00FF87',
            }}
          />
        </motion.button>

        {/* User Profile Avatar */}
        {onOpenProfile && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenProfile}
            title="Open Profile Settings"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '999px',
              background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
              border: '1.5px solid rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#050810',
              fontSize: '12px',
              cursor: 'pointer',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : user?.avatarStyle === 'emoji' ? (
              user?.avatarEmoji || '👑'
            ) : user?.name ? (
              user.name.charAt(0).toUpperCase()
            ) : (
              'R'
            )}
          </motion.button>
        )}

      </div>
    </header>
  );
};
