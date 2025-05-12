'use client'
import {useState } from "react";
import { redirect } from "next/navigation";
import { updateProfile } from "@/lib/userForms";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
export default function EditProfileClient({data}: {data: string}) {
    const theData = JSON.parse(data);
    const [first, setFirst] = useState(theData.firstName);
    const [last, setLast] = useState(theData.lastName);
    const [file, setFile] = useState(theData.profilePicture["file"]);
    const update = async () => {
        await updateProfile(first, last, file);
        redirect("/user/profile");
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if(files && files[0]) {
            console.log(files[0]);
            setFile(URL.createObjectURL(files[0]));
            console.log("this one works");
            console.log(file["file"]);
        }
    }
    return (
        <div>
        <Image width = "200" height = "200" src = {file} alt = {file} />
        First Name: <input type="text" className="outline-1" value = {first} 
                    onChange={(e) => setFirst(e.target.value)} /><br></br>
        Last Name: <input type="text" className="outline-1" value = {last} 
                    onChange={(e) => setLast(e.target.value)} /><br></br>
        Profile Picture: <input id = "theFile" type = "file" accept="image/*" onChange={handleFileChange}></input>
        {/*I don't know how to add a function onclick to a custom <Button>
        element so I used a normal <button> instead */}
        <button className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
                onClick={() => update()}>Update Profile
        </button>

        <Button asChild><Link href="/user/profile">Go Back</Link></Button></div>
    )
}