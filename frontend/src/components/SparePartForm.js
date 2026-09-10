import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const SparePartForm = ({ sparePart, onSubmit, onCancel, categories }) => {
  const [formData, setFormData] = useState({
    partNumber: '',
    name: '',
    description: '',
    brand: '',
    categoryId: '',
    subCategoryId: '',
    price: '',
    stockQuantity: '',
    reorderLevel: '',
    imageUrl: '',
    active: true,
  });
  const [subCategories, setSubCategories] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sparePart) {
      setFormData({
        partNumber: sparePart.partNumber || '',
        name: sparePart.name || '',
        description: sparePart.description || '',
        brand: sparePart.brand || '',
        categoryId: sparePart.categoryId || '',
        subCategoryId: sparePart.subCategoryId || '',
        price: sparePart.price || '',
        stockQuantity: sparePart.stockQuantity || '',
        reorderLevel: sparePart.reorderLevel || '',
        imageUrl: sparePart.imageUrl || '',
        active: sparePart.active !== undefined ? sparePart.active : true,
      });

      if (sparePart.categoryId) {
        fetchSubCategories(sparePart.categoryId);
      }
    }
  }, [sparePart]);

  const fetchSubCategories = async (categoryId) => {
    try {
      const response = await api.get(`/subcategories/category/${categoryId}`);
      setSubCategories(response.data);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (name === 'categoryId' && value) {
      fetchSubCategories(value);
      setFormData(prev => ({ ...prev, subCategoryId: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stockQuantity: parseInt(formData.stockQuantity),
        reorderLevel: parseInt(formData.reorderLevel),
        categoryId: parseInt(formData.categoryId),
        subCategoryId: formData.subCategoryId ? parseInt(formData.subCategoryId) : null,
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save spare part');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        {sparePart ? 'Edit Spare Part' : 'Add New Spare Part'}
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Part Number / SKU *
            </label>
            <input
              type="text"
              name="partNumber"
              value={formData.partNumber}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., BRK-001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Spare Part Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Brake Pad"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Bosch"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sub-category
            </label>
            <select
              name="subCategoryId"
              value={formData.subCategoryId}
              onChange={handleChange}
              className="input-field"
              disabled={!formData.categoryId}
            >
              <option value="">Select Sub-category</option>
              {subCategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Price ($) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input-field"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Stock Quantity *
            </label>
            <input
              type="number"
              name="stockQuantity"
              value={formData.stockQuantity}
              onChange={handleChange}
              className="input-field"
              placeholder="0"
              min="0"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reorder Level *
            </label>
            <input
              type="number"
              name="reorderLevel"
              value={formData.reorderLevel}
              onChange={handleChange}
              className="input-field"
              placeholder="10"
              min="0"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="input-field"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="md:col-span-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Saving...' : (sparePart ? 'Update' : 'Add')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SparePartForm;
