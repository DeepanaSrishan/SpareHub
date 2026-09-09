import { useState } from 'react';
import { UserPlus, ArrowRight, ShieldCheck, Mail, Lock, Phone, MapPin, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WelcomeModal from '../components/WelcomeModal';

export default function RegisterPage({ onSwitchToLogin, onRegisteredSuccess }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [registeredName, setRegisteredName] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim()) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(formData);
      if (res.success) {
        setRegisteredName(res.firstName || formData.firstName);
        setShowWelcome(true); // Trigger welcome celebration message
      } else {
        setErrorMsg(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to connect to server.');
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
        maxWidth: '560px',
        width: '100%',
        padding: '2.5rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span className="badge badge-role-customer" style={{ marginBottom: '0.75rem' }}>
            Customer Registration
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.5rem' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Join SpareHub to access Sri Lanka's largest automotive spare parts catalog with loyalty rewards.
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  name="firstName" 
                  className="form-input" 
                  placeholder="e.g. Kasun" 
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input 
                type="text" 
                name="lastName" 
                className="form-input" 
                placeholder="e.g. Fernando" 
                value={formData.lastName}
                onChange={handleChange}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input 
              type="email" 
              name="email" 
              className="form-input" 
              placeholder="kasun@example.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password * (Min 6 chars)</label>
            <input 
              type="password" 
              name="password" 
              className="form-input" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                name="phone" 
                className="form-input" 
                placeholder="077 123 4567" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">City / Address</label>
              <input 
                type="text" 
                name="address" 
                className="form-input" 
                placeholder="Colombo 07, Sri Lanka" 
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '0.875rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <ShieldCheck size={20} color="var(--accent-cyan)" />
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Upon registration, you automatically receive <strong>Bronze Loyalty Tier</strong> status and default customer permissions.
            </span>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '0.75rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register as Customer'}
            <UserPlus size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <button 
            onClick={onSwitchToLogin}
            style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign In here
          </button>
        </div>
      </div>

      {/* Welcome Celebration Modal */}
      <WelcomeModal 
        isOpen={showWelcome}
        userName={registeredName}
        onClose={() => {
          setShowWelcome(false);
          if (onRegisteredSuccess) onRegisteredSuccess();
        }}
        onExplore={() => {
          setShowWelcome(false);
          if (onRegisteredSuccess) onRegisteredSuccess();
        }}
      />
    </div>
  );
}
