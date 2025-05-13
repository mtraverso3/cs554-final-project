import { CardSkeleton } from '@/components/Skeletons';

export default function ExploreDecksLoading() {
  return (
    <div className="px-6 py-8">
      <h1 className="text-3xl font-semibold mb-6">Explore Public Decks</h1>
      
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8 animate-pulse">
        <div className="flex-1 h-9 bg-muted rounded"></div>
        <div className="h-9 w-48 bg-muted rounded"></div>
        <div className="h-9 w-56 bg-muted rounded"></div>
      </div>
      
      <CardSkeleton count={9} />
    </div>
  );
}