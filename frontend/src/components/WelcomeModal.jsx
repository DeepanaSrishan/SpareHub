import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, CheckCircle2, Sparkles, X, ArrowRight } from 'lucide-react';

export default function WelcomeModal({ isOpen, onClose, userName, tierName = 'Bronze', onExplore }) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti celebratory burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38BDF8', '#2563EB', '#F59E0B', '#10B981']
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card animate-pop-in" style={{
        maxWidth: '520px',
        width: '100%',
        padding: '2.5rem',
        textAlign: 'center',
        position: 'relative',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 30px rgba(56, 189, 248, 0.2)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.25rem'
          }}
        >
          <X size={20} />
        </button>

        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(37, 99, 235, 0.2))',
          border: '2px solid #38BDF8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          color: '#38BDF8'
        }}>
          <Sparkles size={36} />
        </div>

        <span className="badge badge-role-customer" style={{ marginBottom: '0.75rem' }}>
          Registration Successful
        </span>

        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#FFFFFF' }}>
          Welcome to SpareHub, {userName || 'Customer'}!
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.75rem', lineHeight: 1.6 }}>
          Your automotive spare parts account has been created successfully. You are now an official member of the SpareHub retail & distribution network in Sri Lanka.
        </p>

        {/* Loyalty Starter Perk Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          marginBottom: '2rem',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--tier-bronze-grad)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            flexShrink: 0
          }}>
            <Award size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>Starter Tier: {tierName}</span>
              <span className="badge badge-bronze">Active</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
              Earn points on every purchase and automatically qualify for Silver and Gold discounts as your orders grow!
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem 1.5rem', fontSize: '0.95rem' }}
            onClick={() => {
              onClose();
              if (onExplore) onExplore();
            }}
          >
            Access My Profile Dashboard <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
