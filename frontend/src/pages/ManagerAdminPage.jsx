import { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Users, UserCheck, UserX, CheckCircle, RefreshCw, Key, Lock, Unlock, Sparkles, UserPlus, X, Boxes } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ManagerAdminPage() {
  const { user, switchDemoRole } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Staff Account Creation State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    role: 'ROLE_SALES_STAFF',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    address: ''
  });
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uList, sData] = await Promise.all([
        api.getAllUsers(),
        api.getSystemStats()
      ]);
      setUsers(uList);
      setStats(sData);
    } catch (e) {
      console.error("Failed to load admin RBAC data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    setUpdatingId(targetUser.id);
    try {
      const updated = await api.updateUserRoles(targetUser.id, [newRole]);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? updated : u));
      showToast(`Updated role for ${targetUser.fullName} to ${newRole.replace('ROLE_', '')}`);
      // Refresh stats
      api.getSystemStats().then(setStats);
    } catch (e) {
      console.error("Failed to update user role:", e);
      showToast("Error updating user roles.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStatusToggle = async (targetUser) => {
    setUpdatingId(targetUser.id);
    const newStatus = !targetUser.isActive;
    try {
      const updated = await api.updateUserStatus(targetUser.id, newStatus);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? updated : u));
      showToast(`Account for ${targetUser.fullName} is now ${newStatus ? 'Active' : 'Deactivated'}`);
      api.getSystemStats().then(setStats);
    } catch (e) {
      console.error("Failed to toggle status:", e);
      showToast("Error toggling account status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreatingStaff(true);
    try {
      const created = await api.createStaffUser(staffForm);
      showToast(`Created staff account for ${created.fullName} (${staffForm.role.replace('ROLE_', '')}) successfully!`);
      setShowCreateModal(false);
      setStaffForm({
        role: 'ROLE_SALES_STAFF',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        address: ''
      });
      fetchAdminData();
    } catch (err) {
      console.error("Failed to create staff account:", err);
      let msg = 'Failed to create staff account. Please check inputs.';
      if (err.response?.status === 404) {
        msg = 'Backend endpoint not found (HTTP 404). Please restart the Spring Boot backend in your terminal so it registers the new API.';
      } else if (err.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err.response?.data?.errors) {
        if (Array.isArray(err.response.data.errors)) {
          msg = err.response.data.errors.map(e => e.defaultMessage || e.message).join(', ');
        } else if (typeof err.response.data.errors === 'object') {
          msg = Object.values(err.response.data.errors).join(', ');
        }
      } else if (err.message) {
        msg = err.message;
      }
      setCreateError(msg);
    } finally {
      setCreatingStaff(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  const isManager = user?.roles?.includes('ROLE_MANAGER');

  if (!isManager) {
    return (
      <div style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '0 1.5rem' }}>
        <div className="glass-card" style={{ padding: '3rem 2rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <ShieldAlert size={48} color="var(--accent-rose)" style={{ margin: '0 auto 1rem' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
            Access Restricted • RBAC
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
            You are currently logged in with customer or non-manager privileges. In accordance with <strong>Role-Based Access Control (RBAC)</strong>, unauthorized users cannot access restricted administrative functions.
          </p>
          <button 
            className="btn btn-primary"
            onClick={() => switchDemoRole('MANAGER')}
          >
            Switch to Manager Persona (Supun Bandara)
          </button>
        </div>
      </div>
    );
  }

  const getRoleBadgeClass = (roleName) => {
    if (roleName?.includes('MANAGER')) return 'badge-role-manager';
    if (roleName?.includes('SALES')) return 'badge-role-sales';
    if (roleName?.includes('INVENTORY')) return 'badge-role-inventory';
    return 'badge-role-customer';
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '2rem auto', padding: '0 1.5rem' }}>
      {/* Toast */}
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
          <Key size={18} /> {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <span className="badge badge-role-manager" style={{ marginBottom: '0.5rem' }}>
            Manager Control Center
          </span>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#FFFFFF' }}>
            Role-Based Access Control (RBAC) & Users
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Enforce role-based access permissions, manage staff assignments, and activate/deactivate user accounts.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => { setShowCreateModal(true); setCreateError(''); }}
            className="btn btn-primary btn-sm"
          >
            <UserPlus size={15} /> Create Staff Account
          </button>
          <button 
            onClick={fetchAdminData}
            className="btn btn-secondary btn-sm"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh System RBAC
          </button>
        </div>
      </div>

      {/* RBAC Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Users
            </span>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FFFFFF', marginTop: '0.2rem' }}>
              {stats.totalUsers}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customers
            </span>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
              {stats.customerCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Sales Staff
            </span>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '0.2rem' }}>
              {stats.salesStaffCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Inventory Staff
            </span>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: '#FBBF24', marginTop: '0.2rem' }}>
              {stats.inventoryStaffCount || 0}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Managers
            </span>
            <div className="metric-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-indigo)', marginTop: '0.2rem' }}>
              {stats.managerCount}
            </div>
          </div>
        </div>
      )}

      {/* Users & RBAC Management Table */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
            User Directory & Access Permissions
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', marginTop: '0.2rem' }}>
            Managers can assign roles and toggle account authorization in real time.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
            Loading users directory...
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.9)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.875rem 1.5rem' }}>User Info</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Contact & Location</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Current Role</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Account Status</th>
                  <th style={{ padding: '0.875rem 1rem' }}>Change Role (Manager Action)</th>
                  <th style={{ padding: '0.875rem 1.5rem', textAlign: 'right' }}>Status Toggle</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const userRole = u.roles?.[0] || 'ROLE_CUSTOMER';
                  return (
                    <tr 
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'var(--transition)'
                      }}
                    >
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <div style={{ fontWeight: 600, color: '#FFFFFF', fontSize: '0.95rem' }}>
                          {u.fullName}
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                          {u.email}
                        </div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <div style={{ color: '#FFFFFF' }}>{u.phone || '—'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{u.address || 'Sri Lanka'}</div>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span className={`badge ${getRoleBadgeClass(userRole)}`}>
                          {userRole.replace('ROLE_', '')}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-active' : 'badge-inactive'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>

                      <td style={{ padding: '1rem 1rem' }}>
                        <select
                          className="form-select"
                          style={{ padding: '0.35rem 0.6rem', fontSize: '0.8125rem', width: 'auto' }}
                          value={userRole}
                          disabled={updatingId === u.id}
                          onChange={(e) => handleRoleChange(u, e.target.value)}
                        >
                          <option value="ROLE_CUSTOMER">ROLE_CUSTOMER</option>
                          <option value="ROLE_SALES_STAFF">ROLE_SALES_STAFF</option>
                          <option value="ROLE_INVENTORY_STAFF">ROLE_INVENTORY_STAFF</option>
                          <option value="ROLE_MANAGER">ROLE_MANAGER</option>
                        </select>
                      </td>

                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-secondary' : 'btn-success'}`}
                          disabled={updatingId === u.id || u.id === user.userId}
                          onClick={() => handleStatusToggle(u)}
                          title={u.id === user.userId ? "Cannot deactivate yourself" : "Toggle account status"}
                        >
                          {u.isActive ? (
                            <>
                              <Lock size={13} /> Deactivate
                            </>
                          ) : (
                            <>
                              <Unlock size={13} /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Staff Account Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div className="glass-card animate-pop-in" style={{
            width: '100%',
            maxWidth: '520px',
            padding: '2rem',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: 'var(--accent-cyan)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>Create Staff Account</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Provision credentials for sales or inventory staff</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.6rem' }}
              >
                <X size={16} />
              </button>
            </div>

            {createError && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid #F43F5E',
                color: '#FB7185',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.8125rem'
              }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateStaff}>
              <div className="form-group">
                <label className="form-label">Staff Role *</label>
                <select 
                  className="form-select"
                  value={staffForm.role}
                  onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                  required
                >
                  <option value="ROLE_SALES_STAFF">Sales Staff (ROLE_SALES_STAFF)</option>
                  <option value="ROLE_INVENTORY_STAFF">Inventory Staff (ROLE_INVENTORY_STAFF)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input 
                    className="form-input"
                    type="text"
                    placeholder="e.g. Kasun"
                    value={staffForm.firstName}
                    onChange={(e) => setStaffForm({ ...staffForm, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input 
                    className="form-input"
                    type="text"
                    placeholder="e.g. Perera"
                    value={staffForm.lastName}
                    onChange={(e) => setStaffForm({ ...staffForm, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Username / Email *</label>
                <input 
                  className="form-input"
                  type="text"
                  placeholder="e.g. kasun_sales or staff@sparehub.com"
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password * (Min 6 chars)</label>
                <input 
                  className="form-input"
                  type="password"
                  placeholder="Enter initial staff password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                  required
                  minLength={6}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    className="form-input"
                    type="tel"
                    placeholder="e.g. 0771234567"
                    value={staffForm.phone}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Branch / Warehouse</label>
                  <input 
                    className="form-input"
                    type="text"
                    placeholder="e.g. Colombo Warehouse"
                    value={staffForm.address}
                    onChange={(e) => setStaffForm({ ...staffForm, address: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingStaff}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={creatingStaff}
                >
                  {creatingStaff ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" /> Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} /> Create Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
