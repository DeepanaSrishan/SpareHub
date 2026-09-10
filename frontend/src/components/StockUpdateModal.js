import React, { useState } from 'react';
import { X } from 'lucide-react';

const StockUpdateModal = ({ isOpen, onClose, sparePart, onUpdateStock }) => {
  const [formData, setFormData] = useState({
    quantity: 0,
    transactionType: 'STOCK_IN',
    reason: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onUpdateStock(sparePart.id, {
        quantity: parseInt(formData.quantity),
        transactionType: formData.transactionType,
        reason: formData.reason,
      });
      onClose();
      setFormData({ quantity: 0, transactionType: 'STOCK_IN', reason: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Update Stock</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{sparePart.name}</p>
            <p className="text-sm text-gray-600">Part Number: {sparePart.partNumber}</p>
            <p className="text-sm text-gray-600">Current Stock: {sparePart.stockQuantity}</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type
              </label>
              <select
                name="transactionType"
                value={formData.transactionType}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="STOCK_IN">Stock In</option>
                <option value="STOCK_OUT">Stock Out</option>
                <option value="ADJUSTMENT">Adjustment</option>
                <option value="DAMAGE">Damage</option>
                <option value="LOSS">Loss</option>
                <option value="CORRECTION">Correction</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Change
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter quantity (positive for add, negative for remove)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use positive number to add stock, negative to remove stock
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder="Enter reason for stock change"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Updating...' : 'Update Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockUpdateModal;
