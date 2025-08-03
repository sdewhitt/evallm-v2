import React from 'react';
import { ModelStatistics } from '@/types';
import { formatLLMStats } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface LLMStatsDisplayProps {
  statistics: ModelStatistics;
  analysis: string;
}

const LLMStatsDisplay: React.FC<LLMStatsDisplayProps> = ({ statistics, analysis }) => {
  return (
    <div className="p-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent mb-2">
            LLM Statistics
          </h2>
          <p className="text-gray-400">Performance metrics and analysis across AI models</p>
        </div>
        
        {/* Model Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(statistics).map(([model, data]) => (
            <div key={model} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-600/50">
              <div className="mb-4 pb-4 border-b border-gray-700/50">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent flex items-center">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mr-3"></div>
                  {model}
                </h3>
              </div>
              <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 max-h-80 overflow-y-auto">
                <pre className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{formatLLMStats(data)}</pre>
              </div>
            </div>
          ))}
        </div>
        
        {/* Analysis */}
        {analysis && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                Analysis
              </h3>
            </div>
            <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
              <MarkdownRenderer content={analysis} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMStatsDisplay;
