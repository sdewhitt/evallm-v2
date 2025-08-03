export interface Evaluation {
  responseTime: number;
  exactMatch: boolean;
  similarity: number;
  bleu: number;
  rouge: number[];
  perplexity: number;
}

export interface ResponseAndEvaluation {
  response: string;
  evaluation: Evaluation;
}

export interface Experiment {
  prompt: string;
  expected: string;
  responsesAndEvaluations: {
    [model: string]: ResponseAndEvaluation;
  };
  comparativeAnalysis?: string;
}

export interface LLMStatistics {
  avgResponseTime: string;
  numResponses: number;
  avgSimilarity: string;
  avgBleu: string;
  avgRouge: string;
}

export interface ModelStatistics {
  [model: string]: LLMStatistics;
}

export const MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'] as const;
export type ModelName = typeof MODELS[number];
