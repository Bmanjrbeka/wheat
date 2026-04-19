"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, Camera, Image as ImageIcon } from "lucide-react";

interface UploadedFile {
  file: File;
  preview: string;
  id: string;
}

interface Props {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.webp']
};

export function ImageUploadZone({ 
  onFilesChange, 
  maxFiles = 10, 
  disabled = false 
}: Props) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError('File size must be less than 10MB');
      } else if (rejection.errors.some((e: any) => e.code === 'too-many-files')) {
        setError(`Maximum ${maxFiles} files allowed`);
      } else {
        setError('Invalid file type. Please upload images only.');
      }
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }));

    const updatedFiles = [...uploadedFiles, ...newFiles].slice(0, maxFiles);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  }, [uploadedFiles, maxFiles, onFilesChange]);

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== id);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: maxFiles - uploadedFiles.length,
    maxSize: MAX_FILE_SIZE,
    disabled: disabled || uploadedFiles.length >= maxFiles
  });

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400 bg-white'
          }
          ${(disabled || uploadedFiles.length >= maxFiles)
            ? 'opacity-50 cursor-not-allowed'
            : ''
          }
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragActive ? 'bg-primary-500' : 'bg-gray-100'}
          `}>
            {isDragActive ? (
              <Upload className="w-8 h-8 text-white" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? 'Drop images here' : 'Upload wheat leaf images'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag & drop, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              JPG, PNG, WEBP • Max 10MB • Up to {maxFiles} images
            </p>
          </div>
        </div>
      </div>

      {/* Camera Capture Button */}
      <label className="
        flex items-center justify-center gap-2 w-full
        py-3 px-4 bg-white border border-gray-300 rounded-lg
        text-gray-700 font-medium cursor-pointer
        hover:bg-gray-50 transition-colors
      ">
        <Camera className="w-5 h-5" />
        Take Photo with Camera
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          disabled={disabled || uploadedFiles.length >= maxFiles}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              onDrop(files, []);
            }
            e.target.value = '';
          }}
        />
      </label>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* File Preview Grid */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Selected Images ({uploadedFiles.length}/{maxFiles})
            </p>
            <button
              onClick={() => {
                setUploadedFiles([]);
                onFilesChange([]);
              }}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200"
              >
                <img
                  src={uploadedFile.preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                
                {/* Remove Button */}
                <button
                  onClick={() => removeFile(uploadedFile.id)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                           flex items-center justify-center opacity-0 group-hover:opacity-100 
                           transition-opacity duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                  <p className="text-xs text-white truncate">
                    {uploadedFile.file.name}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
