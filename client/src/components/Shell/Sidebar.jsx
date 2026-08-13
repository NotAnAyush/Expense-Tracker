import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  Target, 
  Repeat, 
  Sparkles, 
  Bot,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenCopilot }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets & Pace', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target },
    { id: 'recurring', label: 'Subscriptions', icon: Repeat },
    { id: 'analytics', label: 'Analytics Engine', icon: Sparkles },
  ];

  return (
    <aside style={{
      width: '240px',
      background: 'var(--color-primary)',
      borderRight: '1px solid var(--color-border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 20
    }}>
      <div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-sm)',
                  color: isActive ? '#020617' : 'var(--color-foreground)',
                  backgroundColor: isActive ? 'var(--color-accent)' : 'transparent',
                  fontWeight: isActive ? 700 : 600,
                  fontSize: '14px',
                  transition: 'var(--transition)',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  boxShadow: isActive ? 'var(--glow-accent)' : 'none'
                }}
              >
                <Icon size={18} color={isActive ? '#020617' : 'var(--color-muted-text)'} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={onOpenCopilot}
          className="button-primary"
          style={{ width: '100%', height: '44px', gap: '8px' }}
        >
          <Bot size={18} />
          Finance Copilot
        </button>

        <div style={{
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-secondary)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div className="body-sm-strong" style={{ color: 'var(--color-foreground)' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '12px', color: 'var(--color-muted-text)' }}>{user?.email || 'demo@user.com'}</div>
          </div>
          <button onClick={logout} title="Sign Out" style={{ color: 'var(--color-muted-text)', padding: '4px', cursor: 'pointer', border: 'none', background: 'none' }}>
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
