import React from 'react';
import Button from '@/components/ui/Button';
import Logout from '@/components/Logout';

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleStats: () => void;
  onLogoClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleStats, onLogoClick }) => {
  return (
    <div className="fixed top-0 w-full z-30">
      <div className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 p-3 h-20 shadow-lg">
        <button 
          onClick={onLogoClick}
          className="block mx-auto transition-transform duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 rounded-lg p-1"
        >
          <img src="/EvallmLogo.png" alt="Evallm" className="w-36 h-14" />
        </button>
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
