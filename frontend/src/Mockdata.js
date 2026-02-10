

export const mockEmails = [
  { 
    id: '1', 
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
    senderName: "Phillip Allen",
    senderEmail: "phillip.allen@enron.com",
    subject: "Urgent: Wire Transfer Request", 
    preview: "Please process the attached payment to the new Cayman account.", 
    body: "Urgent request: Please process a transfer of $450,000 to the following account details immediately for Project Raptor closure.\n\nAccount: 00982341\nBank: International Cayman Bank",
    status: "anomaly",
    riskLevel: "high",
    riskReasons: [
      "Stylometric Mismatch: Digit-to-Letter ratio is 15% higher than user prototype", 
      "Infrastructure Anomaly: Sent from an unrecognized subnet outside the corporate graph", 
      "High-pressure financial keywords detected in a non-standard context"
    ],
    read: false,
    starred: false,
    timestamp: "09:15 AM"
  },
  { 
    id: '3', 
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
  },
  { 
    id: '4', 
    senderName: "Kenneth Lay",
    senderEmail: "kenneth.lay@enron.com",
    subject: "Confidential Board Meeting Minutes", 
    preview: "Attached are the minutes from yesterday's board meeting...",
    body: "Attached are the minutes from yesterday's board meeting regarding the LJM partnership. This is for your eyes only and should not be shared outside of this thread.",
    status: "warning",
    riskLevel: "suspicious",
    riskReasons: [
      "Temporal Anomaly: Email sent at 3:15 AM (Statistically outside user's active profile)", 
      "Linguistic Variance: Sentence complexity (Flesch-Kincaid) is lower than the sender's average"
    ],
    read: false,
    starred: true,
    timestamp: "Feb 03"
  },
  { 
    id: '5', 
    senderName: "Vince Kaminski",
    senderEmail: "vince.kaminski@enron.com",
    subject: "ML Model Deployment Error", 
    preview: "I noticed some discrepancies in the volatility curve model...",
    body: "I noticed some discrepancies in the volatility curve model we deployed this morning. Can we meet to discuss the variance? We need to ensure the Prototypical Network clusters are correctly aligned.",
    status: "anomaly",
    riskLevel: "high",
    riskReasons: [
      "Authorship Verification Failed: Stylometry distance exceeds threshold (D > 0.85)", 
      "Social Graph Anomaly: First-time communication with this high-privilege recipient in this subnet"
    ],
    read: false,
    starred: false,
    timestamp: "Feb 02"
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
  { id: 2, risk: 'suspicious', subject: 'Board Meeting Minutes', reason: 'Time Variance', status: 'Investigating', time: 'Feb 03' },
  { id: 3, risk: 'high', subject: 'ML Model Deployment', reason: 'Identity Distance', status: 'Confirmed', time: 'Feb 02' },
];

export const labelItems = [
  { label: "High Risk", color: "bg-rose-500" },
  { label: "Verified", color: "bg-emerald-500" },
  { label: "Internal", color: "bg-indigo-500" },
];