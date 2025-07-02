import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentHome = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    console.log('StudentHome User:', user);
    const fetchTests = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login again.');
        navigate('/login');
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/tests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('StudentHome - Fetched tests:', res.data);
        setTests(res.data);
        const newTests = res.data.filter(test => {
          const start = new Date(test.availability.start);
          const now = new Date();
          return now >= start && now <= new Date(test.availability.end);
        });
        setNotifications(
          newTests.map(test => ({
            message: `New test available: ${test.title} (${test.subject}/${test.class})`,
            type: 'info',
          }))
        );
      } catch (err) {
        console.error('StudentHome - Error:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load tests.');
      }
    };

    if (user && user.role === 'student') {
      fetchTests();
    }
  }, [user, navigate]);

  const handleDismissNotification = (index) => {
    setNotifications(notifications.filter((_, i) => i !== index));
  };

  const filteredTests = tests.filter(
    test =>
      (!filterSubject || test.subject === filterSubject) &&
      (!filterClass || test.class === filterClass)
  );

  const subjectOptions = [...new Set(tests.map(test => test.subject).filter(Boolean))];
  const classOptions = [...new Set(tests.map(test => test.class).filter(Boolean))];

  if (!user || user.role !== 'student') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F9FAFB'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#388E3C', marginBottom: '1rem' }}>Access Restricted</h2>
          <p style={{ color: '#6B7280' }}>This page is only accessible to students.</p>
        </div>
      </div>
    );
  }

  const sidebarItems = [
    { name: 'Dashboard', path: '/student', icon: '📊' },
    { name: 'Tests', path: '/tests', icon: '📝' },
    { name: 'Results', path: '/results', icon: '📈' },
    { name: 'Profile', path: '/profile', icon: '👤' }
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F9FAFB',
      display: 'flex',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '280px' : '70px',
        backgroundColor: '#388E3C',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000,
        boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Sidebar Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem',
              borderRadius: '8px',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            ☰
          </button>
          {isSidebarOpen && (
            <div style={{
              marginTop: '1rem',
              opacity: isSidebarOpen ? 1 : 0,
              transition: 'opacity 0.3s'
            }}>
              <img 
                src="/images/sanni.png" 
                alt="Sanniville Academy" 
                style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }} 
                onError={(e) => {
                  // Fallback if image doesn't load
                  e.target.style.display = 'none';
                }}
              />
              <h3 style={{ 
                color: 'white', 
                fontSize: '1.1rem', 
                margin: 0,
                fontWeight: '600'
              }}>
                Sanniville Academy
              </h3>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav style={{ flex: 1, padding: '1rem 0' }}>
          {sidebarItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.2s',
                borderRadius: '0 25px 25px 0',
                margin: '0.25rem 0',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.transform = 'translateX(0)';
              }}
            >
              <span style={{ fontSize: '1.2rem', marginRight: isSidebarOpen ? '1rem' : '0' }}>
                {item.icon}
              </span>
              {isSidebarOpen && (
                <span style={{ 
                  fontSize: '1rem', 
                  fontWeight: '500',
                  opacity: isSidebarOpen ? 1 : 0,
                  transition: 'opacity 0.3s'
                }}>
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div style={{ padding: '1rem' }}>
          <button
            onClick={logout}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '500',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isSidebarOpen ? 'flex-start' : 'center'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <span style={{ marginRight: isSidebarOpen ? '0.5rem' : '0' }}>🚪</span>
            {isSidebarOpen && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: isSidebarOpen ? '280px' : '70px',
        transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        flex: 1,
        minHeight: '100vh'
      }}>
        {/* Header */}
        <header style={{
          backgroundColor: 'white',
          padding: '1.5rem 2rem',
          borderBottom: '1px solid #E5E7EB',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h1 style={{
                color: '#388E3C',
                fontSize: '1.8rem',
                fontWeight: '700',
                margin: 0
              }}>
                Welcome back, {user.name}!
              </h1>
              <p style={{
                color: '#6B7280',
                fontSize: '1rem',
                margin: '0.5rem 0 0 0'
              }}>
                Your WAEC prep journey continues at Sanniville Academy
              </p>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <div style={{
                backgroundColor: '#FDD835',
                color: '#1F2937',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                {tests.length} Tests Available
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                backgroundColor: '#F9FAFB',
                padding: '0.5rem 1rem',
                borderRadius: '25px',
                border: '1px solid #E5E7EB'
              }}>
                <span style={{
                  color: '#374151',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                  {user.name}
                </span>
                <img
                  src={user.profileImage || '/images/default1.png'}
                  alt="Profile"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #388E3C',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    // Fallback to a default avatar if image fails to load
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiMzODhFM0MiLz4KPHRleHQgeD0iMjAiIHk9IjI2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsIj57dXNlci5uYW1lWzBdfTwvdGV4dD4KPC9zdmc+';
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '2rem' }}>
          {/* Error Display */}
          {error && (
            <div style={{
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              borderLeft: '4px solid #EF4444',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              marginBottom: '2rem'
            }}>
              <p style={{ color: '#DC2626', margin: 0 }}>{error}</p>
            </div>
          )}

          {/* Notifications */}
          {notifications.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{
                color: '#388E3C',
                fontSize: '1.4rem',
                fontWeight: '600',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                🔔 Notifications
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {notifications.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderLeft: '4px solid #FDD835',
                      padding: '1rem 1.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'transform 0.2s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
                    onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                  >
                    <span style={{
                      color: '#374151',
                      fontSize: '1rem'
                    }}>
                      {n.message}
                    </span>
                    <button
                      onClick={() => handleDismissNotification(i)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#6B7280',
                        fontSize: '1.5rem',
                        cursor: 'pointer',
                        padding: '0.25rem',
                        borderRadius: '4px',
                        transition: 'color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#388E3C'}
                      onMouseLeave={(e) => e.target.style.color = '#6B7280'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div style={{
            backgroundColor: 'white',
            padding: '1.5rem',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            marginBottom: '2rem',
            border: '1px solid #E5E7EB'
          }}>
            <h3 style={{
              color: '#388E3C',
              fontSize: '1.2rem',
              fontWeight: '600',
              marginBottom: '1rem'
            }}>
              Filter Tests
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Subject
                </label>
                <select
                  value={filterSubject}
                  onChange={(e) => setFilterSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#388E3C';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 142, 60, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Subjects</option>
                  {subjectOptions.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Class
                </label>
                <select
                  value={filterClass}
                  onChange={(e) => setFilterClass(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    fontSize: '1rem',
                    backgroundColor: 'white',
                    color: '#374151',
                    transition: 'border-color 0.2s, box-shadow 0.2s'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#388E3C';
                    e.target.style.boxShadow = '0 0 0 3px rgba(56, 142, 60, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <option value="">All Classes</option>
                  {classOptions.map(cls => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Tests Grid */}
          <div>
            <h2 style={{
              color: '#388E3C',
              fontSize: '1.4rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📚 Available Tests ({filteredTests.length})
            </h2>
            
            {filteredTests.length === 0 ? (
              <div style={{
                backgroundColor: 'white',
                padding: '3rem',
                borderRadius: '12px',
                textAlign: 'center',
                border: '1px solid #E5E7EB',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
              }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  📝
                </div>
                <h3 style={{
                  color: '#6B7280',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  No tests available
                </h3>
                <p style={{
                  color: '#9CA3AF',
                  fontSize: '1rem'
                }}>
                  Check back soon for new tests!
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
              }}>
                {filteredTests.map(test => {
                  const isAvailable = new Date() <= new Date(test.availability.end);
                  return (
                    <div
                      key={test._id}
                      style={{
                        backgroundColor: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-4px)';
                        e.target.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }}
                    >
                      {/* Status Badge */}
                      <div style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600',
                        backgroundColor: isAvailable ? '#D1FAE5' : '#FEE2E2',
                        color: isAvailable ? '#065F46' : '#991B1B'
                      }}>
                        {isAvailable ? '✅ Available' : '❌ Expired'}
                      </div>

                      <div style={{ marginBottom: '1rem', paddingRight: '5rem' }}>
                        <h3 style={{
                          color: '#388E3C',
                          fontSize: '1.3rem',
                          fontWeight: '600',
                          marginBottom: '0.5rem',
                          lineHeight: '1.3'
                        }}>
                          {test.title}
                        </h3>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '0.75rem',
                        marginBottom: '1.5rem'
                      }}>
                        <div style={{
                          backgroundColor: '#F9FAFB',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB'
                        }}>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                          }}>
                            SUBJECT
                          </div>
                          <div style={{
                            color: '#374151',
                            fontWeight: '600'
                          }}>
                            {test.subject}
                          </div>
                        </div>
                        <div style={{
                          backgroundColor: '#F9FAFB',
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: '1px solid #E5E7EB'
                        }}>
                          <div style={{
                            fontSize: '0.75rem',
                            color: '#6B7280',
                            fontWeight: '500',
                            marginBottom: '0.25rem'
                          }}>
                            CLASS
                          </div>
                          <div style={{
                            color: '#374151',
                            fontWeight: '600'
                          }}>
                            {test.class}
                          </div>
                        </div>
                      </div>

                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '1.5rem',
                        padding: '0.75rem',
                        backgroundColor: '#F3F4F6',
                        borderRadius: '8px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1rem' }}>⏱️</span>
                          <span style={{
                            color: '#374151',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            {test.duration} mins
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <span style={{ fontSize: '1rem' }}>📅</span>
                          <span style={{
                            color: '#374151',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            Until {new Date(test.availability.end).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Link
                        to={`/test/${test._id}`}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '0.875rem',
                          backgroundColor: isAvailable ? '#388E3C' : '#9CA3AF',
                          color: 'white',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          textAlign: 'center',
                          fontSize: '1rem',
                          fontWeight: '600',
                          transition: 'all 0.2s',
                          border: 'none',
                          cursor: isAvailable ? 'pointer' : 'not-allowed'
                        }}
                        onMouseEnter={(e) => {
                          if (isAvailable) {
                            e.target.style.backgroundColor = '#2E7D32';
                            e.target.style.transform = 'translateY(-1px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (isAvailable) {
                            e.target.style.backgroundColor = '#388E3C';
                            e.target.style.transform = 'translateY(0)';
                          }
                        }}
                      >
                        {isAvailable ? '🚀 Take Test' : '⏰ Test Expired'}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#1F2937',
          color: '#9CA3AF',
          padding: '2rem',
          textAlign: 'center',
          marginTop: '3rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <span>Powered by</span>
            <a
              href="https://devsannisystems.com"
              style={{
                color: '#FDD835',
                textDecoration: 'none',
                fontWeight: '600',
                transition: 'color 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.color = '#F59E0B'}
              onMouseLeave={(e) => e.target.style.color = '#FDD835'}
            >
              Devsanni Systems
            </a>
            <span>⚡</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default StudentHome;