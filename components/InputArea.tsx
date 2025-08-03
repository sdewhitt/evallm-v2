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
    <div className="fixed bottom-0 w-full bg-stone-900 border-t border-gray-950 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-3 items-center">
          
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

          <input
            type="text"
            value={message}
            onChange={e => onMessageChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="User Prompt..."
            className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
          />
          
          <input
            type="text"
            value={expectedOutput}
            onChange={e => onExpectedOutputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Expected Output..."
            className="flex-1 rounded-xl border border-stone-700 bg-stone-800 px-4 py-3 text-stone-100 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent placeholder-stone-400"
          />

          <Button
            onClick={onSubmit}
            disabled={isLoading || !message.trim() || !expectedOutput.trim()}
            isLoading={isLoading}
            size="md"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InputArea;
