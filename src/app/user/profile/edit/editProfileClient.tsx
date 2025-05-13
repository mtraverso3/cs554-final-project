"use client";
import React, { useState } from 'react';
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  Upload, 
  Save, 
  X, 
  AlertCircle 
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { updateProfile } from "@/lib/userForms";
import DeleteAccountButton from "./DeleteAccountButton";

export default function EditProfileClient({ data }: { data: string }) {
  const theData = JSON.parse(data);
  const [first, setFirst] = useState(theData.firstName);
  const [last, setLast] = useState(theData.lastName);
  const [file, setFile] = useState(theData.profilePicture["file"]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(theData.profilePicture["file"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const router = useRouter();
  
  const update = async () => {
    if (!first.trim() || !last.trim()) {
      setError("First name and last name are required");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateProfile(first, last, file);
      setSuccess(true);
      
      setTimeout(() => {
        router.push("/user/profile");
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      const fileUrl = URL.createObjectURL(selectedFile);
      setFile(fileUrl);
      setPreviewUrl(fileUrl);
    }
  };
  
  const handleCancel = () => {
    router.push("/user/profile");
  };

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <Button variant="outline" asChild className="mb-8">
          <Link href="/user/profile">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-muted-foreground">Update your personal information</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
          <AlertCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your profile has been updated successfully.</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Profile Image Section */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>Update your profile image</CardDescription>
          </CardHeader>
          
          <CardContent className="flex flex-col items-center">
            <div className="relative mb-6">
              <Avatar className="h-40 w-40 border-2 border-muted">
                <AvatarImage 
                  src={previewUrl || undefined}
                  alt={`${first} ${last}`}
                />
                <AvatarFallback className="text-3xl">
                  {first?.[0] || ''}
                  {last?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              
              <Label 
                htmlFor="profile-upload"
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 rounded-full flex items-center justify-center cursor-pointer shadow-md"
              >
                <Upload size={18} />
              </Label>
            </div>
            
            <div className="w-full">
              <Input
                id="profile-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <Label htmlFor="profile-upload" className="w-full">
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Image
                </Button>
              </Label>
              
              <p className="text-xs text-muted-foreground text-center mt-2">
                Recommended: Square image, at least 200x200 pixels
              </p>
            </div>
          </CardContent>
        </Card>
        
        {/* Profile Details Form */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Edit your account details</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  placeholder="Enter your first name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  placeholder="Enter your last name"
                  disabled={isSubmitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={theData.email}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Your email cannot be changed
                </p>
              </div>
            </div>
          </CardContent>
          
          <Separator />
          
          <CardFooter className="flex justify-between pt-6">
            <Button 
              variant="outline" 
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            
            <Button 
              onClick={update} 
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
      <DeleteAccountButton />
    </main>
  );
}