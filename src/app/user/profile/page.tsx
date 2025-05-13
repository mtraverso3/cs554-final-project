"use server";
import { getUserData } from "@/lib/userForms";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Calendar, 
  Edit2, 
  ArrowLeft
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default async function UserProfile() {
  const theData = await getUserData();
  const data = JSON.parse(theData);
  
  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-8">
          <Link href="/user/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">View and manage your personal information</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Profile Card with Avatar */}
        <Card className="h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-32 w-32 mb-4">
              <AvatarImage
                src={data.profilePicture["file"]}
                alt={`${data.firstName} ${data.lastName}`}
              />
              <AvatarFallback className="text-2xl">
                {data.firstName[0]}
                {data.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <h2 className="text-xl font-semibold mb-1">
              {data.firstName} {data.lastName}
            </h2>
            <p className="text-muted-foreground text-sm mb-4">{data.email}</p>
            
            <Button asChild className="w-full mt-2">
              <Link href="/user/profile/edit">
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        {/* Profile Details */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal and account details</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <User className="h-5 w-5 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Full Name</p>
                  <p className="text-sm text-muted-foreground">
                    {data.firstName} {data.lastName}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Mail className="h-5 w-5 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Email Address</p>
                  <p className="text-sm text-muted-foreground">{data.email}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 rounded-md border p-4">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">Account Created</p>
                  <p className="text-sm text-muted-foreground">May 2025</p>
                </div>
              </div>
            </div>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline" asChild>
              <Link href="/user/home">Back to Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/user/profile/edit">Edit Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}
