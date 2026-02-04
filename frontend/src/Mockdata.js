// src/mockData.js

export const mockEmails = [
  { 
    id: '1', 
    sender: "jeff.skilling@enron.com", 
    senderName: "Jeff Skilling",
    senderEmail: "jeff.skilling@enron.com",
    subject: "Q4 Strategy Update", 
    preview: "We need to finalize the energy trading targets...", 
    body: "Team,\n\nAs we approach the end of the fiscal year, we need to finalize our energy trading targets. I expect full compliance with the new risk management protocols.\n\nRegards,\nJeff",
    status: "verified",
    riskLevel: "safe",
    read: true,
    starred: true,
    timestamp: "10:30 AM"
  },
  { 
    id: '2', 
    sender: "phillip.allen@enron.com", 
    senderName: "Phillip Allen",
    senderEmail: "phillip.allen@enron.com",
    subject: "Urgent: Wire Transfer Request", 
    preview: "Please process the attached payment to the new Cayman account.", 
    body: "Urgent request: Please process a transfer of $450,000 to the following account details immediately for Project Raptor closure.\n\nAccount: 00982341\nBank: International Cayman Bank",
    status: "anomaly",
    riskLevel: "high",
    riskReasons: ["Unusual Subnet (192.168.1.x)", "Stylometric mismatch detected", "High-frequency recipient"],
    read: false,
    starred: false,
    timestamp: "09:15 AM"
  },
  { 
    id: '3', 
    sender: "kay.mann@enron.com", 
    senderName: "Kay Mann",
    senderEmail: "kay.mann@enron.com",
    subject: "Legal Review - Project Raptor", 
    preview: "Attached are the final contracts for the SPV structure...", 
    body: "The legal team has completed the review of the Raptor contracts. Please see the attached documents for the Special Purpose Vehicle (SPV) structures.",
    status: "verified",
    riskLevel: "safe",
    read: true,
    starred: false,
    timestamp: "Yesterday"
  }
];

export const dashboardStats = {
  kpi: {
    scanned: 12540,
    flagged: 154,
    highRisk: 12,
    falsePositives: 3
  },
  trends: [
    { date: 'Jan 26', flagged: 10 },
    { date: 'Jan 27', flagged: 15 },
    { date: 'Jan 28', flagged: 8 },
    { date: 'Jan 29', flagged: 22 },
    { date: 'Jan 30', flagged: 18 },
    { date: 'Jan 31', flagged: 25 },
    { date: 'Feb 01', flagged: 12 },
  ],
  detectionReasons: [
    { name: 'Style Mismatch', value: 45 },
    { name: 'Subnet Anomaly', value: 32 },
    { name: 'Time Variance', value: 18 },
    { name: 'Social Graph', value: 12 },
  ],
  riskBreakdown: [
    { name: 'High Risk', value: 12, color: '#f43f5e' }, // Rose-500
    { name: 'Suspicious', value: 42, color: '#f59e0b' }, // Amber-500
    { name: 'Safe', value: 12486, color: '#10b981' }, // Emerald-500
  ]
};

export const recentAlerts = [
  { id: 1, risk: 'high', subject: 'Wire Transfer Request', reason: 'Style Mismatch', status: 'Confirmed', time: '09:15 AM' },
  { id: 2, risk: 'suspicious', subject: 'Quarterly Review', reason: 'Subnet Anomaly', status: 'Investigating', time: '11:45 AM' },
  { id: 3, risk: 'high', subject: 'Login from New IP', reason: 'Infrastructure', status: 'Confirmed', time: 'Yesterday' },
];

export const labelItems = [
  { label: "High Risk", color: "bg-rose-500" },
  { label: "Verified", color: "bg-emerald-500" },
  { label: "Internal", color: "bg-indigo-500" },
];