// src/components/ui/StatCard.jsx

import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatCard = ({ icon, title, value, change, changeType }) => {
  const isPositive = changeType === 'positive';

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <div className="text-gray-400">
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-4">
        <span className={`flex items-center text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatCard;