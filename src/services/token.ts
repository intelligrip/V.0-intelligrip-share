
import { db } from "@/lib/firebase"
import { collection, addDoc } from "firebase/firestore"

interface TokenTransaction {
  userId: string
  rideId: string
  amount: number
  type: "earn" | "spend"
  timestamp: number
}

export const tokenService = {
  async earnTokensForRide(
    rideId: string,
    miles: number,
    timestamp: string
  ): Promise<{ amount: number }> {
    try {
      const amount = this.calculateTokensForMiles(miles)
      
      await addDoc(collection(db, "tokenTransactions"), {
        rideId,
        amount,
        type: "earn",
        timestamp: Date.now()
      })

      return { amount }
    } catch (error) {
      console.error("Error earning tokens:", error)
      throw error
    }
  },

  calculateTokensForMiles(miles: number): number {
    return Math.floor(miles)
  }
}
