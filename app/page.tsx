"use client";
import React, { useState, useEffect } from "react";
import './globals.css';
import MarkdownRenderer from "@/components/MarkdownRenderer";
import LoginForm from "@/components/LoginForm";


interface Experiment {
  prompt: string;
  expected: string;
  responsesAndEvaluations: {
    [model: string]: {
      response: string;
      evaluation: {
        responseTime: number;
        exactMatch: boolean;
        similarity: number;
        bleu: number;
        rouge: number[];
        perplexity: number;
      };
    };
  };
}

const models = ['llama3-8b-8192', 'mixtral-8x7b-32768', 'gemma2-9b-it'];
const defaultStatistics: { [key: string]: number | string} = {
  numResponses: 0,
  avgSimilarity: 0,
  avgBleu: 0,
  avgRouge: 0,
}
const defaultModelStatistics: { [key: string]: { [key: string]: number | string} } = models.reduce((acc: { [key: string]: { [key: string]: number | string} }, model) => {
  acc[model] = { ...defaultStatistics };
  return acc;
}, {});

export default function Home() {

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Evallm</h1>
      <LoginForm />
    </div>
  );
}

