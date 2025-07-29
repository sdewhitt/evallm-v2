"use client"
import React from 'react'
import Image from "next/image";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Logout from '@/components/Logout';


import MarkdownRenderer from "@/components/MarkdownRenderer";

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
    const { data: session, status } = useSession();
    
    useEffect(() => {
        if (status === "loading") return; // Still loading
        if (!session) {
            redirect("/");
        }
    }, [session, status]);
    
    const [message, setMessage] = useState("");
    const [expectedOutput, setExpectedOutput] = useState("");
    
    const [isLoading, setIsLoading] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const [experimentArray, setExperimentArray] = useState<Experiment[]>([]);
    const [experiment, setExperiment] = useState<Experiment | null>(null);

    const [isViewingLLMStats, setIsViewingLLMStats] = useState(false);
    const [llmStatistics, setLLMStatistics] = useState<{ [key: string]: { [key: string]: number | string} }>(defaultModelStatistics);
    const [llmCumulativeAnalysis, setLLMCumulativeAnalysis] = useState<string>("");

    // Handle user input and retrieve LLM responses + evaluations
    const handleSubmit = async () => {
        // Clear the input field
        setMessage("");
        setExpectedOutput("");
        setIsLoading(true);
        setExperiment(null);
        try {
        if (!message.trim() || !expectedOutput.trim()) throw new Error("Please enter a user prompt and an expected output.");

        // Track the user prompt and expected output
        //const prompt = { role: "user" as const, content: message };
        //const expected = { role: "user" as const, content: !expectedOutput.trim() ? expectedOutput : "N/A" };


        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({ message, expectedOutput, email: session?.user?.email }),
        });
        
        // Retrieve MULTIPLE LLM responses

        const data = await response.json();
        
        // Update Experiment Array:
        
        setExperimentArray(prevArray => [data.experiment, ...prevArray]);
        setExperiment(null);
        setIsViewingLLMStats(false);
        setExperiment(data.experiment);


        // Calculate/Update the LLM Statistics
        const fetchedStats = await fetchLLMStats();
        //const fetchedAnalysis = await fetchLLMCumulativeAnalysis();
        //setLLMCumulativeAnalysis(fetchedAnalysis);
        setLLMStatistics(fetchedStats);
        

        } catch (error) {
        //console.error("Error:", error instanceof Error ? error.message : "unknown");
        setError(`${error instanceof Error ? error.message : "unknown"}`);
        } finally {
        setIsLoading(false);
        }
    };

    const fetchLLMCumulativeAnalysis = async (stats = defaultModelStatistics , experiments = experimentArray) => {
        const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ llmStatistics: stats, experiments: experiments }),
        });

        const data = await response.json();

        return data.Analysis;
    }

    const fetchLLMStats = async (experiments = experimentArray) => {
        try {
        const llmStats: { [key: string]: {[key: string]: number | string} } = {};
        for (const LLM of models) {
            const stats = await calculateLLMStats(LLM, experiments);
            llmStats[LLM] = stats;
        }

        const fetchedAnalysis = await fetchLLMCumulativeAnalysis(llmStats, experiments);
        setLLMCumulativeAnalysis(fetchedAnalysis);


        return llmStats;
        } catch (error) {
        setError(`${error instanceof Error ? error.message : "unknown"}`);
        }
        return defaultModelStatistics;
    }

    const calculateLLMStats = async (LLM: string, experiments: Experiment[]) => {

        let avgResponseTime = 0;
        let numResponses = 0;
        let avgSimilarity = 0;
        let avgBleu = 0;
        let avgRouge = 0;

        for (let i = 0; i < experiments.length; i++) {
        const curResponsesAndEvaluations = experiments[i].responsesAndEvaluations;
        if (!curResponsesAndEvaluations[LLM]) { continue; }
        const curEval = curResponsesAndEvaluations[LLM].evaluation;
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

    }

    /* ================================= UI functions ================================= */

    const clearExperiment = async () => {
        setIsClearing(true);
        try {
        setExperiment(null);
        } catch (error) {
        setError(`${error instanceof Error ? error.message : "unknown"}`);
        } finally {
        setIsClearing(false);
        }
    }

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    const switchDisplayPrompt = (index: number) => {
        setExperiment(experimentArray[index]);
        toggleSidebar();
        setIsViewingLLMStats(false);
    };

    const formatEvaluation = (evaluation: Experiment["responsesAndEvaluations"]["model"]["evaluation"]) => {
        const responseTime = `Reponse time: ${evaluation.responseTime.toFixed(0)}ms\n`;
        const similarityPercent = `Similarity: ${(evaluation.similarity * 100).toFixed(0)}%\n`;
        const bleuScore = `BLEU Score: ${((evaluation.bleu || 0) * 100).toFixed(0)}%\n`;

        const rougeAverage = evaluation.rouge.reduce((acc, score) => acc + (score || 0), 0) / evaluation.rouge.length;
        const rougeScore = `ROUGE Score: ${(rougeAverage * 100).toFixed(0)}%\n`;

        return responseTime + similarityPercent + bleuScore + rougeScore;
    }

    const formatLLMStats = (stats: { [key: string]: number | string} ) => {
        return `~${stats.avgResponseTime}ms\n${stats.numResponses} responses\n${stats.avgSimilarity}% similarity\n${stats.avgBleu}% BLEU\n${stats.avgRouge}% ROUGE`;
    }

    const toggleViewLLMStats = () => {
        setIsViewingLLMStats(!isViewingLLMStats);
        setIsSidebarVisible(false);
        clearExperiment();
    };



    if (false) {
        return (
            <div>
                {status === "loading" ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <h1 className="text-3xl font-bold mb-6">Welcome, {session?.user?.name}!</h1>
                        <p className="mb-4">You are logged in as {session?.user?.email}.</p>
                        <p className="text-gray-500">This is your home page.</p>
                        <Image
                            src={session?.user?.image || "/default-avatar.png"}
                            alt={session?.user?.name || "User Avatar"}
                            width={100}
                            height={100}
                            className="rounded-full mt-4"/>

                        <Logout />
                    </>
                )}
            </div>
        )
    }


  return (
    <div>
        
    </div>
  )
}
