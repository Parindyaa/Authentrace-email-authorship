import React, { useState, useEffect } from "react";
import { EmailList } from "./EmailList";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_AUTHENTRACE_API_KEY || "authentrace_secret_key_2024";

export const EmailInbox = () => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(null);

      // You can pass limit/offset if you want:
      // const response = await fetch(`${API_URL}/emails?limit=50&offset=0`);
      const response = await fetch(`${API_URL}/emails`, {
        headers: {
          "X-API-Key": API_KEY,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch emails`);
      }

      const data = await response.json();

      // Backend returns: { success, emails: [...] }
      const rawEmails = Array.isArray(data.emails) ? data.emails : [];

      // Transform backend data to match EmailList expected format
      const transformedEmails = rawEmails.map((email, index) => {
        const recipients = Array.isArray(email.recipients)
          ? email.recipients
          : (email.recipients || "")
              .split(",")
              .map((r) => r.trim())
              .filter(Boolean);

        return {
          id: email.id ?? `email-${index}`,
          sender: email.sender || email.claimed_sender || email.from || "",
          senderName: email.senderName || email.sender_name || email.sender || email.claimed_sender || "",
          subject: email.subject || "No Subject",
          preview: email.preview || (email.body ? String(email.body).substring(0, 100) : ""),
          body: email.body || email.content || "",
          time: email.time || email.sent_at || email.timestamp || "",
          timestamp: email.sent_at || email.timestamp || email.time || "",
          read: email.read !== undefined ? Boolean(email.read) : false,
          starred: email.starred ? Boolean(email.starred) : false,
          recipients,
          // keep original for debugging
          _original: email,
          // if backend already provides ML fields, keep them
          mlResult: email.mlResult,
          riskLevel: email.riskLevel,
          status: email.status,
        };
      });

      setEmails(transformedEmails);
      console.log(`✅ Loaded ${transformedEmails.length} emails from backend`);
    } catch (err) {
      console.error("❌ Error fetching emails:", err);
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (email) => {
    try {
      setVerifyingId(email.id);
      console.log("🔍 Verifying email:", email.id);

      const verifyRequest = {
        claimed_sender: email.sender,
        recipients: email.recipients || [],
        sent_at: email.timestamp || email.time || "",
        body: email.body || "",
        threshold: 2.5,
      };

      const response = await fetch(`${API_URL}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-API-Key": API_KEY },
        body: JSON.stringify(verifyRequest),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Verification failed");
      }

      const result = await response.json();
      console.log("✅ Verification result:", result);

      setEmails((prevEmails) =>
        prevEmails.map((e) =>
          e.id === email.id
            ? {
                ...e,
                mlResult: {
                  decision: result.result?.is_authentic ? "CLEAN" : "FLAGGED",
                  score: result.result?.score,
                  confidence: result.result?.confidence,
                  details: result.result,
                },
                riskLevel: result.result?.is_authentic ? "low" : "high",
              }
            : e
        )
      );
    } catch (err) {
      console.error("❌ Verification error:", err);
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSelectEmail = (email) => {
    setSelectedEmailId(email.id);
    setEmails((prevEmails) => prevEmails.map((e) => (e.id === email.id ? { ...e, read: true } : e)));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading emails...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <AlertCircle className="w-8 h-8" />
            <h2 className="text-xl font-bold">Connection Error</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchEmails}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              <RefreshCw className="w-5 h-5" />
              Retry Connection
            </button>
            <div className="text-sm text-gray-500 space-y-1">
              <p className="font-semibold">Troubleshooting:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>
                  Make sure backend is running:{" "}
                  <code className="bg-gray-100 px-1 rounded">python -m uvicorn app:app --reload --host 127.0.0.1 --port 8000</code>
                </li>
                <li>
                  Check backend URL: <code className="bg-gray-100 px-1 rounded">{API_URL}</code>
                </li>
                <li>
                  Verify CSV path is correct in <code className="bg-gray-100 px-1 rounded">app.py</code>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <span className="text-sm text-gray-500">
            {emails.length} {emails.length === 1 ? "message" : "messages"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Filter buttons */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === "unread" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Unread
            </button>
            <button
              onClick={() => setFilter("flagged")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === "flagged" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Flagged
            </button>
          </div>

          <button
            onClick={fetchEmails}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Refresh emails"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Email List */}
      <EmailList
        emails={emails}
        selectedEmailId={selectedEmailId}
        onSelectEmail={handleSelectEmail}
        filter={filter}
        onVerifyEmail={handleVerifyEmail}
        verifyingId={verifyingId}
      />
    </div>
  );
};

export default EmailInbox;
