import React, { useState } from 'react';
import { Inbox, LayoutDashboard, X } from 'lucide-react';
import clsx from 'clsx';

// Components
import { Sidebar } from './Components/Sidebar';
import { EmailList } from './Components/EmailList';
import { ReadingPane } from './Components/ReadingPane';
import { Dashboard } from './Components/Dashboard';
import { Header } from './Components/Header';
import { mockEmails } from './mockdata';

const App = () => {
  // 1. State Management
  const [activeNav, setActiveNav] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('inbox');

  // 2. Selection Logic
  const selectedEmail = selectedEmailId 
    ? mockEmails.find(e => e.id === selectedEmailId) || null 
    : null;

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-gray-900 overflow-hidden">
      {/* Top Navigation Bar */}
      <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={setActiveNav}
          isCollapsed={isSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-tl-2xl border-t border-l border-gray-200 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)] ml-[-1px] mt-[-1px] z-0 relative overflow-hidden">
            
            {/* View Toggle Tabs (Gmail style) */}
            <div className="flex items-center px-4 pt-2 bg-white border-b border-gray-200">
                <button 
                  onClick={() => setViewMode('inbox')}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors hover:bg-gray-50 outline-none",
                    viewMode === 'inbox' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
                  )}
                >
                  <Inbox className="w-4 h-4" />
                  <span className="text-sm font-medium">Primary Inbox</span>
                </button>
                
                <button 
                  onClick={() => setViewMode('dashboard')}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors hover:bg-gray-50 outline-none",
                    viewMode === 'dashboard' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Forensic Dashboard</span>
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full ml-1">3</span>
                </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex overflow-hidden bg-white">
              {viewMode === 'inbox' ? (
                  <>
                    <EmailList 
                      emails={mockEmails} 
                      selectedEmailId={selectedEmailId} 
                      onSelectEmail={setSelectedEmailId}
                    />

                    {/* Sliding Reading Pane for Forensic Analysis */}
                    {selectedEmail && (
                      <div className="w-[60%] border-l border-gray-200 shadow-2xl z-20 absolute inset-y-0 right-0 bg-white transition-transform duration-300">
                          <div className="h-full flex flex-col">
                            <div className="flex justify-end p-2 bg-white sticky top-0 border-b border-gray-100">
                                <button onClick={() => setSelectedEmailId(null)} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                                  <X size={20} />
                                </button>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <ReadingPane email={selectedEmail} />
                            </div>
                          </div>
                      </div>
                    )}
                  </>
              ) : (
                  <Dashboard />
              )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;