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
  Zap,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenCopilot }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { id: 'expenses', label: 'Transactions', icon: Receipt },
    { id: 'budgets', label: 'Budgets & Pace', icon: PieChart },
    { id: 'goals', label: 'Savings Goals', icon: Target, badge: '3 Active' },
    { id: 'recurring', label: 'Subscriptions', icon: Repeat },
    { id: 'analytics', label: 'Analytics Engine', icon: Sparkles, badge: 'AI' },
  ];

  return (
    <aside
      style={{
        width: '260px',
        background: 'rgba(10, 13, 20, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        flexShrink: 0,
      }}
    >
      <div>
        {/* Nav Items Group */}
        <div style={{ marginBottom: '16px', paddingLeft: '8px', fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Navigation Hub
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 16px',
                  borderRadius: '14px',
                  color: isActive ? '#050810' : '#CBD5E1',
                  background: isActive ? 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)' : 'transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'var(--transition)',
                  boxShadow: isActive ? '0 4px 20px rgba(0, 255, 135, 0.35)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: isActive ? 'rgba(5, 8, 16, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition)',
                    }}
                  >
                    <Icon
                      size={18}
                      color={isActive ? '#050810' : '#00FF87'}
                      style={{
                        filter: isActive ? 'none' : 'drop-shadow(0 0 5px rgba(0, 255, 135, 0.5))',
                      }}
                    />
                  </div>
                  <span>{item.label}</span>
                </div>

                {/* Optional Badge */}
                {item.badge && (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 7px',
                      borderRadius: '999px',
                      background: isActive ? 'rgba(5, 8, 16, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                      color: isActive ? '#050810' : '#94A3B8',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: AI Copilot Bot Widget & User Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Interactive AI Assistant Mascot Widget with Pulse Waves */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          onClick={onOpenCopilot}
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, rgba(121, 40, 202, 0.25) 0%, rgba(15, 20, 32, 0.8) 100%)',
            border: '1.5px solid rgba(121, 40, 202, 0.4)',
            borderRadius: '18px',
            padding: '16px',
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(121, 40, 202, 0.25)',
          }}
        >
          {/* Animated Pulse Waves Background */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              borderRadius: '999px',
              background: 'rgba(0, 255, 135, 0.15)',
              filter: 'blur(15px)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
            {/* Animated Bot Mascot Avatar */}
            <div style={{ position: 'relative' }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #7928CA 0%, #00FF87 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(0, 255, 135, 0.4)',
                }}
              >
                <Bot size={22} color="#050810" />
              </motion.div>

              {/* Pulse Ring Indicator */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: '16px',
                  border: '1.5px solid #00FF87',
                  animation: 'radarWave 2.5s infinite ease-out',
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="font-display" style={{ fontSize: '14px', fontWeight: 800, color: '#F1F5F9' }}>
                  Finance Copilot
                </span>
                <Zap size={12} color="#00FF87" fill="#00FF87" />
              </div>
              <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                AI Wealth Advisor • Active
              </span>
            </div>

            <ChevronRight size={16} color="#00FF87" />
          </div>
        </motion.div>

        {/* User Info & Logout Card */}
        <div
          style={{
            padding: '12px 14px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #FFD700, #FF8800)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                color: '#050810',
                fontSize: '13px',
                fontFamily: 'var(--font-display)',
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : 'R'}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9' }}>{user?.name || 'Richy VIP'}</div>
              <div style={{ fontSize: '11px', color: '#64748B' }}>{user?.email || 'user@richy.app'}</div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.15, color: '#F43F5E' }}
            whileTap={{ scale: 0.9 }}
            onClick={logout}
            title="Sign Out"
            style={{
              color: '#94A3B8',
              padding: '6px',
              cursor: 'pointer',
              border: 'none',
              background: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </div>
    </aside>
  );
};
