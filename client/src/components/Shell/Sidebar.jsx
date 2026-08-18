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
  Flame,
  Sliders,
  Users,
  TrendingDown,
  Plane,
  Palette
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCustomization } from '../../context/CustomizationContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenCopilot }) => {
  const { user, logout } = useAuth();
  const { activeConfig } = useCustomization();
  const modules = activeConfig?.modules || {};

  const rawNavGroups = [
    {
      group: 'Core Ledger',
      items: [
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
          id: 'budgets', 
          label: 'Budgets & Pace', 
          icon: PieChart 
        },
        { 
          id: 'recurring', 
          label: 'Subscriptions', 
          icon: Repeat 
        },
      ]
    },
    {
      group: 'Wealth & Planning',
      items: [
        ...(modules.fireSimulator !== false ? [{ 
          id: 'fire', 
          label: 'FIRE Simulator', 
          icon: Flame, 
          badge: { text: 'Monte Carlo', type: 'ai' } 
        }] : []),
        { 
          id: 'goals', 
          label: 'Savings Goals', 
          icon: Target 
        },
        ...(modules.debtOptimizer !== false ? [{ 
          id: 'debts', 
          label: 'Debt Payoff', 
          icon: TrendingDown 
        }] : []),
        ...(modules.groupSplitting !== false ? [{ 
          id: 'splits', 
          label: 'Group Ledgers', 
          icon: Users 
        }] : []),
        ...(modules.travelFxVaults !== false ? [{ 
          id: 'trips', 
          label: 'Travel & FX', 
          icon: Plane 
        }] : []),
      ]
    },
    {
      group: 'Intelligence & Studio',
      items: [
        ...(modules.aiCopilot !== false || modules.lifestyleHabits !== false ? [{ 
          id: 'analytics', 
          label: 'Analytics Engine', 
          icon: Sparkles, 
          badge: { text: 'AI', type: 'ai' } 
        }] : []),
        { 
          id: 'customization', 
          label: 'Customization Studio', 
          icon: Palette,
          badge: { text: 'STUDIO', type: 'live' } 
        },
        { 
          id: 'settings', 
          label: 'AI & Settings', 
          icon: Sliders 
        },
      ]
    }
  ];

  // Filter out empty groups if all items in a group were toggled off
  const navGroups = rawNavGroups.filter((g) => g.items.length > 0);

  return (
    <aside
      className="sidebar-container"
      style={{
        width: '260px',
        background: 'linear-gradient(180deg, rgba(10, 14, 24, 0.98) 0%, rgba(6, 9, 16, 0.99) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.07)',
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
        padding: '18px 12px 14px 12px',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Header & Navigation Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        
        {/* Brand / Logo Area */}
        <div
          onClick={() => setActiveTab('dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '4px 8px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '9px',
              background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 14px rgba(0, 255, 135, 0.3)',
              overflow: 'hidden',
              flexShrink: 0,
            }}
          >
            <img
              src="/logo.jpg"
              alt="Richy Rich"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span
                className="font-display"
                style={{
                  fontSize: '15.5px',
                  fontWeight: 800,
                  letterSpacing: '-0.3px',
                  color: '#FFFFFF',
                }}
              >
                Richy Rich
              </span>
              <span
                style={{
                  fontSize: '9px',
                  fontWeight: 800,
                  color: '#00FF87',
                  background: 'rgba(0, 255, 135, 0.1)',
                  border: '1px solid rgba(0, 255, 135, 0.25)',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                v3.0
              </span>
            </div>
            <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 600, marginTop: '1px' }}>
              Personal Wealth OS
            </div>
          </div>
        </div>

        {/* Grouped Nav Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {navGroups.map((group) => (
            <div key={group.group}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '0.8px',
                  padding: '0 10px',
                  marginBottom: '4px',
                }}
              >
                {group.group}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      whileHover={{ x: 2, transition: { duration: 0.12 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(item.id)}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '7px 10px',
                        borderRadius: '10px',
                        color: isActive ? '#FFFFFF' : '#94A3B8',
                        background: isActive ? 'rgba(255, 255, 255, 0.06)' : 'transparent',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '13px',
                        border: 'none',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Left Accent Bar for Active State */}
                      {isActive && (
                        <motion.div
                          layoutId="activeSidebarIndicator"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '4px',
                            bottom: '4px',
                            width: '3px',
                            borderRadius: '0 4px 4px 0',
                            background: 'linear-gradient(180deg, #00FF87 0%, #FFD700 100%)',
                            boxShadow: '0 0 8px #00FF87',
                          }}
                        />
                      )}

                      {/* Icon + Label */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '9px', position: 'relative', zIndex: 1 }}>
                        <Icon
                          size={16}
                          color={isActive ? '#00FF87' : '#64748B'}
                          style={{
                            transition: 'color 0.15s ease',
                            flexShrink: 0,
                          }}
                        />
                        <span style={{ letterSpacing: '-0.1px' }}>{item.label}</span>
                      </div>

                      {/* Right Badge */}
                      {item.badge && (
                        <div style={{ position: 'relative', zIndex: 1 }}>
                          {item.badge.type === 'live' && (
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '999px',
                                background: 'rgba(0, 255, 135, 0.12)',
                                color: '#00FF87',
                                border: '1px solid rgba(0, 255, 135, 0.3)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <span style={{ width: '4px', height: '4px', borderRadius: '999px', background: '#00FF87' }} />
                              {item.badge.text}
                            </span>
                          )}
                          {item.badge.type === 'ai' && (
                            <span
                              style={{
                                fontSize: '9px',
                                fontWeight: 800,
                                padding: '1px 6px',
                                borderRadius: '6px',
                                background: 'rgba(139, 92, 246, 0.15)',
                                color: '#A78BFA',
                                border: '1px solid rgba(139, 92, 246, 0.3)',
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
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Footer: Sleek AI Copilot Trigger + User Profile */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
        
        {/* AI Copilot Compact Button */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onOpenCopilot}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(0, 255, 135, 0.08) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #8B5CF6, #00FF87)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Bot size={15} color="#050810" />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Copilot AI <Zap size={11} color="#00FF87" fill="#00FF87" />
              </div>
              <div style={{ fontSize: '10px', color: '#94A3B8' }}>Ask your finances</div>
            </div>
          </div>
          <ChevronRight size={14} color="#94A3B8" />
        </motion.div>

        {/* User Card */}
        <div
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: '10px',
            background: activeTab === 'profile' ? 'rgba(0, 255, 135, 0.08)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${activeTab === 'profile' ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
            cursor: 'pointer',
            transition: 'var(--transition)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #00FF87 0%, #FFD700 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 800,
                color: '#050810',
                flexShrink: 0,
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
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#F1F5F9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                {user?.name || 'Richy User'}
              </div>
              <div style={{ fontSize: '10px', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                {user?.email || 'user@richy.app'}
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.15, color: '#F43F5E' }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              logout();
            }}
            title="Sign Out"
            style={{
              color: '#64748B',
              padding: '4px',
              borderRadius: '6px',
              cursor: 'pointer',
              border: 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LogOut size={14} />
          </motion.button>
        </div>

      </div>
    </aside>
  );
};
