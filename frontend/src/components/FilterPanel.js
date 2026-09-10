import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';

const FilterPanel = ({ filters, setFilters, categories, onApplyFilters, onClearFilters }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (field, value) => {
    setFilters({
      ...filters,
      [field]: value,
    });
  };

  const handleApply = () => {
    onApplyFilters();
    setIsOpen(false);
  };

  const handleClear = () => {
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-secondary flex items-center"
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border p-4 z-10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-900">Filter Spare Parts</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => handleChange('categoryId', e.target.value || null)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
              <input
                type="text"
                value={filters.brand || ''}
                onChange={(e) => handleChange('brand', e.target.value)}
                className="input-field"
                placeholder="Enter brand"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value || null)}
                  className="input-field"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value || null)}
                  className="input-field"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
              <select
                value={filters.availability || ''}
                onChange={(e) => handleChange('availability', e.target.value || null)}
                className="input-field"
              >
                <option value="">All</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.active !== undefined ? filters.active.toString() : ''}
                onChange={(e) => handleChange('active', e.target.value === '' ? null : e.target.value === 'true')}
                className="input-field"
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={handleApply} className="btn-primary flex-1">
                Apply
              </button>
              <button onClick={handleClear} className="btn-secondary flex-1">
                Clear
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
