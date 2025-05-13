'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previousPath, setPreviousPath] = useState('');
  
  useEffect(() => {
    const currentPath = pathname + searchParams.toString();
    
    if (previousPath && currentPath !== previousPath) {
      setLoading(true);
      setProgress(0);
      
      let progressValue = 0;
      const progressInterval = setInterval(() => {
        progressValue += Math.random() * 10;
        if (progressValue >= 90) {
          clearInterval(progressInterval);
          progressValue = 90;
        }
        setProgress(progressValue);
      }, 100);
      
      setTimeout(() => {
        clearInterval(progressInterval);
        setProgress(100);
        
        setTimeout(() => {
          setLoading(false);
          setProgress(0);
        }, 200);
      }, 300);
    }
    
    setPreviousPath(currentPath);
  }, [pathname, searchParams, previousPath]);
  
  if (!loading) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1">
      <div 
        className="h-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}