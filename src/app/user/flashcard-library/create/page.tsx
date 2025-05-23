"use client";
import { ChangeEvent, useState } from "react";
import { addDeck } from "@/lib/quizForms";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DeckCreateSchema } from "@/lib/db/data/safeSchema";
import * as Yup from "yup";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface DeckForm {
  name: string;
  description: string;
  category: string;
  published: boolean;
}

export default function CreateDeck() {
  const router = useRouter();
  const [deckInfo, setDeckInfo] = useState<DeckForm>({
    name: "",
    description: "",
    category: "",
    published: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string[] | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setDeckInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setDeckInfo((prev) => ({ ...prev, published: checked }));
  };

  const finishDeck = async () => {
    setError(null);

    try {
      await DeckCreateSchema.validate(deckInfo, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        setError(validationError.errors); // Or join all errors
        return;
      }
    }
    
    setIsSubmitting(true);
    
    try {
      await addDeck(deckInfo.name, deckInfo.description, deckInfo.category, deckInfo.published);
      router.push("/user/flashcard-library");
    } catch (error) {
      console.error(error);
      setError([error instanceof Error ? error.message : "Error creating deck"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Create New Deck</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded space-y-1" role="alert">
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
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Deck Name
          </label>
          <Input
            name="name"
            value={deckInfo.name}
            onChange={handleInputChange}
            placeholder="Enter deck name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description
          </label>
          <Textarea
            name="description"
            value={deckInfo.description}
            onChange={handleInputChange}
            placeholder="Enter deck description"
            rows={3}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Category
          </label>
          <Input
            name="category"
            value={deckInfo.category}
            onChange={handleInputChange}
            placeholder="Enter deck category (e.g., Math, Science, Languages)"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Public
          </Label>
          <Switch
            name="published"
            checked={deckInfo.published}
            onCheckedChange={handleSwitchChange}
            required
          />
        </div>
        
        <Button 
          onClick={finishDeck}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating..." : "Create Deck"}
        </Button>
      </div>
    </div>
  );
}