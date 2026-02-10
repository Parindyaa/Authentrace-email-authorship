import React from "react";
import { Star, Square, Archive, Trash2, MailOpen } from "lucide-react";
import clsx from "clsx";

export const EmailList = ({ emails, selectedEmailId, onSelectEmail, filter }) => {
  const filteredEmails = emails.filter((email) => {
    if (filter === "unread") return !email.read;
    if (filter === "flagged") return email.riskLevel === "high" || email.riskLevel === "suspicious";
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto bg-white">
      <div className="divide-y divide-gray-100 border-t border-gray-200">
        {filteredEmails.map((email) => (
          <EmailRow
            key={email.id}
            email={email}
            isSelected={selectedEmailId === email.id}
            onClick={() => onSelectEmail(email)}
          />
        ))}

        {filteredEmails.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <MailOpen className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium">No messages found in this view</p>
          </div>
        )}
      </div>
    </div>
  );
};

const EmailRow = ({ email, isSelected, onClick }) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "group flex items-center gap-3 px-4 py-2.5 cursor-pointer relative transition-all hover:shadow-sm hover:z-10",
        isSelected ? "bg-blue-50/50" : "bg-white hover:bg-gray-50",
        !email.read && "bg-white font-semibold"
      )}
    >
      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />}

      <div className="flex items-center gap-3 text-gray-400 flex-shrink-0">
        <button onClick={(e) => e.stopPropagation()} className="hover:text-gray-600 p-1 rounded hover:bg-gray-200 outline-none">
          <Square className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => e.stopPropagation()}
          className={clsx(
            "p-1 rounded hover:bg-gray-200 outline-none",
            email.starred ? "text-yellow-400 fill-yellow-400" : "hover:text-gray-600"
          )}
        >
          <Star className="w-4 h-4" />
        </button>
      </div>

      <div className={clsx("w-48 truncate flex-shrink-0 text-[15px]", !email.read ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
        {email.senderName || email.sender}
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-2 text-[15px]">
        <span className={clsx("truncate", !email.read ? "font-bold text-gray-900" : "font-medium text-gray-700")}>
          {email.subject}
        </span>
        <span className="text-gray-400 mx-1">-</span>
        <span className="text-gray-500 truncate flex-1 font-normal">{email.preview || email.body}</span>
      </div>

      <div className="flex items-center gap-4 pl-4 flex-shrink-0">
        <RiskPill level={email.riskLevel} />

        <span className={clsx("text-xs font-medium w-24 text-right group-hover:hidden", !email.read ? "text-gray-900" : "text-gray-500")}>
          {email.time || ""}
        </span>

        <div className="hidden group-hover:flex items-center justify-end w-24 gap-1">
          <ActionBtn icon={Archive} tooltip="Archive" />
          <ActionBtn icon={Trash2} tooltip="Delete" />
          <ActionBtn icon={MailOpen} tooltip="Mark as read" />
        </div>
      </div>
    </div>
  );
};

const RiskPill = ({ level }) => {
  const lvl = (level || "pending").toLowerCase();

  if (lvl === "safe") {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-bold uppercase tracking-wide">Safe</span>
      </div>
    );
  }

  if (lvl === "suspicious") {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span className="text-[10px] font-bold uppercase tracking-wide">Suspicious</span>
      </div>
    );
  }

  if (lvl === "high") {
    return (
      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wide">High Risk</span>
      </div>
    );
  }

  // pending / unknown
  return (
    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200/50">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      <span className="text-[10px] font-bold uppercase tracking-wide">Pending</span>
    </div>
  );
};

const ActionBtn = ({ icon: Icon, tooltip }) => (
  <button
    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors outline-none"
    title={tooltip}
    onClick={(e) => e.stopPropagation()}
  >
    <Icon className="w-4 h-4" />
  </button>
);
