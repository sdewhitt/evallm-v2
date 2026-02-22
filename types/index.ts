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
  condensedSummary?: string;
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

export type Provider = 'groq' | 'openai';

export const MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-20b',
  'gpt-4o-mini',
  'gpt-4o',
] as const;
export type ModelName = typeof MODELS[number];

/** Map each model to its API provider */
export const MODEL_PROVIDER: Record<string, Provider> = {
  'llama-3.3-70b-versatile': 'groq',
  'llama-3.1-8b-instant': 'groq',
  'openai/gpt-oss-20b': 'groq',
  'gpt-4o-mini': 'openai',
  'gpt-4o': 'openai',
};

export function getProvider(model: string): Provider {
  return MODEL_PROVIDER[model] ?? 'groq';
}
