"use client";

import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle } from "lucide-react";

interface CircularProgressProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}

export function CircularProgress({
  value,
  maxValue = 100,
  size = 120,
  strokeWidth = 8,
  className = "",
  showPercentage = true,
  color = "primary"
}: CircularProgressProps) {
  const percentage = Math.min((value / maxValue) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClasses = {
    primary: "stroke-primary-600",
    success: "stroke-green-600",
    warning: "stroke-yellow-600",
    error: "stroke-red-600"
  };

  const bgColors = {
    primary: "stroke-primary-100",
    success: "stroke-green-100",
    warning: "stroke-yellow-100",
    error: "stroke-red-100"
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className={bgColors[color]}
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          className={colorClasses[color]}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>
      
      {/* Center content */}
      {showPercentage && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900">
            {Math.round(percentage)}%
          </span>
          <span className="text-xs text-gray-500">Complete</span>
        </div>
      )}
    </div>
  );
}

interface AnalysisProgressProps {
  progress: number;
  status: "uploading" | "analyzing" | "complete" | "error";
  className?: string;
}

export function AnalysisProgress({ 
  progress, 
  status, 
  className = "" 
}: AnalysisProgressProps) {
  const getStatusColor = () => {
    switch (status) {
      case "uploading": return "primary";
      case "analyzing": return "primary";
      case "complete": return "success";
      case "error": return "error";
      default: return "primary";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case "error":
        return <AlertTriangle className="w-6 h-6 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "uploading": return "Uploading images...";
      case "analyzing": return "Analyzing wheat leaves...";
      case "complete": return "Analysis complete!";
      case "error": return "Analysis failed";
      default: return "Processing...";
    }
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      <CircularProgress
        value={status === "complete" ? 100 : progress}
        color={getStatusColor()}
        size={120}
        showPercentage={status !== "complete" && status !== "error"}
      />
      
      {getStatusIcon()}
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-lg font-medium text-gray-900">
          {getStatusText()}
        </p>
        {status === "analyzing" && (
          <p className="text-sm text-gray-500 mt-1">
            AI is examining your wheat leaves for disease patterns
          </p>
        )}
      </motion.div>

      {/* Animated dots for loading states */}
      {(status === "uploading" || status === "analyzing") && (
        <div className="flex space-x-1">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-2 h-2 bg-primary-600 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [1, 0.5, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.2,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ProgressBarProps {
  progress: number;
  className?: string;
  showLabel?: boolean;
  color?: "primary" | "success" | "warning" | "error";
}

export function ProgressBar({
  progress,
  className = "",
  showLabel = true,
  color = "primary"
}: ProgressBarProps) {
  const colorClasses = {
    primary: "bg-primary-600",
    success: "bg-green-600",
    warning: "bg-yellow-600",
    error: "bg-red-600"
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full ${colorClasses[color]}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
