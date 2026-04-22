"use client";

import { motion } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  TrendingUp, 
  Shield,
  Bug,
  Activity
} from "lucide-react";
import { CircularProgress } from "./CircularProgress";

interface ResultCardProps {
  disease: string;
  confidence: number;
  imageUrl: string;
  fileName: string;
  treatment: string;
  className?: string;
}

export function ResultCard({
  disease,
  confidence,
  imageUrl,
  fileName,
  treatment,
  className = ""
}: ResultCardProps) {
  const getSeverityLevel = () => {
    if (disease === "Healthy") return { level: "Low", color: "green", icon: CheckCircle };
    if (disease === "Leaf Rust" || disease === "Stripe Rust") return { level: "Medium", color: "yellow", icon: AlertTriangle };
    if (disease === "Stem Rust" || disease === "Fusarium") return { level: "High", color: "red", icon: AlertTriangle };
    return { level: "Medium", color: "yellow", icon: Info };
  };

  const severity = getSeverityLevel();
  const SeverityIcon = severity.icon;

  const getSeverityColorClasses = (color: string) => {
    const colors = {
      green: "bg-green-100 text-green-800 border-green-200",
      yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
      red: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[color as keyof typeof colors];
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "success";
    if (confidence >= 70) return "warning";
    return "error";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden ${className}`}
    >
      {/* Header with Image */}
      <div className="relative h-48 bg-gray-100">
        <img
          src={imageUrl}
          alt={`Analyzed: ${fileName}`}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay with disease name */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-xl font-bold mb-2">{disease}</h3>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColorClasses(severity.color)}`}>
              <SeverityIcon className="w-4 h-4 inline mr-1" />
              {severity.level} Severity
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Accuracy Gauge */}
        <div className="flex flex-col items-center space-y-4">
          <h4 className="text-lg font-semibold text-gray-900">AI Confidence</h4>
          <CircularProgress
            value={confidence}
            maxValue={100}
            size={100}
            strokeWidth={10}
            color={getConfidenceColor(confidence)}
          />
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{Math.round(confidence * 100)}%</p>
            <p className="text-sm text-gray-500">Confidence Score</p>
          </div>
        </div>

        {/* Treatment Plan */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Recommended Treatment</h4>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-gray-700 leading-relaxed">{treatment}</p>
          </div>
        </div>

        {/* Action Items */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            <h4 className="text-lg font-semibold text-gray-900">Immediate Actions</h4>
          </div>
          
          <div className="space-y-2">
            {disease !== "Healthy" && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-900">Isolate affected plants</p>
                  <p className="text-sm text-yellow-700 mt-1">
                    Prevent spreading to healthy crops by separating infected plants
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Monitor closely</p>
                <p className="text-sm text-green-700 mt-1">
                  Check daily for changes and document progress
                </p>
              </div>
            </div>
            
            {confidence < 70 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Info className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-orange-900">Low confidence detected</p>
                  <p className="text-sm text-orange-700 mt-1">
                    Consider manual verification or re-analysis with better images
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>File: {fileName}</span>
            <span>Analyzed: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface ResultSummaryProps {
  results: Array<{
    disease: string;
    confidence: number;
  }>;
  className?: string;
}

export function ResultSummary({ results, className = "" }: ResultSummaryProps) {
  const diseaseCounts = results.reduce((acc, result) => {
    acc[result.disease] = (acc[result.disease] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  const healthyCount = diseaseCounts["Healthy"] || 0;
  const diseaseCount = results.length - healthyCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`bg-white rounded-2xl border border-gray-200 shadow-lg p-6 ${className}`}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6">Analysis Summary</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Samples */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Bug className="w-8 h-8 text-primary-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{results.length}</p>
          <p className="text-sm text-gray-600">Total Samples</p>
        </div>

        {/* Disease Detection */}
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{diseaseCount}</p>
          <p className="text-sm text-gray-600">Disease Detected</p>
        </div>

        {/* Average Confidence */}
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{Math.round(avgConfidence * 100)}%</p>
          <p className="text-sm text-gray-600">Avg Confidence</p>
        </div>
      </div>

      {/* Disease Breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Disease Breakdown</h4>
        <div className="space-y-2">
          {Object.entries(diseaseCounts).map(([disease, count]) => (
            <div key={disease} className="flex items-center justify-between py-2">
              <span className="text-gray-700">{disease}</span>
              <span className="font-medium text-gray-900">{count} sample{count !== 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
