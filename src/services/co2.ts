import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs } from "firebase/firestore"

export interface CO2Savings {
  id: string
  userId: string
  rideId: string
  distance: number
  co2Saved: number
  timestamp: number
  transportType: "car" | "bus" | "motorcycle"
}

export const co2Service = {
  CO2_PER_KM: {
    car: 0.192, // kg CO2 per km (average car)
    bus: 0.082, // kg CO2 per km (public bus)
    motorcycle: 0.103 // kg CO2 per km (motorcycle)
  },

  calculateCO2Savings(distance: number, transportType: "car" | "bus" | "motorcycle" = "car"): number {
    return distance * this.CO2_PER_KM[transportType]
  },

  async trackRideCO2Savings(
    userId: string,
    rideId: string,
    distance: number,
    transportType: "car" | "bus" | "motorcycle" = "car"
  ): Promise<CO2Savings> {
    try {
      const co2Saved = this.calculateCO2Savings(distance, transportType)
      
      const savings: Omit<CO2Savings, "id"> = {
        userId,
        rideId,
        distance,
        co2Saved,
        timestamp: Date.now(),
        transportType
      }

      const docRef = await addDoc(collection(db, "co2Savings"), savings)
      return { ...savings, id: docRef.id } as CO2Savings
    } catch (error) {
      console.error("Error tracking CO2 savings:", error)
      throw error
    }
  },

  async getUserTotalCO2Savings(userId: string): Promise<{
    total: number
    breakdown: { [key in "car" | "bus" | "motorcycle"]: number }
  }> {
    try {
      const q = query(
        collection(db, "co2Savings"),
        where("userId", "==", userId)
      )
      const snapshot = await getDocs(q)
      
      const breakdown = {
        car: 0,
        bus: 0,
        motorcycle: 0
      }

      snapshot.docs.forEach(doc => {
        const saving = doc.data() as CO2Savings
        breakdown[saving.transportType] += saving.co2Saved
      })

      const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0)

      return { total, breakdown }
    } catch (error) {
      console.error("Error getting total CO2 savings:", error)
      return { total: 0, breakdown: { car: 0, bus: 0, motorcycle: 0 } }
    }
  },

  async getCommunityCO2Savings(communityId: string): Promise<number> {
    try {
      const q = query(
        collection(db, "co2Savings"),
        where("communityId", "==", communityId)
      )
      const snapshot = await getDocs(q)
      
      return snapshot.docs.reduce((total, doc) => {
        const saving = doc.data() as CO2Savings
        return total + saving.co2Saved
      }, 0)
    } catch (error) {
      console.error("Error getting community CO2 savings:", error)
      return 0
    }
  },

  formatCO2Amount(kg: number): string {
    if (kg < 1) {
      return `${Math.round(kg * 1000)} g`
    }
    return `${kg.toFixed(2)} kg`
  },

  getCO2SavingsEquivalent(kg: number): string {
    const trees = (kg / 21).toFixed(1) // One tree absorbs ~21kg CO2 per year
    return `Equivalent to ${trees} trees planted`
  }
}