import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, Plus, Minus } from 'lucide-react';
import StockStatusBadge from './StockStatusBadge';
import { useAuth } from '../context/AuthContext';

const SparePartTable = ({ spareParts, onEdit, onDelete, onUpdateStock }) => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const canEdit = hasRole(['INVENTORY_STAFF', 'MANAGER']);
  const canViewDetails = true;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Image
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Part Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Brand
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {spareParts.length === 0 ? (
            <tr>
              <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
                No spare parts found
              </td>
            </tr>
          ) : (
            spareParts.map((part) => (
              <tr key={part.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  {part.imageUrl ? (
                    <img
                      src={part.imageUrl}
                      alt={part.name}
                      className="h-12 w-12 object-cover rounded"
                    />
                  ) : (
                    <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {part.partNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {part.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.brand}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {part.categoryName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ${part.price?.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {part.stockQuantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StockStatusBadge status={part.availabilityStatus} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    {canViewDetails && (
                      <button
                        onClick={() => navigate(`/spare-parts/${part.id}`)}
                        className="text-primary-600 hover:text-primary-900"
                        title="View Details"
                      >
                        View
                      </button>
                    )}
                    {canEdit && (
                      <>
                        <button
                          onClick={() => onEdit(part)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateStock(part)}
                          className="text-green-600 hover:text-green-900"
                          title="Update Stock"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDelete(part)}
                          className="text-red-600 hover:text-red-900"
                          title={part.active ? 'Deactivate' : 'Activate'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SparePartTable;
