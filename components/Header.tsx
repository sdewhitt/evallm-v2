import React from 'react';
import Button from '@/components/ui/Button';
import Logout from '@/components/Logout';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleStats: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleStats }) => {
  return (
    <div className="fixed top-0 w-full justify-between">
      <div className="absolute inset-0 bg-stone-900 p-3 h-20 border-b border-gray-950">
        <img src="/EvallmLogo.png" alt="Evallm" className="mx-auto w-36 h-14" />
      </div>

      <div className="fixed top-3 left-10 space-y-4">
        <Button onClick={onToggleSidebar} size="sm">
          Prompt Analytics
        </Button>
      </div>
      
      <div className="fixed top-3 left-60 space-y-4">
        <Button onClick={onToggleStats} size="sm">
          LLM Statistics
        </Button>
      </div>

      <Logout />
    </div>
  );
};

export default Header;
