'use client'

import { signup } from '@/lib/quizForms'
import {useState} from "react";

export function Signup() {
    const [first, setFirst] = useState('');
    const [last, setLast] = useState('');
    return (
        <div>
            First Name: <input  className="outline-1" type="text" onChange={(e) => setFirst(e.target.value)} />

            Last Name: <input className="outline-1" type="text" onChange={(e) => setLast(e.target.value)} />

            <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                    onClick={() => signup(first,last)}>Submit
            </button>
        </div>

    )
}