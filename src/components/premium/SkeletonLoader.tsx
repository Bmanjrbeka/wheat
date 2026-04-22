"use client";

import { motion } from "framer-motion";

interface SkeletonLoaderProps {
  className?: string;
  height?: string;
  width?: string;
  variant?: "text" | "circular" | "rectangular";
}

export function SkeletonLoader({ 
  className = "", 
  height = "h-4", 
  width = "w-full",
  variant = "rectangular" 
}: SkeletonLoaderProps) {
  const baseClasses = "bg-gray-200 relative overflow-hidden";
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${height} ${width} ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-60"
        animate={{
          x: ["-100%", "100%"]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
}

interface ShimmerCardProps {
  className?: string;
}

export function ShimmerCard({ className = "" }: ShimmerCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <SkeletonLoader variant="circular" width="w-12" height="h-12" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader width="w-3/4" />
          <SkeletonLoader width="w-1/2" height="h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLoader />
        <SkeletonLoader width="w-5/6" />
        <SkeletonLoader width="w-4/5" />
      </div>
      <div className="flex gap-2">
        <SkeletonLoader width="w-20" height="h-8" />
        <SkeletonLoader width="w-16" height="h-8" />
      </div>
    </div>
  );
}

interface ShimmerTableProps {
  rows?: number;
  className?: string;
}

export function ShimmerTable({ rows = 5, className = "" }: ShimmerTableProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <SkeletonLoader width="w-1/3" height="h-6" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="p-4">
            <div className="flex items-center gap-4">
              <SkeletonLoader variant="circular" width="w-10" height="h-10" />
              <div className="flex-1 space-y-2">
                <SkeletonLoader width="w-2/3" />
                <SkeletonLoader width="w-1/3" height="h-3" />
              </div>
              <SkeletonLoader width="w-16" height="h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
