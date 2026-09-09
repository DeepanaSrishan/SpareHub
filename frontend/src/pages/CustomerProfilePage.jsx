import { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Award, CheckCircle2, Sparkles, Shield, Save, Edit2, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { formatLKR } from '../services/api';

export default function CustomerProfilePage() {
  const { user, updateUserLocal } = useAuth();
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: ''
  });
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (user?.userId) {
      loadProfileData(user.userId);
    }
  }, [user]);

  const loadProfileData = async (userId) => {
    setLoading(true);
    try {
      const p = await api.getProfile(userId);
      setProfile(p);
      setFormData({
        firstName: p.firstName || '',
        lastName: p.lastName || '',
        phone: p.phone || '',
        address: p.address || ''
      });
      // Also fetch personal orders
      const ords = await api.getCustomerOrders(userId);
      setOrders(ords);
    } catch (e) {
      console.error("Failed to load profile data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile(user.userId, formData);
      setProfile(updated);
      updateUserLocal({
        firstName: updated.firstName,
        lastName: updated.lastName,
        fullName: updated.fullName,
        phone: updated.phone,
        address: updated.address
      });
      setEditing(false);
      showToast("Profile information updated successfully!");
    } catch (err) {
      console.error(err);
      showToast("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const getTierGradient = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case 'silver': return 'var(--tier-silver-grad)';
      case 'gold': return 'var(--tier-gold-grad)';
      case 'platinum': return 'var(--tier-platinum-grad)';
      default: return 'var(--tier-bronze-grad)';
    }
  };

  const getTierClass = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case 'silver': return 'badge-silver';
      case 'gold': return 'badge-gold';
      case 'platinum': return 'badge-platinum';
      default: return 'badge-bronze';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary)' }}>
        Loading your profile and loyalty details...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div className="animate-pop-in" style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid #10B981',
          color: '#34D399',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {toastMsg}
        </div>
      )}

      {/* Header Banner with Welcome message */}
      <div className="glass-card" style={{
        padding: '2rem',
        marginBottom: '2rem',
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.8))',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: getTierGradient(profile?.loyaltyTier),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 0 20px rgba(0,0,0,0.5)',
            border: '2px solid rgba(255,255,255,0.2)'
          }}>
            <User size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#FFFFFF' }}>
                {profile?.fullName}
              </h1>
              <span className={`badge ${getTierClass(profile?.loyaltyTier)}`}>
                {profile?.loyaltyTier || 'Bronze'} Member
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {profile?.email} • Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-LK') : '2026'}
            </p>
          </div>
        </div>

        {/* Welcome Card Pill */}
        <div style={{
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          maxWidth: '380px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={16} color="var(--accent-cyan)" />
            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
              Registration Welcome
            </span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.78125rem', lineHeight: 1.4 }}>
            Welcome to SpareHub! Your account is active. Enjoy guaranteed genuine automotive parts and loyalty discounts across Sri Lanka.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem' }}>
        {/* Left Column: View & Update Customer Profile */}
        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF' }}>
                Personal Information
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                Manage your personal details to ensure accurate shipping and contact records.
              </p>
            </div>
            {!editing ? (
              <button 
                onClick={() => setEditing(true)}
                className="btn btn-secondary btn-sm"
              >
                <Edit2 size={14} /> Edit Profile
              </button>
            ) : (
              <button 
                onClick={() => setEditing(false)}
                className="btn btn-secondary btn-sm"
              >
                Cancel
              </button>
            )}
          </div>

          {!editing ? (
            /* View Profile Mode */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    First Name
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', marginTop: '0.2rem' }}>
                    {profile?.firstName}
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Last Name
                  </span>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF', marginTop: '0.2rem' }}>
                    {profile?.lastName}
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </span>
                <div style={{ fontSize: '1rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                  {profile?.email}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Phone Number
                </span>
                <div style={{ fontSize: '1rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {profile?.phone || 'Not provided'}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Delivery Address (Sri Lanka)
                </span>
                <div style={{ fontSize: '1rem', color: '#FFFFFF', marginTop: '0.2rem' }}>
                  {profile?.address || 'Not provided'}
                </div>
              </div>
            </div>
          ) : (
            /* Edit Profile Form Mode */
            <form onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Delivery Address</label>
                <textarea 
                  className="form-textarea" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={saving}
              >
                <Save size={16} /> {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Loyalty Status & Perks Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Loyalty Tier Perks Card */}
          <div className="glass-card" style={{
            padding: '1.75rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(22, 31, 48, 0.9))'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
              <Award size={22} color="var(--accent-cyan)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF' }}>
                My Loyalty Status & Benefits
              </h2>
            </div>

            <div style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              background: getTierGradient(profile?.loyaltyTier),
              color: 'white',
              marginBottom: '1.25rem',
              boxShadow: '0 8px 20px rgba(0,0,0,0.4)'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.85 }}>
                Current Tier Level
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>
                {profile?.loyaltyTier || 'Bronze'} Tier
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem', opacity: 0.9 }}>
                {profile?.discountPercentage > 0 ? (
                  <span>🔥 {profile.discountPercentage}% Instant Discount on all parts</span>
                ) : (
                  <span>Starter privileges • Spend Rs. 25,000 for Silver (5% OFF)</span>
                )}
              </div>
            </div>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Bronze:</span>
                <span style={{ color: '#FFFFFF' }}>0% OFF (Rs. 0 min)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Silver:</span>
                <span style={{ color: '#FFFFFF' }}>5% OFF (Rs. 25,000 min)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                <span>Gold:</span>
                <span style={{ color: '#FFFFFF' }}>10% OFF (Rs. 75,000 min)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span>Platinum:</span>
                <span style={{ color: '#FFFFFF' }}>15% OFF (Rs. 150,000 min)</span>
              </div>
            </div>
          </div>

          {/* My Orders Summary */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <ShoppingBag size={18} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                Recent Orders ({orders.length})
              </h3>
            </div>

            {orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {orders.slice(0, 3).map(o => (
                  <div key={o.id} style={{
                    padding: '0.75rem',
                    background: 'rgba(15, 23, 42, 0.7)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--accent-cyan)' }}>
                        {o.orderNumber}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {o.itemsSummary || 'Automotive parts'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#FFFFFF' }}>
                        {formatLKR(o.totalAmount)}
                      </div>
                      <span className="badge badge-active" style={{ fontSize: '0.65rem' }}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
                No past orders recorded for this account.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
