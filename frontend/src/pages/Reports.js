import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Package, TrendingUp, AlertTriangle, XCircle, DollarSign, Activity } from 'lucide-react';

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/inventory/reports');
      setSummary(response.data);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Reports</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spare Parts</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalSpareParts || 0}</p>
            </div>
            <Package className="w-10 h-10 text-primary-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Spare Parts</p>
              <p className="text-3xl font-bold text-green-600">{summary?.activeSpareParts || 0}</p>
            </div>
            <Activity className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock Quantity</p>
              <p className="text-3xl font-bold text-gray-900">{summary?.totalStockQuantity || 0}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-3xl font-bold text-yellow-600">{summary?.lowStockCount || 0}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-yellow-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock Items</p>
              <p className="text-3xl font-bold text-red-600">{summary?.outOfStockCount || 0}</p>
            </div>
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Stock Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${summary?.totalStockValue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="w-10 h-10 text-green-600" />
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Inventory Insights</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Stock Health</p>
              <p className="text-sm text-gray-600">
                {summary?.lowStockCount === 0 && summary?.outOfStockCount === 0
                  ? 'All stock levels are healthy'
                  : `${summary?.lowStockCount || 0} items need attention`}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              summary?.lowStockCount === 0 && summary?.outOfStockCount === 0
                ? 'bg-green-500'
                : 'bg-yellow-500'
            }`} />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Active Inventory Rate</p>
              <p className="text-sm text-gray-600">
                {summary?.totalSpareParts > 0
                  ? `${((summary.activeSpareParts / summary.totalSpareParts) * 100).toFixed(1)}%`
                  : '0%'} of total parts are active
              </p>
            </div>
            <div className="text-2xl font-bold text-primary-600">
              {summary?.totalSpareParts > 0
                ? `${((summary.activeSpareParts / summary.totalSpareParts) * 100).toFixed(1)}%`
                : '0%'}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Average Stock per Part</p>
              <p className="text-sm text-gray-600">
                {summary?.totalSpareParts > 0
                  ? (summary.totalStockQuantity / summary.totalSpareParts).toFixed(1)
                  : '0'} units per part
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {summary?.totalSpareParts > 0
                ? (summary.totalStockQuantity / summary.totalSpareParts).toFixed(1)
                : '0'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
