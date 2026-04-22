"use client";

interface UploadZoneProps {
  children?: any;
  className?: string;
}

export function UploadZone({ children, className = "" }: UploadZoneProps) {
  return (
    <div className={`w-full space-y-4 ${className}`}>
      {children}
    </div>
  );
}
