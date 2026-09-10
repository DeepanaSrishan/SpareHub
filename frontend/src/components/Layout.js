import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Package, 
  FolderTree, 
  History, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const Layout = () => {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['INVENTORY_STAFF', 'MANAGER'] },
    { path: '/spare-parts', icon: Package, label: 'Spare Parts', roles: ['INVENTORY_STAFF', 'MANAGER', 'CUSTOMER'] },
    { path: '/categories', icon: FolderTree, label: 'Categories', roles: ['INVENTORY_STAFF', 'MANAGER'] },
    { path: '/transactions', icon: History, label: 'Transactions', roles: ['INVENTORY_STAFF', 'MANAGER'] },
    { path: '/reports', icon: BarChart3, label: 'Reports', roles: ['INVENTORY_STAFF', 'MANAGER'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-white shadow-md z-50 px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-primary-600">SpareHub</h1>
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
          {sidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary-600">SpareHub</h1>
        </div>
        
        <nav className="mt-6 px-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg w-full"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
