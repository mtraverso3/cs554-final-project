'use client'
import { signup } from '@/lib/userForms';
import {useState} from "react";
import { redirect } from "next/navigation";

export function OnboardingPage({data}: {data: {firstName: string, lastName: string}}) {
    const [first, setFirst] = useState(data.firstName);
    const [last, setLast] = useState(data.lastName);
    const theFile = new File(["genericpicture"], "@genericpicture.jpg", {type: "image"});
    const [file, setFile] = useState<File>(theFile);
    const addUser = async () => {
        await signup(first, last, file);
        redirect("/user/profile");
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if(files && files[0]) {
            setFile(files[0]);
        }
    }
    return (
        <div>
            First Name: <input className="outline-1" type="text" defaultValue = {data.firstName} onChange={(e) => {setFirst(e.target.value)}} />

            Last Name: <input className="outline-1" type="text"  defaultValue = {data.lastName} onChange={(e) => {setLast(e.target.value)}} />

            Profile Picture: <input type = "file" accept="image/*" onChange={handleFileChange} /><br></br>
            <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                    onClick={() => {addUser()}}>Sign Up
            </button>
        </div>

    )
}