import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../utils/api';
import SparePartForm from '../components/SparePartForm';

const EditSparePart = () => {
  const [sparePart, setSparePart] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [sparePartRes, categoriesRes] = await Promise.all([
        api.get(`/spare-parts/${id}`),
        api.get('/categories/active'),
      ]);
      setSparePart(sparePartRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      navigate('/spare-parts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    try {
      await api.put(`/spare-parts/${id}`, formData);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Spare Part</h1>
      <SparePartForm
        sparePart={sparePart}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/spare-parts')}
      />
    </div>
  );
};

export default EditSparePart;
