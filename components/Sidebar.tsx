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
        <div 
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        >
            <div 
                className="flex flex-col fixed top-0 left-0 w-80 h-full bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 h-20 flex items-center px-6">
                    <button 
                    className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-blue-300 transition-all p-2 rounded-xl" 
                    onClick={onClose}
                    >
                    Prompt Analytics
                    </button>
                </div>

                {/* Experiments List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {experiments.length === 0 ? (
                    <div className="text-center py-12">
                    <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
                        <p className="text-gray-300 text-lg mb-2">No experiments yet.</p>
                        <p className="text-gray-400 text-sm">Submit your first prompt to get started!</p>
                    </div>
                    </div>
                ) : (
                    [...experiments].map((experimentItem, index) => (
                    experimentItem ? (
                        <button 
                            key={experimentItem.prompt + index} 
                            className="text-left p-4 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-200 w-full group shadow-lg"
                            onClick={() => onSelectExperiment(index)}
                        >
                            <h2 className="text-gray-200 group-hover:text-white font-medium whitespace-pre-wrap break-words">{experimentItem.prompt}</h2>
                            <div className="mt-2 flex items-center space-x-2">
                                <div className="w-2 h-2 bg-emerald-400 rounded-full opacity-60"></div>
                                <span className="text-xs text-gray-400">Experiment {experiments.length - index}</span>
                            </div>
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
