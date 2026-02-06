import React, { useState } from 'react';
import { Inbox, LayoutDashboard, X, Share2 } from 'lucide-react'; // Added Share2 for Social tab
import clsx from 'clsx';

// Components
import { Sidebar } from './Components/Sidebar';
import { EmailList } from './Components/EmailList';
import { ReadingPane } from './Components/ReadingPane';
import { Dashboard } from './Components/Dashboard';
import { Header } from './Components/Header';
import { SocialGraphView } from './Components/SocialGraphView';

// Data - Updated to lowercase to match your new filename
import { mockEmails } from './mockdata';

const App = () => {
  const [activeNav, setActiveNav] = useState('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState('inbox');

  const selectedEmail = selectedEmailId 
    ? mockEmails.find(e => e.id === selectedEmailId) || null 
    : null;

  return (
    <div className="flex flex-col h-screen w-full bg-white font-sans text-gray-900 overflow-hidden">
      <Header onMenuClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={setActiveNav}
          isCollapsed={isSidebarCollapsed}
        />

        <div className="flex-1 flex flex-col min-w-0 bg-white rounded-tl-2xl border-t border-l border-gray-200 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)] ml-[-1px] mt-[-1px] z-0 relative overflow-hidden">
            
            {/* View Toggle Tabs */}
            <div className="flex items-center px-4 pt-2 bg-white border-b border-gray-200">
                <button 
                  onClick={() => setViewMode('inbox')}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors outline-none",
                    viewMode === 'inbox' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
                  )}
                >
                  <Inbox className="w-4 h-4" />
                  <span className="text-sm font-medium">Primary Inbox</span>
                </button>

                <button 
                  onClick={() => setViewMode('social')}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors outline-none",
                    viewMode === 'social' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
                  )}
                >
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Interaction Map</span>
                </button>
                
                <button 
                  onClick={() => setViewMode('dashboard')}
                  className={clsx(
                    "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors outline-none",
                    viewMode === 'dashboard' ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
                  )}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-medium">Forensic Dashboard</span>
                </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-1 flex overflow-hidden bg-white relative">
              {viewMode === 'inbox' && (
                  <>
                    <EmailList 
                      emails={mockEmails} 
                      selectedEmailId={selectedEmailId} 
                      onSelectEmail={setSelectedEmailId}
                    />

                    {selectedEmail && (
                        <div className="w-[60%] border-l border-gray-200 shadow-2xl z-20 absolute inset-y-0 right-0 bg-white transition-transform duration-300">
                          <div className="h-full flex flex-col">
                              <div className="flex justify-end p-2 border-b border-gray-100">
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
              )}

              {viewMode === 'social' && (
                <div className="flex-1 p-4 bg-gray-50">
                  <SocialGraphView />
                </div>
              )}

              {viewMode === 'dashboard' && <Dashboard />}
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;