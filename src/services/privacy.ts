
import { db } from "@/lib/firebase"
import { collection, doc, getDoc, setDoc } from "firebase/firestore"

export interface DataCategory {
  id: string
  enabled: boolean
  monetizationEnabled: boolean
  lastUpdated: number
}

export interface DataCategoryInfo {
  id: string
  name: string
  description: string
  benefits: string[]
  pricePerMonth: number
}

export interface PrivacySettings {
  userId: string
  dataSharing: {
    [key: string]: DataCategory
  }
  dataCategories: string[]
  estimatedEarnings: number
  lastUpdated: number
  paymentPreferences: {
    preferredPayment: "paypal" | "crypto" | "bank"
    paypalEmail?: string
    cryptoWallet?: string
  }
}

export const DATA_CATEGORIES: DataCategoryInfo[] = [
  {
    id: "location",
    name: "Location Data",
    description: "Share your riding routes and locations",
    benefits: [
      "Contribute to safer route planning",
      "Help improve cycling infrastructure",
      "Enable real-time safety features"
    ],
    pricePerMonth: 5.00
  },
  {
    id: "activity",
    name: "Activity Data",
    description: "Share your riding patterns and habits",
    benefits: [
      "Improve cycling analytics",
      "Contribute to fitness research",
      "Help develop better cycling products"
    ],
    pricePerMonth: 3.00
  },
  {
    id: "maintenance",
    name: "Maintenance Data",
    description: "Share your bike maintenance history",
    benefits: [
      "Help improve component reliability",
      "Enhance predictive maintenance",
      "Contribute to product development"
    ],
    pricePerMonth: 2.00
  }
]

export const privacyService = {
  getDataCategoryInfo(categoryId: string): DataCategoryInfo | undefined {
    return DATA_CATEGORIES.find(cat => cat.id === categoryId)
  },

  async getPrivacySettings(userId: string): Promise<PrivacySettings | null> {
    try {
      const docRef = doc(db, `users/${userId}/settings/privacy`)
      const docSnap = await getDoc(docRef)
      return docSnap.exists() ? docSnap.data() as PrivacySettings : null
    } catch (error) {
      console.error("Error getting privacy settings:", error)
      return null
    }
  },

  async initializePrivacySettings(userId: string): Promise<PrivacySettings> {
    const initialSettings: PrivacySettings = {
      userId,
      dataSharing: {},
      dataCategories: DATA_CATEGORIES.map(cat => cat.id),
      estimatedEarnings: 0,
      lastUpdated: Date.now(),
      paymentPreferences: {
        preferredPayment: "paypal"
      }
    }

    try {
      await setDoc(doc(db, `users/${userId}/settings/privacy`), initialSettings)
      return initialSettings
    } catch (error) {
      console.error("Error initializing privacy settings:", error)
      throw error
    }
  },

  async updatePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
    try {
      const updatedSettings = {
        ...settings,
        lastUpdated: Date.now()
      }
      await setDoc(doc(db, `users/${userId}/settings/privacy`), updatedSettings)
    } catch (error) {
      console.error("Error updating privacy settings:", error)
      throw error
    }
  },

  calculateMonthlyEarnings(settings: PrivacySettings): number {
    return DATA_CATEGORIES.reduce((total, category) => {
      const categorySettings = settings.dataSharing[category.id]
      if (categorySettings?.enabled && categorySettings?.monetizationEnabled) {
        return total + category.pricePerMonth
      }
      return total
    }, 0)
  }
}
