import { useState, useEffect } from 'react';
import { Award, ShoppingBag, Search, RefreshCw, UserCheck, ChevronRight, Filter, AlertCircle, ArrowUpRight } from 'lucide-react';
import api, { formatLKR } from '../services/api';
import CustomerTransactionDrawer from '../components/CustomerTransactionDrawer';

export default function SalesStaffPage() {
  const [customers, setCustomers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [custList, tierList] = await Promise.all([
        api.getCustomers(''),
        api.getLoyaltyTiers()
      ]);
      setCustomers(custList);
      setTiers(tierList);
    } catch (e) {
      console.error("Failed to load sales staff data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await api.getCustomers(searchQuery);
      setCustomers(data);
    } catch (e) {
      console.error("Failed to search customers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAutoAssign = async (customer) => {
    try {
      const updated = await api.autoAssignTier(customer.id);
      setCustomers(prev => prev.map(c => c.id === customer.id ? updated : c));
      showToast(`Promoted ${updated.fullName} to ${updated.loyaltyTierName} tier based on Rs. ${updated.totalSpend?.toLocaleString()} spend!`);
    } catch (e) {
      console.error("Failed to auto-assign tier:", e);
      showToast("Failed to auto-assign tier");
    }
  };

  const handleOpenDrawer = (customer) => {
    setSelectedCustomer(customer);
    setIsDrawerOpen(true);
  };

  const handleTierUpdated = (updatedCust) => {
    setCustomers(prev => prev.map(c => c.id === updatedCust.id ? updatedCust : c));
    setSelectedCustomer(updatedCust);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const getTierClass = (tierName) => {
    switch (tierName?.toLowerCase()) {
      case 'silver': return 'badge-silver';
      case 'gold': return 'badge-gold';
      case 'platinum': return 'badge-platinum';
      default: return 'badge-bronze';
    }
  };

  // Compute aggregate metrics
  const totalCustomers = customers.length;
  const totalSpendAll = customers.reduce((acc, c) => acc + (parseFloat(c.totalSpend) || 0), 0);
  const totalOrdersAll = customers.reduce((acc, c) => acc + (c.orderCount || 0), 0);

  return (
    <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Toast Alert */}
      {toastMsg && (
        <div className="animate-pop-in" style={{
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1px solid #38BDF8',
          color: '#38BDF8',
          padding: '0.875rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Award size={18} /> {toastMsg}
        </div>
      )}

      {/* Page Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <span className="badge badge-role-sales" style={{ marginBottom: '0.5rem' }}>
            Sales Staff Portal
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF' }}>
            Customer Loyalty & Order Histories
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            View customer purchase records in Sri Lankan Rupees, assign loyalty tiers, and evaluate spending patterns.
          </p>
        </div>

        <button 
          onClick={fetchInitialData}
          className="btn btn-secondary btn-sm"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Registered Customers
          </span>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            {totalCustomers}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Active buyers in SpareHub network
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Customer Purchases
          </span>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>
            {formatLKR(totalSpendAll)}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Cumulative revenue across all accounts
          </span>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Total Recorded Orders
          </span>
          <div className="metric-value" style={{ fontSize: '2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.25rem' }}>
            {totalOrdersAll} Orders
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Automotive spare parts transactions
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '1.75rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              className="form-input" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Search customer by name or email (e.g. Kasun, Anura, Janaka)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            Search
          </button>
          {searchQuery && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => { setSearchQuery(''); api.getCustomers('').then(setCustomers); }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Customers Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
            Customer Accounts ({customers.length})
          </h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Click on any customer to view orders or modify loyalty tier
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading customer accounts...
          </div>
        ) : customers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.5rem' }}>Customer</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Phone & Location</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Current Loyalty Tier</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Total Purchases (LKR)</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Spend Eligibility</th>
                  <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr 
                    key={c.id} 
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'var(--transition)',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    onClick={() => handleOpenDrawer(c)}
                  >
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                        {c.fullName}
                      </div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {c.email}
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <div style={{ color: '#FFFFFF' }}>{c.phone || '—'}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{c.address || 'Sri Lanka'}</div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <span className={`badge ${getTierClass(c.loyaltyTierName)}`}>
                        {c.loyaltyTierName || 'Bronze'} ({c.discountPercentage || 0}% OFF)
                      </span>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      <div className="metric-value" style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '1rem' }}>
                        {formatLKR(c.totalSpend)}
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {c.orderCount || 0} Orders
                      </div>
                    </td>

                    <td style={{ padding: '1rem 1rem' }}>
                      {c.suggestedTierName && c.suggestedTierName !== c.loyaltyTierName ? (
                        <span className="badge badge-gold" style={{ cursor: 'help' }} title={`Eligible for upgrade to ${c.suggestedTierName}`}>
                          Eligible: {c.suggestedTierName}
                        </span>
                      ) : (
                        <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                          Tier Aligned
                        </span>
                      )}
                    </td>

                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                        {c.suggestedTierName && c.suggestedTierName !== c.loyaltyTierName && (
                          <button
                            className="btn btn-outline-cyan btn-sm"
                            title="Auto upgrade tier based on spend"
                            onClick={() => handleQuickAutoAssign(c)}
                          >
                            <ArrowUpRight size={14} /> Auto-Promote
                          </button>
                        )}
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handleOpenDrawer(c)}
                        >
                          <ShoppingBag size={14} /> Transactions
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No customers found matching your criteria.
          </div>
        )}
      </div>

      {/* Customer Detailed Orders & Loyalty Drawer */}
      <CustomerTransactionDrawer 
        customer={selectedCustomer}
        tiers={tiers}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onTierUpdated={handleTierUpdated}
      />
    </div>
  );
}
