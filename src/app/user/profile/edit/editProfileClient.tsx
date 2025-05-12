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
  const router = useRouter();
  const update = async () => {
    await updateProfile(first, last);
    router.push("/user/profile");
  };
  return (
    <main className="container mx-auto py-8">
      <Card className="max-w-md mx-auto p-6 space-y-6">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
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
