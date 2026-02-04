import React from 'react';
import { Menu, Search, SlidersHorizontal, Settings, HelpCircle, Grip } from 'lucide-react';

// Removed the TypeScript Interface and React.FC type definition
export const Header = ({ onMenuClick }) => {
  return (
    <header className="h-16 flex items-center justify-between px-4 bg-white border-b border-gray-200 sticky top-0 z-50 shrink-0">
      {/* Brand / Logo Section */}
      <div className="flex items-center gap-4 w-[260px]">
        <button 
          onClick={onMenuClick} 
          className="p-3 hover:bg-gray-100 rounded-full text-gray-600 outline-none transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 cursor-default">
           {/* Logo - Matches your security-focused branding */}
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
             A
           </div>
           <span className="text-xl font-medium text-gray-700 tracking-tight">AuthenTrace</span>
        </div>
      </div>

      {/* Search Bar - Central Forensic Search */}
      <div className="flex-1 max-w-2xl mx-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-12 pr-12 py-3 bg-gray-100 border-none rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 focus:shadow-md transition-all sm:text-base"
            placeholder="Search mail for anomalies..."
          />
          <button className="absolute inset-y-0 right-0 pr-4 flex items-center outline-none">
            <SlidersHorizontal className="h-5 w-5 text-gray-600 hover:text-gray-900 cursor-pointer" />
          </button>
        </div>
      </div>

      {/* Utility / Profile Section */}
      <div className="flex items-center justify-end gap-2 w-[260px]">
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
          <HelpCircle className="w-6 h-6" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden md:block">
          <Settings className="w-6 h-6" />
        </button>
        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors hidden sm:block">
          <Grip className="w-6 h-6" />
        </button>
        
        {/* User Initials - Represents the Security Analyst Profile */}
        <div className="ml-2 w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium cursor-pointer ring-4 ring-transparent hover:ring-gray-100 transition-all">
          CS
        </div>
      </div>
    </header>
  );
};