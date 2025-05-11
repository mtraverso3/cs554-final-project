"use client";
import { ChangeEvent, useState } from "react";
import { addQuiz } from "@/lib/quizForms";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";

interface QuizForm {
  name: string;
  description: string;
  category: string;
}

export default function CreateQuiz() {
  const router = useRouter();
  const [quizInfo, setQuizInfo] = useState<QuizForm>({
    name: "",
    description: "",
    category: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuizInfo((prev) => ({ ...prev, [name]: value }));
  };

  const finishQuiz = async () => {
    setError(null);
    
    if (!quizInfo.name.trim()) {
      setError("Quiz name is required");
      return;
    }
    
    if (!quizInfo.description.trim()) {
      setError("Description is required");
      return;
    }
    
    if (!quizInfo.category.trim()) {
      setError("Category is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addQuiz(quizInfo.name, quizInfo.description, quizInfo.category);
      router.push("/user/quiz-library");
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "Error creating quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" size={18} />
            <span className="block sm:inline">{error}</span>
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Quiz Name*
          </label>
          <Input
            name="name"
            value={quizInfo.name}
            onChange={handleInputChange}
            placeholder="Enter quiz name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Description*
          </label>
          <Textarea
            name="description"
            value={quizInfo.description}
            onChange={handleInputChange}
            placeholder="Enter quiz description"
            rows={3}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Category*
          </label>
          <Input
            name="category"
            value={quizInfo.category}
            onChange={handleInputChange}
            placeholder="Enter quiz category (e.g., Math, Science, History)"
            required
          />
        </div>
        
        <Button 
          onClick={finishQuiz}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? "Creating..." : "Create Quiz"}
        </Button>
      </div>
    </div>
  );
}
