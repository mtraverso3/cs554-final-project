"use server"
import { getUserData } from "@/lib/userForms";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default async function UserProfile() {
    const theData = await getUserData();
    const data = JSON.parse(theData);
    //The image is not working at all
    return <><Image width = "200" height = "150" src = "/noimage.jpeg" alt = "/noimage.jpeg"/>
    <div>Full Name: {data.firstName} {data.lastName}</div>
    <div>Email: {data.email}</div>
    <Button asChild>
    <Link href="/user/profile/edit">
    Edit Profile
    </Link>
    </Button>
    <Button asChild>
    <Link href="/user/home">
    Back to Home
    </Link>
    </Button></>;
}