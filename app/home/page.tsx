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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-950 to-black relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-gray-950 to-black opacity-50"></div>
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            
            {/* Header */}
            <Header 
                onToggleSidebar={handleToggleSidebar}
                onToggleStats={handleToggleStats}
                onLogoClick={handleClearExperiment}
            />
            
            {/* Main Content */}
            <div className="relative z-10 flex-1">
                {/* Experiment Display */}
                {currentExperiment && !isViewingLLMStats && (
                    <div className="max-w-6xl mx-auto p-10 pt-24">
                        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/30">
                            <ExperimentDisplay 
                                experiment={currentExperiment}
                            />
                        </div>
                    </div>
                )}

                {/* LLM Statistics Display */}
                {isViewingLLMStats && (
                    <div className="max-w-6xl mx-auto p-6 pt-24">
                        <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/30">
                            <LLMStatsDisplay 
                                statistics={statistics}
                                analysis={analysis}
                            />
                        </div>
                    </div>
                )}

                {/* Input Area (when no experiment is shown) */}
                {!currentExperiment && !isViewingLLMStats && (
                    <div className="flex items-center justify-center min-h-[calc(100vh-5rem)] px-6">
                        <div className="w-full max-w-2xl">
                            <div className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 shadow-2xl shadow-black/30">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent mb-3">
                                        AI Model Evaluation
                                    </h1>
                                    <p className="text-gray-400 text-lg">
                                        Test and compare AI model responses
                                    </p>
                                </div>
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
                        </div>
                    </div>
                )}
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
