"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Shuffle, 
  ArrowLeft, 
  Home, 
  Settings, 
  Volume2, 
  History, 
  Timer, 
  RefreshCw, 
  LayoutGrid,
  XCircle,
  Pause,
  Play,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { saveStudyProgress } from "@/lib/deckForms";

type FlashcardDTO = {
  _id: string;
  deckId: string;
  front: string;
  back: string;
};

type StudyProgressDTO = {
  currentCardIndex: number;
  knownCardIds: string[];
  unknownCardIds: string[];
  lastPosition: number;
  studyTime: number;
  isReviewMode: boolean;
  isCompleted: boolean;
  reviewingCardIds: string[];
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
  studyProgress?: StudyProgressDTO;
};

type CardAnswer = {
  card: FlashcardDTO;
  known: boolean;
  timestamp: Date;
};

export default function StudyView({ deck }: { deck: DeckDTO }) {
  const router = useRouter();
  const [cards, setCards] = useState<FlashcardDTO[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<FlashcardDTO[]>([]);
  const [unknownCards, setUnknownCards] = useState<FlashcardDTO[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [studyComplete, setStudyComplete] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showDefinitionFirst, setShowDefinitionFirst] = useState(false);
  const [cardHistory, setCardHistory] = useState<CardAnswer[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [studyTime, setStudyTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(true);
  const [showBreakReminder, setShowBreakReminder] = useState(false);
  const [spacedRepetition, setSpacedRepetition] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [previousCardIndex, setPreviousCardIndex] = useState<number | null>(null);
  const [previousCardResponses, setPreviousCardResponses] = useState<{[key: string]: boolean}>({});
  const [showNotification, setShowNotification] = useState(false);
  const [showResumeDialog, setShowResumeDialog] = useState(false);

  useEffect(() => {
    if (deck && deck.flashcardList.length > 0) {
      setCards([...deck.flashcardList]);
      
      if (deck.studyProgress && 
          deck.studyProgress.currentCardIndex >= 0 && 
          deck.studyProgress.currentCardIndex < deck.flashcardList.length &&
          (deck.studyProgress.knownCardIds.length > 0 || 
           deck.studyProgress.unknownCardIds.length > 0 ||
           deck.studyProgress.studyTime > 0)) {
        
        setShowResumeDialog(true);
      }
    }
  }, [deck]);

const restoreProgress = () => {
  if (deck.studyProgress) {
    if (deck.studyProgress.isCompleted && !deck.studyProgress.isReviewMode) {
      setKnownCards(deck.flashcardList.filter(card => 
        deck.studyProgress?.knownCardIds.includes(card._id)));
      
      setUnknownCards(deck.flashcardList.filter(card => 
        deck.studyProgress?.unknownCardIds.includes(card._id)));
        
      setStudyComplete(true);
      setStudyTime(deck.studyProgress.studyTime);
      setCardHistory(generateHistoryFromIds(deck.studyProgress.knownCardIds, deck.studyProgress.unknownCardIds));
      setShowResumeDialog(false);
      return;
    }
    
    if (deck.studyProgress.isReviewMode && deck.studyProgress.reviewingCardIds.length > 0) {
      const reviewCards = deck.flashcardList.filter(card => 
        deck.studyProgress?.reviewingCardIds.includes(card._id));
      
      setCards(reviewCards);
    }
    
    const validIndex = Math.min(
      deck.studyProgress.currentCardIndex,
      deck.studyProgress.isReviewMode ? 
        deck.studyProgress.reviewingCardIds.length - 1 : 
        deck.flashcardList.length - 1
    );
    
    setCurrentCardIndex(validIndex);
    
    if (deck.studyProgress.studyTime > 0) {
      setStudyTime(deck.studyProgress.studyTime);
    }
    
    if (deck.studyProgress.knownCardIds.length > 0) {
      const knownCardsList = deck.flashcardList.filter(card => 
        deck.studyProgress?.knownCardIds.includes(card._id));
      setKnownCards(knownCardsList);
    }
    
    if (deck.studyProgress.unknownCardIds.length > 0) {
      const unknownCardsList = deck.flashcardList.filter(card => 
        deck.studyProgress?.unknownCardIds.includes(card._id));
      setUnknownCards(unknownCardsList);
    }
    
    if (deck.studyProgress.knownCardIds.length > 0 || deck.studyProgress.unknownCardIds.length > 0) {
      setCardHistory(generateHistoryFromIds(deck.studyProgress.knownCardIds, deck.studyProgress.unknownCardIds));
    }
    
    setShowResumeDialog(false);
  }
};

const generateHistoryFromIds = (knownIds: string[], unknownIds: string[]) => {
  const restoredHistory: CardAnswer[] = [];
  
  deck.flashcardList.filter(card => knownIds.includes(card._id))
    .forEach(card => {
      restoredHistory.push({
        card,
        known: true,
        timestamp: new Date()
      });
    });
  
  deck.flashcardList.filter(card => unknownIds.includes(card._id))
    .forEach(card => {
      restoredHistory.push({
        card,
        known: false,
        timestamp: new Date()
      });
    });
  
  return restoredHistory;
};

  const declineRestore = () => {
    setShowResumeDialog(false);
  };

useEffect(() => {
  const saveProgress = async () => {
    if (cards.length > 0) {
      try {
        const knownCardIds = knownCards.map(card => card._id);
        const unknownCardIds = unknownCards.map(card => card._id);
        const reviewingCardIds = cards.map(card => card._id);
        
        await saveStudyProgress(deck._id, {
          currentCardIndex,
          knownCardIds,
          unknownCardIds,
          lastPosition: currentCardIndex,
          studyTime,
          isReviewMode: cards.length !== deck.flashcardList.length,
          isCompleted: studyComplete,
          reviewingCardIds
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    }
  };
  
  const saveInterval = setInterval(saveProgress, 30000);
  
  return () => {
    clearInterval(saveInterval);
    saveProgress();
  };
}, [currentCardIndex, knownCards, unknownCards, studyTime, cards.length, studyComplete, deck._id, cards]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerActive && !studyComplete) {
      interval = setInterval(() => {
        setStudyTime(prev => {
          const newTime = prev + 1;
          
          if (newTime % 900 === 0) {
            setShowBreakReminder(true);
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, studyComplete]);

  const clearProgress = () => {
    setCurrentCardIndex(0);
    setKnownCards([]);
    setUnknownCards([]);
    setCardHistory([]);
    setIsFlipped(false);
    setStudyTime(0);
    setPreviousCardIndex(null);
    setPreviousCardResponses({});
    setCards([...deck.flashcardList]);
    
    saveStudyProgress(
      deck._id,
      {
        currentCardIndex: 0,
        knownCardIds: [],
        unknownCardIds: [],
        lastPosition: 0,
        studyTime: 0,
        isReviewMode: false,
        isCompleted: false,
        reviewingCardIds: []
      },
      true
    );
    
    setShowResumeDialog(false);
  };
  

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const toggleTimer = () => {
    setIsTimerActive(prev => !prev);
  };

  const shuffleCards = () => {
    const cardsToShuffle = [...cards];
  
    for (let i = cardsToShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
    }
    
    setShuffled(true);
    setCards(cardsToShuffle);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const resetOrder = () => {
    const answeredCardIds = new Set([
      ...knownCards.map(card => card._id),
      ...unknownCards.map(card => card._id)
    ]);
    
    const currentCard = cards[currentCardIndex];
    const reorderedCards = [];

    for (const card of deck.flashcardList) {
      if (answeredCardIds.has(card._id)) {
        reorderedCards.push(card);
      }
    }
    
    if (!answeredCardIds.has(currentCard._id)) {
      reorderedCards.push(currentCard);
    }

    for (const card of deck.flashcardList) {
      if (!answeredCardIds.has(card._id) && card._id !== currentCard._id) {
        reorderedCards.push(card);
      }
    }

    setShuffled(false);
    setCards(reorderedCards);
    
    const newIndex = reorderedCards.findIndex(card => card._id === currentCard._id);
    setCurrentCardIndex(newIndex >= 0 ? newIndex : 0);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const restartDeck = () => {
    setKnownCards([]);
    setUnknownCards([]);
    setCardHistory([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyComplete(false);
    setStudyTime(0);
    setPreviousCardIndex(null);
    setPreviousCardResponses({});
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);

    if (spacedRepetition && cardHistory.length > 0) {
      const sortedCards = [...deck.flashcardList].sort((a, b) => {
        const aKnowledge = cardHistory.filter(
          h => h.card._id === a._id && h.known
        ).length;
        const bKnowledge = cardHistory.filter(
          h => h.card._id === b._id && h.known
        ).length;
        
        return aKnowledge - bKnowledge;
      });
      
      setCards(sortedCards);
    } else {
      if (shuffled) {
        const cardsToShuffle = [...deck.flashcardList];
        
        for (let i = cardsToShuffle.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [cardsToShuffle[i], cardsToShuffle[j]] = [cardsToShuffle[j], cardsToShuffle[i]];
        }
        
        setCards(cardsToShuffle);
      } else {
        setCards([...deck.flashcardList]);
      }
    }
  };

  const toggleDefinitionFirst = () => {
    setShowDefinitionFirst(prev => !prev);
    setIsFlipped(false);
  };

  const flipCard = () => {
    if (!isAnimating) {
      setIsFlipped(!isFlipped);
    }
  };

  const speakCardContent = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      if (cards.length === 0 || currentCardIndex >= cards.length) return;
      
      const currentCard = cards[currentCardIndex];
      
      let textToRead;
      if (showDefinitionFirst) {
        textToRead = isFlipped ? currentCard.front : currentCard.back;
      } else {
        textToRead = isFlipped ? currentCard.back : currentCard.front;
      }
      
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'en-US';
      
      utterance.onend = () => {
        setIsSpeaking(false);
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Sorry, your browser doesn't support text-to-speech!");
    }
  };
  
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const markAsKnown = () => {
    if (isAnimating || cards.length === 0) return;
    
    setIsAnimating(true);
    
    const currentCard = cards[currentCardIndex];
    setKnownCards(prev => [...prev, currentCard]);
    setPreviousCardIndex(currentCardIndex);
    setPreviousCardResponses(prev => ({
      ...prev,
      [currentCard._id]: true
    }));
    
    setCardHistory(prev => [
      ...prev, 
      { card: currentCard, known: true, timestamp: new Date() }
    ]);
    
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(150%)";
      cardRef.current.style.opacity = "0";
    }
    
    setTimeout(() => {
      moveToNextCard();
      setIsAnimating(false);
    }, 300);
  };

  const markAsUnknown = () => {
    if (isAnimating || cards.length === 0) return;
    
    setIsAnimating(true);
    
    const currentCard = cards[currentCardIndex];
    setUnknownCards(prev => [...prev, currentCard]);
    
    setPreviousCardIndex(currentCardIndex);
    setPreviousCardResponses(prev => ({
      ...prev,
      [currentCard._id]: false
    }));
    
    setCardHistory(prev => [
      ...prev, 
      { card: currentCard, known: false, timestamp: new Date() }
    ]);
    
    if (cardRef.current) {
      cardRef.current.style.transform = "translateX(-150%)";
      cardRef.current.style.opacity = "0";
    }
    
    setTimeout(() => {
      moveToNextCard();
      setIsAnimating(false);
    }, 300);
  };
  
  const goToPreviousCard = () => {
    if (previousCardIndex === null || isAnimating || studyComplete) return;
    
    setIsAnimating(true);
    
    const previousCard = cards[previousCardIndex];

    if (previousCardResponses[previousCard._id]) {
      setKnownCards(prev => prev.filter(card => card._id !== previousCard._id));
    } else {
      setUnknownCards(prev => prev.filter(card => card._id !== previousCard._id));
    }
    
    setCardHistory(prev => prev.slice(0, -1));
    setCurrentCardIndex(previousCardIndex);
    setIsFlipped(false);
    setPreviousCardIndex(null);
    
    if (cardRef.current) {
      cardRef.current.style.transform = "";
      cardRef.current.style.opacity = "1";
    }
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const moveToNextCard = () => {
    if (currentCardIndex >= cards.length - 1) {
      setStudyComplete(true);
      
      saveStudyProgress(deck._id, {
        currentCardIndex: currentCardIndex,
        knownCardIds: knownCards.map(card => card._id),
        unknownCardIds: unknownCards.map(card => card._id),
        lastPosition: currentCardIndex,
        studyTime: studyTime,
        isReviewMode: cards.length !== deck.flashcardList.length,
        isCompleted: true,
        reviewingCardIds: cards.map(card => card._id)
      }, false);
    } else {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
      
      if (cardRef.current) {
        cardRef.current.style.transform = "";
        cardRef.current.style.opacity = "1";
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAnimating || studyComplete) return;
    setIsDragging(true);
    setDragOffset(0);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || isAnimating || studyComplete) return;
    
    const newOffset = e.movementX;
    setDragOffset(prev => {
      const updatedOffset = prev + newOffset;
      
      if (cardRef.current) {
        const rotation = updatedOffset * 0.05;
        cardRef.current.style.transform = `translateX(${updatedOffset}px) rotate(${rotation}deg)`;
        
        if (updatedOffset > 0) {
          cardRef.current.style.boxShadow = `0 0 20px rgba(34, 197, 94, ${Math.min(Math.abs(updatedOffset) / 200, 0.6)})`;
        } else if (updatedOffset < 0) {
          cardRef.current.style.boxShadow = `0 0 20px rgba(239, 68, 68, ${Math.min(Math.abs(updatedOffset) / 200, 0.6)})`;
        }
      }
      
      return updatedOffset;
    });
  };

  const handleMouseUp = () => {
    if (!isDragging || isAnimating || studyComplete) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 100) {
      if (dragOffset > 0) {
        markAsKnown();
      } else {
        markAsUnknown();
      }
    } else {
      if (cardRef.current) {
        cardRef.current.style.transform = "";
        cardRef.current.style.boxShadow = "";
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (studyComplete) return;
      
      switch (e.key) {
        case "ArrowRight":
          markAsKnown();
          break;
        case "ArrowLeft":
          markAsUnknown();
          break;
        case " ":
          flipCard();
          break;
        case "Backspace":
        case "z":
          if (e.ctrlKey || e.metaKey) {
            goToPreviousCard();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentCardIndex, isFlipped, isAnimating, studyComplete, previousCardIndex]);

  const restartWithUnknown = () => {
    const cardsToReview = [...unknownCards];
    
    setCards(cardsToReview);
    setKnownCards([]);
    setUnknownCards([]);
    setCardHistory([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setStudyComplete(false);
    setStudyTime(0);
    setPreviousCardIndex(null);
    setPreviousCardResponses({});
    setIsTimerActive(true);
    
    saveStudyProgress(
      deck._id,
      {
        currentCardIndex: 0,
        knownCardIds: [],
        unknownCardIds: [],
        lastPosition: 0,
        studyTime: 0,
        isReviewMode: true,
        isCompleted: false,
        reviewingCardIds: cardsToReview.map(card => card._id)
      },
      false
    );
    
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const formatScore = () => {
    const total = knownCards.length + unknownCards.length;
    if (total === 0) return "100%";
    return `${Math.round((knownCards.length / total) * 100)}%`;
  };

  const getCurrentCardContent = (side: 'front' | 'back') => {
    if (cards.length === 0 || currentCardIndex >= cards.length) return "";
    
    const currentCard = cards[currentCardIndex];
    
    if (showDefinitionFirst) {
      return side === 'front' ? currentCard.back : currentCard.front;
    } else {
      return side === 'front' ? currentCard.front : currentCard.back;
    }
  };

  const handleExit = async () => {
    try {
      await saveStudyProgress(
        deck._id,
        {
          currentCardIndex,
          knownCardIds: knownCards.map(card => card._id),
          unknownCardIds: unknownCards.map(card => card._id),
          lastPosition: currentCardIndex,
          studyTime,
          isReviewMode: cards.length !== deck.flashcardList.length,
          isCompleted: studyComplete,
          reviewingCardIds: cards.map(card => card._id)
        },
        false
      );
    } catch (error) {
      console.error("Failed to save progress on exit:", error);
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <h2 className="text-2xl font-bold mb-4">No Flashcards to Study</h2>
        <p className="text-gray-600 mb-6">This deck doesn't have any flashcards yet.</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href={`/user/flashcard-library/${deck._id}/edit`}>
              Add Flashcards
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/user/flashcard-library" onClick={handleExit}>
              Back to Library
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Resume study session dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Resume Your Study Session?</DialogTitle>
            <DialogDescription>
              You have a saved study session for this deck. Would you like to continue where you left off?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={clearProgress}>
              Start New Session
            </Button>
            <Button onClick={restoreProgress}>
              Resume Session
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* notification toast */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded flex items-center shadow-md">
          <div className="mr-2">
            {shuffled ? <Shuffle size={16} /> : 
              cards.length === unknownCards.length ? <RefreshCw size={16} /> : 
              <RefreshCw size={16} />}
          </div>
          <div>
            <p className="font-bold">
              {shuffled && cards.length === deck.flashcardList.length ? "Cards Shuffled" : 
               !shuffled && cards.length === deck.flashcardList.length ? "Order Reset" : 
               "Deck Restarted"}
            </p>
            <p className="text-sm">
              {shuffled && cards.length === deck.flashcardList.length ? "Cards have been randomly shuffled" : 
               !shuffled && cards.length === deck.flashcardList.length ? "Original order restored" : 
               "Timer has been reset to 0"}
            </p>
          </div>
        </div>
      )}
      
      {/* break reminder */}
      <Dialog open={showBreakReminder} onOpenChange={setShowBreakReminder}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Time for a Break!</DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="mb-4">You've been studying for {Math.floor(studyTime / 60)} minutes.</p>
            <p>Taking short breaks improves retention and prevents fatigue.</p>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowBreakReminder(false);
                setIsTimerActive(false);
              }}
            >
              <Pause className="mr-2" size={16} />
              Pause Timer
            </Button>
            <Button onClick={() => setShowBreakReminder(false)}>
              Continue Studying
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Study Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="definition-first">Show Definition First</Label>
              <div 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showDefinitionFirst ? 'bg-primary' : 'bg-gray-200'
                }`}
                onClick={toggleDefinitionFirst}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    showDefinitionFirst ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  {showDefinitionFirst && <Check className="h-3 w-3 text-primary" />}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="spaced-repetition">Spaced Repetition</Label>
              <div 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  spacedRepetition ? 'bg-primary' : 'bg-gray-200'
                }`}
                onClick={() => setSpacedRepetition(!spacedRepetition)}
              >
                <span 
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    spacedRepetition ? 'translate-x-6' : 'translate-x-1'
                  }`}
                >
                  {spacedRepetition && <Check className="h-3 w-3 text-primary" />}
                </span>
              </div>
            </div>
            
            <Separator />
            
            <div className="pt-2 space-y-2">
              <Button 
                onClick={restartDeck} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="mr-2" size={16} />
                Restart Deck
              </Button>
              
              <Button 
                onClick={shuffled ? resetOrder : shuffleCards}
                variant="outline"
                className="w-full"
              >
                <Shuffle className="mr-2" size={16} />
                {shuffled ? "Reset Order" : "Shuffle Cards"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* header */}
      <div className="px-4 py-4 bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/user/flashcard-library/${deck._id}`} onClick={handleExit}>
                <ArrowLeft className="mr-2" size={16} />
                Back
              </Link>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowSettings(true)}
            >
              <Settings size={16} />
            </Button>
          </div>
          
          <div className="flex flex-col items-center">
            <h1 className="text-xl font-bold">{deck.name}</h1>
            <div className="text-sm text-gray-500">
              {currentCardIndex + 1} of {cards.length} • 
              <span className="ml-1">
                {knownCards.length} known • {unknownCards.length} to review
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? "bg-gray-100" : ""}
            >
              <History size={16} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTimer}
              className="flex items-center"
            >
              {isTimerActive ? <Pause size={16} /> : <Play size={16} />}
              <span className="ml-1">{formatTime(studyTime)}</span>
            </Button>
            
            <Button variant="ghost" size="sm" asChild>
              <Link href="/user/flashcard-library" onClick={handleExit}>
                <Home size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-1 container mx-auto px-4 py-8">
        {/* card history */}
        {showHistory && (
          <div className="w-64 mr-6 border-r pr-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">History</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowHistory(false)}
              >
                <XCircle size={16} />
              </Button>
            </div>
            
            <div className="space-y-2">
              {cardHistory.length === 0 ? (
                <p className="text-sm text-gray-500">No cards reviewed yet</p>
              ) : (
                cardHistory.map((item, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded-md text-sm ${
                      item.known ? 'bg-green-50 border-l-2 border-green-500' : 'bg-red-50 border-l-2 border-red-500'
                    }`}
                  >
                    <p className="font-medium line-clamp-1">{item.card.front}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {' • '}
                      {item.known ? 'Known' : 'Review'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col flex-1">
          {!studyComplete ? (
            <>
              {/* study info */}
              <div className="flex justify-between mb-6">
                <div>
                  <span className="text-sm text-gray-500">
                    {showDefinitionFirst ? 'Showing definitions first' : 'Showing terms first'} 
                    {shuffled ? ' • Shuffled' : ''}
                    {spacedRepetition ? ' • Spaced repetition on' : ''}
                  </span>
                </div>
                
                <div className="text-sm text-gray-500">
                  Tap to flip • Swipe right to mark as known • Swipe left to review again
                </div>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center">
                <div 
                  className="w-full max-w-xl perspective relative" 
                  style={{ height: "400px" }}
                >
                  <div 
                    ref={cardRef}
                    className={`flip-card w-full h-full absolute ${isFlipped ? 'flipped' : ''}`}
                    onClick={flipCard}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{
                      transition: "transform 0.3s, opacity 0.3s, box-shadow 0.3s",
                      cursor: isDragging ? "grabbing" : "pointer"
                    }}
                  >
                    {/* card front */}
                    <div className="card-face border rounded-xl bg-white shadow-lg p-8 flex flex-col items-center justify-center">
                      <p className="text-xl font-medium text-center">{getCurrentCardContent('front')}</p>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSpeaking) {
                              stopSpeaking();
                            } else {
                              speakCardContent();
                            }
                          }}
                        >
                          <Volume2 
                            size={16} 
                            className={isSpeaking ? "text-blue-600" : ""}
                          />
                        </Button>
                      </div>
                      {showDefinitionFirst ? (
                        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                          Definition
                        </div>
                      ) : (
                        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                          Term
                        </div>
                      )}
                    </div>
                    
                    {/* card back */}
                    <div className="card-face card-back border rounded-xl bg-white shadow-lg p-8 flex flex-col items-center justify-center">
                      <p className="text-xl font-medium text-center">{getCurrentCardContent('back')}</p>
                      <div className="absolute top-4 right-4 flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isSpeaking) {
                              stopSpeaking();
                            } else {
                              speakCardContent();
                            }
                          }}
                        >
                          <Volume2 
                            size={16} 
                            className={isSpeaking ? "text-blue-600" : ""}
                          />
                        </Button>
                      </div>
                      {showDefinitionFirst ? (
                        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                          Term
                        </div>
                      ) : (
                        <div className="absolute bottom-4 left-4 text-xs text-gray-400">
                          Definition
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* button controls */}
                <div className="flex justify-between w-full max-w-xl mt-8">
                <Button 
                  onClick={markAsUnknown}
                  className="bg-red-500 hover:bg-red-600 text-white"
                  disabled={isAnimating}
                >
                  <ChevronLeft className="mr-2" />
                  Don't Know
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={goToPreviousCard}
                    variant="outline"
                    disabled={isAnimating || previousCardIndex === null}
                    className={previousCardIndex === null ? "opacity-50" : ""}
                  >
                    Undo
                  </Button>
                  
                  <Button 
                    onClick={flipCard}
                    variant="outline"
                    disabled={isAnimating}
                  >
                    Flip Card
                  </Button>
                </div>
                
                <Button 
                  onClick={markAsKnown}
                  className="bg-green-500 hover:bg-green-600 text-white"
                  disabled={isAnimating}
                >
                  Know
                  <ChevronRight className="ml-2" />
                </Button>
              </div>
                
                {/* keyboard shortcut */}
                <div className="mt-4 text-sm text-gray-500">
                  Keyboard shortcuts: ← Don't Know • → Know • Space to flip • Ctrl+Z to undo
                </div>
              </div>
            </>
          ) : (
            /* study complete view */
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <h2 className="text-3xl font-bold mb-2">Study Complete!</h2>
              <p className="text-xl mb-6">
                You completed all {knownCards.length + unknownCards.length} cards in {formatTime(studyTime)}
              </p>
              
              <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md mb-8">
                <div className="text-5xl font-bold mb-4">{formatScore()}</div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-bold text-green-500">{knownCards.length}</div>
                    <div className="text-sm text-gray-500">Correct</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-500">{unknownCards.length}</div>
                    <div className="text-sm text-gray-500">To Review</div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={restartDeck} variant="outline">
                  <RefreshCw className="mr-2" size={16} />
                  Restart All Cards
                </Button>
                
                {unknownCards.length > 0 && (
                  <Button onClick={restartWithUnknown}>
                    Practice {unknownCards.length} Missed Cards
                  </Button>
                )}
                
                <Button variant="outline" asChild>
                  <Link href={`/user/flashcard-library/${deck._id}`} onClick={handleExit}>
                    Back to Deck
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}