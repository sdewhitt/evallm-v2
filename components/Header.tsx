import React from 'react';
import Button from '@/components/ui/Button';
import Logout from '@/components/Logout';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleStats: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleStats }) => {
  return (
    <div className="fixed top-0 w-full z-30">
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-3 h-20 shadow-lg">
        <img src="/EvallmLogo.png" alt="Evallm" className="mx-auto w-36 h-14" />
      </div>

      <div className="fixed top-3 left-10 space-y-4 p-2 z-40">
        <Button onClick={onToggleSidebar} size="sm">
          Prompt Analytics
        </Button>
      </div>

      <div className="fixed top-3 left-60 space-y-4 p-2 z-40">
        <Button onClick={onToggleStats} size="sm">
          LLM Statistics
        </Button>
      </div>

      <Logout />
    </div>
  );
};

export default Header;
