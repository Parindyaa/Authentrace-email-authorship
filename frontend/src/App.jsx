import React, { useState, useEffect, useMemo } from "react";
import { Inbox, LayoutDashboard, X, Share2 } from "lucide-react";
import clsx from "clsx";

// Components
import { Sidebar } from "./Components/Sidebar";
import { EmailList } from "./Components/EmailList";
import { ReadingPane } from "./Components/ReadingPane";
import { Dashboard } from "./Components/Dashboard";
import { Header } from "./Components/Header";
import SocialGraphView from "./Components/SocialGraphView";

// API Services
import { verifyEmail } from "./api/verify";
import { fetchEmails } from "./api/email";

const DEFAULT_THRESHOLD = 2.5;

// Decide badge from ML output
function decisionToRisk(decision) {
  // Accept either legacy decision string or the full report object.
  if (!decision) return "pending";
  // If caller passed the full report object
  if (typeof decision === "object") {
    // Prefer numeric score if present (more granular)
    if (typeof decision.score === "number") {
      if (decision.score >= 1.5) return "high";
      if (decision.score >= 0.8) return "suspicious";
      return "safe";
    }
    // Fallback to boolean authenticity
    if (typeof decision.is_authentic === "boolean") return decision.is_authentic ? "safe" : "high";
    return "pending";
  }
  // Legacy string values
  if (decision === "FLAGGED") return "high";
  if (decision === "CLEAN") return "safe";
  return "pending";
}

const App = () => {
  const [activeNav, setActiveNav] = useState("inbox");
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState("inbox");

  // Real inbox state
  const [emails, setEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(true);
  const [emailsError, setEmailsError] = useState("");

  // Forensic report (for selected email pane/dashboard)
  const [forensicReport, setForensicReport] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mlError, setMlError] = useState("");

  // 1) Load emails from backend
  useEffect(() => {
    async function loadInbox() {
      setLoadingEmails(true);
      setEmailsError("");

      try {
        const data = await fetchEmails(50, 0);

        const mapped = (data.items || []).map((e) => ({
          // Normalize id to string to ensure consistent comparisons
          id: String(e.id ?? (typeof e.id === 'number' ? e.id : '')),
          // Prefer a displayName (for sent-folder messages) then senderName when available; fall back to sender/from
          senderName: e.displayName || e.senderName || e.sender || e.from || "",
          sender: e.sender || e.from || (e.senderName ? undefined : ""),
          subject: e.subject && String(e.subject).trim() ? e.subject : "(no subject)",
          preview: e.preview || (e.body ? String(e.body).substring(0, 120) : ""),
          body: e.body || e.content || "",
          recipients: e.recipients || [],
          fromEmail: e.sender || e.from || "",
          toEmails: e.recipients || [],
          sent_at: e.sent_at || e.timestamp || e.time || "",
          time: e.sent_at ? new Date(e.sent_at).toLocaleString() : e.time || "",
          // Use backend-provided ML outputs when present
          riskLevel: e.riskLevel || e.status || "pending",
          mlResult: e.mlResult || null,
          riskScore: e.riskScore ?? (e.mlResult ? e.mlResult.score : undefined),
          riskReasons: (e.mlResult && (e.mlResult.reasons || e.mlResult.reasons)) || [],
          read: Boolean(e.read),
          starred: Boolean(e.starred),
        }));

        setEmails(mapped);
        if (mapped.length > 0) setSelectedEmailId(mapped[0].id);
      } catch (err) {
        console.error(err);
        setEmailsError(String(err?.message || err));
        setEmails([]);
      } finally {
        setLoadingEmails(false);
      }
    }

    loadInbox();
  }, []);

  // 2) Selected email object
  const selectedEmail = useMemo(() => {
    if (selectedEmailId === null || selectedEmailId === undefined) return null;
    return emails.find((e) => e.id === selectedEmailId) || null;
  }, [selectedEmailId, emails]);

  // 3) Build verify payload
  const buildVerifyPayload = (mail) => {
    const claimed_sender =
      mail.fromEmail ||
      mail.senderEmail ||
      mail.from ||
      mail.sender ||
      "no.address@enron.com";

    let recipientsRaw = mail.toEmails || mail.recipients || mail.to || [];
    if (Array.isArray(recipientsRaw)) recipientsRaw = recipientsRaw.join(";");

    const recipients = String(recipientsRaw)
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const sent_at = mail.sent_at || mail.date || mail.time || "2001-10-10 03:15:00";
    const body = mail.body || mail.content || mail.snippet || mail.preview || "";

    return { claimed_sender, recipients, sent_at, body, threshold: DEFAULT_THRESHOLD };
  };

  // 4) Auto-score the inbox (SOC view)
  useEffect(() => {
    if (!emails.length) return;

    let cancelled = false;

    async function scoreInbox() {
      // score first N emails for demo speed
      const N = Math.min(20, emails.length);

      for (let i = 0; i < N; i++) {
        const mail = emails[i];

        // skip if already scored
        if (mail.riskLevel !== "pending") continue;

        try {
          const payload = buildVerifyPayload(mail);
          const report = await verifyEmail(payload);

          if (cancelled) return;

          const risk = decisionToRisk(report);

          setEmails((prev) =>
            prev.map((e) =>
              e.id === mail.id
                ? {
                    ...e,
                    mlResult: report,
                    riskLevel: risk, // safe | high | pending
                  }
                : e
            )
          );
        } catch (err) {
          // keep pending if error
          console.error("Auto-score failed:", err);
        }
      }
    }

    scoreInbox();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emails.length]);

  // 5) Score selected email and show report in ReadingPane/Dashboard
  // When selection changes, use backend-provided ML result if available.
  useEffect(() => {
    if (!selectedEmail) {
      setForensicReport(null);
      setMlError("");
      setIsAnalyzing(false);
      return;
    }

    // Prefer the ML/heuristic result shipped with the row. Do NOT auto-re-score on open.
    setForensicReport(selectedEmail.mlResult || null);
    setMlError("");
    setIsAnalyzing(false);
  }, [selectedEmailId]);

  // Run analysis on-demand (from ReadingPane button or manual trigger)
  const runAnalysis = async (mail) => {
    if (!mail) return;
    setIsAnalyzing(true);
    setMlError("");

    try {
      const payload = buildVerifyPayload(mail);
      const report = await verifyEmail(payload);

      setForensicReport(report);

      const risk = decisionToRisk(report);
      setEmails((prev) => prev.map((e) => (e.id === mail.id ? { ...e, mlResult: report, riskLevel: risk, riskScore: report?.score ?? e.riskScore } : e)));
    } catch (err) {
      console.error("Manual ML failed:", err);
      setMlError(String(err?.message || err));
    } finally {
      setIsAnalyzing(false);
    }
  };

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
          {/* Tabs */}
          <div className="flex items-center px-4 pt-2 bg-white border-b border-gray-200">
            <button
              onClick={() => setViewMode("inbox")}
              className={clsx(
                "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors outline-none",
                viewMode === "inbox" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
              )}
            >
              <Inbox className="w-4 h-4" />
              <span className="text-sm font-medium">Primary</span>
            </button>

            <button
              onClick={() => setViewMode("social")}
              className={clsx(
                "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors outline-none",
                viewMode === "social" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
              )}
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Interaction Map</span>
            </button>

            <button
              onClick={() => setViewMode("dashboard")}
              className={clsx(
                "flex items-center gap-3 px-6 py-3 border-b-[3px] transition-colors outline-none",
                viewMode === "dashboard" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-600"
              )}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="text-sm font-medium">Detection Dashboard</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden bg-white relative">
            {viewMode === "inbox" && (
              <>
                {loadingEmails && (
                  <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                    Loading inbox...
                  </div>
                )}
                {emailsError && (
                  <div className="px-4 py-2 text-sm text-red-600 border-b border-gray-200">
                    {emailsError}
                  </div>
                )}

                <EmailList
                  emails={emails}
                  selectedEmailId={selectedEmailId}
                  onSelectEmail={(emailObjOrId) => {
                    if (typeof emailObjOrId === "object" && emailObjOrId?.id) {
                      setSelectedEmailId(emailObjOrId.id);
                    } else {
                      setSelectedEmailId(emailObjOrId);
                    }
                  }}
                />

                {selectedEmail && (
                  <div className="w-[60%] border-l border-gray-200 shadow-2xl z-20 absolute inset-y-0 right-0 bg-white transition-transform duration-300">
                    <div className="h-full flex flex-col">
                      <div className="flex justify-end p-2 border-b border-gray-100">
                        <button
                          onClick={() => setSelectedEmailId(null)}
                          className="p-2 hover:bg-gray-100 rounded-full text-gray-500"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="flex-1 overflow-y-auto">
                        <ReadingPane
                          email={selectedEmail}
                          report={forensicReport}
                          isAnalyzing={isAnalyzing}
                          error={mlError}
                          onRunAnalysis={runAnalysis}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {viewMode === "social" && (
              <div className="flex-1 p-4 bg-gray-50">
                <SocialGraphView />
              </div>
            )}

            {viewMode === "dashboard" && (
              <div className="flex-1 overflow-y-auto">
                <Dashboard report={forensicReport} isAnalyzing={isAnalyzing} error={mlError} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
