'use client';

import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoadingButtonProps {
  children: React.ReactNode;
  onClick: () => Promise<void>;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export default function LoadingButton({
  children,
  onClick,
  disabled = false,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: LoadingButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {typeof children === 'string' ? 'Loading...' : children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}