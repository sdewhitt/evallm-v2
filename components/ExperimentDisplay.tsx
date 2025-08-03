import React from 'react';
import { Experiment } from '@/types';
import { formatEvaluation } from '@/lib/utils';

interface ExperimentDisplayProps {
  experiment: Experiment;
}

const ExperimentDisplay: React.FC<ExperimentDisplayProps> = ({ experiment }) => {
  return (
    <div className="flex-1 pt-20 pb-16">
      {/* Prompt and Expected Output */}
      <div className="flex p-4 justify-center items-center space-x-96">
        <div className="flex-1 border-stone-900 bg-stone-800 rounded-xl p-4 m-6">
          <h2 className="text-2xl font-semibold text-emerald-500 text-center">User Prompt</h2>
          <p className="text-stone-100 text-center">{experiment.prompt}</p>
        </div>
        <div className="flex-1 border-stone-900 bg-stone-800 rounded-xl p-4 m-6">
          <h2 className="text-2xl font-semibold text-emerald-500 text-center">Expected Output</h2>
          <p className="text-stone-100 text-center">{experiment.expected}</p>
        </div>
      </div>

      {/* Responses and Evaluations */}
      <div className="p-4 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-semibold text-emerald-200 p-4">Responses & Evaluations</h2>
        <div className="flex overflow-x-auto space-x-4">
          {Object.entries(experiment.responsesAndEvaluations).map(([model, data]) => (
            <div key={model} className="flex-none border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-96 overflow-x-auto">
              <div className="flex-1 p-2">
                <h3 className="text-xl font-semibold text-emerald-500">{model}</h3>
                <pre className="text-stone-100 whitespace-pre-wrap">{data.response}</pre>
              </div>

              <div className="flex-1 p-2">
                <h3 className="text-xl font-semibold text-emerald-500">Evaluation Metrics</h3>
                <pre className="text-stone-100 whitespace-pre-wrap">{formatEvaluation(data.evaluation)}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExperimentDisplay;
