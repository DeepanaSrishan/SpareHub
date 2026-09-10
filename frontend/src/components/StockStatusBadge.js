import React from 'react';

const StockStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'IN_STOCK':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'IN STOCK'
        };
      case 'LOW_STOCK':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'LOW STOCK'
        };
      case 'OUT_OF_STOCK':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          label: 'OUT OF STOCK'
        };
      case 'INACTIVE':
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'INACTIVE'
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: status
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}>
      {config.label}
    </span>
  );
};

export default StockStatusBadge;
