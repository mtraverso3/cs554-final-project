"use server"
import EditProfileClient from "./editProfileClient";
import { getUserData } from "@/lib/userForms";
export default async function editProfile() {
    const data = await getUserData();
    return <EditProfileClient data = {data}/>;
}