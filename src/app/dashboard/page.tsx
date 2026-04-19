"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  TrendingUp, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Eye,
  Calendar,
  History,
  FileText
} from "lucide-react";

const statsData = [
  {
    title: "Total Analyses",
    value: "1,247",
    change: "+12.5%",
    trend: "up",
    icon: <Activity className="w-6 h-6" />,
    color: "primary"
  },
  {
    title: "Disease Detected",
    value: "342",
    change: "+8.2%",
    trend: "up", 
    icon: <AlertTriangle className="w-6 h-6" />,
    color: "alert"
  },
  {
    title: "Healthy Samples",
    value: "905",
    change: "+15.1%",
    trend: "up",
    icon: <CheckCircle className="w-6 h-6" />,
    color: "primary"
  },
  {
    title: "Avg Confidence",
    value: "87.3%",
    change: "+2.4%",
    trend: "up",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "primary"
  }
];

const diseaseData = [
  { name: "Healthy", value: 905, color: "#4CAF50" },
  { name: "Leaf Rust", value: 156, color: "#FFBF00" },
  { name: "Stripe Rust", value: 89, color: "#FF9800" },
  { name: "Stem Rust", value: 45, color: "#F44336" },
  { name: "Septoria", value: 34, color: "#9C27B0" },
  { name: "Fusarium", value: 18, color: "#E91E63" }
];

const recentActivity = [
  { id: 1, type: "analysis", sample: "Sample #1247", result: "Leaf Rust", time: "2 min ago", confidence: 92 },
  { id: 2, type: "analysis", sample: "Sample #1246", result: "Healthy", time: "15 min ago", confidence: 96 },
  { id: 3, type: "analysis", sample: "Sample #1245", result: "Stripe Rust", time: "1 hour ago", confidence: 78 },
  { id: 4, type: "analysis", sample: "Sample #1244", result: "Healthy", time: "2 hours ago", confidence: 89 },
  { id: 5, type: "analysis", sample: "Sample #1243", result: "Septoria", time: "3 hours ago", confidence: 71 }
];

const getStatColor = (color: string) => {
  switch (color) {
    case 'primary': return 'bg-primary-100 text-primary-700 border-primary-200';
    case 'alert': return 'bg-alert-100 text-alert-700 border-alert-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 85) return 'text-primary-600 bg-primary-50';
  if (confidence >= 70) return 'text-alert-600 bg-alert-50';
  return 'text-red-600 bg-red-50';
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of wheat disease analysis and research metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <div className="flex items-center gap-2 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg border ${getStatColor(stat.color)}`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Disease Distribution Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Disease Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={diseaseData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {diseaseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} samples`, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary-500 rounded-full mt-2" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{activity.sample}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(activity.confidence)}`}>
                      {activity.result}
                    </span>
                    <span className="text-xs text-gray-500">{activity.confidence}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center gap-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors border border-primary-200">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">New Analysis</p>
              <p className="text-sm text-gray-600">Start analyzing wheat samples</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <History className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">View History</p>
              <p className="text-sm text-gray-600">Browse past analyses</p>
            </div>
          </button>
          
          <button className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200">
            <div className="w-10 h-10 bg-gray-500 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="font-medium text-gray-900">Generate Report</p>
              <p className="text-sm text-gray-600">Export analysis data</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
