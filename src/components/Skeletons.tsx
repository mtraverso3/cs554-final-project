'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardSkeletonProps {
  className?: string;
  count?: number;
}

export function CardSkeleton({ className, count = 3 }: CardSkeletonProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="border rounded-lg p-6 h-64 animate-pulse flex flex-col"
        >
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-full mb-1"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
          <div className="flex-1 flex flex-col justify-end">
            <div className="h-4 bg-muted rounded w-full mb-1"></div>
            <div className="h-4 bg-muted rounded w-full mb-1"></div>
            <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
            <div className="flex justify-between">
              <div className="h-9 bg-muted rounded w-24"></div>
              <div className="h-9 bg-muted rounded w-16"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FlashcardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="h-80 border rounded-xl bg-card shadow relative animate-pulse mb-6">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 bg-muted rounded w-3/4 max-w-md"></div>
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div className="h-10 bg-muted rounded w-28"></div>
        <div className="text-center">
          <div className="h-5 bg-muted rounded w-20 mx-auto mb-1"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
        <div className="h-10 bg-muted rounded w-28"></div>
      </div>
    </div>
  );
}

export function QuizSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-pulse">
      {/* question */}
      <div>
        <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-muted rounded w-full mb-8"></div>
      </div>
      
      {/* options */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-full p-4 rounded-lg border">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-muted mr-3"></div>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* navi */}
      <div className="flex justify-between pt-4">
        <div className="h-10 bg-muted rounded w-28"></div>
        <div className="h-10 bg-muted rounded w-28"></div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex items-center space-x-6">
        <div className="h-24 w-24 bg-muted rounded-full"></div>
        <div className="space-y-3">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-5 bg-muted rounded w-64"></div>
          <div className="pt-4 flex space-x-2">
            <div className="h-10 bg-muted rounded w-32"></div>
            <div className="h-10 bg-muted rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FlashcardStudySkeleton() {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full w-1/3"></div>
        </div>
        
        {/* flashcaeds */}
        <div className="relative h-80 mb-6">
          <div className="w-full h-full border rounded-xl bg-white shadow animate-pulse flex items-center justify-center">
            <div className="h-8 bg-muted rounded w-1/2 max-w-xs"></div>
          </div>
        </div>
        
        {/* controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
          
          <div className="flex flex-col items-center">
            <div className="flex items-center mb-1 gap-2">
              <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-8 rounded-full bg-muted animate-pulse"></div>
            </div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          
          <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
        </div>
        
        {/* action buttons */}
        <div className="flex justify-between w-full max-w-xl mx-auto mt-8">
          <div className="h-12 w-32 bg-red-100 rounded animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-12 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-12 w-24 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-32 bg-green-100 rounded animate-pulse"></div>
        </div>
      </div>
    );
  }

  export function QuizStudySkeleton() {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-4">
          <div className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          
          <div className="flex flex-col items-center">
            <div className="h-7 w-48 bg-muted rounded animate-pulse mb-1"></div>
            <div className="h-5 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="h-6 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-9 w-9 bg-muted rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div className="bg-primary h-2 rounded-full w-1/3"></div>
        </div>
        
        {/* question */}
        <div className="mb-6">
          <div className="h-8 w-3/4 bg-muted rounded animate-pulse mb-4"></div>
          <div className="bg-blue-50 px-4 py-2 rounded-md flex items-center mb-4">
            <div className="h-5 w-full bg-blue-100 rounded animate-pulse"></div>
          </div>
        </div>
        
        {/* anwer options */}
        <div className="space-y-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-full p-4 rounded-lg border animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-muted mr-3"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* navi */}
        <div className="flex justify-between">
          <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-10 w-20 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }
  
  export function DeckEditSkeleton() {
    return (
      <div className="space-y-6 px-4 py-6 animate-pulse">
        <div className="space-y-2">
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-9 w-full bg-muted rounded"></div>
        </div>
        
        <div className="space-y-2">
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-24 w-full bg-muted rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="h-5 w-20 bg-muted rounded"></div>
            <div className="h-9 w-full bg-muted rounded"></div>
          </div>
          
          <div className="space-y-2">
            <div className="h-5 w-16 bg-muted rounded"></div>
            <div className="h-9 w-20 bg-muted rounded"></div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="h-5 w-24 bg-muted rounded"></div>
          <div className="h-5 w-64 bg-muted rounded"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="border rounded-md p-6 h-32">
              <div className="h-9 w-full bg-muted rounded mb-3"></div>
              <div className="h-9 w-full bg-muted rounded"></div>
            </div>
          ))}
          
          <div className="border-2 border-dashed rounded-md p-6 h-32 flex flex-col items-center justify-center gap-2">
            <div className="h-8 w-8 rounded-full bg-muted"></div>
            <div className="h-5 w-32 bg-muted rounded"></div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <div className="h-10 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  export function QuizEditSkeleton() {
    return (
      <div className="container mx-auto py-8 px-4 animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="h-10 w-32 bg-muted rounded"></div>
          <div className="h-8 w-48 bg-muted rounded"></div>
          <div className="h-10 w-32 bg-muted rounded"></div>
        </div>
        
        <div className="space-y-6">
          <div className="border rounded-lg p-6">
            <div className="h-6 w-48 bg-muted rounded mb-4"></div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded"></div>
                <div className="h-9 w-full bg-muted rounded"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded"></div>
                <div className="h-24 w-full bg-muted rounded"></div>
              </div>
              
              <div className="space-y-2">
                <div className="h-5 w-24 bg-muted rounded"></div>
                <div className="h-9 w-full bg-muted rounded"></div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="h-6 w-36 bg-muted rounded mb-4"></div>
            
            {[1, 2].map((i) => (
              <div key={i} className="border rounded-lg p-6 mb-4">
                <div className="h-9 w-full bg-muted rounded mb-4"></div>
                
                <div className="space-y-3 mb-4">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="h-9 w-full bg-muted rounded"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="h-9 w-28 bg-muted rounded"></div>
                        <div className="h-9 w-9 bg-muted rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-end">
                  <div className="h-9 w-32 bg-muted rounded"></div>
                </div>
              </div>
            ))}
            
            <div className="border-dashed border-2 rounded-lg py-6 text-center">
              <div className="h-6 w-32 bg-muted rounded mx-auto"></div>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <div className="h-10 w-24 bg-muted rounded"></div>
            <div className="h-10 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }