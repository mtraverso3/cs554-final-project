"use client";
import { ChangeEvent, useState } from "react";
import { addQuiz } from "@/lib/quizForms";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle } from "lucide-react";
import { QuizCreateSchema } from "@/lib/db/data/safeSchema";
import * as Yup from "yup";

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
  const [error, setError] = useState<string[] | null>(null);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setQuizInfo((prev) => ({ ...prev, [name]: value }));
  };

  const finishQuiz = async () => {
    setError(null);
    try {
      await QuizCreateSchema.validate(quizInfo, { abortEarly: false });
    } catch (validationError) {
      if (validationError instanceof Yup.ValidationError) {
        setError(validationError.errors); // Or join all errors
        return;
      }
    }

    
    setIsSubmitting(true);
    
    try {
      await addQuiz(quizInfo.name, quizInfo.description, quizInfo.category);
      router.push("/user/quiz-library");
    } catch (error) {
      console.error(error);
      setError([error instanceof Error ? error.message : "Error creating quiz"]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-6 max-w-lg">
      <h1 className="text-3xl font-bold mb-6">Create New Quiz</h1>

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
