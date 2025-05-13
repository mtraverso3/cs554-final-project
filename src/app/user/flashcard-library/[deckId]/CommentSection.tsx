"use client";

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/userForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addDeckComment } from "@/lib/deckForms";
import { Comment, DeckInput } from "@/lib/db/data/safeSchema";

export default function CommentSection({
  deck,
  currentUserId,
}: {
  deck: DeckInput;
  currentUserId: string;
}) {
  const parsedDeck = deck;
  const [comments, setComments] = useState<Comment[]>(
    parsedDeck.comments || ([] as Comment[]),
  );
  const [userNames, setUserNames] = useState<Record<string, string>>({});
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Assuming you have an API endpoint to add a comment
      await addDeckComment(parsedDeck._id, newComment);
      setComments([
        ...comments,
        {
          ownerId: currentUserId,
          text: newComment,
          createdAt: new Date().toISOString(),
        },
      ]);
      setNewComment("");
    } catch (err) {
      console.error("Error adding comment:", err);
      setError("Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchUserNames = async () => {
      const uniqueIds = Array.from(new Set(comments.map((c) => c.ownerId)));
      const missingIds = uniqueIds.filter((id) => !userNames[id]);
      const fetchedNames: Record<string, string> = {};
      await Promise.all(
        missingIds.map(async (id) => {
          try {
            const user = JSON.parse(await getUserById(id));
            fetchedNames[id] = user.firstName + " " + user.lastName;
          } catch (e) {
            console.error(`Failed to fetch user ${id}`, e);
          }
        }),
      );
      if (Object.keys(fetchedNames).length > 0) {
        setUserNames((prev) => ({ ...prev, ...fetchedNames }));
      }
    };
    fetchUserNames();
  }, [comments]);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Comments</h2>
      <div className="flex flex-col gap-2">
        {comments.map((comment: Comment, index: number) => (
          <div key={index} className="p-3 border rounded-md bg-gray-50">
            <p className="font-semibold">
              {userNames[comment.ownerId] || "Unknown User"} &bull;{" "}
              <span className="text-xs">
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </p>
            <p>{comment.text}</p>
          </div>
        ))}
      </div>
      <Input
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        placeholder="Add a comment..."
        disabled={isSubmitting}
      />
      <Button onClick={handleAddComment} disabled={isSubmitting}>
        Add Comment
      </Button>

      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}
