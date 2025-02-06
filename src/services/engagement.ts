
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore"
import type { StaticImageData } from "next/image"

interface CommentData {
  userId: string
  userName: string
  userAvatar: string | StaticImageData
  content: string
}

interface Comment extends CommentData {
  id: string
  timestamp: number
}

export const engagementService = {
  async likePost(userId: string, postId: string): Promise<string> {
    const like = await addDoc(collection(db, "likes"), {
      userId,
      postId,
      timestamp: Date.now()
    })
    return like.id
  },

  async unlikePost(userId: string, postId: string): Promise<void> {
    const likesRef = collection(db, "likes")
    const q = query(likesRef, 
      where("userId", "==", userId),
      where("postId", "==", postId)
    )
    const snapshot = await getDocs(q)
    if (!snapshot.empty) {
      await deleteDoc(doc(db, "likes", snapshot.docs[0].id))
    }
  },

  async getUserLike(userId: string, postId: string): Promise<string | null> {
    const likesRef = collection(db, "likes")
    const q = query(likesRef,
      where("userId", "==", userId),
      where("postId", "==", postId)
    )
    const snapshot = await getDocs(q)
    return snapshot.empty ? null : snapshot.docs[0].id
  },

  async addComment(postId: string, data: CommentData): Promise<Comment> {
    const comment = await addDoc(collection(db, "comments"), {
      ...data,
      postId,
      timestamp: Date.now()
    })
    
    return {
      id: comment.id,
      ...data,
      timestamp: Date.now()
    }
  },

  async getComments(postId: string): Promise<Comment[]> {
    const commentsRef = collection(db, "comments")
    const q = query(commentsRef, where("postId", "==", postId))
    const snapshot = await getDocs(q)
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment))
  },

  async updateCommentLikes(commentId: string, likes: number): Promise<void> {
    await addDoc(collection(db, "commentLikes"), {
      commentId,
      likes,
      timestamp: Date.now()
    })
  }
}
