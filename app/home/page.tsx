"use client"
import React, { useEffect } from 'react';
import { redirect } from "next/navigation";
import { useDashboard } from '@/hooks/useDashboard';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import InputArea from '@/components/InputArea';
import ExperimentDisplay from '@/components/ExperimentDisplay';
import LLMStatsDisplay from '@/components/LLMStatsDisplay';
import ErrorModal from '@/components/ErrorModal';

export default function Home() {
    const {
        // Session
        session,
        status,
        
        // Form state
        message,
        expectedOutput,
        setMessage,
        setExpectedOutput,
        
        // UI state
        isLoading,
        isClearing,
        isSidebarVisible,
        isViewingLLMStats,
        error,
        
        // Data
        experiments,
        currentExperiment,
        statistics,
        analysis,
        
        // Actions
        handleSubmit,
        handleClearExperiment,
        handleToggleSidebar,
        handleToggleStats,
        handleSelectExperiment,
        handleCloseError,
    } = useDashboard();

    // Redirect if not authenticated
    useEffect(() => {
        if (status === "loading") return; // Still loading
        if (!session) {
            redirect("/");
        }
    }, [session, status]);

    return (
        <div className="min-h-screen flex bg-stone-700">
            {/* Header */}
            <Header 
                onToggleSidebar={handleToggleSidebar}
                onToggleStats={handleToggleStats}
            />
            {/* Main Content */}
            <div className="flex-1 pt-20 pb-16">
                {/* Experiment Display */}
                {currentExperiment && !isViewingLLMStats && (
                    <ExperimentDisplay 
                        experiment={currentExperiment}
                    />
                )}

                {/* LLM Statistics Display */}
                {isViewingLLMStats && (
                    <LLMStatsDisplay 
                        statistics={statistics}
                        analysis={analysis}
                    />
                )}

                {/* Input Area (when no experiment is shown) */}
                {!currentExperiment && !isViewingLLMStats && (
                    <div className="flex items-center justify-center h-full">
                        <InputArea
                            message={message}
                            expectedOutput={expectedOutput}
                            onMessageChange={setMessage}
                            onExpectedOutputChange={setExpectedOutput}
                            onSubmit={handleSubmit}
                            isLoading={isLoading}
                            hasExperiment={!!currentExperiment}
                            onClear={handleClearExperiment}
                            isClearing={isClearing}
                        />
                    </div>
                )}
            </div>

            {/* Bottom Input Bar (always visible) */}
            <div className="fixed bottom-0 w-full bg-stone-900 border-t border-gray-950 p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex gap-3 items-center">
                        {currentExperiment && (
                            <button
                                onClick={handleClearExperiment}
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
            <Sidebar
                experiments={experiments}
                isVisible={isSidebarVisible}
                onSelectExperiment={handleSelectExperiment}
                onClose={handleToggleSidebar}
            />

            {/* Error Modal */}
            <ErrorModal
                error={error}
                onClose={handleCloseError}
            />
        </div>
    );
}
