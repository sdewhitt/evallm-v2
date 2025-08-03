import React from 'react';
import Button from '@/components/ui/Button';

interface InputAreaProps {
  message: string;
  expectedOutput: string;
  isLoading: boolean;
  hasExperiment: boolean;
  onMessageChange: (value: string) => void;
  onExpectedOutputChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isClearing: boolean;
}

const InputArea: React.FC<InputAreaProps> = ({
  message,
  expectedOutput,
  isLoading,
  hasExperiment,
  onMessageChange,
  onExpectedOutputChange,
  onSubmit,
  onClear,
  isClearing
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && message.trim() && expectedOutput.trim()) {
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              User Prompt
            </label>
            <textarea
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              className="w-full rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 shadow-lg transition-all duration-200 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expected Output
            </label>
            <textarea
              value={expectedOutput}
              onChange={e => onExpectedOutputChange(e.target.value)}
              placeholder="Enter expected response..."
              rows={4}
              className="w-full rounded-xl border border-gray-700/50 bg-gray-800/80 backdrop-blur-sm px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent placeholder-gray-400 shadow-lg transition-all duration-200 resize-none"
            />
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-4">
          {hasExperiment && (
            <Button
              onClick={onClear}
              disabled={isClearing}
              variant="danger"
              size="md"
            >
              {isClearing ? "Clearing..." : "Clear Output"}
            </Button>
          )}

          <Button
            onClick={onSubmit}
            disabled={isLoading || !message.trim() || !expectedOutput.trim()}
            isLoading={isLoading}
            size="md"
            className="min-w-32"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
