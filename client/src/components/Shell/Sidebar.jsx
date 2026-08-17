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
        background: 'linear-gradient(180deg, rgba(12, 16, 26, 0.96) 0%, rgba(8, 10, 18, 0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
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
        padding: '22px 14px',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Background Ambient Glow Orbs for Luxury Depth */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          left: '-40px',
          width: '180px',
          height: '180px',
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(0, 255, 135, 0.12) 0%, transparent 70%)',
          filter: 'blur(25px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '80px',
          right: '-50px',
          width: '190px',
          height: '190px',
          borderRadius: '999px',
          background: 'radial-gradient(circle, rgba(121, 40, 202, 0.16) 0%, transparent 75%)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Top Section: Navigation Header & Menu Items */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Lively Navigation Hub Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
            padding: '0 8px',
          }}
        >
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: '#64748B',
              textTransform: 'uppercase',
              letterSpacing: '1.2px',
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
              background: 'rgba(0, 255, 135, 0.08)',
              border: '1px solid rgba(0, 255, 135, 0.2)',
              borderRadius: '999px',
              padding: '2px 8px',
            }}
          >
            <span className="animate-live-dot" />
            <span
              style={{
                fontSize: '9px',
                fontWeight: 800,
                color: '#00FF87',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
              }}
            >
              Live Sync
            </span>
          </div>
        </div>

        {/* Navigation Item Buttons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 5, transition: { duration: 0.15 } }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(item.id)}
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '11px 14px',
                  borderRadius: '14px',
                  color: isActive ? '#050810' : '#CBD5E1',
                  background: 'transparent',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '13.5px',
                  border: 'none',
                  cursor: 'pointer',
                  width: '100%',
                  textAlign: 'left',
                  transition: 'color 0.2s ease, transform 0.2s ease',
                  overflow: 'hidden',
                }}
              >
                {/* Framer Motion Shared Active Pill Glider */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarPill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
                      borderRadius: '14px',
                      boxShadow: '0 4px 20px rgba(0, 255, 135, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.4)',
                      zIndex: 0,
                    }}
                  />
                )}

                {/* Inactive Hover Backlight */}
                {!isActive && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '14px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid transparent',
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
                      background: isActive ? 'rgba(5, 8, 16, 0.18)' : 'rgba(255, 255, 255, 0.06)',
                      border: isActive ? '1px solid rgba(5, 8, 16, 0.2)' : '1px solid rgba(255, 255, 255, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'var(--transition)',
                      boxShadow: isActive ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <Icon
                      size={17}
                      color={isActive ? '#050810' : '#00FF87'}
                      style={{
                        filter: isActive ? 'none' : 'drop-shadow(0 0 6px rgba(0, 255, 135, 0.6))',
                        transition: 'filter 0.2s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading)',
                      letterSpacing: '-0.2px',
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
                          background: isActive ? 'rgba(5, 8, 16, 0.2)' : 'rgba(0, 255, 135, 0.12)',
                          color: isActive ? '#050810' : '#00FF87',
                          border: isActive ? '1px solid rgba(5, 8, 16, 0.25)' : '1px solid rgba(0, 255, 135, 0.3)',
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
                            background: isActive ? '#050810' : '#00FF87',
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
                          background: isActive ? 'rgba(5, 8, 16, 0.2)' : 'rgba(255, 215, 0, 0.12)',
                          color: isActive ? '#050810' : '#FFD700',
                          border: isActive ? '1px solid rgba(5, 8, 16, 0.25)' : '1px solid rgba(255, 215, 0, 0.35)',
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
                          background: isActive ? 'rgba(5, 8, 16, 0.2)' : 'linear-gradient(135deg, rgba(121, 40, 202, 0.25), rgba(0, 240, 255, 0.25))',
                          color: isActive ? '#050810' : '#00F0FF',
                          border: isActive ? '1px solid rgba(5, 8, 16, 0.25)' : '1px solid rgba(0, 240, 255, 0.4)',
                          boxShadow: isActive ? 'none' : '0 0 8px rgba(0, 240, 255, 0.25)',
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

        {/* Lively Gamified Mini Financial Pulse Widget */}
        <div
          style={{
            marginTop: '20px',
            padding: '12px 14px',
            borderRadius: '16px',
            background: 'linear-gradient(145deg, rgba(20, 26, 42, 0.7) 0%, rgba(12, 16, 26, 0.85) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Subtle top edge highlight */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0, 255, 135, 0.4), transparent)',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#00FF87" />
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  color: '#F1F5F9',
                  fontFamily: 'var(--font-heading)',
                  letterSpacing: '0.3px',
                }}
              >
                Wealth Shield
              </span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 800,
                color: '#00FF87',
                background: 'rgba(0, 255, 135, 0.1)',
                padding: '2px 6px',
                borderRadius: '6px',
              }}
            >
              94% Safe
            </span>
          </div>

          {/* Animated Mini Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '5px',
              borderRadius: '999px',
              background: 'rgba(255, 255, 255, 0.08)',
              overflow: 'hidden',
              marginBottom: '8px',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{
                height: '100%',
                borderRadius: '999px',
                background: 'linear-gradient(90deg, #00FF87 0%, #FFD700 100%)',
                boxShadow: '0 0 8px rgba(0, 255, 135, 0.6)',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: '#94A3B8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Flame size={12} color="#FF9900" />
              Pace ₹2,771/day
            </span>
            <span style={{ color: '#00FF87', fontWeight: 700 }}>In Budget</span>
          </div>
        </div>
      </div>

      {/* Bottom Section: AI Copilot Bot Widget & User Card */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 1, marginTop: '20px' }}>
        {/* Interactive AI Assistant Mascot Widget with Pulse Waves */}
        <motion.div
          whileHover={{ scale: 1.025, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCopilot}
          className="animate-copilot-card"
          style={{
            position: 'relative',
            background: 'linear-gradient(145deg, rgba(121, 40, 202, 0.28) 0%, rgba(15, 20, 32, 0.92) 100%)',
            border: '1.5px solid rgba(121, 40, 202, 0.45)',
            borderRadius: '18px',
            padding: '14px',
            cursor: 'pointer',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(121, 40, 202, 0.25)',
            transition: 'var(--transition)',
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
              background: 'rgba(0, 255, 135, 0.18)',
              filter: 'blur(16px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 2 }}>
            {/* Animated Bot Mascot Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '13px',
                  background: 'linear-gradient(135deg, #7928CA 0%, #00FF87 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 16px rgba(0, 255, 135, 0.45)',
                }}
              >
                <Bot size={22} color="#050810" />
              </motion.div>

              {/* Pulse Ring Indicator */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-3px',
                  borderRadius: '15px',
                  border: '1.5px solid #00FF87',
                  animation: 'radarWave 2.5s infinite ease-out',
                  pointerEvents: 'none',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span
                  className="font-display"
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 800,
                    color: '#F1F5F9',
                    letterSpacing: '-0.2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Finance Copilot
                </span>
                <Zap size={13} color="#00FF87" fill="#00FF87" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '1px' }}>
                <span className="animate-live-dot" style={{ width: '5px', height: '5px' }} />
                <span style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                  AI Wealth Advisor
                </span>
              </div>
            </div>

            <motion.div
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ChevronRight size={16} color="#00FF87" />
            </motion.div>
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
                  width: '9px',
                  height: '9px',
                  borderRadius: '999px',
                  background: '#00FF87',
                  border: '1.5px solid #0A0D14',
                  boxShadow: '0 0 6px #00FF87',
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
                {user?.name || 'Richy VIP'}
              </div>
              <div
                style={{
                  fontSize: '10.5px',
                  color: '#64748B',
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
              color: '#94A3B8',
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
