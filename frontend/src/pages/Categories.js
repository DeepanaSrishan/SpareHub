import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const canAdd = hasRole(['INVENTORY_STAFF', 'MANAGER']);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    if (!window.confirm(
      `Are you sure you want to ${category.active ? 'deactivate' : 'activate'} this category?`
    )) {
      return;
    }

    try {
      const endpoint = category.active 
        ? `/categories/${category.id}/deactivate`
        : `/categories/${category.id}/activate`;
      
      await api.patch(endpoint);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update category status');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading categories...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        {canAdd && (
          <button
            onClick={() => navigate('/categories/add')}
            className="btn-primary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            No categories found
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="card">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {canAdd && (
                  <button
                    onClick={() => handleDelete(category)}
                    className="text-gray-400 hover:text-red-600"
                    title={category.active ? 'Deactivate' : 'Activate'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
              )}

              {canAdd && (
                <button
                  onClick={() => navigate(`/categories/${category.id}/edit`)}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Categories;
