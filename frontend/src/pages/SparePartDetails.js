import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { ArrowLeft, Edit, Package, DollarSign, AlertTriangle } from 'lucide-react';
import StockStatusBadge from '../components/StockStatusBadge';
import { useAuth } from '../context/AuthContext';

const SparePartDetails = () => {
  const [sparePart, setSparePart] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const canEdit = hasRole(['INVENTORY_STAFF', 'MANAGER']);

  useEffect(() => {
    fetchSparePart();
  }, [id]);

  const fetchSparePart = async () => {
    try {
      const response = await api.get(`/spare-parts/${id}`);
      setSparePart(response.data);
    } catch (err) {
      console.error('Error fetching spare part:', err);
      navigate('/spare-parts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!sparePart) {
    return <div className="text-center py-12">Spare part not found</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </button>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Image Section */}
          <div className="md:w-1/3">
            {sparePart.imageUrl ? (
              <img
                src={sparePart.imageUrl}
                alt={sparePart.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <Package className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="md:w-2/3">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{sparePart.name}</h1>
                <p className="text-gray-600">{sparePart.partNumber}</p>
              </div>
              <StockStatusBadge status={sparePart.availabilityStatus} />
            </div>

            {sparePart.description && (
              <p className="text-gray-700 mb-6">{sparePart.description}</p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Brand</p>
                <p className="font-medium text-gray-900">{sparePart.brand}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <p className="font-medium text-gray-900">{sparePart.categoryName}</p>
              </div>

              {sparePart.subCategoryName && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Sub-category</p>
                  <p className="font-medium text-gray-900">{sparePart.subCategoryName}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Price</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {sparePart.price?.toFixed(2)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                <p className="font-medium text-gray-900">{sparePart.stockQuantity}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Reorder Level</p>
                <p className="font-medium text-gray-900 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  {sparePart.reorderLevel}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              {canEdit && (
                <button
                  onClick={() => navigate(`/spare-parts/${sparePart.id}/edit`)}
                  className="btn-primary flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Spare Part
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SparePartDetails;
