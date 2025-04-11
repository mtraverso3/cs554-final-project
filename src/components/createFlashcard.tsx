'use client'

import { createFlashcard } from '@/lib/quizForms'
import {useState} from "react";

export function CreateFlashcard() {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');

    return (
        <div>
            <input  className="outline-1" type="text" onChange={(e) => setFront(e.target.value)} />

            <input className="outline-1" type="text" onChange={(e) => setBack(e.target.value)} />

            <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                    onClick={() => createFlashcard(front,back)}>Create
            </button>
        </div>

    )
}