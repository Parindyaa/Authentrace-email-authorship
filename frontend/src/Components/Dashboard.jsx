import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend, RadialBarChart, RadialBar
} from 'recharts';
import { 
  ShieldCheck, AlertTriangle, AlertOctagon, Eye, 
  Calendar, Filter, ChevronDown, CheckCircle2
} from 'lucide-react';
import clsx from 'clsx';

// Data derived from your latest Block 13 "Hard, No-Leak" test results
const RESEARCH_METRICS = {
  scanned: "12,540",
  flagged: 154,
  highRisk: 12,
  accuracy: "92.8%", 
  reasons: [
    { name: 'Style Mismatch', value: 45 },
    { name: 'Subnet Anomaly', value: 30 },
    { name: 'Time Variance', value: 15 },
    { name: 'Social Graph', value: 10 },
  ],
};

const MODEL_CALIBRATION = {
  eer: 0.0492,
  optimalThreshold: 2.2551, // Optimal BestF1 Threshold
  testAccuracy: 92.8,
  testF1: 0.9312,
  confusion: { tn: 441, fp: 59, fn: 13, tp: 487 }, // Test @ BestF1 values
};

// Formatting logic for the UI
const scannedNum = 12540;
const flagged = 154;
const highRisk = 12;
const suspicious = flagged - highRisk;

const LAYER_DISTRIBUTION = [
  { name: 'Stylometric', value: 45, color: '#6366f1' },
  { name: 'Infrastructure', value: 30, color: '#f59e0b' },
  { name: 'Temporal', value: 15, color: '#f97316' },
  { name: 'Social', value: 10, color: '#10b981' },
];

const stats = {
  trends: [
    { date: 'Jan 26', flagged: 10 }, { date: 'Jan 27', flagged: 15 },
    { date: 'Jan 28', flagged: 8 }, { date: 'Jan 29', flagged: 22 },
    { date: 'Jan 30', flagged: 18 }, { date: 'Jan 31', flagged: 25 },
    { date: 'Feb 01', flagged: 12 },
  ],
  riskDistribution: [
    { name: 'High Risk', value: highRisk, color: '#fb7185' },
    { name: 'Suspicious', value: suspicious, color: '#f59e0b' },
  ],
};

export const Dashboard = () => {
  return (
    <div className="flex-1 h-full bg-gray-50 overflow-y-auto pb-10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Phishing Detection Dashboard</h1>
        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
            <Calendar className="w-4 h-4" /> <span>Last 7 Days</span>
            <div className="h-4 w-px bg-gray-300 mx-2" />
            <Filter className="w-4 h-4" /> <span>All Mail</span>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Row 1: KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="Emails Scanned" value={RESEARCH_METRICS.scanned} icon={Eye} color="bg-blue-50 text-blue-600" />
          <KpiCard title="Flagged Emails" value={flagged} icon={AlertTriangle} color="bg-yellow-50 text-yellow-600" trend="+12% vs last week" />
          <KpiCard title="High Risk Alerts" value={highRisk} icon={AlertOctagon} color="bg-rose-50 text-rose-600" />
          <KpiCard title="False Positives" value="59" icon={CheckCircle2} color="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Row 2: Accuracy & Main Trends */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[320px]">
            <h3 className="text-sm font-bold text-gray-700 mb-6 uppercase tracking-wider">Flagged Emails Over Time</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={stats.trends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="flagged" stroke="#6366f1" strokeWidth={4} dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center h-[320px]">
            <h3 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Overall Accuracy</h3>
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ value: MODEL_CALIBRATION.testAccuracy, fill: '#10b981' }]} startAngle={90} endAngle={-270}>
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-gray-900">{RESEARCH_METRICS.accuracy}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">Hard Test Set</span>
              </div>
            </div>
            <p className="mt-4 text-[11px] text-center text-gray-500 font-medium">Verified using BestF1 Calibration (thr={MODEL_CALIBRATION.optimalThreshold})</p>
          </div>
        </div>

        {/* Row 3: Forensic Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Donut Chart Fix: Now focused on Flagged items only to prevent distortion */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px]">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Risk Breakdown (Flagged)</h3>
            <div className="flex-1 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.riskDistribution} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                    {stats.riskDistribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pb-10 pointer-events-none">
                <span className="text-2xl font-black text-gray-900">{flagged}</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Alerts</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[350px]">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Top Detection Reasons</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={RESEARCH_METRICS.reasons} layout="vertical" margin={{ left: 10 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} width={100} />
                <Tooltip />
                <Bar dataKey="value" fill="#818cf8" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[350px]">
            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Confusion Matrix</h3>
            <ConfusionMatrix data={MODEL_CALIBRATION.confusion} />
            <div className="mt-4 text-[10px] text-gray-400 font-medium italic text-center">
              *Ground-truth evaluation of 1,000 adversarial identities.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const KpiCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between transition-transform hover:scale-[1.02]">
    <div>
      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-2xl font-black text-gray-900">{value}</h4>
      {trend && <p className="text-[10px] text-emerald-600 font-bold mt-1">{trend}</p>}
    </div>
    <div className={`p-2.5 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
  </div>
);

const ConfusionMatrix = ({ data }) => (
  <div className="grid grid-cols-2 gap-2 w-full mt-2">
    <MatrixCell val={data.tn} label="True Neg (Safe)" color="bg-emerald-50 text-emerald-700 border-emerald-100" />
    <MatrixCell val={data.fp} label="False Pos (Alarm)" color="bg-rose-50 text-rose-500 border-rose-100" />
    <MatrixCell val={data.fn} label="False Neg (Miss)" color="bg-rose-100 text-rose-800 border-rose-200" />
    <MatrixCell val={data.tp} label="True Pos (Caught)" color="bg-emerald-600 text-white border-emerald-700" />
  </div>
);

const MatrixCell = ({ val, label, color }) => (
  <div className={clsx("flex flex-col items-center justify-center py-4 rounded-lg border", color)}>
    <span className="text-xl font-black">{val}</span>
    <span className="text-[8px] font-bold uppercase tracking-tighter text-center">{label}</span>
  </div>
);