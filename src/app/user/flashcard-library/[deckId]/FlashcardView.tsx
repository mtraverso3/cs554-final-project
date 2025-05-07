"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Edit, X, Check, List, BookOpen, Volume2, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { updateDeck } from "@/lib/deckForms";
import { useRouter } from "next/navigation";

type FlashcardDTO = {
  _id: string;
  deckId: string;
  front: string;
  back: string;
};

type DeckDTO = {
  _id: string;
  ownerId: string;
  name: string;
  description: string;
  category: string;
  createdAt: string;
  lastStudied: string;
  flashcardList: FlashcardDTO[];
};

export default function FlashcardView({ deck }: { deck: DeckDTO }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [editing, setEditing] = useState<null | number>(null);
  const [editValues, setEditValues] = useState({ front: "", back: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [cards, setCards] = useState<FlashcardDTO[]>(deck.flashcardList);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const hasCards = cards.length > 0;
  const currentCard = hasCards ? cards[currentIndex] : null;

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // txt to speech bc y not (i had time)
  const speakCardContent = (card: FlashcardDTO, isBackSide: boolean = false, isListView: boolean = false) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      setIsSpeaking(true);
      
      if (isListView) {
        const frontIntroUtterance = new SpeechSynthesisUtterance("Front side.");
        const frontUtterance = new SpeechSynthesisUtterance(card.front);
        const pauseUtterance = new SpeechSynthesisUtterance(" ");
        pauseUtterance.rate = 0.1;
        const backIntroUtterance = new SpeechSynthesisUtterance("Back side.");
        const backUtterance = new SpeechSynthesisUtterance(card.back);
        
        frontIntroUtterance.lang = 'en-US';
        frontUtterance.lang = 'en-US';
        backIntroUtterance.lang = 'en-US';
        backUtterance.lang = 'en-US';
        
        backUtterance.onend = () => {
          setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(frontIntroUtterance);
        window.speechSynthesis.speak(frontUtterance);
        window.speechSynthesis.speak(pauseUtterance);
        window.speechSynthesis.speak(backIntroUtterance);
        window.speechSynthesis.speak(backUtterance);
      } else {
        const textToRead = isBackSide ? card.back : card.front;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        utterance.lang = 'en-US';
        
        utterance.onend = () => {
          setIsSpeaking(false);
        };
        
        window.speechSynthesis.speak(utterance);
      }
    } else {
      alert("Sorry, your browser doesn't support text-to-speech!"); // in case someone does have this feature
    }
  };
  
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const nextCard = () => {
    if (editing !== null) return;
    
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
  };

  const prevCard = () => {
    if (editing !== null) return;
    
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
  };

  const flipCard = () => {
    if (editing !== null) return;
    setIsFlipped(!isFlipped);
  };

  const startEditing = (index: number) => {
    if (!cards[index]) return;
    
    setEditing(index);
    setEditValues({
      front: cards[index].front,
      back: cards[index].back
    });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const saveEditing = async (cardIndex?: number) => {
    const indexToEdit = cardIndex !== undefined ? cardIndex : editing;
    
    if (indexToEdit === null || indexToEdit === undefined) return;
    
    const updatedCards = [...cards];
    updatedCards[indexToEdit] = {
      ...updatedCards[indexToEdit],
      front: editValues.front,
      back: editValues.back
    };
    
    setIsSaving(true);
    
    try {
      const cardsForApi = updatedCards.map(card => ({
        front: card.front,
        back: card.back
      }));
      
      const result = await updateDeck(
        deck._id,
        deck.name,
        deck.description,
        cardsForApi
      );
      
      const parsedResult = JSON.parse(result);
      
      if (parsedResult.success) {
        setCards(updatedCards);
        setEditing(null);
        router.refresh();
      } else {
        alert("Failed to save changes: " + parsedResult.error);
      }
    } catch (error) {
      console.error("Error saving card:", error);
      alert("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const saveAndNavigateToLibrary = async () => {
    if (editing !== null) {
      await saveEditing();
    }
    
    router.push('/user/flashcard-library');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Link href="/user/flashcard-library" className="flex items-center text-gray-600 hover:text-gray-900">
            <Button variant="outline">
              <Home className="mr-2" size={16} />
              Back to Library
            </Button>
          </Link>
          
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{deck.name}</h1>
            <span className="ml-4 text-gray-500">{cards.length} cards</span>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/user/flashcard-library/${deck._id}/edit`}>
                <Edit className="mr-2" size={16} />
                Edit Deck
              </Link>
            </Button>
          </div>
        </div>
        <p className="mt-2 text-gray-600 text-center">{deck.description}</p>
      </div>
      
      {/* mode switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-md shadow-sm">
          <Button
            variant={viewMode === 'card' ? 'default' : 'outline'}
            className="rounded-r-none"
            onClick={() => setViewMode('card')}
          >
            <BookOpen className="mr-2" size={16} />
            Card View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            className="rounded-l-none"
            onClick={() => setViewMode('list')}
          >
            <List className="mr-2" size={16} />
            List View
          </Button>
        </div>
      </div>
      
      {hasCards ? (
        <>
        {/* card view (to flip the flashcards) */}
          {viewMode === 'card' && (
            <div className="max-w-2xl mx-auto">
              <div className="relative h-80 mb-6 perspective">
                <div
                  className={`flip-card w-full h-full ${isFlipped ? 'flipped' : ''}`}
                  onClick={flipCard}
                >
                  {/* front */}
                  <div className="card-face border rounded-xl bg-white shadow p-8 flex items-center justify-center">
                    {editing === currentIndex ? (
                      <div 
                        className="w-full h-full flex flex-col justify-center" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="font-medium mb-2">Front</label>
                        <Input
                          value={editValues.front}
                          onChange={(e) => setEditValues({ ...editValues, front: e.target.value })}
                          className="mb-4"
                          placeholder="Flashcard front"
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={cancelEditing}
                            disabled={isSaving}
                          >
                            <X size={16} className="mr-1" />
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveEditing(currentIndex)}
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : (
                              <>
                                <Check size={16} className="mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl font-medium text-center">{currentCard?.front}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(currentIndex);
                          }}
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                        >
                          <Edit size={18} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* back */}
                  <div className="card-face card-back border rounded-xl bg-white shadow p-8 flex items-center justify-center">
                    {editing === currentIndex ? (
                      <div 
                        className="w-full h-full flex flex-col justify-center" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="font-medium mb-2">Back</label>
                        <Input
                          value={editValues.back}
                          onChange={(e) => setEditValues({ ...editValues, back: e.target.value })}
                          className="mb-4"
                          placeholder="Flashcard back"
                        />
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={cancelEditing}
                            disabled={isSaving}
                          >
                            <X size={16} className="mr-1" />
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => saveEditing(currentIndex)}
                            disabled={isSaving}
                          >
                            {isSaving ? "Saving..." : (
                              <>
                                <Check size={16} className="mr-1" />
                                Save
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-xl font-medium text-center">{currentCard?.back}</p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(currentIndex);
                          }}
                          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                        >
                          <Edit size={18} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* txt to speech and navigation */}
              <div className="flex justify-between items-center mb-8">
                <Button 
                  variant="outline" 
                  onClick={prevCard}
                  disabled={editing !== null}
                >
                  <ChevronLeft size={20} />
                  Previous
                </Button>
                
                <div className="flex flex-col items-center">
                  <div className="flex items-center mb-1">
                    <span className="text-sm text-gray-500 mr-2">
                      {currentIndex + 1} of {cards.length}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`rounded-full p-2 ${isSpeaking ? 'bg-blue-100' : ''}`}
                      onClick={() => {
                        if (currentCard) {
                          if (isSpeaking) {
                            stopSpeaking();
                          } else {
                            speakCardContent(currentCard, isFlipped);
                          }
                        }
                      }}
                      disabled={!currentCard || editing !== null}
                    >
                      <Volume2 size={16} className={isSpeaking ? 'text-blue-600' : ''} />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400">Click card to flip</p>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={nextCard}
                  disabled={editing !== null}
                >
                  Next
                  <ChevronRight size={20} />
                </Button>
              </div>
            </div>
          )}
          
          {/* list view (flashcards in a list) */}
          {viewMode === 'list' && (
            <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                {cards.map((card, idx) => (
                  <div key={card._id} className="border rounded-lg shadow overflow-hidden">
                    <div className="bg-gray-50 p-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">Card {idx + 1}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-full p-1"
                          onClick={() => {
                            if (isSpeaking) {
                              stopSpeaking();
                            } else {
                              speakCardContent(card, false, true);
                            }
                          }}
                          disabled={editing === idx}
                        >
                          <Volume2 size={14} className={isSpeaking ? 'text-blue-600' : ''} />
                        </Button>
                      </div>
                      
                      <div className="flex space-x-2">
                        {editing === idx ? (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={cancelEditing}
                              disabled={isSaving}
                            >
                              <X size={16} className="mr-1" />
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              onClick={() => saveEditing(idx)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Saving..." : (
                                <>
                                  <Check size={16} className="mr-1" />
                                  Save
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditing(idx)}
                          >
                            <Edit size={16} className="mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">Front</h3>
                        {editing === idx ? (
                          <Input
                            value={editValues.front}
                            onChange={(e) => setEditValues({ ...editValues, front: e.target.value })}
                            placeholder="Card front"
                          />
                        ) : (
                          <p className="p-3 bg-gray-50 rounded">{card.front}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-500">Back</h3>
                        {editing === idx ? (
                          <Input
                            value={editValues.back}
                            onChange={(e) => setEditValues({ ...editValues, back: e.target.value })}
                            placeholder="Card back"
                          />
                        ) : (
                          <p className="p-3 bg-gray-50 rounded">{card.back}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg mb-4">This deck doesn't have any flashcards yet.</p>
          <Button asChild>
            <Link href={`/user/flashcard-library/${deck._id}/edit`}>
              Add Flashcards
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}