import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { brmsTheme } from 'app/src/core/theme/brmsTheme';

// Mock Data - Rules Created (Monthly)
const rulesCreatedData = [
  { month: 'Jan', value: 12 },
  { month: 'Feb', value: 19 },
  { month: 'Mar', value: 15 },
  { month: 'Apr', value: 25 },
  { month: 'May', value: 22 },
  { month: 'Jun', value: 30 },
  { month: 'Jul', value: 28 },
  { month: 'Aug', value: 38 },
  { month: 'Sep', value: 32 },
  { month: 'Oct', value: 35 },
  { month: 'Nov', value: 40 },
  { month: 'Dec', value: 4 },
];

// Mock Data - Deployed Rules (Monthly)
const deployedRulesData = [
  { month: 'Jan', value: 85 },
  { month: 'Feb', value: 95 },
  { month: 'Mar', value: 110 },
  { month: 'Apr', value: 125 },
  { month: 'May', value: 145 },
  { month: 'Jun', value: 165 },
  { month: 'Jul', value: 180 },
  { month: 'Aug', value: 200 },
  { month: 'Sep', value: 220 },
  { month: 'Oct', value: 235 },
  { month: 'Nov', value: 225 },
  { month: 'Dec', value: 210 },
];

interface CardProps {
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ delay = 0, children, style }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: isHovered ? '0 8px 16px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        border: '1px solid #f0f0f0',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

const Dashboard = () => {
  const [hoveredBar1, setHoveredBar1] = useState<number | null>(null);
  const [hoveredBar2, setHoveredBar2] = useState<number | null>(null);

  const getBarColor = (index: number): string => {
    const colors = [
      '#6552D0', '#7B6AE0', '#9182F0', '#6552D0',
      '#7B6AE0', '#9182F0', '#6552D0', '#7B6AE0',
      '#9182F0', '#6552D0', '#7B6AE0', '#9182F0',
    ];
    return colors[index % colors.length];
  };

  const getDeployedBarColor = (index: number): string => {
    const colors = [
      '#1976d2', '#2196f3', '#42a5f5', '#1976d2',
      '#2196f3', '#42a5f5', '#1976d2', '#2196f3',
      '#42a5f5', '#1976d2', '#2196f3', '#42a5f5',
    ];
    return colors[index % colors.length];
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
      padding: '32px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <Card delay={0} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              
              <div>
                <h1 style={{
                  fontSize: '1.75rem',
                  fontWeight: '700',
                  color: brmsTheme.colors.textPrimary,
                  margin: 0,
                }}>BRMS Dashboard</h1>
                <p style={{
                  fontSize: '0.875rem',
                  color: brmsTheme.colors.textSecondary,
                  margin: '4px 0 0 0',
                }}>Real-time monitoring</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { icon: RefreshCw, label: 'Hub' },
              ].map((btn, idx) => (
                <button key={idx} style={{
                  padding: '12px 24px',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  color: brmsTheme.colors.textSecondary,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = brmsTheme.colors.primary;
                  e.currentTarget.style.color = brmsTheme.colors.primary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = brmsTheme.colors.textSecondary;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}>
                  <btn.icon size={18} />
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {[
            { 
              title: 'Total Projects', 
              value: '248', 
              subtitle: 'In Fleet',
              trend: '+12%',
              trendUp: true,
              icon: '📊',
              gradient: 'linear-gradient(135deg, #6552D0 20%, #17203D 100%)',
            },
            { 
              title: 'Total Rules', 
              value: '121', 
              subtitle: 'Ongoing',
              trend: '+8%',
              trendUp: true,
              icon: '⚖️',
              gradient: 'linear-gradient(135deg, #1976d2 20%, #0d47a1 100%)',
            },
            { 
              title: 'Active Rules', 
              value: '87', 
              subtitle: 'Running Now',
              trend: '+5%',
              trendUp: true,
              icon: '✅',
              gradient: 'linear-gradient(135deg, #2e7d32 20%, #1b5e20 100%)',
            },
            { 
              title: 'Pending Rules', 
              value: '34', 
              subtitle: 'In Queue',
              trend: '-3%',
              trendUp: false,
              icon: '⏳',
              gradient: 'linear-gradient(135deg, #ed6c02 20%, #c77700 100%)',
            }
          ].map((card, index) => (
            <Card key={index}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    color: brmsTheme.colors.textSecondary,
                    fontWeight: '600',
                    letterSpacing: '0.05em',
                    marginBottom: '8px'
                  }}>{card.title}</div>
                  
                  <div style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    background: card.gradient,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.2,
                    marginBottom: '8px'
                  }}>{card.value}</div>
                  
                  {card.subtitle && (
                    <div style={{
                      fontSize: '0.875rem',
                      color: brmsTheme.colors.textSecondary,
                      fontWeight: '500'
                    }}>{card.subtitle}</div>
                  )}
                </div>

                <div style={{
                  width: '56px',
                  height: '56px',
                  background: card.gradient,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                }}>
                  {card.icon}
                </div>
              </div>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px',
                background: card.trendUp ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                borderRadius: '8px',
              }}>
                {card.trendUp ? (
                  <TrendingUp size={16} color={brmsTheme.colors.success} />
                ) : (
                  <TrendingDown size={16} color={brmsTheme.colors.error} />
                )}
                <span style={{
                  fontSize: '0.875rem',
                  fontWeight: '700',
                  color: card.trendUp ? brmsTheme.colors.success : brmsTheme.colors.error,
                }}>
                  {card.trend}
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  color: brmsTheme.colors.textSecondary,
                  marginLeft: 'auto'
                }}>vs last month</span>
              </div>
            </Card>
          ))}
        </div>

        {/* Main Charts Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* Rules Created Chart */}
          <Card>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: brmsTheme.colors.textPrimary,
                  margin: '0 0 4px 0'
                }}>Rules Created</h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: brmsTheme.colors.textSecondary,
                  margin: 0
                }}>Monthly rule creation trends</p>
              </div>
              <select style={{
                padding: '8px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: brmsTheme.colors.textSecondary,
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'white',
                outline: 'none'
              }}>
                <option>Last 12 Months</option>
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
              </select>
            </div>

            <div style={{ position: 'relative', height: '320px' }}>
              {/* Y-axis */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: brmsTheme.colors.textSecondary,
                fontWeight: '600',
                width: '35px'
              }}>
                <div>45</div>
                <div>36</div>
                <div>27</div>
                <div>18</div>
                <div>9</div>
                <div>0</div>
              </div>

              {/* Grid lines */}
              <div style={{
                position: 'absolute',
                left: '45px',
                right: '16px',
                top: 0,
                bottom: '40px',
              }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${i * 20}%`,
                    height: '1px',
                    background: '#f0f0f0',
                  }} />
                ))}
              </div>

              {/* Bars Container */}
              <div style={{
                position: 'absolute',
                left: '45px',
                right: '16px',
                top: 0,
                bottom: '40px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '6px',
              }}>
                {rulesCreatedData.map((item, index) => {
                  const heightPercent = (item.value / 45) * 100;
                  
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredBar1(index)}
                      onMouseLeave={() => setHoveredBar1(null)}
                      style={{
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%',
                      }}
                    >
                      {hoveredBar1 === index && (
                        <div style={{
                          position: 'absolute',
                          bottom: `calc(${heightPercent}% + 10px)`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: brmsTheme.colors.textPrimary,
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.875rem' }}>{item.month} 2024</div>
                          <div style={{ fontSize: '1rem', fontWeight: '700' }}>{item.value} rules</div>
                        </div>
                      )}
                      <div style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        minHeight: '2px',
                        background: getBarColor(index),
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: hoveredBar1 === index ? 1 : 0.85,
                        transform: hoveredBar1 === index ? 'scaleY(1.05)' : 'scaleY(1)',
                        transformOrigin: 'bottom',
                        boxShadow: hoveredBar1 === index ? `0 4px 12px ${getBarColor(index)}50` : 'none',
                        cursor: 'pointer',
                      }} />
                    </div>
                  );
                })}
              </div>

              {/* X-axis */}
              <div style={{
                position: 'absolute',
                left: '45px',
                right: '16px',
                bottom: 0,
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {rulesCreatedData.map((item, index) => (
                  <div key={index} style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: brmsTheme.colors.textSecondary,
                    fontWeight: '600'
                  }}>
                    {item.month}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Deployed Rules Chart */}
          <Card>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: brmsTheme.colors.textPrimary,
                  margin: '0 0 4px 0'
                }}>Deployed Rules</h2>
                <p style={{
                  fontSize: '0.875rem',
                  color: brmsTheme.colors.textSecondary,
                  margin: 0
                }}>Cumulative deployment statistics</p>
              </div>
              <select style={{
                padding: '8px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                color: brmsTheme.colors.textSecondary,
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'white',
                outline: 'none'
              }}>
                <option>Last 12 Months</option>
                <option>Last 6 Months</option>
                <option>Last 3 Months</option>
              </select>
            </div>

            <div style={{ position: 'relative', height: '320px' }}>
              {/* Y-axis */}
              <div style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: brmsTheme.colors.textSecondary,
                fontWeight: '600',
                width: '35px'
              }}>
                <div>250</div>
                <div>200</div>
                <div>150</div>
                <div>100</div>
                <div>50</div>
                <div>0</div>
              </div>

              {/* Grid lines */}
              <div style={{
                position: 'absolute',
                left: '45px',
                right: '16px',
                top: 0,
                bottom: '40px',
              }}>
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: `${i * 20}%`,
                    height: '1px',
                    background: '#f0f0f0',
                  }} />
                ))}
              </div>

              {/* Bars Container */}
              <div style={{
                position: 'absolute',
                left: '45px',
                right: '16px',
                top: 0,
                bottom: '40px',
                display: 'flex',
                alignItems: 'flex-end',
                gap: '6px',
              }}>
                {deployedRulesData.map((item, index) => {
                  const heightPercent = (item.value / 250) * 100;
                  
                  return (
                    <div
                      key={index}
                      onMouseEnter={() => setHoveredBar2(index)}
                      onMouseLeave={() => setHoveredBar2(null)}
                      style={{
                        flex: 1,
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        height: '100%',
                      }}
                    >
                      {hoveredBar2 === index && (
                        <div style={{
                          position: 'absolute',
                          bottom: `calc(${heightPercent}% + 10px)`,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: brmsTheme.colors.textPrimary,
                          color: 'white',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}>
                          <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '0.875rem' }}>{item.month} 2024</div>
                          <div style={{ fontSize: '1rem', fontWeight: '700' }}>{item.value} deployed</div>
                        </div>
                      )}
                      <div style={{
                        width: '100%',
                        height: `${heightPercent}%`,
                        minHeight: '2px',
                        background: getDeployedBarColor(index),
                        borderRadius: '6px 6px 0 0',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: hoveredBar2 === index ? 1 : 0.85,
                        transform: hoveredBar2 === index ? 'scaleY(1.05)' : 'scaleY(1)',
                        transformOrigin: 'bottom',
                        boxShadow: hoveredBar2 === index ? `0 4px 12px ${getDeployedBarColor(index)}50` : 'none',
                        cursor: 'pointer',
                      }} />
                    </div>
                  );
                })}
              </div>

              {/* X-axis */}
              <div style={{
                position: 'absolute',
                left: '45px',
                right: '16px',
                bottom: 0,
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {deployedRulesData.map((item, index) => (
                  <div key={index} style={{
                    flex: 1,
                    textAlign: 'center',
                    fontSize: '0.7rem',
                    color: brmsTheme.colors.textSecondary,
                    fontWeight: '600'
                  }}>
                    {item.month}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;