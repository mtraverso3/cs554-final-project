"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import { updateDeck } from "@/lib/deckForms";
import { useRouter } from "next/navigation";
import { DeckInputSchema, FlashcardInput, QuizInputEntry } from "@/lib/db/data/safeSchema"; // safe for front end
import * as Yup from "yup";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { generateQuizEntryAction } from '@/lib/quizForms';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditDeckForm({ deck }: { deck: string }) {
  const parsedDeck = JSON.parse(deck);

  const router = useRouter();
  const [name, setName] = useState(parsedDeck.name);
  const [description, setDescription] = useState(parsedDeck.description);
  const [category, setCategory] = useState(parsedDeck.category);
  const [published, setPublished] = useState(parsedDeck.published);
  const [cards, setCards] = useState<FlashcardInput[]>(
    parsedDeck.flashcardList.map(
      (card: { _id: string; front: string; back: string }) => ({
        _id: parsedDeck._id,
        front: card.front,
        back: card.back,
      }),
    ),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string[] | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressStates, setProgressStates] = useState<{ status: 'pending' | 'loading' | 'success' | 'error'; question: string; error?: string }[]>([]);

  const addCard = () =>
    setCards((prev) => [
      ...prev,
      { _id: "placeholderId", front: "", back: "" },
    ]);

  const updateCard = (
    index: number,
    field: keyof FlashcardInput,
    value: string,
  ) => {
    setCards((prevCards) => {
      const newCards = [...prevCards];
      newCards[index] = { ...newCards[index], [field]: value };
      return newCards;
    });
  };

  const removeCard = (index: number) => {
    setCards((prevCards) => prevCards.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError(null);

    const formData = {
      _id: parsedDeck._id.toString(),
      name,
      description,
      category: parsedDeck.category, // assuming category is not editable
      flashcardList: cards,
      published,
    };

    try {
      await DeckInputSchema.validate(formData, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        console.log(validationError.errors);
        setError(validationError.errors); // Or join all errors
        return;
      }
    }

    setSaving(true);

    try {
      const validCards = cards.filter(
        (card) => card.front.trim() !== "" || card.back.trim() !== "",
      );
      const result = await updateDeck(
        parsedDeck._id.toString(),
        name,
        description,
        validCards,
          published,
      );

      const parsedResult = JSON.parse(result);

      if (parsedResult.success) {
        router.push("/user/flashcard-library");
      } else {
        setError(parsedResult.error || "Failed to save changes");
      }
    } catch (error) {
      console.error("Error saving deck:", error);
      setError(["An unexpected error occurred"]);
    } finally {
      setSaving(false);
    }
  };

  const handleConvertToQuiz = async () => {
    setError(null);
    setSaving(true);
    setShowProgressModal(true);
    setProgressStates(cards.map(card => ({ status: 'pending', question: card.front })));
    const quizEntries: QuizInputEntry[] = new Array(cards.length);
    const promises = cards.map((card, i) =>
      generateQuizEntryAction(card.front, card.back)
        .then((entry) => {
          quizEntries[i] = entry;
          setProgressStates(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'success' } : p));
        })
        .catch((err) => {
          setProgressStates(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error', error: err instanceof Error ? err.message : 'Error' } : p));
        })
        .finally(() => {
          setProgressStates(prev => prev.map((p, idx) => {
            if (idx === i && prev[idx].status === 'pending') {
              return { ...p, status: 'success' };
            }
            return p;
          }));
        })
    );
    await Promise.allSettled(promises);
    setShowProgressModal(false);
    if (progressStates.some((p) => p.status === 'error')) {
      setError(['Failed to generate one or more quiz questions.']);
      setSaving(false);
      return;
    }
    const params = new URLSearchParams({
      fromDeck: '1',
      name: name || '',
      description: description || '',
      category: category || '',
      published: String(!!published),
      questions: JSON.stringify(quizEntries),
    });
    router.push(`/user/quiz-library/create?${params.toString()}`);
    setSaving(false);
  };

  return (
    <div className="space-y-6 px-4 py-6">
      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded space-y-1"
          role="alert"
        >
          {Array.isArray(error) ? (
            <ul className="list-disc list-inside text-sm">
              {error.map((errMsg, idx) => (
                <li key={idx}>{errMsg}</li>
              ))}
            </ul>
          ) : (
            <span className="block sm:inline">{error}</span>
          )}
        </div>
      )}

      {/* Name */}
      <div className="space-y-2">
        <Label>Deck Name</Label>
        <Input
          className="flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Deck Name"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          className="flex-1 resize-y"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Deck Description"
        />
      </div>

      {/*side by side*/}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label>Category</Label>
          <Input
            className="flex-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Deck Category"
          />
        </div>

        {/* Published (switch true/false)*/}
        <div className="space-y-2">
          <Label>Public</Label>
          <Switch
            name="published"
            checked={published}
            onCheckedChange={setPublished}
            required
          />
        </div>
      </div>

      {/* Flashcards grid */}
      <div className="space-y-2">
        <Label>Flashcards</Label>
        <p className="text-sm text-gray-500">
          Add, edit, or remove flashcards for this deck.
        </p>
      </div>
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
      <div className="flex justify-between gap-2">
        <Button disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save Changes"}
        </Button>
        <Button variant="secondary" disabled={saving} onClick={handleConvertToQuiz}>
          {saving ? "Converting..." : "Convert to Quiz"}
        </Button>
      </div>

      <Dialog open={showProgressModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generating Quiz</DialogTitle>
          </DialogHeader>
          <div className="my-4 text-center">Generating quiz from deck. This may take a few moments…</div>
          <div className="space-y-2">
            {progressStates.map((p, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="truncate flex-1 text-left text-xs">{p.question}</span>
                {p.status === 'pending' && <Skeleton className="h-2 w-24" />}
                {p.status === 'loading' && <Skeleton className="h-2 w-24 animate-pulse bg-blue-800" />}
                {p.status === 'success' && <span className="text-green-600 text-xs">✓</span>}
                {p.status === 'error' && <span className="text-red-600 text-xs">✗</span>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
