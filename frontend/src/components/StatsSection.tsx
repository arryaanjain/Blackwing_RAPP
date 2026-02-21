import React from 'react';

interface StatCardProps {
  value: string;
  label: string;
}

const StatCard: React.FC<StatCardProps> = ({ value, label }) => {
  return (
    <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6 text-center">
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className="text-sm text-blue-200">{label}</div>
    </div>
  );
};

const StatsSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-900 to-indigo-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">Driving Real Results</h2>
          <p className="mt-4 text-xl text-blue-200">See the impact of our blockchain-powered procurement platform</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StatCard value="30%" label="Average Cost Reduction" />
          <StatCard value="65%" label="Faster Process Times" />
          <StatCard value="100%" label="Transparent Transactions" />
          <StatCard value="4.2M" label="Smart Contracts Executed" />
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
