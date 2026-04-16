import { TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

const StatCard = ({ icon, title, value, change, changeType }) => {
  const isPositive = changeType === 'positive';

  return (
    <div className="bg-white p-6 sm:p-8 rounded-[24px] shadow-[0_4px_20px_rgba(49,46,129,0.04)] flex flex-col justify-between transition-all duration-300 hover:shadow-[0_12px_40px_rgba(49,46,129,0.06)] hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-[#464554] uppercase tracking-[0.05em]">{title}</p>
          <p className="text-4xl font-bold text-[#191c1e]">{value}</p>
        </div>
        <div className="p-3 bg-[#f7f9fb] rounded-full text-[#4338ca]">
          {icon}
        </div>
      </div>
      <div className="flex items-center mt-6">
        <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'bg-[#ecfdf5] text-[#10B981]' : 'bg-[#fff1f2] text-[#e11d48]'}`}>
          {isPositive ? <TrendingUp className="mr-1 h-3.5 w-3.5" /> : <TrendingDown className="mr-1 h-3.5 w-3.5" />}
          {change}
        </span>
      </div>
    </div>
  );
};

export default StatCard;