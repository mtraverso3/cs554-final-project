import { CardSkeleton } from '@/components/Skeletons';

export default function QuizLibraryLoading() {
  return (
    <div className="container mx-auto py-8 px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quiz Library</h1>
        <div className="h-10 w-32 bg-muted rounded animate-pulse"></div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <div className="h-9 bg-muted rounded w-full animate-pulse"></div>
        </div>
        <div className="h-9 w-44 bg-muted rounded animate-pulse"></div>
      </div>

      <CardSkeleton count={6} />
    </div>
  );
}