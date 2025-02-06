import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore"
import type { BicycleListing } from "@/components/marketplace/BicycleMarketplace"

const COLLECTION_NAME = "listings"

export const marketplaceService = {
  async createListing(listing: Omit<BicycleListing, "id" | "createdAt">) {
    try {
      const docRef = await addDoc(collection(db, COLLECTION_NAME), {
        ...listing,
        createdAt: new Date().toISOString()
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating listing:", error)
      throw error
    }
  },

  async getListings(): Promise<BicycleListing[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BicycleListing[]
    } catch (error) {
      console.error("Error fetching listings:", error)
      throw error
    }
  }
}