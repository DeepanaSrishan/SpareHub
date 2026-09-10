import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Search, Plus } from 'lucide-react';
import SparePartTable from '../components/SparePartTable';
import FilterPanel from '../components/FilterPanel';
import StockUpdateModal from '../components/StockUpdateModal';
import { useAuth } from '../context/AuthContext';

const SpareParts = () => {
  const [spareParts, setSpareParts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filters, setFilters] = useState({
    categoryId: null,
    subCategoryId: null,
    brand: '',
    minPrice: null,
    maxPrice: null,
    availability: null,
    active: null,
  });
  const [selectedSparePart, setSelectedSparePart] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const { hasRole } = useAuth();
  const navigate = useNavigate();

  const canAdd = hasRole(['INVENTORY_STAFF', 'MANAGER']);

  useEffect(() => {
    fetchSpareParts();
    fetchCategories();
  }, []);

  const fetchSpareParts = async () => {
    try {
      const response = await api.get('/spare-parts');
      setSpareParts(response.data);
    } catch (err) {
      console.error('Error fetching spare parts:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/active');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchSpareParts();
      return;
    }

    try {
      const response = await api.get(`/spare-parts/search?keyword=${searchKeyword}`);
      setSpareParts(response.data);
    } catch (err) {
      console.error('Error searching spare parts:', err);
    }
  };

  const handleApplyFilters = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.categoryId) params.append('categoryId', filters.categoryId);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.availability) params.append('availability', filters.availability);
      if (filters.active !== null) params.append('active', filters.active);

      const response = await api.get(`/spare-parts/filter?${params.toString()}`);
      setSpareParts(response.data);
    } catch (err) {
      console.error('Error filtering spare parts:', err);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      categoryId: null,
      subCategoryId: null,
      brand: '',
      minPrice: null,
      maxPrice: null,
      availability: null,
      active: null,
    });
    fetchSpareParts();
  };

  const handleEdit = (sparePart) => {
    navigate(`/spare-parts/${sparePart.id}/edit`);
  };

  const handleDelete = async (sparePart) => {
    if (!window.confirm(
      `Are you sure you want to ${sparePart.active ? 'deactivate' : 'activate'} this spare part?`
    )) {
      return;
    }

    try {
      const endpoint = sparePart.active 
        ? `/spare-parts/${sparePart.id}/deactivate`
        : `/spare-parts/${sparePart.id}/activate`;
      
      await api.patch(endpoint);
      fetchSpareParts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update spare part status');
    }
  };

  const handleUpdateStock = (sparePart) => {
    setSelectedSparePart(sparePart);
    setIsStockModalOpen(true);
  };

  const handleStockUpdate = async (sparePartId, stockData) => {
    try {
      await api.patch(`/inventory/${sparePartId}/stock`, stockData);
      fetchSpareParts();
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading spare parts...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Spare Parts</h1>
        {canAdd && (
          <button
            onClick={() => navigate('/spare-parts/add')}
            className="btn-primary flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Spare Part
          </button>
        )}
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="input-field pl-10"
                placeholder="Search by part number or name..."
              />
            </div>
            <button onClick={handleSearch} className="btn-primary">
              Search
            </button>
          </div>
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            categories={categories}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        </div>
      </div>

      {/* Spare Parts Table */}
      <SparePartTable
        spareParts={spareParts}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onUpdateStock={handleUpdateStock}
      />

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setSelectedSparePart(null);
        }}
        sparePart={selectedSparePart}
        onUpdateStock={handleStockUpdate}
      />
    </div>
  );
};

export default SpareParts;
