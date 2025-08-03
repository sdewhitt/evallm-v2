import React from 'react';
import { Experiment } from '@/types';

interface SidebarProps {
  isVisible: boolean;
  experiments: Experiment[];
  onClose: () => void;
  onSelectExperiment: (index: number) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isVisible, 
  experiments, 
  onClose, 
  onSelectExperiment 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="flex flex-col fixed inset-y-0 left-0 w-64 bg-emerald-950 shadow-lg border-b border-stone-900">
        
        {/* Header */}
        <div className="bg-emerald-900 p-4 border-b border-emerald-950">
          <button 
            className="text-xl font-semibold text-white hover:bg-emerald-950 transition-all p-2 rounded-xl" 
            onClick={onClose}
          >
            Prompt Analytics
          </button>
        </div>

        {/* Experiments List */}
        <div className="flex-1 overflow-y-auto p-4">
          {experiments.length === 0 ? (
            <div className="text-center text-emerald-200 py-8">
              <p>No experiments yet.</p>
              <p className="text-sm text-emerald-300 mt-2">Submit your first prompt to get started!</p>
            </div>
          ) : (
            experiments.map((experimentItem, index) => (
              experimentItem ? (
                <button 
                  key={experimentItem.prompt + index} 
                  className="text-left p-2 bg-emerald-800 rounded-xl mb-2 hover:bg-emerald-900 transition-all w-full"
                  onClick={() => onSelectExperiment(index)}
                >
                  <h2 className="text-lg text-stone-100 truncate">{experimentItem.prompt}</h2>
                </button>
              ) : null
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
