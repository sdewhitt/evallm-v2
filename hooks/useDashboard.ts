import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Experiment, ModelStatistics, MODELS } from '@/types';
import { calculateLLMStats, getDefaultModelStatistics } from '@/lib/utils';

export const useDashboard = () => {
  const { data: session, status } = useSession();
  
  // Form state
  const [message, setMessage] = useState('');
  const [expectedOutput, setExpectedOutput] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isViewingLLMStats, setIsViewingLLMStats] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedUserData, setHasLoadedUserData] = useState(false);
  
  // Data state
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [currentExperiment, setCurrentExperiment] = useState<Experiment | null>(null);
  const [statistics, setStatistics] = useState<ModelStatistics>(getDefaultModelStatistics());
  const [analysis, setAnalysis] = useState<string>('');

  // Load user's historical data when authenticated
  useEffect(() => {
    const loadUserData = async () => {
      if (session?.user?.email && status === "authenticated" && !hasLoadedUserData) {
        try {
          console.log('Loading user data for:', session.user.email);
          const response = await fetch("/api/user-data");
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.prompts) {
              setExperiments(data.prompts);
              console.log('Loaded historical data:', data.prompts.length, 'experiments');
              setHasLoadedUserData(true);
              
              // Update statistics with loaded data
              if (data.prompts.length > 0) {
                updateStatistics(data.prompts);
              }
            }
          } else {
            console.error('Failed to load user data:', response.statusText);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setError('Failed to load user data');
        }
      }
    };
    
    loadUserData();
  }, [session?.user?.email, status, hasLoadedUserData]);

  // Update statistics
  const updateStatistics = useCallback(async (experimentsData: Experiment[]) => {
    try {
      const newStats: ModelStatistics = {};
      
      for (const model of MODELS) {
        newStats[model] = calculateLLMStats(model, experimentsData);
      }
      
      setStatistics(newStats);
      
      // Fetch analysis
      const response = await fetch("/api/analytics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ llmStatistics: newStats, experiments: experimentsData }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.Analysis || '');
      }
    } catch (error) {
      console.error('Error updating statistics:', error);
      setError('Failed to update statistics');
    }
  }, []);

  // Handle experiment submission
  const handleSubmit = useCallback(async () => {
    if (!message.trim() || !expectedOutput.trim()) {
      setError("Please enter a user prompt and an expected output.");
      return;
    }

    const currentMessage = message;
    const currentExpectedOutput = expectedOutput;
    
    // Clear form and set loading
    setMessage("");
    setExpectedOutput("");
    setIsLoading(true);
    setCurrentExperiment(null);
    setIsViewingLLMStats(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: currentMessage, 
          expectedOutput: currentExpectedOutput, 
          email: session?.user?.email 
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Validate the experiment data
      if (!data.experiment || !data.experiment.prompt || !data.experiment.expected) {
        throw new Error('Invalid experiment data received from API');
      }
      
      // Update experiments list
      const updatedExperiments = [data.experiment, ...experiments];
      setExperiments(updatedExperiments);
      setCurrentExperiment(data.experiment);
      
      // Update statistics
      await updateStatistics(updatedExperiments);
      
      console.log('Experiment completed successfully');
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError(error instanceof Error ? error.message : "An unknown error occurred");
      // Restore form values on error
      setMessage(currentMessage);
      setExpectedOutput(currentExpectedOutput);
    } finally {
      setIsLoading(false);
    }
  }, [message, expectedOutput, session?.user?.email, experiments, updateStatistics]);

  // Clear current experiment
  const handleClearExperiment = useCallback(async () => {
    setIsClearing(true);
    try {
      setCurrentExperiment(null);
      setIsViewingLLMStats(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to clear experiment");
    } finally {
      setIsClearing(false);
    }
  }, []);

  // Toggle sidebar
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarVisible(!isSidebarVisible);
    if (isViewingLLMStats) {
      setIsViewingLLMStats(false);
    }
  }, [isSidebarVisible, isViewingLLMStats]);

  // Toggle statistics view
  const handleToggleStats = useCallback(() => {
    setIsViewingLLMStats(!isViewingLLMStats);
    setIsSidebarVisible(false);
    setCurrentExperiment(null);
  }, [isViewingLLMStats]);

  // Select experiment from sidebar
  const handleSelectExperiment = useCallback((index: number) => {
    const selectedExperiment = experiments[index];
    if (selectedExperiment) {
      setCurrentExperiment(selectedExperiment);
      setIsSidebarVisible(false);
      setIsViewingLLMStats(false);
    }
  }, [experiments]);

  // Close error modal
  const handleCloseError = useCallback(() => {
    setError(null);
  }, []);

  return {
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
  };
};
