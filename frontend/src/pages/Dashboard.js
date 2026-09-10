import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Package, AlertTriangle, XCircle, TrendingUp, DollarSign } from 'lucide-react';
import StockStatusBadge from '../components/StockStatusBadge';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [outOfStockItems, setOutOfStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, lowStockRes, outOfStockRes] = await Promise.all([
        api.get('/inventory/reports'),
        api.get('/inventory/low-stock'),
        api.get('/inventory/out-of-stock'),
      ]);

      setSummary(summaryRes.data);
      setLowStockItems(lowStockRes.data);
      setOutOfStockItems(outOfStockRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spare Parts</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalSpareParts || 0}</p>
            </div>
            <Package className="w-8 h-8 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock</p>
              <p className="text-2xl font-bold text-gray-900">{summary?.totalStockQuantity || 0}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-yellow-600">{summary?.lowStockCount || 0}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{summary?.outOfStockCount || 0}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Stock Value Card */}
      <div className="card mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Stock Value</p>
            <p className="text-3xl font-bold text-gray-900">
              ${summary?.totalStockValue?.toFixed(2) || '0.00'}
            </p>
          </div>
          <DollarSign className="w-10 h-10 text-green-600" />
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="card mb-8 border-l-4 border-yellow-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-yellow-600" />
            Low Stock Alert
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-yellow-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Reorder Level</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.partNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.stockQuantity}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.reorderLevel}</td>
                    <td className="px-4 py-2">
                      <StockStatusBadge status={item.availabilityStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Out of Stock Alert */}
      {outOfStockItems.length > 0 && (
        <div className="card border-l-4 border-red-500">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <XCircle className="w-5 h-5 mr-2 text-red-600" />
            Out of Stock Items
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-red-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {outOfStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.partNumber}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                    <td className="px-4 py-2">
                      <StockStatusBadge status={item.availabilityStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {lowStockItems.length === 0 && outOfStockItems.length === 0 && (
        <div className="card text-center py-12">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">All stock levels are healthy!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
