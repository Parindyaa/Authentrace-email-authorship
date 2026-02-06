import React from 'react';
import { 
  Inbox, Star, Clock, Send, File, ChevronDown, Plus 
} from 'lucide-react';
import { labelItems } from '../mockdata'; // Ensure labelItems is exported from mockData.js
import clsx from 'clsx';

// Removed TypeScript Interface and React.FC type definition
export const Sidebar = ({ activeNav, setActiveNav, isCollapsed = false }) => {
  const navItems = [
    { icon: Inbox, label: "Inbox", id: 'inbox', count: 3 },
    { icon: Star, label: "Starred", id: 'starred' },
    { icon: Clock, label: "Snoozed", id: 'snoozed' },
    { icon: Send, label: "Sent", id: 'sent' },
    { icon: File, label: "Drafts", id: 'drafts' },
  ];

  return (
    <div className={clsx(
      "flex-shrink-0 bg-white h-full flex flex-col pt-4 transition-all duration-300 border-r border-gray-100",
      isCollapsed ? "w-[72px] items-center" : "w-[260px] pr-4"
    )}>
      {/* Compose Button - Standard Gmail-style UI */}
      <div className={clsx("mb-4", isCollapsed ? "px-2" : "pl-2")}>
        <button className={clsx(
          "flex items-center gap-3 bg-blue-50 text-blue-800 hover:shadow-md hover:bg-blue-100 transition-all rounded-2xl outline-none",
          isCollapsed ? "w-12 h-12 justify-center p-0" : "h-14 px-5 min-w-[140px]"
        )}>
          <Plus className="w-6 h-6" strokeWidth={3} />
          {!isCollapsed && <span className="font-medium tracking-wide">Compose</span>}
        </button>
      </div>

      {/* Primary Navigation Items */}
      <nav className="flex-1 overflow-y-auto px-2 custom-scrollbar">
        <div className="flex flex-col gap-0.5">
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={clsx(
                  "flex items-center gap-4 py-2 rounded-r-full transition-all outline-none",
                   isCollapsed ? "justify-center px-0 w-10 h-10 rounded-full mx-auto" : "pl-6 pr-4 w-full",
                   isActive 
                    ? "bg-blue-100 text-blue-800 font-bold shadow-sm" 
                    : "text-gray-600 hover:bg-gray-100"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className={clsx("w-5 h-5", isActive && "fill-current")} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left text-sm">{item.label}</span>
                    {item.count && (
                      <span className="text-xs font-semibold">{item.count}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
          
          <button className={clsx(
            "flex items-center gap-4 py-2 rounded-r-full text-gray-600 hover:bg-gray-100 transition-colors mt-1 outline-none",
            isCollapsed ? "justify-center px-0 w-10 rounded-full mx-auto" : "pl-6 pr-4 w-full"
          )}>
            <ChevronDown className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">More</span>}
          </button>
        </div>

        {/* Dynamic Labels Section - Useful for sorting by Risk Level */}
        {!isCollapsed && (
          <div className="mt-8">
            <div className="px-6 flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Labels</h3>
              <button className="text-gray-400 hover:text-gray-600 outline-none">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-col gap-0.5">
              {(labelItems || []).map((item, index) => (
                <button
                  key={index}
                  className="flex items-center gap-4 pl-6 pr-4 py-2 rounded-r-full text-gray-600 hover:bg-gray-100 transition-all outline-none group"
                >
                  <div className={clsx(
                    "w-2 h-2 rounded-full transition-transform group-hover:scale-125",
                    item.color || "bg-gray-400"
                  )} />
                  <span className="text-sm flex-1 text-left truncate font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};