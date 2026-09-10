import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, ArrowDown, ArrowUp, AlertTriangle } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ type: '' });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/inventory/transactions');
      setTransactions(response.data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'STOCK_IN':
        return <ArrowDown className="w-4 h-4 text-green-600" />;
      case 'STOCK_OUT':
        return <ArrowUp className="w-4 h-4 text-red-600" />;
      case 'DAMAGE':
      case 'LOSS':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'STOCK_IN':
        return 'text-green-600';
      case 'STOCK_OUT':
        return 'text-red-600';
      case 'DAMAGE':
      case 'LOSS':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  const filteredTransactions = filter.type
    ? transactions.filter(t => t.transactionType === filter.type)
    : transactions;

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading transactions...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Inventory Transaction History</h1>

      <div className="card mb-6">
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Filter by Type:</label>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ type: e.target.value })}
            className="input-field max-w-xs"
          >
            <option value="">All Types</option>
            <option value="STOCK_IN">Stock In</option>
            <option value="STOCK_OUT">Stock Out</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="DAMAGE">Damage</option>
            <option value="LOSS">Loss</option>
            <option value="CORRECTION">Correction</option>
          </select>
        </div>
      </div>

      <div className="card">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Part Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.partNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.partName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTransactionIcon(transaction.transactionType)}
                        <span className={`ml-2 text-sm font-medium ${getTransactionColor(transaction.transactionType)}`}>
                          {transaction.transactionType.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantityBefore}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      transaction.quantityChanged > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.quantityChanged > 0 ? '+' : ''}{transaction.quantityChanged}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.quantityAfter}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {transaction.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.userName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
