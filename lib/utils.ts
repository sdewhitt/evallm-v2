import { Evaluation, LLMStatistics, Experiment, MODELS } from '@/types';

export const formatEvaluation = (evaluation: Evaluation): string => {
  const responseTime = `Response time: ${evaluation.responseTime.toFixed(0)}ms\n`;
  const similarityPercent = `Similarity: ${(evaluation.similarity * 100).toFixed(0)}%\n`;
  const bleuScore = `BLEU Score: ${((evaluation.bleu || 0) * 100).toFixed(0)}%\n`;
  
  const rougeAverage = evaluation.rouge.reduce((acc, score) => acc + (score || 0), 0) / evaluation.rouge.length;
  const rougeScore = `ROUGE Score: ${(rougeAverage * 100).toFixed(0)}%\n`;
  
  return responseTime + similarityPercent + bleuScore + rougeScore;
};

export const formatLLMStats = (stats: LLMStatistics): string => {
  return `~${stats.avgResponseTime}ms\n${stats.numResponses} responses\n${stats.avgSimilarity}% similarity\n${stats.avgBleu}% BLEU\n${stats.avgRouge}% ROUGE`;
};

export const calculateLLMStats = (model: string, experiments: Experiment[]): LLMStatistics => {
  let avgResponseTime = 0;
  let numResponses = 0;
  let avgSimilarity = 0;
  let avgBleu = 0;
  let avgRouge = 0;

  for (const experiment of experiments) {
    const evaluation = experiment.responsesAndEvaluations[model];
    if (!evaluation) continue;
    
    const curEval = evaluation.evaluation;
    avgResponseTime += curEval.responseTime;
    numResponses++;
    avgSimilarity += curEval.similarity;
    avgBleu += curEval.bleu || 0;
    avgRouge += curEval.rouge.reduce((acc, score) => acc + (score || 0), 0);
  }

  if (numResponses !== 0) {
    avgResponseTime /= numResponses;
    avgSimilarity /= numResponses;
    avgBleu /= numResponses;
    avgRouge /= numResponses;
  }

  return {
    avgResponseTime: avgResponseTime.toFixed(0),
    numResponses: numResponses,
    avgSimilarity: (avgSimilarity * 100).toFixed(1),
    avgBleu: (avgBleu * 100).toFixed(1),
    avgRouge: (avgRouge * 100).toFixed(1),
  };
};

export const getDefaultStatistics = (): LLMStatistics => ({
  avgResponseTime: '0',
  numResponses: 0,
  avgSimilarity: '0',
  avgBleu: '0',
  avgRouge: '0',
});

export const getDefaultModelStatistics = () => 
  MODELS.reduce((acc, model) => {
    acc[model] = getDefaultStatistics();
    return acc;
  }, {} as Record<string, LLMStatistics>);
