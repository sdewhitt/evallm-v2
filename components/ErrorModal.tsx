import React from 'react';
import Button from '@/components/ui/Button';

interface ErrorModalProps {
  error: string | null;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
  if (!error) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-stone-800 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Error</h2>
        <p className="text-red-400 mb-6">{error}</p>
        
        <Button
          onClick={onClose}
          variant="danger"
          className="w-full"
        >
          Close
        </Button>
      </div>
    </div>
  );
};

export default ErrorModal;
