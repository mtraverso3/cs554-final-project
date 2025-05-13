"use server";
import { getUserData } from "@/lib/userForms";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default async function UserProfile() {
  const theData = await getUserData();
  const data = JSON.parse(theData);
  return (
    <main className="container mx-auto py-8 pr-4">
      <Card className="flex items-center space-x-6">
        <Avatar className="h-24 w-24">
          <AvatarImage // We can add image here later if we want
            src={data.profilePicture["file"]}
            alt={`${data.firstName} ${data.lastName}`}
          />
          <AvatarFallback>
            {data.firstName[0]}
            {data.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1">
          <CardHeader>
            <CardTitle>
              {data.firstName} {data.lastName}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Email: {data.email}</p>
          </CardContent>
          <div className="flex space-x-2 pt-4">
            <Button asChild variant="secondary">
              <Link href="/user/profile/edit">Edit Profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/user/home">Back to Home</Link>
            </Button>
          </div>
        </div>
      </Card>
    </main>
  );
}
