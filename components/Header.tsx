import React from 'react';
import { Sprout, Tractor, ShoppingBasket, Cloud, LogOut, User as UserIcon } from 'lucide-react';
import { User } from '../types';
import { CloudinaryImage } from './CloudinaryImage';

interface HeaderProps {
  goHome: () => void;
  mode: 'infield' | 'outfield';
  onToggleMode: (mode: 'infield' | 'outfield') => void;
  onOpenCloudinary?: () => void;
  currentUser?: User | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  goHome,
  mode,
  onToggleMode,
  onOpenCloudinary,
  currentUser,
  onLogout
}) => {
  return (
    <header className="bg-emerald-800 text-white p-3 sm:p-4 shadow-md sticky top-0 z-50 border-b border-emerald-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
        
        {/* Logo Section */}
        <div 
          onClick={goHome} 
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-95 transition-opacity"
        >
          <div className="bg-emerald-950 p-2 rounded-xl shadow-inner border border-emerald-700/50">
            <Sprout size={26} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-wide leading-none text-white">KRISHI-MART</h1>
            <span className="text-[11px] text-emerald-200 font-medium">Farmer-First Marketplace</span>
          </div>
        </div>

        {/* CORE WORKFLOW TOGGLE */}
        <div className="flex bg-emerald-950/80 rounded-full p-1 border border-emerald-700/60 shadow-inner">
          <button
            onClick={() => onToggleMode('infield')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              mode === 'infield' 
                ? 'bg-yellow-400 text-emerald-950 shadow-md' 
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <Tractor size={15} />
            INFIELD
            <span className="hidden sm:inline font-normal opacity-75 ml-0.5">(Grow)</span>
          </button>

          <button
            onClick={() => onToggleMode('outfield')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
              mode === 'outfield' 
                ? 'bg-white text-emerald-950 shadow-md' 
                : 'text-emerald-300 hover:text-white'
            }`}
          >
            <ShoppingBasket size={15} />
            OUTFIELD
            <span className="hidden sm:inline font-normal opacity-75 ml-0.5">(Harvest)</span>
          </button>
        </div>

        {/* RIGHT SIDE ACTIONS: Cloudinary Media Hub & User Avatar / Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenCloudinary && (
            <button
              onClick={onOpenCloudinary}
              className="flex items-center gap-1.5 bg-emerald-900/90 hover:bg-emerald-700 border border-emerald-600/70 text-emerald-100 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs transition-all"
              title="Cloudinary Media & CDN Manager"
            >
              <Cloud size={15} className="text-cyan-300 animate-pulse" />
              <span className="hidden sm:inline">Cloudinary</span> Hub
            </button>
          )}

          {currentUser && (
            <div className="flex items-center gap-2 bg-emerald-950/60 pl-2 pr-1 py-1 rounded-xl border border-emerald-700/50">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-300 capitalize">{currentUser.role}</div>
              </div>

              {currentUser.avatarUrl ? (
                <CloudinaryImage
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  transformations={{ width: 64, height: 64, crop: 'thumb', gravity: 'face', radius: 'max' }}
                  className="w-7 h-7 rounded-full border border-emerald-400 object-cover"
                />
              ) : (
                <div className="w-7 h-7 bg-emerald-700 rounded-full flex items-center justify-center text-white border border-emerald-500">
                  <UserIcon size={14} />
                </div>
              )}

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1 hover:bg-emerald-800 rounded-lg text-emerald-300 hover:text-red-300 transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
};