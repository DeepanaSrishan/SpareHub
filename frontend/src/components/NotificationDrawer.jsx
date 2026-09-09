import { Bell, Check, X, Sparkles } from 'lucide-react';

export default function NotificationDrawer({ isOpen, onClose, notifications, onMarkRead }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.65)',
      backdropFilter: 'blur(4px)',
      zIndex: 900,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          height: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-color)',
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.7)',
          animation: 'slideLeft 0.25s ease-out'
        }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-cyan)'
            }}>
              <Bell size={18} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Notifications & Alerts</h3>
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.25rem' }}>
          {notifications && notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id}
                style={{
                  background: n.isRead ? 'rgba(17, 24, 39, 0.5)' : 'rgba(15, 23, 42, 0.9)',
                  border: n.isRead ? '1px solid var(--border-color)' : '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  marginBottom: '0.875rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.375rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={16} color="var(--accent-cyan)" />
                    <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>{n.title}</span>
                  </div>
                  {!n.isRead && onMarkRead && (
                    <button 
                      onClick={() => onMarkRead(n.id)}
                      title="Mark as read"
                      style={{
                        background: 'rgba(56, 189, 248, 0.1)',
                        border: 'none',
                        color: 'var(--accent-cyan)',
                        padding: '0.2rem 0.4rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.75rem'
                      }}
                    >
                      <Check size={12} /> Mark Read
                    </button>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                  {n.message}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {n.createdAt ? new Date(n.createdAt).toLocaleString('en-LK') : 'Recent'}
                </div>
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
              <Bell size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
              <p>No notifications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
