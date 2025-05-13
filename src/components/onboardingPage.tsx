"use client";
import { signup } from "@/lib/userForms";
import { useState } from "react";
import { redirect } from "next/navigation";

export function OnboardingPage() {
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const theFile = URL.createObjectURL(
    new File(["genericpicture"], "@genericpicture.jpg", { type: "image" }),
  );
  const [picture, setPicture] = useState(theFile);
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      setPicture(URL.createObjectURL(files[0]));
    }
  };
  return (
    <div>
      First Name:{" "}
      <input
        className="outline-1"
        type="text"
        onChange={(e) => setFirst(e.target.value)}
      />
      Last Name:{" "}
      <input
        className="outline-1"
        type="text"
        onChange={(e) => setLast(e.target.value)}
      />
      <br></br>
      Profile Picture:{" "}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <br></br>
      <button
        className="bg-black text-white outline-1 outline-gray-200 rounded p-2"
        onClick={() => {
          signup(first, last, picture);
          redirect("/user/home");
        }}
      >
        Submit
      </button>
    </div>
  );
}