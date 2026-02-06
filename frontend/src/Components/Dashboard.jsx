import React, { useState } from 'react';
import { 
LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import { 

    ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, 
    Calendar, Filter, Eye, ChevronDown, CheckCircle2, XCircle
} from 'lucide-react';
import clsx from 'clsx';

// Note: Ensure your mockData.js has dashboardStats and recentAlerts exports
import { dashboardStats, recentAlerts } from '../mockdata';

export const Dashboard = () => {
  const [dateRange, setDateRange] = useState('7 days');

  return (
    <div className="flex-1 h-full bg-gray-50 overflow-y-auto">
      {/* Dashboard Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <h1 className="text-xl font-medium text-gray-800">Phishing Detection Dashboard</h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Last {dateRange}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
          
          <div className="h-6 w-px bg-gray-300 mx-1" />
          
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span>All Mail</span>
          </button>
          
          <div className="flex items-center gap-2 ml-2">
            <label className="text-sm text-gray-600 font-medium">Show only flagged</label>
            <button className="w-10 h-5 rounded-full bg-gray-300 relative transition-colors hover:bg-gray-400 outline-none">
              <div className="w-4 h-4 rounded-full bg-white shadow-sm absolute top-0.5 left-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard 
            title="Emails Scanned" 
            value={dashboardStats.kpi.scanned.toLocaleString()} 
            icon={Eye} 
            color="bg-blue-50 text-blue-600"
          />
          <KpiCard 
            title="Flagged Emails" 
            value={dashboardStats.kpi.flagged.toString()} 
            icon={AlertTriangle} 
            color="bg-yellow-50 text-yellow-600"
            trend="+12% vs last week"
          />
          <KpiCard 
            title="High Risk" 
            value={dashboardStats.kpi.highRisk.toString()} 
            icon={AlertOctagon} 
            color="bg-red-50 text-red-600"
          />
          <KpiCard 
            title="False Positives" 
            value={dashboardStats.kpi.falsePositives.toString()} 
            icon={CheckCircle2} 
            color="bg-green-50 text-green-600"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[320px]">
          {/* Line Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[300px]">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Flagged Emails Over Time</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardStats.trends}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6b7280'}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="flagged" 
                    stroke="#2563eb" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-[300px]">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Top Detection Reasons</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dashboardStats.detectionReasons} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    width={100}
                    tick={{fontSize: 12, fill: '#4b5563'}} 
                  />
                  <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pie Chart */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm col-span-1 h-[300px] flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Risk Breakdown</h3>
            <div className="flex-1 w-full min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dashboardStats.riskBreakdown}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {dashboardStats.riskBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                <div className="text-center">
                  <span className="block text-2xl font-bold text-gray-900">12.5k</span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Alerts Table */}
          <div className="bg-white p-0 rounded-xl border border-gray-200 shadow-sm col-span-1 lg:col-span-2 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Recent Alerts</h3>
              <button className="text-xs text-blue-600 font-medium hover:underline">View All</button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                  <tr>
                    <th className="px-5 py-3 font-medium">Risk</th>
                    <th className="px-5 py-3 font-medium">Subject</th>
                    <th className="px-5 py-3 font-medium">Reason</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentAlerts.map((alert) => (
                    <tr key={alert.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                      <td className="px-5 py-3">
                        <RiskBadge level={alert.risk} />
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">{alert.subject}</td>
                      <td className="px-5 py-3 text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium border border-gray-200">
                          {alert.reason}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={clsx(
                          "text-xs font-medium px-2 py-0.5 rounded-full",
                          alert.status === 'Confirmed' ? "bg-red-100 text-red-700" :
                          alert.status === 'Investigating' ? "bg-yellow-100 text-yellow-700" :
                          "bg-gray-100 text-gray-600"
                        )}>
                          {alert.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500 text-xs">{alert.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const KpiCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-start justify-between">
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      {trend && <p className="text-xs text-green-600 font-medium mt-1">{trend}</p>}
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-5 h-5" />
    </div>
  </div>
);

const RiskBadge = ({ level }) => {
  if (level === 'safe') return <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">Safe</span>;
  if (level === 'suspicious') return <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded text-xs font-bold">Suspicious</span>;
  return <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-xs font-bold">High Risk</span>;
};