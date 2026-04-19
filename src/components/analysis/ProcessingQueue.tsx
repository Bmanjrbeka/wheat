"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  X,
  Play,
  Pause
} from "lucide-react";

export interface AnalysisItem {
  id: string;
  fileName: string;
  preview: string;
  status: 'waiting' | 'processing' | 'completed' | 'error';
  progress: number;
  result?: {
    disease: string;
    confidence: number;
    treatment?: string;
  };
  error?: string;
}

interface Props {
  items: AnalysisItem[];
  onStartAnalysis: () => void;
  onStopAnalysis: () => void;
  isAnalyzing: boolean;
}

export function ProcessingQueue({ 
  items, 
  onStartAnalysis, 
  onStopAnalysis, 
  isAnalyzing 
}: Props) {
  const [currentProcessingIndex, setCurrentProcessingIndex] = useState<number | null>(null);

  // Simulate processing progress
  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentProcessingIndex(null);
      return;
    }

    const processNext = () => {
      const nextIndex = items.findIndex(item => item.status === 'waiting');
      if (nextIndex !== -1) {
        setCurrentProcessingIndex(nextIndex);
        
        // Simulate processing time (2-4 seconds per image)
        const processingTime = 2000 + Math.random() * 2000;
        
        setTimeout(() => {
          // This would normally update the parent state
          // For now, we'll just move to the next
          setCurrentProcessingIndex(null);
        }, processingTime);
      }
    };

    const timer = setTimeout(processNext, 500);
    return () => clearTimeout(timer);
  }, [isAnalyzing, items]);

  const getStatusIcon = (status: AnalysisItem['status']) => {
    switch (status) {
      case 'waiting':
        return <Clock className="w-5 h-5 text-gray-400" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = (status: AnalysisItem['status']) => {
    switch (status) {
      case 'waiting':
        return 'Waiting...';
      case 'processing':
        return 'Processing...';
      case 'completed':
        return 'Done';
      case 'error':
        return 'Error';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600 bg-green-50';
    if (confidence >= 70) return 'text-alert-600 bg-alert-50';
    return 'text-red-600 bg-red-50';
  };

  const completedCount = items.filter(item => item.status === 'completed').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const processingCount = items.filter(item => item.status === 'processing').length;
  const waitingCount = items.filter(item => item.status === 'waiting').length;

  return (
    <div className="space-y-6">
      {/* Queue Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Processing Queue</h2>
          <p className="text-sm text-gray-600 mt-1">
            {completedCount} completed, {processingCount} processing, {waitingCount} waiting
            {errorCount > 0 && `, ${errorCount} errors`}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {!isAnalyzing ? (
            <button
              onClick={onStartAnalysis}
              disabled={items.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg
                       hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Analysis
            </button>
          ) : (
            <button
              onClick={onStopAnalysis}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg
                       hover:bg-red-600 transition-colors"
            >
              <Pause className="w-4 h-4" />
              Stop Analysis
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {items.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {Math.round((completedCount / items.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Queue Items */}
      <div className="space-y-3">
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`
              bg-white rounded-lg border border-gray-200 p-4
              ${item.status === 'processing' ? 'ring-2 ring-primary-200' : ''}
              ${item.status === 'completed' ? 'bg-green-50 border-green-200' : ''}
              ${item.status === 'error' ? 'bg-red-50 border-red-200' : ''}
            `}
          >
            <div className="flex items-center gap-4">
              {/* Status Icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>

              {/* Image Preview */}
              <div className="flex-shrink-0">
                <img
                  src={item.preview}
                  alt={item.fileName}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                />
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 truncate">{item.fileName}</p>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    item.status === 'completed' ? 'bg-green-100 text-green-700' :
                    item.status === 'processing' ? 'bg-primary-100 text-primary-700' :
                    item.status === 'error' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getStatusText(item.status)}
                  </span>
                </div>
                
                {/* Progress Bar for Processing Items */}
                {item.status === 'processing' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Results for Completed Items */}
                {item.status === 'completed' && item.result && (
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Result:</span>
                      <span className="font-medium text-gray-900">{item.result.disease}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceColor(item.result.confidence)}`}>
                      {Math.round(item.result.confidence * 100)}% confidence
                    </span>
                  </div>
                )}

                {/* Error Message */}
                {item.status === 'error' && item.error && (
                  <p className="mt-2 text-sm text-red-600">{item.error}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No images in queue</h3>
          <p className="text-gray-600">Upload wheat leaf images to start analysis</p>
        </div>
      )}
    </div>
  );
}
