
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"
import { privacyService, DATA_CATEGORIES, type DataCategoryInfo } from "@/services/privacy"

interface PaymentTransaction {
  id: string
  userId: string
  amount: number
  type: "data_monetization" | "insurance_premium" | "service_fee"
  status: "pending" | "completed" | "failed"
  timestamp: number
  details: Record<string, any>
}

export const paymentService = {
  async processDataMonetizationPayment(userId: string): Promise<PaymentTransaction> {
    try {
      const settings = await privacyService.getPrivacySettings(userId)
      if (!settings) {
        throw new Error("Privacy settings not found")
      }

      const enabledCategories = Object.entries(settings.dataSharing)
        .filter(([_, sharing]) => sharing.monetizationEnabled)
        .map(([categoryId]) => {
          const category = DATA_CATEGORIES.find(cat => cat.id === categoryId)
          return {
            categoryId,
            amount: category?.pricePerMonth || 0,
          }
        })

      const totalAmount = enabledCategories.reduce((sum, cat) => sum + cat.amount, 0)

      const transaction: Omit<PaymentTransaction, "id"> = {
        userId,
        amount: totalAmount,
        type: "data_monetization",
        status: "pending",
        timestamp: Date.now(),
        details: {
          categories: enabledCategories
        }
      }

      const docRef = await addDoc(collection(db, "paymentTransactions"), transaction)
      return {
        id: docRef.id,
        ...transaction
      }
    } catch (error) {
      console.error("Error processing data monetization payment:", error)
      throw error
    }
  },

  async getPaymentHistory(userId: string): Promise<PaymentTransaction[]> {
    try {
      const q = query(
        collection(db, "paymentTransactions"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentTransaction[]
    } catch (error) {
      console.error("Error getting payment history:", error)
      throw error
    }
  }
}
