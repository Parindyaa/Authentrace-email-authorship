import React from 'react';
import socialGraphImage from './Social_Graph.png';

const SocialGraphView = () => {
  return (
    <div className="flex flex-col h-full bg-white p-6 overflow-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Interaction Map (Social Graph Spread)</h2>
        <p className="text-sm text-gray-500">Visualizing community clusters and anomalous communication edges (k=2 hops).</p>
      </div>

      <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden shadow-inner">
        <img 
          src={socialGraphImage} 
          alt="Trained Social Graph" 
          className="max-w-full max-h-full object-contain p-4"
        />
      </div>

      <div className="mt-4 flex gap-6 text-xs font-medium text-gray-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span> Node (Employee)
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-gray-300"></span> Standard Communication
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 bg-red-500"></span> Anomalous Edge (Flagged)
        </div>
      </div>
    </div>
  );
};

export default SocialGraphView;