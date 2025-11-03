import React, { useEffect, useMemo, useState } from 'react';
import { Experiment } from '@/types';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface ExperimentDisplayProps {
  experiment: Experiment;
}

const ExperimentDisplay: React.FC<ExperimentDisplayProps> = ({ experiment }) => {
  const models = useMemo(() => Object.keys(experiment.responsesAndEvaluations || {}), [experiment]);
  const [activeModel, setActiveModel] = useState<string>(models[0] || '');

  const activeData = activeModel ? experiment.responsesAndEvaluations[activeModel] : undefined;

  // Keep activeModel in sync with incoming experiments/models changes
  useEffect(() => {
    if (!models.length) {
      setActiveModel('');
      return;
    }
    if (!activeModel || !models.includes(activeModel)) {
      setActiveModel(models[0]);
    }
  }, [models, activeModel]);

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
        
        {/* Tabs */}
        <div className="w-full">
          {/* Tab list */}
          <div className="flex flex-wrap gap-2 border-b border-gray-700/50">
            {models.map((model) => {
              const isActive = model === activeModel;
              return (
                <button
                  key={model}
                  onClick={() => setActiveModel(model)}
                  className={
                    `px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ` +
                    (isActive
                      ? 'bg-gray-800 text-emerald-300 border-x border-t border-gray-700'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/50')
                  }
                  aria-selected={isActive}
                  role="tab"
                >
                  {model}
                </button>
              );
            })}
          </div>

          {/* Tab panel */}
          {activeData ? (
            <div role="tabpanel" className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-b-2xl p-6 shadow-xl">
              {/*<div className="mb-6 pb-4 border-b border-gray-700/50 flex items-center justify-between">
                <h3 className="text-xl font-semibold text-emerald-400">{activeModel}</h3>
              </div>*/}

              <div className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
                {/* Response */}
                <div className="min-h-0">
                  <h4 className="text-lg font-medium text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2" />
                    Response
                  </h4>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-4 max-h-96 overflow-y-auto">
                    <MarkdownRenderer content={activeData.response} />
                  </div>
                </div>

                {/* Evaluation as table */}
                <div className="min-h-0">
                  <h4 className="text-lg font-medium text-gray-300 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                    Metrics
                  </h4>
                  <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-xl p-0 overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-700/50">
                        <tr className="hover:bg-gray-900/60">
                          <th className="text-left text-gray-400 font-medium px-3 py-2.5 text-xs">Response time</th>
                          <td className="text-gray-200 px-3 py-2.5 text-right">{activeData.evaluation.responseTime.toFixed(0)} ms</td>
                        </tr>
                        <tr className="hover:bg-gray-900/60">
                          <th className="text-left text-gray-400 font-medium px-3 py-2.5 text-xs">Similarity</th>
                          <td className="text-gray-200 px-3 py-2.5 text-right">{(activeData.evaluation.similarity * 100).toFixed(0)}%</td>
                        </tr>
                        <tr className="hover:bg-gray-900/60">
                          <th className="text-left text-gray-400 font-medium px-3 py-2.5 text-xs">BLEU</th>
                          <td className="text-gray-200 px-3 py-2.5 text-right">{((activeData.evaluation.bleu || 0) * 100).toFixed(0)}%</td>
                        </tr>
                        <tr className="hover:bg-gray-900/60">
                          <th className="text-left text-gray-400 font-medium px-3 py-2.5 text-xs">ROUGE (avg)</th>
                          <td className="text-gray-200 px-3 py-2.5 text-right">
                            {(() => {
                              const rouge = activeData.evaluation.rouge || [];
                              const avg = rouge.length ? rouge.reduce((a, b) => a + (b || 0), 0) / rouge.length : 0;
                              return `${(avg * 100).toFixed(0)}%`;
                            })()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400">No model data available.</div>
          )}
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
