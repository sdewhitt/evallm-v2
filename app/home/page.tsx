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

const models = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'];
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

    // Debug: Track experiment changes
    useEffect(() => {
        console.log('Experiment state changed:', experiment);
    }, [experiment]);

    // Debug: Track experimentArray changes
    useEffect(() => {
        console.log('ExperimentArray changed:', experimentArray);
        console.log('Array length:', experimentArray.length);
        experimentArray.forEach((exp, index) => {
            if (!exp) {
                console.warn(`Null/undefined experiment at index ${index}`);
            }
        });
    }, [experimentArray]);

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
        
        console.log('API Response data:', data);
        console.log('data.experiment:', data.experiment);
        
        // Validate the experiment data before adding it
        if (!data.experiment || !data.experiment.prompt || !data.experiment.expected) {
            throw new Error('Invalid experiment data received from API');
        }
        
        // Update Experiment Array:
        
        setExperimentArray(prevArray => [data.experiment, ...prevArray]);
        setIsViewingLLMStats(false);
        console.log('Setting experiment to:', data.experiment);
        setExperiment(data.experiment);


        // Calculate/Update the LLM Statistics with the updated array
        const updatedExperimentArray = [data.experiment, ...experimentArray];
        const fetchedStats = await fetchLLMStats(updatedExperimentArray);
        //const fetchedAnalysis = await fetchLLMCumulativeAnalysis();
        //setLLMCumulativeAnalysis(fetchedAnalysis);
        setLLMStatistics(fetchedStats);
        

        } catch (error) {
        console.error("Error in handleSubmit:", error instanceof Error ? error.message : "unknown");
        setError(`${error instanceof Error ? error.message : "unknown"}`);
        // Don't clear experiment on error, keep the previous state
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
        console.log('Clearing experiment');
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
        const selectedExperiment = experimentArray[index];
        if (selectedExperiment) {
            setExperiment(selectedExperiment);
            toggleSidebar();
            setIsViewingLLMStats(false);
        }
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


    // test display to view user info
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
    <div className="min-h-screen flex bg-stone-700">
      
      {/* Top Bar */}
      <div className="fixed top-0 w-full justify-between">
        <div className="absolute inset-0 bg-stone-900  p-3 h-20 border-b border-gray-950">
          <img src="/EvallmLogo.png" alt="Evallm" className="mx-auto w-36 h-14" />
        </div> 
        

        <div className="fixed top-3 left-10 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl ">
          <button onClick={toggleSidebar}>Prompt Analytics</button>
        </div>
        <div className="fixed top-3 left-60 space-y-4 bg-emerald-700 hover:bg-emerald-800 transition-all p-3 rounded-xl ">
          <button onClick={toggleViewLLMStats}>LLM Statistics</button>
        </div>

        <Logout />
      </div>


      {/* Responses & Evaluations */}
      {experiment && (
        <div className="flex-1 pt-20 pb-16 ">

          
          <div className="flex p-4  justify-center items-center space-x-96">
            <div className="flex-1 border-stone-900 bg-stone-800 rounded-xl p-4 m-6">
              <h2 className="text-2xl font-semibold text-emerald-500 text-center">User Prompt</h2>
              <p className="text-stone-100 text-center">{experiment.prompt}</p>
            </div>
            <div className="flex-1 border-stone-900 bg-stone-800 rounded-xl p-4 m-6">
              <h2 className="text-2xl font-semibold text-emerald-500 text-center">Expected Output</h2>
              <p className="text-stone-100 text-center">{experiment.expected}</p>
            </div>
          </div>

          <div className="p-4 flex flex-col items-center justify-center">
            <h2 className="text-3xl font-semibold text-emerald-200 p-4">Responses & Evaluations</h2>
            <div className="flex overflow-x-auto space-x-4">
              {Object.entries(experiment.responsesAndEvaluations).map(([model, data]) => (
                <div key={model} className="flex-none border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-96 overflow-x-auto">
                  <div className="flex-1 p-2">
                    <h3 className="text-xl font-semibold text-emerald-500">{model}</h3>
                    <pre className="text-stone-100 whitespace-pre-wrap">{data.response /*JSON.stringify(data, null, 2)*/}</pre>
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
      )}
      
      {/* View LLM Stats llmStatistics*/}
      {isViewingLLMStats && (
      <div className="flex-1 pt-20 pb-16 ">

        <div className="p-4 flex flex-col items-center justify-center">
          <h2 className="text-3xl font-semibold text-emerald-200 p-4">LLM Statistics</h2>
          <div className="flex overflow-x-auto space-x-4">
            {Object.entries(llmStatistics).map(([model, data]) => (
                <div key={model} className="flex-none border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-96 overflow-x-auto">
                  <div className="flex-1 p-2">
                    <h3 className="text-xl font-semibold text-emerald-500">{model}</h3>
                    <pre className="text-stone-100 whitespace-pre-wrap">{formatLLMStats(data)}</pre>
                  </div>
                </div>
              ))}
          </div>
          
          <div className="justify-center border border-stone-900 bg-stone-800 p-4 rounded-xl mb-4 w-[70%] mx-auto">
            <div className="justify-center items-center flex">
              <h3 className="text-xl font-semibold text-emerald-500">Analysis</h3>
            </div>
            
            {/*<pre className="text-stone-100 whitespace-pre-wrap">{llmCumulativeAnalysis}</pre>*/}
            <MarkdownRenderer content={llmCumulativeAnalysis}/>
          </div>
        </div>


    
      </div>
      )}

      


      {/* Error Box */}
      {error && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-stone-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold text-red-600">Error</h2>
            <p className="text-s text-red-600">{error}</p>
            
            <button
              onClick={() => setError(null)}
              className="mt-4 px-4 py-2 bg-red-600 text-stone-900 rounded-xl hover:bg-red-800 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

        
      {/* Bottom Bar */}
      <div className="fixed bottom-0 w-full bg-stone-900 border-t border-gray-950 p-4">

        {/* Input Area */}
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-3 items-center">

            {experiment && (
                          <button
                          onClick={clearExperiment}
                          disabled={isClearing}
                          className="bg-rose-800 text-white px-5 py-3 rounded-xl hover:bg-rose-900 transition-all disabled:bg-rose-950 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isClearing ? "Clearing..." : "Clear Output"}
                        </button>
            )}


            <input
              type="text"
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyPress={e => e.key === "Enter" && handleSubmit()}
              placeholder="User Prompt..."
              className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
            />
            <input
              type="text"
              value={expectedOutput}
              onChange={e => setExpectedOutput(e.target.value)}
              onKeyPress={e => e.key === "Enter" && message && handleSubmit()}
              placeholder="Expected Output..."
              className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
            />


            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-emerald-700 text-white px-5 py-3 rounded-xl hover:bg-emerald-800 transition-all disabled:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>

        

      </div>


      {/* Sidebar */}
      {isSidebarVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60">
          <div className="flex flex-col fixed inset-y-0 left-0 w-64 bg-emerald-950 shadow-lg border-b border-stone-900">

            <div className = "bg-emerald-900 p-4 border-b border-emerald-950">
              <button className="text-xl font-semibold text-white hover:bg-emerald-950 transition-all p-2 rounded-xl" onClick={toggleSidebar}>
                Prompt Analytics
              </button>
            </div>

            {/* Display Prompts:*/}
            <div className="flex-1 overflow-y-auto p-4">

                {experimentArray.map((experimentItem, index) => (
                  experimentItem ? (
                    <button 
                      key={experimentItem.prompt + index} 
                      className="text-left p-2 bg-emerald-800 rounded-xl mb-2 hover:bg-emerald-900 transition-all"
                      onClick={() => switchDisplayPrompt(index)}>
                      <h2 className="text-lg text-stone-100">{experimentItem.prompt}</h2>
                    </button>
                  ) : null
                ))}

            </div>


          </div>

        </div>
        

      )}


      
    </div>
  )
}
