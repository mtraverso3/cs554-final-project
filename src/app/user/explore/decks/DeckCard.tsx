"use client";

import Link from "next/link";
import type { SerializedDeck } from "@/lib/db/data/serialize";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThumbsUp } from "lucide-react";
import { toggleLike } from "@/lib/deckForms";
import { useRouter } from "next/navigation";

interface DeckCardProps {
  deck: SerializedDeck;
  currentUserId: string;
}

export default function DeckCard({ deck, currentUserId }: DeckCardProps) {
  const router = useRouter();

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{deck.name}</CardTitle>
        <CardDescription className="text-sm text-gray-500">
          {deck.category} &bull; Created on{" "}
          {new Date(deck.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-2 text-muted-foreground">{deck.description}</p>
      </CardContent>

      <CardFooter className="pt-2 flex-row justify-between">
        <Button asChild size="sm">
          <Link href={`/user/flashcard-library/${deck._id}`}>View</Link>
        </Button>

        <Button
          onClick={async () => {
            await toggleLike(deck._id);
            router.refresh();
          }}
          variant={deck.likes.includes(currentUserId) ? "default" : "ghost"}
        >
          <ThumbsUp /> {deck.likes.length}
        </Button>
      </CardFooter>
    </Card>
  );
}
