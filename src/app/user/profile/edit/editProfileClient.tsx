"use client";
import { useState } from "react";
import { updateProfile } from "@/lib/userForms";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function EditProfileClient({ data }: { data: string }) {
  const theData = JSON.parse(data);
  const [first, setFirst] = useState(theData.firstName);
  const [last, setLast] = useState(theData.lastName);
  const [file, setFile] = useState(theData.profilePicture["file"]);
  const router = useRouter();
  const update = async () => {
    await updateProfile(first, last, file);
    router.push("/user/profile");
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if(files && files[0]) {
            setFile(URL.createObjectURL(files[0]));
        }
      }
  console.log(file);
  return (
    <main className="container mx-auto py-8">
      <Card className="max-w-md mx-auto p-6 space-y-6">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <img /*Might want to use a different image element type here but I got errors using an 
          <Image> or <AvatarImage>*/
            src={file}
            alt={`${first} ${last}`}
          />
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={first}
                onChange={(e) => setFirst(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                type="text"
                value={last}
                onChange={(e) => setLast(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="profilePicture">Profile Picture</Label>
              <Input
                id="profilePicture"
                type="file"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </CardContent>
        <div className="flex justify-end space-x-2">
          <Button onClick={update}>Save Changes</Button>
          <Button variant="outline" asChild>
            <Link href="/user/profile">Cancel</Link>
          </Button>
        </div>
      </Card>
    </main>
  );
}
