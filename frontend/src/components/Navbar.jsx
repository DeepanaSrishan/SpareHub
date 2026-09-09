import { useState, useEffect } from 'react';
import { Shield, Award, Users, User, Bell, LogOut, ChevronDown, Sparkles, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import NotificationDrawer from './NotificationDrawer';

export default function Navbar({ activeTab, setActiveTab }) {
  const { user, logout, switchDemoRole } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (user?.userId) {
      loadNotifications(user.userId);
    }
  }, [user]);

  const loadNotifications = async (userId) => {
    try {
      const list = await api.getNotifications(userId);
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  const handleMarkRead = async (notifId) => {
    try {
      await api.markNotificationRead(notifId);
      setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error("Failed to mark read:", e);
    }
  };

  const handleSwitchPersona = async (roleType) => {
    setSwitching(true);
    await switchDemoRole(roleType);
    if (roleType === 'CUSTOMER') setActiveTab('customer');
    if (roleType === 'SALES_STAFF') setActiveTab('sales');
    if (roleType === 'MANAGER') setActiveTab('manager');
    setSwitching(false);
  };

  const currentRole = user?.roles?.[0] || 'ROLE_CUSTOMER';

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 500,
        backgroundColor: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.75rem 1.5rem'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem'
        }}>
          {/* Logo & Project Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div 
              onClick={() => setActiveTab('customer')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #0284C7, #2563EB)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 0 15px rgba(56, 189, 248, 0.4)'
              }}>
                <Wrench size={20} />
              </div>
              <div>
                <span className="brand-text" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.03em' }}>
                  Spare<span style={{ color: 'var(--accent-cyan)' }}>Hub</span>
                </span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '-3px' }}>
                  Automotive Sri Lanka
                </span>
              </div>
            </div>

            {/* Navigation Tabs */}
            {user && (
              <nav style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className={`btn btn-sm ${activeTab === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setActiveTab('customer')}
                >
                  <User size={15} /> My Profile
                </button>

                {(currentRole === 'ROLE_SALES_STAFF' || currentRole === 'ROLE_MANAGER') && (
                  <button
                    className={`btn btn-sm ${activeTab === 'sales' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('sales')}
                  >
                    <Award size={15} /> Customer Loyalty & Orders
                  </button>
                )}

                {currentRole === 'ROLE_MANAGER' && (
                  <button
                    className={`btn btn-sm ${activeTab === 'manager' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('manager')}
                  >
                    <Shield size={15} /> Role-Based Access Control
                  </button>
                )}
              </nav>
            )}
          </div>

          {/* Right Section: Demo Role Fast Switcher & User Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Demo Fast Switcher Pill for Supervisor/Grading */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-full)',
              padding: '0.2rem 0.35rem'
            }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', paddingLeft: '0.5rem', fontWeight: 600 }}>
                DEMO PERSONA:
              </span>
              <button
                onClick={() => handleSwitchPersona('CUSTOMER')}
                disabled={switching}
                className={`btn btn-sm ${currentRole === 'ROLE_CUSTOMER' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                title="Log in as Customer (Janaka)"
              >
                Customer
              </button>
              <button
                onClick={() => handleSwitchPersona('SALES_STAFF')}
                disabled={switching}
                className={`btn btn-sm ${currentRole === 'ROLE_SALES_STAFF' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                title="Log in as Sales Staff (Nalaka)"
              >
                Sales Staff
              </button>
              <button
                onClick={() => handleSwitchPersona('INVENTORY_STAFF')}
                disabled={switching}
                className={`btn btn-sm ${currentRole === 'ROLE_INVENTORY_STAFF' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                title="Log in as Inventory Staff (Kamal)"
              >
                Inventory
              </button>
              <button
                onClick={() => handleSwitchPersona('MANAGER')}
                disabled={switching}
                className={`btn btn-sm ${currentRole === 'ROLE_MANAGER' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                title="Log in as Manager (Supun)"
              >
                Manager
              </button>
            </div>

            {/* Notification Bell */}
            {user && (
              <button 
                onClick={() => setShowNotifDrawer(true)}
                title="View Notifications"
                style={{
                  position: 'relative',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-primary)',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    background: 'var(--accent-rose)',
                    color: 'white',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(244, 63, 94, 0.6)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Logout */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>
                    {user.fullName || user.firstName}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {currentRole.replace('ROLE_', '')}
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="btn btn-secondary btn-sm"
                  title="Sign out"
                  style={{ padding: '0.45rem' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('login')}
                className="btn btn-primary btn-sm"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Notification Drawer Component */}
      <NotificationDrawer 
        isOpen={showNotifDrawer}
        onClose={() => setShowNotifDrawer(false)}
        notifications={notifications}
        onMarkRead={handleMarkRead}
      />
    </>
  );
}
