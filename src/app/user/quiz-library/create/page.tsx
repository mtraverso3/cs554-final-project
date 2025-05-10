"use client";
import { ChangeEvent, useState } from "react";
import { addQuiz } from "@/lib/quizForms";
import { redirect } from "next/navigation";

interface QuizForm {
    name: string;
    description: string;
    category: string;
}

export default function CreateQuiz() {
    const [quizInfo, setQuizInfo] = useState<QuizForm>({
        name: "",
        description: "",
        category: "",

    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuizInfo((prev) => ({ ...prev, [name]: value }));
    };

    const finishQuiz = async () => {
        try {
            await addQuiz(quizInfo.name, quizInfo.description, quizInfo.category);
            alert("Quiz created successfully");
        } catch (error) {
            console.error(error);
            alert("Error creating quiz");
        }
        redirect("/user/quiz-library");

    };

    return (
        <div className="space-y-4">
            <label className="block">
                Name:
                <input
                    name="name"
                    type="text"
                    value={quizInfo.name}
                    onChange={handleInputChange}
                    className="mt-1 w-full outline-1"
                />
            </label>
            <label className="block">
                Description:
                <input
                    name="description"
                    type="text"
                    value={quizInfo.description}
                    onChange={handleInputChange}
                    className="mt-1 w-full outline-1"
                />
            </label>
          <label className="block">
            Category:
            <input
              name="category"
              type="text"
              value={quizInfo.category}
              onChange={handleInputChange}
              className="mt-1 w-full outline-1"
            />
          </label>
            <button
                onClick={() => finishQuiz()}
                className="bg-black text-white rounded p-2"
            >
                Create Deck
            </button>
        </div>
    );
}
