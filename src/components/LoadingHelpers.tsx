'use client';

import React, { useState, useEffect } from 'react';
import { CardSkeleton } from '@/components/Skeletons';
import { Skeleton } from '@/components/ui/skeleton';
import { Suspense } from 'react';

interface WithLoadingProps {
  isLoading: boolean;
  loadingComponent?: React.ReactNode;
  children: React.ReactNode;
}

export function WithLoading({
  isLoading,
  loadingComponent,
  children
}: WithLoadingProps) {
  return isLoading ? (loadingComponent || <Skeleton className="h-40 w-full" />) : children;
}

export function withLoadingState<T extends object>(
  WrappedComponent: React.ComponentType<T>,
  LoadingComponent: React.ReactNode
) {
  return function WithLoadingState(props: T & { isLoading?: boolean }) {
    const { isLoading, ...rest } = props;
    
    if (isLoading) {
      return LoadingComponent;
    }
    
    return <WrappedComponent {...(rest as T)} />;
  };
}

export function DataFetchWrapper<T>({
  fetchDataAction,
  renderContentAction,
  loadingComponent = <CardSkeleton count={3} />,
  errorComponent = <div className="text-red-500 p-4">Failed to load data</div>,
  deps = [],
}: {
  fetchDataAction: () => Promise<T>;
  renderContentAction: (data: T) => React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  deps?: React.DependencyList;
}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const result = await fetchDataAction();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'));
      } finally {
        setLoading(false);
      }
    };
    
    getData();
  }, deps);
  
  if (loading) return loadingComponent;
  if (error) return errorComponent;
  if (!data) return errorComponent;
  
  return renderContentAction(data);
}

export function SuspenseWrapper({
  children,
  fallback
}: {
  children: React.ReactNode;
  fallback: React.ReactNode;
}) {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
}