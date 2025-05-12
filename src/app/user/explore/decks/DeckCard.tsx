'use client';

import Link from 'next/link';
import type { SerializedDeck } from '@/lib/db/data/serialize';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';

interface DeckCardProps {
  deck: SerializedDeck;
}

export default function DeckCard({ deck }: DeckCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {deck.category} &bull; Created on{' '}
          {new Date(deck.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-2 text-muted-foreground">
          {deck.description}
        </p>
      </CardContent>

      <CardFooter className="pt-2">
        <Button asChild size="sm">
          <Link href={`/public/flashcard-library/${deck._id}`}>
            View
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}