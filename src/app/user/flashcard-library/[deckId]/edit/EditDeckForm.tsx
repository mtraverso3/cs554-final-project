// src/app/user/flashcard-library/[deckId]/edit/EditDeckForm.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

type Flashcard = { front: string; back: string };

type FlashcardDTO = {
  _id: string;
  deckId: string;
  front: string;
  back: string;
};

type DeckDTO = { //todo: consider changing the schema to have `Type`s and `TypeDTO`s
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  createdAt: string; // as string
  lastStudied: string; // as string
  flashcardList: FlashcardDTO[];
};

export default function EditDeckForm({ deck }: { deck: DeckDTO }) {
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description);
  const [cards, setCards] = useState<Flashcard[]>(deck.flashcardList);
  const [saving, setSaving] = useState(false);

  const addCard = () => setCards((c) => [...c, { front: "", back: "" }]);

  return (
    <div className="space-y-6 px-4 py-6">
      {/* Name */}
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Description */}
      <div className="flex items-start gap-2">
        <Textarea
          className="flex-1 resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Flashcards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="relative">
            <CardContent className="space-y-2">
              <Input placeholder="Front" value={card.front} />
              <Input placeholder="Back" value={card.back} />
            </CardContent>
          </Card>
        ))}

        <div
          onClick={addCard}
          className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed py-8 text-gray-400 hover:border-gray-300"
        >
          <Plus size={24} />
          <span className="mt-2">Add Flashcard</span>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button disabled={saving}>{saving ? "Saving…" : "Save Changes"}</Button>
      </div>
    </div>
  );
}
