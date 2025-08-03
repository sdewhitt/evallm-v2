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
    <div className="flex-1 pt-20 pb-16">
      <div className="p-4 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold text-emerald-200 p-4">LLM Statistics</h2>
        
        {/* Model Statistics */}
        <div className="flex overflow-x-auto space-x-4">
          {Object.entries(statistics).map(([model, data]) => (
            <div key={model} className="flex-none border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-96 overflow-x-auto">
              <div className="flex-1 p-2">
                <h3 className="text-xl font-semibold text-emerald-500">{model}</h3>
                <pre className="text-stone-100 whitespace-pre-wrap">{formatLLMStats(data)}</pre>
              </div>
            </div>
          ))}
        </div>
        
        {/* Analysis */}
        {analysis && (
          <div className="justify-center border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-[70%] mx-auto">
            <div className="justify-center items-center flex">
              <h3 className="text-xl font-semibold text-emerald-500">Analysis</h3>
            </div>
            <MarkdownRenderer content={analysis} />
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMStatsDisplay;
