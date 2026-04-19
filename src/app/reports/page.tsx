"use client";

import { useState } from "react";
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Mock data for reports
const diseaseData = [
  { name: "Healthy", value: 905, color: "#4CAF50" },
  { name: "Leaf Rust", value: 156, color: "#FFBF00" },
  { name: "Stripe Rust", value: 89, color: "#FF9800" },
  { name: "Stem Rust", value: 45, color: "#F44336" },
  { name: "Septoria", value: 34, color: "#9C27B0" },
  { name: "Fusarium", value: 18, color: "#E91E63" }
];

const monthlyData = [
  { month: "Jan", healthy: 145, leafRust: 23, stripeRust: 15, stemRust: 8, septoria: 5, fusarium: 3 },
  { month: "Feb", healthy: 167, leafRust: 28, stripeRust: 18, stemRust: 6, septoria: 7, fusarium: 4 },
  { month: "Mar", healthy: 189, leafRust: 35, stripeRust: 22, stemRust: 9, septoria: 8, fusarium: 5 },
  { month: "Apr", healthy: 156, leafRust: 31, stripeRust: 19, stemRust: 7, septoria: 6, fusarium: 3 },
  { month: "May", healthy: 178, leafRust: 25, stripeRust: 12, stemRust: 8, septoria: 5, fusarium: 2 },
  { month: "Jun", healthy: 70, leafRust: 14, stripeRust: 3, stemRust: 7, septoria: 3, fusarium: 1 }
];

const confidenceData = [
  { range: "90-100%", count: 856, percentage: 68.7 },
  { range: "80-89%", count: 234, percentage: 18.8 },
  { range: "70-79%", count: 98, percentage: 7.9 },
  { range: "60-69%", count: 42, percentage: 3.4 },
  { range: "Below 60%", count: 17, percentage: 1.2 }
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedReport, setSelectedReport] = useState('overview');

  const generateReport = (type: string) => {
    // Mock report generation
    const reportData = {
      overview: {
        title: "Wheat Disease Analysis Overview",
        period: selectedPeriod,
        totalAnalyses: 1247,
        diseaseDetection: 342,
        healthySamples: 905,
        avgConfidence: 87.3
      },
      trends: {
        title: "Disease Trends Analysis",
        period: selectedPeriod,
        topDisease: "Leaf Rust",
        trendDirection: "increasing",
        recommendations: ["Increase monitoring for Leaf Rust", "Consider resistant varieties"]
      },
      locations: {
        title: "Geographic Distribution",
        period: selectedPeriod,
        hotspots: ["Field A, Sector 3", "Field B, Sector 1"],
        recommendations: ["Target fungicide application in hotspots"]
      }
    };

    const data = reportData[type as keyof typeof reportData];
    const csv = Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive analysis and insights from wheat disease detection</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button
            onClick={() => generateReport(selectedReport)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'trends', label: 'Trends', icon: <TrendingUp className="w-4 h-4" /> },
            { id: 'locations', label: 'Locations', icon: <Activity className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedReport(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${selectedReport === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">1,247</p>
                  <p className="text-sm text-gray-600">Total Analyses</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-alert-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-alert-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">342</p>
                  <p className="text-sm text-gray-600">Disease Detected</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">905</p>
                  <p className="text-sm text-gray-600">Healthy Samples</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">87.3%</p>
                  <p className="text-sm text-gray-600">Avg Confidence</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Disease Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
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
                  <Tooltip />
                </RePieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={confidenceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Trends Report */}
      {selectedReport === 'trends' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Disease Trends</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="healthy" stackId="a" fill="#4CAF50" name="Healthy" />
                <Bar dataKey="leafRust" stackId="a" fill="#FFBF00" name="Leaf Rust" />
                <Bar dataKey="stripeRust" stackId="a" fill="#FF9800" name="Stripe Rust" />
                <Bar dataKey="stemRust" stackId="a" fill="#F44336" name="Stem Rust" />
                <Bar dataKey="septoria" stackId="a" fill="#9C27B0" name="Septoria" />
                <Bar dataKey="fusarium" stackId="a" fill="#E91E63" name="Fusarium" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Top Disease</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-alert-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-alert-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Leaf Rust</p>
                  <p className="text-sm text-gray-600">156 cases (12.5%)</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Trend Direction</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Increasing</p>
                  <p className="text-sm text-gray-600">+8.2% vs last period</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Increase monitoring frequency</li>
                <li>• Apply preventive fungicides</li>
                <li>• Consider resistant varieties</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Locations Report */}
      {selectedReport === 'locations' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Hotspots</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">High Risk Areas</h4>
                <div className="space-y-3">
                  {[
                    { location: "Field A, Sector 3", cases: 45, risk: "High" },
                    { location: "Field B, Sector 1", cases: 38, risk: "High" },
                    { location: "Field C, Sector 4", cases: 29, risk: "Medium" }
                  ].map((area, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{area.location}</p>
                        <p className="text-sm text-gray-600">{area.cases} cases</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        area.risk === 'High' 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {area.risk} Risk
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Recommendations by Location</h4>
                <div className="space-y-3">
                  {[
                    { location: "Field A, Sector 3", action: "Immediate fungicide application" },
                    { location: "Field B, Sector 1", action: "Increase scouting frequency" },
                    { location: "Field C, Sector 4", action: "Monitor disease spread" }
                  ].map((rec, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-blue-900">{rec.location}</p>
                      <p className="text-sm text-blue-700 mt-1">{rec.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
