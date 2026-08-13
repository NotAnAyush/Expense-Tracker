import React from 'react';
import { Search, Plus, Bot } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Header = ({ onAddExpense, onOpenCopilot, searchQuery, setSearchQuery }) => {
  const { user } = useAuth();

  return (
    <header style={{
      background: 'var(--color-primary)',
      borderBottom: '1px solid var(--color-border)',
      padding: '0 24px',
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      gap: '20px',
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Brand Wordmark & Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <img
          src="/logo.jpg"
          alt="Richy Rich Logo"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-sm)',
            objectFit: 'cover',
            border: '1px solid var(--color-accent)',
            boxShadow: 'var(--glow-accent)'
          }}
        />
        <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--color-foreground)' }}>
          Richy Rich
        </span>
      </div>

      {/* Centered Pill Search Bar */}
      <div style={{ flex: 1, maxWidth: '600px', margin: '0 auto' }}>
        <div className="search-bar-container">
          <Search size={18} color="var(--color-muted-text)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="search-bar"
            placeholder="Search transactions, merchants, categories..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Right Action Cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <button
          onClick={onOpenCopilot}
          className="button-icon-circular"
          title="Finance Copilot"
        >
          <Bot size={20} color="var(--color-foreground)" />
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
