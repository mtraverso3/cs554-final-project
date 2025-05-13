"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteUserAccount } from "@/lib/userForms";
import { useRouter } from 'next/navigation';

export default function DeleteAccountButton() {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteAccount = async () => {
    if (confirmText.toLowerCase() !== "delete my account") {
      setError("Please type 'delete my account' to confirm");
      return;
    }

    setError(null);
    setIsDeleting(true);
    
    try {
      const result = await deleteUserAccount();
      
      if (result.success) {
        router.push('/auth/logout');
      } else {
        setError(result.message);
        setIsDeleting(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="border border-destructive/30 rounded-lg p-6 mt-10">
        <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
        <p className="text-muted-foreground mb-4">
          Permanently delete your account and all associated content.
          This action cannot be undone.
        </p>
        <Button 
          variant="destructive" 
          onClick={() => setShowConfirmDialog(true)}
          className="flex items-center"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Delete Your Account
            </DialogTitle>
            <DialogDescription>
              This action will permanently delete your account, all your flashcards, quizzes, and personal data.
              This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <p className="text-sm font-medium">
              To confirm, type "delete my account" below:
            </p>
            
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="delete my account"
              className="w-full"
              disabled={isDeleting}
            />
          </div>
          
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isDeleting || confirmText.toLowerCase() !== "delete my account"}
              className="sm:ml-3"
            >
              {isDeleting ? "Deleting..." : "Permanently Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}