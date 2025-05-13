import { ProfileSkeleton } from '@/components/Skeletons';

export default function ProfileLoading() {
  return (
    <main className="container mx-auto py-8 pr-4">
      <ProfileSkeleton />
    </main>
  );
}