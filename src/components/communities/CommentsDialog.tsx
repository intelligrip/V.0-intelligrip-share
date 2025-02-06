
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"
import { engagementService } from "@/services/engagement"
import type { StaticImageData } from "next/image"
import Image from "next/image"

interface CommentsDialogProps {
  postId: string
  userId: string
  userName: string
  userAvatar: string | StaticImageData
  trigger: React.ReactNode
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar: string | StaticImageData
  content: string
  timestamp: number
}

export function CommentsDialog({
  postId,
  userId,
  userName,
  userAvatar,
  trigger
}: CommentsDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadComments = useCallback(async () => {
    try {
      const loadedComments = await engagementService.getComments(postId)
      setComments(loadedComments)
    } catch (error) {
      console.error("Error loading comments:", error)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    if (isOpen) {
      loadComments()
    }
  }, [isOpen, loadComments])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const comment = await engagementService.addComment(postId, {
        userId,
        userName,
        userAvatar,
        content: newComment
      })
      setComments(prev => [comment, ...prev])
      setNewComment("")
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Comments</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              disabled={isSubmitting}
            />
            <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </form>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <Image
                      src={comment.userAvatar}
                      alt={comment.userName}
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                  </Avatar>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
