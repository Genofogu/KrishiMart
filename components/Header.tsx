import React from 'react';
import { Sprout, Tractor, ShoppingBasket } from 'lucide-react';

interface HeaderProps {
  goHome: () => void;
  mode: 'infield' | 'outfield';
  onToggleMode: (mode: 'infield' | 'outfield') => void;
}

export const Header: React.FC<HeaderProps> = ({ goHome, mode, onToggleMode }) => {
  return (
    <header className="bg-green-700 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        
        {/* Logo Section */}
        <div 
          onClick={goHome} 
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Sprout size={32} className="text-yellow-300" />
          <div>
            <h1 className="text-2xl font-bold tracking-wide leading-none">KRISHI-MART</h1>
            <span className="text-xs text-green-200">Farmer-First Marketplace</span>
          </div>
        </div>

        {/* NEW: THE CORE FEATURE TOGGLE */}
        {/* This slider represents the workflow: Growing (Infield) -> Selling (Outfield) */}
        <div className="flex bg-green-900 rounded-full p-1 shadow-inner">
          <button
            onClick={() => onToggleMode('infield')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              mode === 'infield' 
                ? 'bg-yellow-400 text-green-900 shadow-md' 
                : 'text-green-300 hover:text-white'
            }`}
          >
            <Tractor size={16} />
            INFIELD
            <span className="hidden md:inline font-normal opacity-75 ml-1">(Grow)</span>
          </button>

          <button
            onClick={() => onToggleMode('outfield')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
              mode === 'outfield' 
                ? 'bg-white text-green-900 shadow-md' 
                : 'text-green-300 hover:text-white'
            }`}
          >
            <ShoppingBasket size={16} />
            OUTFIELD
            <span className="hidden md:inline font-normal opacity-75 ml-1">(Harvest)</span>
          </button>
        </div>

      </div>
    </header>
  );
};