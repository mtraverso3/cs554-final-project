"use client";

import { useEffect, useState } from "react";
import { getUserById } from "@/lib/userForms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addQuizComment } from "@/lib/quizForms";
import { Comment, QuizInput } from "@/lib/db/data/safeSchema";
import { MessageCircle, Send, User, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function CommentSection({
  quiz,
  currentUserId,
}: {
  quiz: QuizInput;
  currentUserId: string;
}) {
  const parsedQuiz = quiz;
  const [comments, setComments] = useState<Comment[]>(
    parsedQuiz.comments || ([] as Comment[]),
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
      await addQuizComment(parsedQuiz._id, newComment);
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
  }, [comments, userNames]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }) + ' at ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="px-6 py-8 bg-gray-50 rounded-xl shadow-sm mt-8">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <MessageCircle className="mr-2" size={20} />
        Comments ({comments.length})
      </h2>
      
      <Separator className="mb-6" />
      
      <div className="flex items-center space-x-2 mb-6">
        <Input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          disabled={isSubmitting}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleAddComment();
            }
          }}
        />
        <Button 
          onClick={handleAddComment} 
          disabled={isSubmitting || !newComment.trim()}
          size="sm"
        >
          <Send size={16} className="mr-2" />
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>
      
      {error && (
        <div className="p-3 mb-4 text-sm text-red-800 bg-red-100 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center p-6 text-gray-500">
            No comments yet. Be the first to leave a comment!
          </div>
        ) : (
          comments.map((comment: Comment, index: number) => (
            <div 
              key={index} 
              className="p-4 border rounded-md bg-white hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center mb-2">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-2">
                  <User size={16} />
                </div>
                <div>
                  <div className="font-medium">
                    {userNames[comment.ownerId] || "Loading user..."}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <Clock size={12} className="mr-1" />
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
              </div>
              <p className="pl-10 text-gray-700 whitespace-pre-line">{comment.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
