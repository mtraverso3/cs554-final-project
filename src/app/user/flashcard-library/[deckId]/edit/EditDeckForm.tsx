"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { updateDeck } from "@/lib/deckForms";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [name, setName] = useState(deck.name);
  const [description, setDescription] = useState(deck.description);
  const [cards, setCards] = useState<Flashcard[]>(
    deck.flashcardList.map(card => ({ front: card.front, back: card.back }))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCard = () => setCards(prev => [...prev, { front: "", back: "" }]);

  const updateCard = (index: number, field: keyof Flashcard, value: string) => {
    setCards(prevCards => {
      const newCards = [...prevCards];
      newCards[index] = { ...newCards[index], [field]: value };
      return newCards;
    });
  };

  const removeCard = (index: number) => {
    setCards(prevCards => prevCards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const validCards = cards.filter(card => card.front.trim() !== '' || card.back.trim() !== '');
      const result = await updateDeck(
        deck._id,
        name,
        description,
        validCards
      );
      
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.success) {
        router.push('/user/flashcard-library');
      } else {
        setError(parsedResult.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving deck:", error);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {/* Name */}
      <div className="flex items-center gap-2">
        <Input
          className="flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Deck Name"
        />
      </div>

      {/* Description */}
      <div className="flex items-start gap-2">
        <Textarea
          className="flex-1 resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deck Description"
        />
      </div>

      {/* Flashcards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="relative">
            <CardContent className="space-y-2 pt-6">
              <Input 
                placeholder="Front" 
                value={card.front} 
                onChange={(e) => updateCard(i, "front", e.target.value)}
              />
              <Input 
                placeholder="Back" 
                value={card.back} 
                onChange={(e) => updateCard(i, "back", e.target.value)}
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 h-6 w-6"
                onClick={() => removeCard(i)}
              >
                <Trash2 size={16} />
              </Button>
            </CardContent>
          </Card>
        ))}

        <div
          onClick={addCard}
          className="flex cursor-pointer flex-col items-center justify-center rounded border-2 border-dashed py-8 text-gray-400 hover:border-gray-300 hover:text-gray-500 transition-colors"
        >
          <Plus size={24} />
          <span className="mt-2">Add Flashcard</span>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end">
        <Button disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
