import React from 'react';
import { Search, Plus, Bot, Wallet, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onAddExpense, onOpenCopilot, searchQuery, setSearchQuery }) => {
  const { user } = useAuth();

  return (
    <header style={{
      background: 'var(--canvas)',
      borderBottom: '1px solid var(--hairline)',
      padding: '0 24px',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
      width: '100%',
    }}>
      {/* Brand Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
        }}>
          <Wallet size={20} />
        </div>
        <span style={{ fontFamily: 'var(--font-family)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.8px', color: 'var(--ink)' }}>
          Antigravity
        </span>
      </div>

      {/* Centered Pill Search Bar */}
      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto' }}>
        <div className="search-bar-container" style={{ position: 'relative' }}>
          <Search size={18} color="var(--mute)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="search-bar"
            placeholder="Search ideas, transactions, merchants, categories..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{ paddingRight: searchQuery ? '40px' : '16px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery && setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--mute)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Clear Search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Right Action Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          onClick={onOpenCopilot}
          className="button-icon-circular"
          title="Finance Copilot"
        >
          <Bot size={20} color="var(--ink)" />
        </button>

        <button
          onClick={onAddExpense}
          className="button-primary"
        >
          <Plus size={18} />
          Add Expense
        </button>
      </div>
    </header>
  );
};
