'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
  centered?: boolean;
  className?: string;
}

export default function Loading({
  text,
  size = 'md',
  fullScreen = false,
  centered = true,
  className,
}: LoadingProps) {
  const sizeMap = {
    sm: {
      spinner: 'h-5 w-5',
      text: 'text-sm'
    },
    md: {
      spinner: 'h-8 w-8',
      text: 'text-base'
    },
    lg: {
      spinner: 'h-12 w-12',
      text: 'text-lg'
    },
    xl: {
      spinner: 'h-16 w-16',
      text: 'text-xl'
    }
  };
  
  const { spinner, text: textSize } = sizeMap[size];
  
  return (
    <div className={cn(
      'flex flex-col items-center justify-center',
      fullScreen && 'fixed inset-0 bg-background/80 backdrop-blur-sm z-50',
      centered && !fullScreen && 'h-full min-h-[12rem]',
      className
    )}>
      <Loader2 
        className={cn(
          'animate-spin text-primary', 
          spinner
        )} 
      />
      
      {text && (
        <p className={cn(
          'mt-4 text-muted-foreground animate-pulse', 
          textSize
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

export function PageLoading() {
  return (
    <Loading 
      text="Loading page..." 
      size="lg" 
      fullScreen={false} 
      centered={true}
    />
  );
}

export function FullScreenLoading() {
  return (
    <Loading 
      text="Loading..." 
      size="xl" 
      fullScreen={true} 
      centered={true}
    />
  );
}

export function InlineLoading() {
  return (
    <div className="flex items-center space-x-2">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">Loading...</span>
    </div>
  );
}