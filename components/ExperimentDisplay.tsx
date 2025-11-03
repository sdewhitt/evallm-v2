import React from 'react';
import { Experiment } from '@/types';
import { formatEvaluation } from '@/lib/utils';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface ExperimentDisplayProps {
  experiment: Experiment;
}

const ExperimentDisplay: React.FC<ExperimentDisplayProps> = ({ experiment }) => {
  return (
    <div className="p-8">
      {/* Prompt and Expected Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-emerald-400 text-center mb-4">
            User Prompt
          </h2>
          <p className="text-gray-200 text-center leading-relaxed">{experiment.prompt}</p>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold text-blue-400 text-center mb-4">
            Expected Output
          </h2>
          <pre className="text-gray-200 leading-relaxed whitespace-pre-wrap font-sans break-words">{experiment.expected}</pre>
        </div>
      </div>

      {/* Responses and Evaluations */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            Responses & Evaluations
          </h2>
          <p className="text-gray-400">AI model responses and their evaluation metrics</p>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex space-x-6 min-w-max">
            {Object.entries(experiment.responsesAndEvaluations).map(([model, data]) => (
              <div key={model} className="flex-none w-96 min-w-96 bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:border-gray-600/50">
                {/* Model Header */}
                <div className="mb-6 pb-4 border-b border-gray-700/50">
                  <h3 className="text-xl font-semibold text-emerald-400">
                    {model}
                  </h3>
                </div>

                {/* Response Section */}
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-300 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
                    Response
                  </h4>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <MarkdownRenderer content={data.response} />
                  </div>
                </div>

                {/* Evaluation Section */}
                <div>
                  <h4 className="text-lg font-medium text-gray-300 mb-3 flex items-center">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                    Evaluation Metrics
                  </h4>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <pre className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{formatEvaluation(data.evaluation)}</pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparative Analysis */}
        {experiment.comparativeAnalysis && (
          <div className="mt-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Comparative Analysis
              </h2>
              <p className="text-gray-400">AI-powered comparison of all model responses</p>
            </div>
            
            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-xl">
              <div className="flex items-center mb-6">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-3"></div>
                <h3 className="text-xl font-semibold text-purple-400">
                  Cross-Model Comparison
                </h3>
              </div>
              <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700/30 rounded-xl p-6">
                <MarkdownRenderer content={experiment.comparativeAnalysis} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperimentDisplay;
