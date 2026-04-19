"use client";

import { useState } from "react";
import { 
  X, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Calendar
} from "lucide-react";

export interface HistoryRecord {
  id: string;
  fileName: string;
  imageUrl: string;
  disease: string;
  confidence: number;
  date: string;
  location?: string;
  treatment?: string;
  allProbabilities?: Record<string, number>;
  metadata?: {
    temperature?: number;
    humidity?: number;
  };
}

interface Props {
  record: HistoryRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ResultDrawer({ record, isOpen, onClose }: Props) {
  const [showHeatmap, setShowHeatmap] = useState(false);

  if (!record) return null;

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'bg-green-500';
    if (confidence >= 70) return 'bg-alert-500';
    return 'bg-red-500';
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-alert-600';
    return 'text-red-600';
  };

  const getDiseaseIcon = (disease: string) => {
    switch (disease) {
      case 'Healthy': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'Leaf Rust': return <AlertTriangle className="w-6 h-6 text-alert-500" />;
      case 'Stripe Rust': return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'Stem Rust': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'Septoria': return <Droplets className="w-6 h-6 text-blue-500" />;
      case 'Fusarium': return <Thermometer className="w-6 h-6 text-orange-500" />;
      default: return <AlertTriangle className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sortedProbabilities = record.allProbabilities 
    ? Object.entries(record.allProbabilities)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
    : [];

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`
        absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Analysis Details</h2>
              <p className="text-sm text-gray-600 mt-1">{record.fileName}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Low Confidence Warning */}
            {record.confidence < 70 && (
              <div className="bg-alert-50 border border-alert-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-alert-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-alert-900">Low Confidence Detection</h3>
                    <p className="text-alert-700 text-sm mt-1">
                      The AI confidence is below 70%. Please verify this diagnosis manually.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Display */}
            <div className="bg-gray-50 rounded-xl overflow-hidden">
              <div className="relative">
                <img
                  src={showHeatmap ? record.imageUrl : record.imageUrl}
                  alt="Analyzed leaf"
                  className="w-full h-64 object-cover"
                />
                
                {/* Heatmap Toggle */}
                <button
                  onClick={() => setShowHeatmap(!showHeatmap)}
                  className="absolute top-4 right-4 px-3 py-2 bg-black/50 text-white rounded-lg
                           hover:bg-black/60 transition-colors flex items-center gap-2"
                >
                  {showHeatmap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showHeatmap ? 'Original' : 'Heatmap'}
                </button>
              </div>
            </div>

            {/* Primary Result */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getDiseaseIcon(record.disease)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{record.disease}</h3>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-600">Confidence</span>
                      <span className={`text-sm font-bold ${getConfidenceTextColor(record.confidence)}`}>
                        {Math.round(record.confidence * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${getConfidenceColor(record.confidence)}`}
                        style={{ width: `${record.confidence * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 3 Results */}
            {sortedProbabilities.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">All Predictions</h4>
                <div className="space-y-3">
                  {sortedProbabilities.map(([disease, probability], index) => (
                    <div key={disease} className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            disease === record.disease ? 'text-primary-600' : 'text-gray-700'
                          }`}>
                            {disease}
                          </span>
                          <span className={`text-sm font-bold ${
                            disease === record.disease ? 'text-primary-600' : 'text-gray-600'
                          }`}>
                            {Math.round(probability * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              disease === record.disease ? getConfidenceColor(probability) : 'bg-gray-400'
                            }`}
                            style={{ width: `${probability * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Metadata */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  Analysis Date
                </div>
                <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
              </div>
              
              {record.location && (
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Wind className="w-4 h-4" />
                    Location
                  </div>
                  <p className="font-medium text-gray-900">{record.location}</p>
                </div>
              )}
            </div>

            {/* Environmental Conditions */}
            {record.metadata && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Environmental Conditions</h4>
                <div className="grid grid-cols-2 gap-4">
                  {record.metadata.temperature && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                        <Thermometer className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Temperature</p>
                        <p className="font-medium text-gray-900">{record.metadata.temperature}°C</p>
                      </div>
                    </div>
                  )}
                  
                  {record.metadata.humidity && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Droplets className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Humidity</p>
                        <p className="font-medium text-gray-900">{record.metadata.humidity}%</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Treatment Information */}
            {record.treatment && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Treatment Information</h4>
                <p className="text-gray-700">{record.treatment}</p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
