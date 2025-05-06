"use client";
import { ChangeEvent, useState } from "react";
import { addDeck } from "@/lib/quizForms";

interface DeckForm {
  name: string;
  description: string;
  category: string;
}

export default function CreateDeck() {
  const [deckInfo, setDeckInfo] = useState<DeckForm>({
    name: "",
    description: "",
    category: "",
  });

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDeckInfo((prev) => ({ ...prev, [name]: value }));
  };

  const finishDeck = async () => {
    try {
      await addDeck(deckInfo.name, deckInfo.description, deckInfo.category);
      alert("Deck created successfully");
    } catch (error) {
      console.error(error);
      alert("Error creating deck");
    }
  };

  return (
    <div className="space-y-4">
      <label className="block">
        Name:
        <input
          name="name"
          type="text"
          value={deckInfo.name}
          onChange={handleInputChange}
          className="mt-1 w-full outline-1"
        />
      </label>
      <label className="block">
        Description:
        <input
          name="description"
          type="text"
          value={deckInfo.description}
          onChange={handleInputChange}
          className="mt-1 w-full outline-1"
        />
      </label>
      <label className="block">
        Category:
        <input
          name="category"
          type="text"
          value={deckInfo.category}
          onChange={handleInputChange}
          className="mt-1 w-full outline-1"
        />
      </label>
      <button
        onClick={() => finishDeck()}
        className="bg-black text-white rounded p-2"
      >
        Create Deck
      </button>
    </div>
  );
}
