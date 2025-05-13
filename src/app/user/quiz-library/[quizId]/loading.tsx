import { QuizSkeleton } from '@/components/Skeletons';

export default function QuizViewLoading() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
          
          <div className="flex flex-col items-center">
            <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2"></div>
            <div className="h-5 w-28 bg-muted rounded animate-pulse"></div>
          </div>
          
          <div className="flex gap-2">
            <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-muted rounded animate-pulse"></div>
          </div>
        </div>
        <div className="mt-2 text-center">
          <div className="h-5 w-3/4 max-w-md mx-auto bg-muted rounded animate-pulse"></div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>
      
      <QuizSkeleton />
    </div>
  );
}