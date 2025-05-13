"use client";
import { signup } from "@/lib/userForms";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { User, Upload } from "lucide-react";

export function OnboardingPage() {
  const router = useRouter();
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theFile = URL.createObjectURL(
    new File(["genericpicture"], "@genericpicture.jpg", { type: "image" }),
  );
  const [picture, setPicture] = useState(theFile);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const file = files[0];
      setPicture(URL.createObjectURL(file));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  
  const handleSubmit = async () => {
    if (!first || !last) {
      setError("Please fill in both first name and last name");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await signup(first, last, picture);
      router.push("/user/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred during signup");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFF0E5]">
      <div className="w-full bg-white shadow-md py-3 px-4">
        <div className="mx-auto container">
          <h1 className="text-2xl font-bold text-gray-800">CS554 Final Project</h1>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute top-40 left-20 w-20 h-20 rounded-full bg-[#FFE0CC] opacity-40 animate-pulse"></div>
        <div className="absolute top-60 right-40 w-12 h-12 rounded-full bg-[#FFCAB0] opacity-40 animate-pulse"></div>
        <div className="absolute bottom-40 left-40 w-16 h-16 rounded-full bg-[#FFD4BC] opacity-40 animate-pulse"></div>
        
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-[#FF6B35]">Welcome!</CardTitle>
            <CardDescription>Complete your profile to get started with our learning platform</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex flex-col items-center justify-center mb-4">
              <div className="relative">
                <div className="h-24 w-24 rounded-full flex items-center justify-center border-4 border-[#FFEBDD] bg-[#FFF0E5] overflow-hidden mb-2">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Profile preview" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-[#FF6B35]" />
                  )}
                </div>
                
                <Label 
                  htmlFor="picture-upload" 
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center cursor-pointer shadow-md"
                >
                  <Upload size={14} />
                </Label>
                
                <Input 
                  id="picture-upload"
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-500">Profile Picture</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  placeholder="Enter your first name"
                  value={first}
                  onChange={(e) => setFirst(e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  placeholder="Enter your last name"
                  value={last}
                  onChange={(e) => setLast(e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="w-full bg-[#FF6B35] hover:bg-[#FF8C5A] text-white rounded-full transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1"
            >
              {isSubmitting ? "Setting up your account..." : "Create Account"}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <footer className="bg-white py-6">
        <div className="container mx-auto px-4 text-center text-[#6B5B54] text-sm">
          <p>© 2025 CS554 Final Project. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}