
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MapPin, Clock } from "lucide-react"
import { CommentsDialog } from "./CommentsDialog"
import { engagementService } from "@/services/engagement"
import Image from "next/image"

interface RideSharePostProps {
  post: {
    id: string
    userId: string
    userName: string
    userAvatar: string
    rideStats: {
      distance: number
      duration: string
      speed: number
    }
    location: string
    timestamp: number
    media: {
      type: "image" | "video"
      url: string
      thumbnail?: string
    }[]
    likes: number
    comments: number
    description: string
  }
  currentUser: {
    id: string
    name: string
    avatar: string
  }
}

export function RideSharePost({ post, currentUser }: RideSharePostProps) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post.likes)
  const [commentCount, setCommentCount] = useState(post.comments)

  const checkLikeStatus = useCallback(async () => {
    try {
      const existingLike = await engagementService.getUserLike(currentUser.id, post.id)
      setLiked(!!existingLike)
    } catch (error) {
      console.error("Error checking like status:", error)
    }
  }, [currentUser.id, post.id])

  useEffect(() => {
    checkLikeStatus()
  }, [checkLikeStatus])

  const handleLike = async () => {
    try {
      if (liked) {
        await engagementService.unlikePost(currentUser.id, post.id)
        setLikeCount(prev => prev - 1)
      } else {
        await engagementService.likePost(currentUser.id, post.id)
        setLikeCount(prev => prev + 1)
      }
      setLiked(!liked)
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mb-4">
      <CardHeader className="flex flex-row items-center space-x-4 p-4">
        <Avatar className="h-10 w-10">
          <Image src={post.userAvatar} alt={post.userName} width={40} height={40} />
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg font-semibold">{post.userName}</CardTitle>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1" />
            {post.location} • {new Date(post.timestamp).toLocaleDateString()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="relative aspect-video bg-muted">
          {post.media[currentMediaIndex].type === "image" ? (
            <div className="relative w-full h-full">
              <Image
                src={post.media[currentMediaIndex].url}
                alt="Ride"
                className="object-cover"
                width={1280}
                height={720}
              />
            </div>
          ) : (
            <video
              src={post.media[currentMediaIndex].url}
              controls
              className="w-full h-full object-cover"
            />
          )}
          {post.media.length > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
              {post.media.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === currentMediaIndex ? "bg-primary" : "bg-primary/50"
                  }`}
                  onClick={() => setCurrentMediaIndex(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-4 bg-muted/50 rounded-lg p-3">
            <div className="text-center">
              <div className="text-sm font-medium">{post.rideStats.distance}km</div>
              <div className="text-xs text-muted-foreground">Distance</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{post.rideStats.duration}</div>
              <div className="text-xs text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium">{post.rideStats.speed}km/h</div>
              <div className="text-xs text-muted-foreground">Avg Speed</div>
            </div>
          </div>
          <p className="text-sm">{post.description}</p>
        </div>
      </CardContent>

      <CardFooter className="p-4 flex justify-between">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${liked ? "text-red-500" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
            {likeCount}
          </Button>
          <CommentsDialog
            postId={post.id}
            userId={currentUser.id}
            userName={currentUser.name}
            userAvatar={currentUser.avatar}
            trigger={
              <Button variant="ghost" size="sm" className="gap-2">
                <MessageCircle className="h-4 w-4" />
                {commentCount}
              </Button>
            }
          />
        </div>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
