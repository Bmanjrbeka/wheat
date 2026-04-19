"use client";

import { useState } from "react";
import { ImageUploadZone } from "@/components/analysis/ImageUploadZone";
import { ProcessingQueue, AnalysisItem } from "@/components/analysis/ProcessingQueue";
import { ResultsDisplay, AnalysisResult } from "@/components/analysis/ResultsDisplay";
import { ArrowLeft, ArrowRight, Upload, Play, CheckCircle } from "lucide-react";

type UploadedFile = {
  file: File;
  preview: string;
  id: string;
};

type AnalysisStage = 'upload' | 'queue' | 'results';

// Mock treatment data
const getTreatmentData = (disease: string) => {
  const treatments: Record<string, any> = {
    'Leaf Rust': {
      explanation: 'Leaf rust is a fungal disease that causes orange-brown pustules on wheat leaves, reducing photosynthesis and yield.',
      cause: 'Caused by Puccinia triticina fungus. Thrives in moderate temperatures (15-25°C) and high humidity.',
      immediateAction: 'Apply triazole-based fungicide (e.g., Tebuconazole) at first sign. Remove infected plant material.',
      prevention: 'Use resistant varieties, ensure proper spacing for air circulation, and monitor fields regularly.'
    },
    'Stripe Rust': {
      explanation: 'Stripe rust forms yellow-orange stripes on leaves, can spread rapidly in cool, moist conditions.',
      cause: 'Puccinia striiformis fungus. Favors cooler temperatures (10-15°C) and high humidity.',
      immediateAction: 'Apply systemic fungicide early. Consider resistant varieties for next planting.',
      prevention: 'Monitor weather conditions, avoid excessive nitrogen fertilization, practice crop rotation.'
    },
    'Stem Rust': {
      explanation: 'Stem rust is a serious disease causing reddish-brown pustules on stems and leaves, can cause significant yield loss.',
      cause: 'Puccinia graminis f. sp. tritici. Requires warm temperatures (20-30°C) and moisture.',
      immediateAction: 'Apply protective fungicides immediately. Isolate infected areas to prevent spread.',
      prevention: 'Plant resistant varieties, destroy volunteer wheat plants, monitor for early symptoms.'
    },
    'Septoria': {
      explanation: 'Septoria leaf blotch causes irregular brown lesions on leaves, reducing photosynthetic area.',
      cause: 'Zymoseptoria tritici fungus. Favors warm, wet conditions and high humidity.',
      immediateAction: 'Apply strobilurin or triazole fungicides. Remove heavily infected leaves.',
      prevention: 'Use resistant varieties, avoid excessive irrigation, practice proper field sanitation.'
    },
    'Fusarium': {
      explanation: 'Fusarium head blight affects wheat heads, causing bleaching and toxin production.',
      cause: 'Fusarium graminearum fungus. Thrives in warm, humid conditions during flowering.',
      immediateAction: 'Apply fungicide during flowering. Harvest early and dry grain properly.',
      prevention: 'Use resistant varieties, avoid planting after corn, practice crop rotation.'
    },
    'Healthy': {
      explanation: 'No disease symptoms detected. The wheat leaf appears healthy with normal coloration and structure.',
      cause: 'No pathogenic activity detected. Plant shows normal growth patterns.',
      immediateAction: 'Continue regular monitoring. Maintain good agricultural practices.',
      prevention: 'Keep monitoring schedule, maintain soil health, practice crop rotation.'
    }
  };
  
  return treatments[disease] || treatments['Healthy'];
};

// Mock analysis function
const mockAnalysis = async (file: File): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
  
  const diseases = ['Healthy', 'Leaf Rust', 'Stripe Rust', 'Stem Rust', 'Septoria', 'Fusarium'];
  const disease = diseases[Math.floor(Math.random() * diseases.length)];
  const confidence = disease === 'Healthy' ? 0.9 + Math.random() * 0.1 : 0.6 + Math.random() * 0.35;
  
  // Generate probabilities for all diseases
  const allProbabilities: Record<string, number> = {};
  diseases.forEach(d => {
    if (d === disease) {
      allProbabilities[d] = confidence;
    } else {
      allProbabilities[d] = Math.random() * (1 - confidence) * 0.5;
    }
  });
  
  // Normalize probabilities
  const total = Object.values(allProbabilities).reduce((a, b) => a + b, 0);
  Object.keys(allProbabilities).forEach(key => {
    allProbabilities[key] = allProbabilities[key] / total;
  });
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    fileName: file.name,
    imageUrl: URL.createObjectURL(file),
    disease,
    confidence,
    allProbabilities,
    treatment: getTreatmentData(disease),
    metadata: {
      temperature: 18 + Math.random() * 10,
      humidity: 60 + Math.random() * 25,
      location: 'Field A, Sector 3'
    }
  };
};

export default function AnalysisPage() {
  const [stage, setStage] = useState<AnalysisStage>('upload');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [queueItems, setQueueItems] = useState<AnalysisItem[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const handleFilesChange = (files: UploadedFile[]) => {
    setUploadedFiles(files);
  };

  const startAnalysis = async () => {
    if (uploadedFiles.length === 0) return;
    
    setStage('queue');
    setIsAnalyzing(true);
    
    // Convert uploaded files to queue items
    const initialQueueItems: AnalysisItem[] = uploadedFiles.map(file => ({
      id: file.id,
      fileName: file.file.name,
      preview: file.preview,
      status: 'waiting',
      progress: 0
    }));
    
    setQueueItems(initialQueueItems);
    
    // Process each item
    for (let i = 0; i < initialQueueItems.length; i++) {
      const item = initialQueueItems[i];
      const uploadedFile = uploadedFiles.find(f => f.id === item.id);
      
      if (uploadedFile) {
        // Update status to processing
        setQueueItems(prev => prev.map(q => 
          q.id === item.id ? { ...q, status: 'processing', progress: 0 } : q
        ));
        
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 20) {
          await new Promise(resolve => setTimeout(resolve, 400));
          setQueueItems(prev => prev.map(q => 
            q.id === item.id ? { ...q, progress } : q
          ));
        }
        
        try {
          const result = await mockAnalysis(uploadedFile.file);
          
          setQueueItems(prev => prev.map(q => 
            q.id === item.id ? { 
              ...q, 
              status: 'completed', 
              progress: 100,
              result: {
                disease: result.disease,
                confidence: result.confidence,
                treatment: result.treatment.explanation
              }
            } : q
          ));
        } catch (error) {
          setQueueItems(prev => prev.map(q => 
            q.id === item.id ? { 
              ...q, 
              status: 'error', 
              error: 'Analysis failed' 
            } : q
          ));
        }
      }
    }
    
    setIsAnalyzing(false);
  };

  const stopAnalysis = () => {
    setIsAnalyzing(false);
    setQueueItems(prev => prev.map(q => 
      q.status === 'processing' ? { ...q, status: 'waiting', progress: 0 } : q
    ));
  };

  const viewResult = (item: AnalysisItem) => {
    if (item.result && item.status === 'completed') {
      // Create a full result object
      const result: AnalysisResult = {
        id: item.id,
        fileName: item.fileName,
        imageUrl: item.preview,
        disease: item.result.disease,
        confidence: item.result.confidence,
        allProbabilities: {
          'Healthy': 0.1,
          'Leaf Rust': item.result.disease === 'Leaf Rust' ? item.result.confidence : 0.05,
          'Stripe Rust': item.result.disease === 'Stripe Rust' ? item.result.confidence : 0.05,
          'Stem Rust': item.result.disease === 'Stem Rust' ? item.result.confidence : 0.05,
          'Septoria': item.result.disease === 'Septoria' ? item.result.confidence : 0.05,
          'Fusarium': item.result.disease === 'Fusarium' ? item.result.confidence : 0.05
        },
        treatment: getTreatmentData(item.result.disease),
        metadata: {
          temperature: 18 + Math.random() * 10,
          humidity: 60 + Math.random() * 25,
          location: 'Field A, Sector 3'
        }
      };
      
      setSelectedResult(result);
      setStage('results');
    }
  };

  const resetAnalysis = () => {
    setStage('upload');
    setUploadedFiles([]);
    setQueueItems([]);
    setIsAnalyzing(false);
    setSelectedResult(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${stage === 'upload' ? 'text-primary-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stage === 'upload' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              <Upload className="w-4 h-4" />
            </div>
            <span className="ml-2 font-medium">Upload</span>
          </div>
          
          <div className={`w-16 h-0.5 ${stage !== 'upload' ? 'bg-primary-600' : 'bg-gray-300'}`} />
          
          <div className={`flex items-center ${stage === 'queue' ? 'text-primary-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stage === 'queue' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              <Play className="w-4 h-4" />
            </div>
            <span className="ml-2 font-medium">Analyze</span>
          </div>
          
          <div className={`w-16 h-0.5 ${stage === 'results' ? 'bg-primary-600' : 'bg-gray-300'}`} />
          
          <div className={`flex items-center ${stage === 'results' ? 'text-primary-600' : 'text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              stage === 'results' ? 'bg-primary-600 text-white' : 'bg-gray-200'
            }`}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="ml-2 font-medium">Results</span>
          </div>
        </div>
      </div>

      {/* Stage Content */}
      {stage === 'upload' && (
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Wheat Samples</h1>
            <p className="text-gray-600 mt-2">
              Upload up to 10 wheat leaf images for AI-powered disease analysis
            </p>
          </div>
          
          <ImageUploadZone
            onFilesChange={handleFilesChange}
            maxFiles={10}
            disabled={false}
          />
          
          {uploadedFiles.length > 0 && (
            <div className="flex justify-center">
              <button
                onClick={startAnalysis}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-lg
                         hover:bg-primary-600 transition-colors font-medium"
              >
                <Play className="w-5 h-5" />
                Start Analysis ({uploadedFiles.length} images)
              </button>
            </div>
          )}
        </div>
      )}

      {stage === 'queue' && (
        <ProcessingQueue
          items={queueItems}
          onStartAnalysis={startAnalysis}
          onStopAnalysis={stopAnalysis}
          isAnalyzing={isAnalyzing}
        />
      )}

      {stage === 'results' && selectedResult && (
        <ResultsDisplay
          result={selectedResult}
          onBack={() => setStage('queue')}
        />
      )}

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        {stage !== 'upload' && (
          <button
            onClick={() => stage === 'results' ? setStage('queue') : setStage('upload')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            {stage === 'results' ? 'Back to Queue' : 'Back to Upload'}
          </button>
        )}
        
        {stage === 'queue' && queueItems.some(item => item.status === 'completed') && (
          <button
            onClick={() => {
              const completedItem = queueItems.find(item => item.status === 'completed');
              if (completedItem) viewResult(completedItem);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg
                     hover:bg-primary-600 transition-colors font-medium"
          >
            View Results
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        
        {stage === 'queue' && !isAnalyzing && queueItems.length === 0 && (
          <button
            onClick={resetAnalysis}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            Start New Analysis
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
