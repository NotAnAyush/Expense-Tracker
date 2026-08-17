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
  ChevronRight,
  ShieldCheck,
  Activity,
  Flame,
  Sliders,
  Users,
  TrendingDown,
  Plane
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenCopilot }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      badge: { text: 'LIVE', type: 'live' } 
    },
    { 
      id: 'expenses', 
      label: 'Transactions', 
      icon: Receipt 
    },
    { 
      id: 'fire', 
      label: 'FIRE & What-If', 
      icon: Flame, 
      badge: { text: 'Monte Carlo', type: 'ai' } 
    },
    { 
      id: 'trips', 
      label: 'Travel & FX', 
      icon: Plane, 
      badge: { text: 'Vault', type: 'mint' } 
    },
    { 
      id: 'splits', 
      label: 'Group Ledgers', 
      icon: Users, 
      badge: { text: 'UPI', type: 'mint' } 
    },
    { 
      id: 'debts', 
      label: 'Debt Payoff', 
      icon: TrendingDown, 
      badge: { text: 'Snowball', type: 'gold' } 
    },
    { 
      id: 'budgets', 
      label: 'Budgets & Pace', 
      icon: PieChart 
    },
    { 
      id: 'goals', 
      label: 'Savings Goals', 
      icon: Target, 
      badge: { text: '3 Active', type: 'gold' } 
    },
    { 
      id: 'recurring', 
      label: 'Subscriptions', 
      icon: Repeat 
    },
    { 
      id: 'analytics', 
      label: 'Analytics Engine', 
      icon: Sparkles, 
      badge: { text: 'AI', type: 'ai' } 
    },
    { 
      id: 'settings', 
      label: 'AI & Settings', 
      icon: Sliders,
      badge: { text: 'v3.0', type: 'ai' }
    },
  ];

  return (
    <aside
      className="sidebar-container"
      style={{
        width: '270px',
        background: 'rgba(11, 15, 25, 0.96)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100vh',
        maxHeight: '100vh',
        position: 'sticky',
        top: 0,
        alignSelf: 'flex-start',
        zIndex: 45,
        flexShrink: 0,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '24px 14px',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Top Section: Navigation Header & Menu Items */}
      <div>
        {/* Navigation Hub Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            padding: '0 8px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'var(--font-heading)',
            }}
          >
            Navigation Hub
          </span>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 255, 135, 0.1)',
              border: '1px solid rgba(0, 255, 135, 0.25)',
              borderRadius: '999px',
              padding: '2px 8px',
            }}
          >
            <span className="animate-live-dot" />
            <span
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: '#00FF87',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              Live Sync
            </span>
          </div>
        </div>

        {/* Navigation Item Buttons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 3, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '14px',
                  color: isActive ? '#050811' : '#94A3B8',
                  background: 'transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'color 0.2s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Active Pill Glider */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'var(--grad-mint-emerald)',
                      borderRadius: '14px',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Inactive Hover Background */}
                {!isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '14px',
                      background: 'transparent',
                      transition: 'var(--transition)',
                      zIndex: 0,
                    }}
                    className="sidebar-item-hover"
                  />
                )}

                {/* Left Content: Icon & Label */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '10px',
                      background: isActive ? 'rgba(5, 8, 17, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: isActive ? '1px solid rgba(5, 8, 17, 0.25)' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition)',
                    }}
                  >
                    <Icon
                      size={17}
                      color={isActive ? '#050811' : '#00FF87'}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      color: isActive ? '#050811' : '#F8FAFC',
                    }}
                  >
                    {item.label}
                  </span>
                </div>

                {/* Right Badge Cluster */}
                {item.badge && (
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center' }}>
                    {item.badge.type === 'live' && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: isActive ? 'rgba(5, 8, 17, 0.2)' : 'rgba(0, 255, 135, 0.12)',
                          color: isActive ? '#050811' : '#00FF87',
                          border: isActive ? '1px solid rgba(5, 8, 17, 0.3)' : '1px solid rgba(0, 255, 135, 0.35)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span
                          style={{
                            width: '5px',
                            height: '5px',
                            borderRadius: '999px',
                            background: isActive ? '#050811' : '#00FF87',
                          }}
                        />
                        {item.badge.text}
                      </span>
                    )}

                    {item.badge.type === 'gold' && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: isActive ? 'rgba(5, 8, 17, 0.2)' : 'rgba(245, 158, 11, 0.15)',
                          color: isActive ? '#050811' : '#FBBF24',
                          border: isActive ? '1px solid rgba(5, 8, 17, 0.3)' : '1px solid rgba(245, 158, 11, 0.35)',
                        }}
                      >
                        {item.badge.text}
                      </span>
                    )}

                    {item.badge.type === 'ai' && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '999px',
                          background: isActive ? 'rgba(5, 8, 17, 0.2)' : 'rgba(6, 182, 212, 0.15)',
                          color: isActive ? '#050811' : '#22D3EE',
                          border: isActive ? '1px solid rgba(5, 8, 17, 0.3)' : '1px solid rgba(6, 182, 212, 0.35)',
                        }}
                      >
                        {item.badge.text}
                      </span>
                    )}
                  </div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Dark Mini Financial Pulse Widget */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px',
            borderRadius: '16px',
            background: 'rgba(15, 22, 36, 0.7)',
            border: '1px solid var(--border-subtle)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={15} color="#00FF87" />
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#F8FAFC',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Wealth Shield
              </span>
            </div>
            <span
              style={{
                fontSize: '10.5px',
                fontWeight: 800,
                color: '#00FF87',
                background: 'rgba(0, 255, 135, 0.12)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                padding: '2px 7px',
                borderRadius: '6px',
              }}
            >
              94% Safe
            </span>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              marginBottom: '8px',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #10B981 0%, #00FF87 100%)',
                boxShadow: '0 0 8px #00FF87',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Flame size={12} color="#FBBF24" />
              Pace ₹2,771/day
            </span>
            <span style={{ color: '#00FF87', fontWeight: 700 }}>In Budget</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: AI Copilot Bot Widget & User Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
        {/* Interactive AI Assistant Mascot Widget */}
        <motion.div
          whileHover={{ y: -2, borderColor: 'rgba(0, 255, 135, 0.5)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCopilot}
          style={{
            background: 'linear-gradient(145deg, rgba(139, 92, 246, 0.15) 0%, rgba(15, 22, 36, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.35)',
            borderRadius: '16px',
            padding: '12px 14px',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            transition: 'var(--transition)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                background: 'rgba(0, 255, 135, 0.15)',
                border: '1px solid rgba(0, 255, 135, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px rgba(0, 255, 135, 0.3)',
                flexShrink: 0,
              }}
            >
              <Bot size={20} color="#00FF87" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span
                  className="font-display"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 700,
                    color: '#F8FAFC',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Finance Copilot
                </span>
                <Zap size={12} color="#00FF87" fill="#00FF87" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '1px' }}>
                <span className="animate-live-dot" style={{ width: '5px', height: '5px' }} />
                <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  AI Wealth Advisor
                </span>
              </div>
            </div>

            <ChevronRight size={16} color="#00FF87" />
          </div>
        </motion.div>

        {/* User Info & Profile Trigger */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '11px 13px',
            borderRadius: '16px',
            background: activeTab === 'profile'
              ? 'linear-gradient(135deg, rgba(0, 255, 135, 0.15), rgba(0, 240, 255, 0.1))'
              : 'rgba(255, 255, 255, 0.04)',
            border: activeTab === 'profile'
              ? '1.5px solid rgba(0, 255, 135, 0.5)'
              : '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backdropFilter: 'blur(10px)',
            transition: 'var(--transition)',
            cursor: 'pointer',
            boxShadow: activeTab === 'profile' ? '0 0 16px rgba(0, 255, 135, 0.2)' : 'none',
          }}
          title="Open Sovereign Profile & Account Settings"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <div style={{ position: 'relative' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '999px',
                  background: user?.avatarStyle === 'gradient_mint'
                    ? 'linear-gradient(135deg, #00FF87 0%, #00F0FF 100%)'
                    : user?.avatarStyle === 'gradient_violet'
                    ? 'linear-gradient(135deg, #7928CA 0%, #FF007A 100%)'
                    : user?.avatarStyle === 'gradient_flame'
                    ? 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)'
                    : 'linear-gradient(135deg, #FFD700 0%, #FF8800 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  color: user?.avatarStyle === 'gradient_violet' || user?.avatarStyle === 'gradient_flame' ? '#FFFFFF' : '#050810',
                  fontSize: '13px',
                  fontFamily: 'var(--font-display)',
                  boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
                  overflow: 'hidden',
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
              </div>
              {/* Online Dot */}
              <span
                style={{
                  position: 'absolute',
                  bottom: '0px',
                  right: '0px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '999px',
                  background: '#00FF87',
                  border: '1.5px solid #080B11',
                }}
              />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: activeTab === 'profile' ? '#00FF87' : '#F1F5F9',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '110px',
                }}
              >
                {user?.name || 'Richy User'}
              </div>
              <div
                style={{
                  fontSize: '10.5px',
                  color: 'var(--color-text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '110px',
                }}
              >
                {user?.email || 'user@richy.app'}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.2, color: '#F43F5E', backgroundColor: 'rgba(244, 63, 94, 0.15)' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            title="Sign Out"
            style={{
              color: 'var(--color-text-muted)',
              padding: '6px',
              borderRadius: '8px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--transition)',
            }}
          >
            <LogOut size={16} />
          </motion.button>
        </motion.div>
      </div>
    </aside>
  );
};
