"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { CloudUpload, X, Camera, Image as ImageIcon } from "lucide-react";
import Image from "next/image";

interface UploadZoneProps {
  onUpload: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number;
  className?: string;
}

export function UploadZone({ 
  onUpload, 
  maxFiles = 10, 
  maxSize = 10 * 1024 * 1024, // 10MB
  className = "" 
}: UploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/') && file.size <= maxSize
    );
    
    const newFiles = [...uploadedFiles, ...validFiles].slice(0, maxFiles);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
  }, [uploadedFiles, maxFiles, maxSize, onUpload]);

  const { getRootProps, getInputProps, isDragActive: isDragging } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    maxFiles,
    maxSize,
    multiple: true,
    onDragEnter: () => setIsDragActive(true),
    onDragLeave: () => setIsDragActive(false),
    onDropAccepted: () => setIsDragActive(false),
    onDropRejected: () => setIsDragActive(false),
  });

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onUpload(newFiles);
  };

  const openCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        onDrop(Array.from(files));
      }
    };
    input.click();
  };

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Main Upload Container with Glassmorphism */}
      <motion.div
        {...getRootProps()}
        className={`
          relative overflow-hidden rounded-2xl 
          backdrop-blur-md bg-glass-white30 border border-glass-white20
          transition-all duration-300 cursor-pointer
          ${isDragActive || isDragging 
            ? 'border-primary-500 bg-glass-white40 scale-[1.02]' 
            : 'border-gray-200 hover:border-gray-300'
          }
        `}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <input {...getInputProps()} />
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent"
            animate={{
              background: [
                "linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)",
                "linear-gradient(225deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)",
                "linear-gradient(45deg, transparent 30%, rgba(34, 197, 94, 0.1) 50%, transparent 70%)",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        {/* Upload Content */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <motion.div
            animate={{
              scale: isDragActive || isDragging ? 1.1 : 1,
              rotate: isDragActive || isDragging ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <CloudUpload className="w-16 h-16 text-primary-600" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isDragActive || isDragging 
                ? "Drop your wheat leaf images here" 
                : "Upload wheat leaf images for analysis"
              }
            </h3>
            <p className="text-gray-600 mb-4">
              Drag & drop images here, or click to browse
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-500">
              <span>Max {maxFiles} files</span>
              <span>·</span>
              <span>Up to {Math.round(maxSize / 1024 / 1024)}MB each</span>
              <span>·</span>
              <span>JPG, PNG, WebP</span>
            </div>
          </motion.div>

          {/* Camera Button */}
          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openCamera();
            }}
            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </motion.button>
        </div>
      </motion.div>

      {/* File Previews */}
      <AnimatePresence>
        {uploadedFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            {uploadedFiles.map((file, index) => (
              <motion.div
                key={`${file.name}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="relative group"
              >
                <div className="relative overflow-hidden rounded-lg bg-gray-100 border border-gray-200">
                  {/* Image Preview with Next.js optimization */}
                  <div className="aspect-square relative">
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Remove Button */}
                    <motion.button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  {/* File Info */}
                  <div className="p-2">
                    <p className="text-xs text-gray-600 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress Indicator */}
      {uploadedFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between p-4 bg-primary-50 rounded-lg border border-primary-200"
        >
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              {uploadedFiles.length} file{uploadedFiles.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <span className="text-xs text-primary-700">
            Ready for analysis
          </span>
        </motion.div>
      )}
    </div>
  );
}
