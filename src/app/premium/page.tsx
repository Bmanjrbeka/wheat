"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadZone } from "@/components/premium/UploadZone";
import { SkeletonLoader, ShimmerCard } from "@/components/premium/SkeletonLoader";
import { AnalysisProgress, ProgressBar } from "@/components/premium/CircularProgress";
import { ResultCard, ResultSummary } from "@/components/premium/ResultCard";
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle, 
  AlertCircle,
  Leaf,
  Camera
} from "lucide-react";

interface AnalysisResult {
  id: string;
  fileName: string;
  imageUrl: string;
  disease: string;
  confidence: number;
  treatment: string;
}

export default function PremiumAnalysisPage() {
  const [stage, setStage] = useState<"upload" | "processing" | "results">("upload");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<AnalysisResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  const mockDiseases = [
    { name: "Healthy", treatment: "No treatment needed. Continue regular monitoring and maintain good agricultural practices." },
    { name: "Leaf Rust", treatment: "Apply triazole-based fungicide at first sign of infection. Remove infected plant material and ensure proper field sanitation." },
    { name: "Stripe Rust", treatment: "Apply systemic fungicide early in the season. Monitor weather conditions for optimal spread prevention." },
    { name: "Stem Rust", treatment: "Apply protective fungicides immediately. Isolate infected areas and consider resistant varieties for next season." },
    { name: "Septoria", treatment: "Apply strobilurin or triazole fungicides. Remove heavily infected leaves and improve air circulation." },
    { name: "Fusarium", treatment: "Apply fungicide during flowering. Harvest early and dry grain properly to prevent mycotoxin accumulation." }
  ];

  const handleUpload = useCallback((files: File[]) => {
    setUploadedFiles(files);
    setError(null);
  }, []);

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) return;

    setStage("processing");
    setProgress(0);
    setError(null);

    // Simulate analysis with progress updates
    const analysisSteps = [
      { progress: 20, delay: 1000, status: "uploading" },
      { progress: 40, delay: 2000, status: "analyzing" },
      { progress: 60, delay: 3000, status: "analyzing" },
      { progress: 80, delay: 4000, status: "analyzing" },
      { progress: 100, delay: 5000, status: "complete" }
    ];

    for (const step of analysisSteps) {
      await new Promise(resolve => setTimeout(resolve, step.delay));
      setProgress(step.progress);
    }

    // Generate mock results
    const mockResults: AnalysisResult[] = uploadedFiles.map((file, index) => {
      const randomDisease = mockDiseases[Math.floor(Math.random() * mockDiseases.length)];
      const confidence = 0.65 + Math.random() * 0.35; // 65-100% confidence
      
      return {
        id: `result-${index}`,
        fileName: file.name,
        imageUrl: URL.createObjectURL(file),
        disease: randomDisease.name,
        confidence,
        treatment: randomDisease.treatment
      };
    });

    setResults(mockResults);
    setStage("results");
  };

  const resetAnalysis = () => {
    setStage("upload");
    setUploadedFiles([]);
    setResults([]);
    setProgress(0);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Premium Wheat Analysis</h1>
                <p className="text-gray-600">AI-powered disease detection with professional insights</p>
              </div>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {["upload", "processing", "results"].map((step, index) => (
                  <div key={step} className="flex items-center">
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${stage === step || (step === "upload" && stage === "processing") 
                        ? "bg-primary-600 text-white" 
                        : (step === "upload" && stage !== "upload") || 
                          (step === "processing" && stage === "results")
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-500"
                      }
                    `}>
                      {step === "upload" && <Camera className="w-4 h-4" />}
                      {step === "processing" && <Sparkles className="w-4 h-4" />}
                      {step === "results" && <CheckCircle className="w-4 h-4" />}
                    </div>
                    {index < 2 && (
                      <div className={`w-8 h-0.5 mx-2 ${
                        (step === "upload" && stage === "processing") || 
                        (step === "processing" && stage === "results") ||
                        (step === "upload" && stage === "results")
                        ? "bg-primary-600" : "bg-gray-200"
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Upload Stage */}
          {stage === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto"
                >
                  <Camera className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Upload Wheat Leaf Images
                  </h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Our advanced AI will analyze your wheat leaves for disease patterns. 
                    Get professional insights and treatment recommendations in seconds.
                  </p>
                </div>
              </div>

              <div className="max-w-4xl mx-auto">
                <UploadZone
                  onUpload={handleUpload}
                  maxFiles={10}
                  maxSize={10 * 1024 * 1024}
                  className="backdrop-blur-md bg-glass-white30 border border-glass-white20"
                />
              </div>

              {uploadedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center"
                >
                  <button
                    onClick={startAnalysis}
                    className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center gap-3 mx-auto"
                  >
                    Start Analysis
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Processing Stage */}
          {stage === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Analyzing Your Wheat Leaves
                  </h2>
                  <p className="text-lg text-gray-600">
                    Our AI is examining {uploadedFiles.length} image{uploadedFiles.length !== 1 ? 's' : ''} for disease patterns
                  </p>
                </div>

                <div className="max-w-md mx-auto">
                  <AnalysisProgress
                    progress={progress}
                    status={progress === 100 ? "complete" : "analyzing"}
                  />
                  <ProgressBar progress={progress} className="mt-6" />
                </div>

                {/* Loading Skeletons */}
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: Math.min(uploadedFiles.length, 3) }).map((_, index) => (
                    <ShimmerCard key={index} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Stage */}
          {stage === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Analysis Complete
                  </h2>
                  <p className="text-lg text-gray-600">
                    Professional insights for {uploadedFiles.length} wheat leaf sample{uploadedFiles.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Results Summary */}
              <div className="max-w-4xl mx-auto">
                <ResultSummary results={results} />
              </div>

              {/* Individual Results */}
              <div className="max-w-6xl mx-auto">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Detailed Analysis</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {results.map((result, index) => (
                    <ResultCard
                      key={result.id}
                      {...result}
                      className="transform transition-all duration-300 hover:scale-[1.02]"
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <button
                  onClick={resetAnalysis}
                  className="px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center gap-3 mx-auto"
                >
                  Analyze More Images
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-sm text-gray-500">
                  Download detailed report or share results with your agricultural team
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900">Analysis Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={resetAnalysis}
                  className="mt-3 text-red-600 hover:text-red-800 font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
