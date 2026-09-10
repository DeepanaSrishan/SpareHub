import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import SparePartForm from '../components/SparePartForm';

const AddSparePart = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories/active');
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.post('/spare-parts', formData);
      navigate('/spare-parts');
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Spare Part</h1>
      <SparePartForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/spare-parts')}
      />
    </div>
  );
};

export default AddSparePart;
