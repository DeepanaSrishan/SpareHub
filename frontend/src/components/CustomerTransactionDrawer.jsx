import { useState, useEffect } from 'react';
import { X, Award, ShoppingBag, CreditCard, Sparkles, RefreshCw, Calendar, Package } from 'lucide-react';
import api, { formatLKR } from '../services/api';

export default function CustomerTransactionDrawer({ 
  customer, 
  tiers, 
  isOpen, 
  onClose, 
  onTierUpdated 
}) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedTierId, setSelectedTierId] = useState('');
  const [updatingTier, setUpdatingTier] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    if (customer && isOpen) {
      setSelectedTierId(customer.loyaltyTierId || '');
      fetchOrders(customer.id);
    }
  }, [customer, isOpen]);

  const fetchOrders = async (customerId) => {
    setLoadingOrders(true);
    try {
      const data = await api.getCustomerOrders(customerId);
      setOrders(data);
    } catch (e) {
      console.error("Failed to load customer orders:", e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleManualAssign = async () => {
    if (!selectedTierId) return;
    setUpdatingTier(true);
    try {
      const updated = await api.assignLoyaltyTier(customer.id, selectedTierId);
      showToast(`Loyalty tier updated to ${updated.loyaltyTierName}`);
      if (onTierUpdated) onTierUpdated(updated);
    } catch (e) {
      console.error("Failed to assign tier:", e);
      showToast("Error updating loyalty tier");
    } finally {
      setUpdatingTier(false);
    }
  };

  const handleAutoAssign = async () => {
    setUpdatingTier(true);
    try {
      const updated = await api.autoAssignTier(customer.id);
      setSelectedTierId(updated.loyaltyTierId || '');
      showToast(`Auto-assigned ${updated.loyaltyTierName} tier based on Rs. ${updated.totalSpend?.toLocaleString()} spend!`);
      if (onTierUpdated) onTierUpdated(updated);
    } catch (e) {
      console.error("Failed to auto-assign tier:", e);
      showToast("Error auto-assigning tier");
    } finally {
      setUpdatingTier(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  if (!isOpen || !customer) return null;

  const getTierClass = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case 'silver': return 'badge-silver';
      case 'gold': return 'badge-gold';
      case 'platinum': return 'badge-platinum';
      default: return 'badge-bronze';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      zIndex: 950,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div 
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          height: '100vh',
          borderRadius: 0,
          borderLeft: '1px solid var(--border-color)',
          borderTop: 'none',
          borderBottom: 'none',
          borderRight: 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-15px 0 35px rgba(0,0,0,0.8)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
                {customer.fullName}
              </h2>
              <span className={`badge ${getTierClass(customer.loyaltyTierName)}`}>
                {customer.loyaltyTierName || 'Bronze'}
              </span>
              <span className={`badge ${customer.isActive ? 'badge-active' : 'badge-inactive'}`}>
                {customer.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              {customer.email} • {customer.phone || 'No phone'}
            </p>
            {customer.address && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
                📍 {customer.address}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.25rem'
            }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {toastMsg && (
            <div style={{
              background: 'rgba(56, 189, 248, 0.15)',
              border: '1px solid #38BDF8',
              color: '#38BDF8',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={16} /> {toastMsg}
            </div>
          )}

          {/* Stats Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.125rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Purchase Spend (LKR)
              </span>
              <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
                {formatLKR(customer.totalSpend)}
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.8)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.125rem'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Completed Orders
              </span>
              <div className="metric-value" style={{ fontSize: '1.6rem', fontWeight: 700, color: '#FFFFFF', marginTop: '0.25rem' }}>
                {customer.orderCount || 0} Orders
              </div>
            </div>
          </div>

          {/* Loyalty Tier Assignment Card */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            marginBottom: '1.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Award size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FFFFFF' }}>
                Loyalty Tier Management
              </h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '1rem', lineHeight: 1.5 }}>
              Assign loyalty tiers to this customer based on purchase history to enable loyalty benefits and rewards.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
              <select 
                className="form-select"
                style={{ flex: 1, minWidth: '180px' }}
                value={selectedTierId}
                onChange={(e) => setSelectedTierId(Number(e.target.value))}
              >
                <option value="">Select Tier</option>
                {tiers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.tierName} ({formatLKR(t.minSpendAmount)} min • {t.discountPercentage}% off)
                  </option>
                ))}
              </select>

              <button 
                className="btn btn-primary btn-sm"
                onClick={handleManualAssign}
                disabled={updatingTier}
              >
                Assign Tier
              </button>

              <button 
                className="btn btn-outline-cyan btn-sm"
                onClick={handleAutoAssign}
                disabled={updatingTier}
                title="Automatically calculate and upgrade based on total purchases"
              >
                <RefreshCw size={14} className={updatingTier ? 'animate-spin' : ''} />
                Auto-Assign by Spend
              </button>
            </div>
          </div>

          {/* Previous Orders & Transactions History */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShoppingBag size={20} color="var(--accent-cyan)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Transaction & Order History
                </h3>
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                {orders.length} Records Found
              </span>
            </div>

            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Loading transaction history...
              </div>
            ) : orders.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {orders.map((order) => (
                  <div 
                    key={order.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1rem',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {order.orderNumber}
                        </span>
                        <span className={`badge ${order.status === 'COMPLETED' ? 'badge-active' : 'badge-bronze'}`}>
                          {order.status}
                        </span>
                      </div>
                      <span className="metric-value" style={{ fontWeight: 700, fontSize: '1.1rem', color: '#FFFFFF' }}>
                        {formatLKR(order.totalAmount)}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8125rem', marginBottom: '0.35rem' }}>
                      <Package size={14} color="var(--text-muted)" />
                      <span>{order.itemsSummary || 'Automotive Spare Parts'}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <CreditCard size={13} />
                        <span>Payment: {order.paymentMethod || 'Card'}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} />
                        <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-LK') : 'Recent'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-muted)'
              }}>
                <ShoppingBag size={36} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <p>No previous orders found for this customer.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
