"use client";
import { ChangeEvent, useState } from "react";
import { addQuiz } from "@/lib/quizForms";

interface QuizForm {
    name: string;
    description: string;
}

export default function CreateQuiz() {
    const [quizInfo, setQuizInfo] = useState<QuizForm>({
        name: "",
        description: "",
    });

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setQuizInfo((prev) => ({ ...prev, [name]: value }));
    };

    const finishQuiz = async () => {
        try {
            await addQuiz(quizInfo.name, quizInfo.description);
            alert("Quiz created successfully");
        } catch (error) {
            console.error(error);
            alert("Error creating quiz");
        }
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
            <button
                onClick={() => finishQuiz()}
                className="bg-black text-white rounded p-2"
            >
                Create Deck
            </button>
        </div>
    );
}
