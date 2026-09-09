import { useState } from 'react';
import { LogIn, ArrowRight, Shield, User, Award, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage({ onSwitchToRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        if (onLoginSuccess) onLoginSuccess(res.roles?.[0]);
      } else {
        setErrorMsg(res.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Invalid credentials or server unavailable.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await login(demoEmail, demoPassword);
      if (res.success && onLoginSuccess) {
        onLoginSuccess(res.roles?.[0]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 75px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      <div className="glass-card animate-fade-in" style={{
        maxWidth: '480px',
        width: '100%',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-role-customer" style={{ marginBottom: '0.75rem' }}>
            SpareHub Authentication
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Sign in to access your role-based automotive spare parts dashboard.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.15)',
            border: '1px solid #F43F5E',
            color: '#FB7185',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="name@sparehub.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <LogIn size={18} />
          </button>
        </form>

        {/* Demo 1-Click Fast Accounts Section */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', fontWeight: 600 }}>
            QUICK 1-CLICK DEMO ACCOUNTS:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.5rem 0.875rem' }}
              onClick={() => handleQuickLogin('manager@sparehub.com', 'manager123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Shield size={14} color="var(--accent-indigo)" />
                <span>Manager (Supun Bandara)</span>
              </div>
              <span className="badge badge-role-manager" style={{ fontSize: '0.65rem' }}>Manager</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.5rem 0.875rem' }}
              onClick={() => handleQuickLogin('sales@sparehub.com', 'sales123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={14} color="var(--accent-emerald)" />
                <span>Sales Staff (Nalaka Perera)</span>
              </div>
              <span className="badge badge-role-sales" style={{ fontSize: '0.65rem' }}>Sales Staff</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'space-between', padding: '0.5rem 0.875rem' }}
              onClick={() => handleQuickLogin('customer@sparehub.com', 'customer123')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={14} color="var(--accent-cyan)" />
                <span>Customer (Janaka Gamage)</span>
              </div>
              <span className="badge badge-role-customer" style={{ fontSize: '0.65rem' }}>Customer</span>
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account?{' '}
          <button 
            onClick={onSwitchToRegister}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
