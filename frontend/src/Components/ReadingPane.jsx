import React from 'react';
import { 
  Reply, Forward, Archive, Flag, MoreHorizontal, ShieldAlert, 
  Trash2, MailOpen, Star, ShieldCheck, ChevronLeft, ChevronRight, ChevronDown 
} from 'lucide-react';
import clsx from 'clsx';

export const ReadingPane = ({ email, report, isAnalyzing, error, onRunAnalysis }) => {
  // Empty state if no email is selected
  if (!email) {
    return (
      <div className="flex-1 h-full bg-white flex flex-col items-center justify-center text-gray-400">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <MailPlaceholder />
        </div>
        <p className="text-sm">Select an email to view forensic analysis</p>
      </div>
    );
  }

  // Logic to determine if security warnings should show
  const isRisk = email.riskLevel === 'high' || email.riskLevel === 'suspicious' || email.status === 'warning';

  return (
    <div className="flex-1 h-full bg-white flex flex-col min-w-0">
      {/* Toolbar - Modern Security Actions */}
      <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 bg-white sticky top-0 z-10">
        <div className="flex items-center gap-1">
          <ActionButton icon={Archive} tooltip="Archive" />
          <ActionButton icon={Flag} tooltip="Report spam" />
          <ActionButton icon={Trash2} tooltip="Delete" />
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <ActionButton icon={MailOpen} tooltip="Mark as unread" />
          <ActionButton icon={MoreHorizontal} tooltip="More" />
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span className="text-xs">1 of 24</span>
          <div className="flex">
             <button className="p-2 rounded-full hover:bg-gray-100"><ChevronLeft size={16}/></button>
             <button className="p-2 rounded-full hover:bg-gray-100"><ChevronRight size={16}/></button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-4xl mx-auto">
          {/* Email Subject Section */}
          <div className="flex items-start justify-between mb-6">
            <h1 className="text-2xl font-normal text-gray-900 leading-tight">
              {email.subject}
            </h1>
            <div className="flex items-center gap-2">
               <span className="px-2 py-1 bg-gray-100 text-[10px] font-bold text-gray-600 rounded uppercase tracking-wide">Inbox</span>
               <button className="text-gray-300 hover:text-yellow-400 transition-colors">
                 <Star className={clsx("w-5 h-5", email.starred && "fill-yellow-400 text-yellow-400")} />
               </button>
            </div>
          </div>

          {/* Sender Details */}
          <div className="flex items-start gap-4 mb-8">
             <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg select-none">
                {(email.senderName || email.sender || 'U').charAt(0).toUpperCase()}
             </div>
             <div className="flex-1">
                <div className="flex items-baseline justify-between">
                   <div>
                      <span className="font-bold text-gray-900">{email.senderName || email.sender}</span>
                      <span className="text-sm text-gray-400 ml-2 hidden sm:inline">{`<${email.senderEmail || email.sender}>`}</span>
                   </div>
                   <span className="text-xs text-gray-500">{email.timestamp || email.time}</span>
                </div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  to me <ChevronDown size={12} />
                </div>
             </div>
          </div>

          {/* Explainable AI (XAI) Panel */}
          {isRisk ? (
            <div className={clsx(
              "mb-8 rounded-xl border-2 overflow-hidden shadow-sm",
              email.riskLevel === 'high' ? "bg-rose-50 border-rose-200" : "bg-amber-50 border-amber-200"
            )}>
               <div className="p-5 flex items-start gap-4">
                  <div className={clsx("p-2 rounded-full shadow-inner", email.riskLevel === 'high' ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600")}>
                      <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                     <h3 className={clsx("text-base font-bold mb-1", email.riskLevel === 'high' ? "text-rose-900" : "text-amber-900")}>
                       {email.riskLevel === 'high' ? "High Risk Identity Anomaly" : "Suspicious Sender Identity"}
                     </h3>
                     <p className={clsx("text-sm mb-4 leading-relaxed", email.riskLevel === 'high' ? "text-rose-800" : "text-amber-800")}>
                       Our AuthenTrace ML model detected a mismatch between this email's style and the claimed sender's historical profile.
                     </p>

                     {/* Forensic Indicators Grid */}
                     {/** compute reasons and score from report if available */}
                     {
                       (() => {
                         const reasons = (report && (report.reasons || report.reasons)) || email.riskReasons || [];
                         const score = (report && (typeof report.score === 'number' ? report.score : undefined)) ?? email.riskScore ?? 0;
                         const pct = Math.min(100, Math.round((score / 5) * 100));

                         return (
                           <div className="flex flex-col sm:flex-row gap-6 mb-4">
                        {/* Risk Meter */}
                        <div className="w-full sm:w-32 flex-shrink-0">
                           <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60">Identity Score</div>
                           <div className="relative h-2 bg-gray-200 rounded-full mb-1">
                              <div 
                                className={clsx("absolute top-0 left-0 h-full rounded-full transition-all duration-1000", email.riskLevel === 'high' ? "bg-rose-600" : "bg-amber-500")} 
                                style={{ width: email.riskLevel === 'high' ? '88%' : '65%' }}
                              />
                           </div>
                           <div className="text-right text-[10px] font-black uppercase">{pct}% Anomaly</div>
                        </div>

                        {/* Explainable Reasons */}
                        <div className="flex-1">
                           <div className="text-[10px] font-bold uppercase tracking-wider mb-2 opacity-60">Forensic Reasons</div>
                           <ul className="space-y-1.5">
                              {(reasons.length ? reasons : ["Stylometric mismatch", "Unusual sending time"]).map((reason, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-2 font-medium">
                                  <span className={clsx("mt-1 w-1.5 h-1.5 rounded-full flex-shrink-0", email.riskLevel === 'high' ? "bg-rose-500" : "bg-amber-500")} />
                                  <span>{reason}</span>
                                </li>
                              ))}
                           </ul>
                        </div>
                     </div>
                           );
                          })()
                        }

                     {/* Analyst Actions */}
                     <div className="flex gap-3 items-center justify-between">
                        <div className="flex gap-3">
                          <button className={clsx(
                              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border shadow-sm",
                              email.riskLevel === 'high' 
                                ? "bg-rose-600 text-white border-rose-600 hover:bg-rose-700" 
                                : "bg-amber-600 text-white border-amber-600 hover:bg-amber-700"
                          )}>
                             Block Sender
                          </button>
                          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
                             Whitelist Identity
                          </button>
                        </div>

                        {onRunAnalysis && (
                          <div className="text-right">
                            <button
                              onClick={() => onRunAnalysis(email)}
                              disabled={isAnalyzing}
                              className={clsx(
                                "px-3 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all border shadow-sm",
                                isAnalyzing ? "bg-gray-200 text-gray-600 border-gray-200" : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                              )}
                            >
                              {isAnalyzing ? "Analyzing..." : "Run Forensic Analysis"}
                            </button>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 shadow-sm">
               <ShieldCheck className="w-5 h-5 text-emerald-600" />
               <span className="text-sm text-emerald-800 font-medium tracking-tight">Digital DNA Verified: This email matches the sender's stylometric profile.</span>
            </div>
          )}

          {/* Email Body Content */}
          <div className="prose prose-sm max-w-none text-gray-800 leading-relaxed font-sans whitespace-pre-wrap min-h-[200px] border-l-2 border-gray-50 pl-6 italic">
            {email.body}
          </div>

          {/* Response Actions */}
          <div className="mt-12 pt-8 border-t border-gray-100 flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2 border border-gray-200 text-gray-600 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all hover:shadow-md">
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button className="flex items-center gap-2 px-6 py-2 border border-gray-200 text-gray-600 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-gray-50 transition-all hover:shadow-md">
              <Forward className="w-4 h-4" />
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components
const ActionButton = ({ icon: Icon, tooltip, className }) => (
  <button className={clsx("p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors relative outline-none", className)} title={tooltip}>
    <Icon size={20} />
  </button>
);

const MailPlaceholder = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);