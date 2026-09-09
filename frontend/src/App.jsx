import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerProfilePage from './pages/CustomerProfilePage';
import SalesStaffPage from './pages/SalesStaffPage';
import ManagerAdminPage from './pages/ManagerAdminPage';
import './App.css';

function MainLayout() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('customer'); // 'customer' | 'sales' | 'manager' | 'login' | 'register'

  useEffect(() => {
    if (user) {
      const role = user.roles?.[0];
      if (role === 'ROLE_MANAGER') {
        setActiveTab('manager');
      } else if (role === 'ROLE_SALES_STAFF') {
        setActiveTab('sales');
      } else {
        setActiveTab('customer');
      }
    } else {
      setActiveTab('login');
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-secondary)'
      }}>
        Initializing SpareHub System...
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main style={{ flex: 1 }}>
        {!user ? (
          activeTab === 'register' ? (
            <RegisterPage 
              onSwitchToLogin={() => setActiveTab('login')} 
              onRegisteredSuccess={() => setActiveTab('customer')} 
            />
          ) : (
            <LoginPage 
              onSwitchToRegister={() => setActiveTab('register')}
              onLoginSuccess={(role) => {
                if (role === 'ROLE_MANAGER') setActiveTab('manager');
                else if (role === 'ROLE_SALES_STAFF') setActiveTab('sales');
                else setActiveTab('customer');
              }}
            />
          )
        ) : (
          <>
            {activeTab === 'customer' && <CustomerProfilePage />}
            {activeTab === 'sales' && <SalesStaffPage />}
            {activeTab === 'manager' && <ManagerAdminPage />}
            {activeTab === 'login' && <CustomerProfilePage />}
            {activeTab === 'register' && <RegisterPage onSwitchToLogin={() => setActiveTab('customer')} />}
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-color)',
        padding: '1.25rem 1.5rem',
        textAlign: 'center',
        fontSize: '0.8125rem',
        color: 'var(--text-muted)',
        backgroundColor: 'rgba(11, 15, 25, 0.9)'
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <div>
            <strong style={{ color: '#FFFFFF' }}>SpareHub</strong> — Automotive Spare Parts Management System
          </div>
          <div>
            Currency in <strong style={{ color: '#FFFFFF' }}>Rs. (LKR)</strong>
          </div>
          <div>
            Project ID: <span style={{ color: '#FFFFFF' }}>ISE_WE_0102_40</span> &bull; SLIIT 2026
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
