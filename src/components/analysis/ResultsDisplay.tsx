"use client";

import { useState } from "react";
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Thermometer,
  Droplets,
  Wind,
  Sun
} from "lucide-react";

export interface AnalysisResult {
  id: string;
  fileName: string;
  imageUrl: string;
  disease: string;
  confidence: number;
  allProbabilities: Record<string, number>;
  treatment: {
    explanation: string;
    cause: string;
    immediateAction: string;
    prevention: string;
  };
  metadata?: {
    temperature?: number;
    humidity?: number;
    location?: string;
  };
}

interface Props {
  result: AnalysisResult;
  onBack?: () => void;
}

export function ResultsDisplay({ result, onBack }: Props) {
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showTreatment, setShowTreatment] = useState(false);
  const [showTop3, setShowTop3] = useState(false);

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

  const sortedProbabilities = Object.entries(result.allProbabilities)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
          <p className="text-gray-600 mt-1">{result.fileName}</p>
        </div>
        {onBack && (
          <button
            onClick={onBack}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to Queue
          </button>
        )}
      </div>

      {/* Low Confidence Warning */}
      {result.confidence < 70 && (
        <div className="bg-alert-50 border border-alert-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-alert-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-alert-900">Low Confidence Detection</h3>
              <p className="text-alert-700 text-sm mt-1">
                The AI confidence is below 70%. Please verify this diagnosis manually or consult with an expert.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Display */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="relative">
            <img
              src={showHeatmap ? result.imageUrl : result.imageUrl}
              alt="Analyzed leaf"
              className="w-full h-80 object-cover"
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
          
          {/* Metadata */}
          {result.metadata && (
            <div className="p-4 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {result.metadata.temperature && (
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{result.metadata.temperature}°C</span>
                  </div>
                )}
                {result.metadata.humidity && (
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{result.metadata.humidity}%</span>
                  </div>
                )}
                {result.metadata.location && (
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 truncate">{result.metadata.location}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Primary Result */}
        <div className="space-y-4">
          {/* Disease Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {getDiseaseIcon(result.disease)}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900">{result.disease}</h3>
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Confidence</span>
                    <span className={`text-sm font-bold ${getConfidenceTextColor(result.confidence)}`}>
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${getConfidenceColor(result.confidence)}`}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Results */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <button
              onClick={() => setShowTop3(!showTop3)}
              className="w-full flex items-center justify-between text-left"
            >
              <h4 className="font-semibold text-gray-900">Top 3 Predictions</h4>
              {showTop3 ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            
            {showTop3 && (
              <div className="mt-4 space-y-3">
                {sortedProbabilities.map(([disease, probability], index) => (
                  <div key={disease} className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          disease === result.disease ? 'text-primary-600' : 'text-gray-700'
                        }`}>
                          {disease}
                        </span>
                        <span className={`text-sm font-bold ${
                          disease === result.disease ? 'text-primary-600' : 'text-gray-600'
                        }`}>
                          {Math.round(probability * 100)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${
                            disease === result.disease ? getConfidenceColor(probability) : 'bg-gray-400'
                          }`}
                          style={{ width: `${probability * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Treatment Panel */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowTreatment(!showTreatment)}
          className="w-full px-6 py-4 flex items-center justify-between text-left border-b border-gray-200 hover:bg-gray-50"
        >
          <h4 className="font-semibold text-gray-900">Treatment & Action Plan</h4>
          {showTreatment ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        
        {showTreatment && (
          <div className="p-6 space-y-6">
            {/* Explanation */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Disease Explanation
              </h5>
              <p className="text-gray-700">{result.treatment.explanation}</p>
            </div>

            {/* Cause */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Cause
              </h5>
              <p className="text-gray-700">{result.treatment.cause}</p>
            </div>

            {/* Immediate Action */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Immediate Action
              </h5>
              <p className="text-gray-700">{result.treatment.immediateAction}</p>
            </div>

            {/* Prevention */}
            <div>
              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Sun className="w-4 h-4" />
                Prevention
              </h5>
              <p className="text-gray-700">{result.treatment.prevention}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
