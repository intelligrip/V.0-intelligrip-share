
import { db } from "@/lib/firebase"
import { collection, doc, addDoc, getDocs, query, where, orderBy, arrayUnion, updateDoc } from "firebase/firestore"

export interface InsurancePlan {
  id: string
  name: string
  description: string
  coverage: {
    theft: boolean
    damage: boolean
    liability: boolean
    accessories: boolean
  }
  monthlyPremium: number
  deductible: number
  maxCoverage: number
  terms: string[]
  features: string[]
}

export interface InsuranceClaim {
  id: string
  policyId: string
  userId: string
  type: "theft" | "damage" | "liability"
  description: string
  amount: number
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  documents: string[]
  location?: {
    latitude: number
    longitude: number
  }
}

export interface InsurancePolicy {
  id: string
  userId: string
  planId: string
  bikeId: string
  status: "active" | "cancelled" | "expired"
  startDate: string
  endDate: string
  monthlyPremium: number
  claims: InsuranceClaim[]
}

const insuranceService = {
  async getInsurancePlans(): Promise<InsurancePlan[]> {
    try {
      const plansRef = collection(db, "insurancePlans")
      const snapshot = await getDocs(plansRef)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InsurancePlan[]
    } catch (error) {
      console.error("Error fetching insurance plans:", error)
      throw error
    }
  },

  async getPolicyByBikeId(bikeId: string): Promise<InsurancePolicy | null> {
    try {
      const policiesRef = collection(db, "insurancePolicies")
      const q = query(
        policiesRef,
        where("bikeId", "==", bikeId),
        where("status", "==", "active")
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      } as InsurancePolicy
    } catch (error) {
      console.error("Error fetching policy:", error)
      throw error
    }
  },

  async createPolicy(
    userId: string,
    planId: string,
    bikeId: string,
    plan: InsurancePlan
  ): Promise<string> {
    try {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setFullYear(endDate.getFullYear() + 1)

      const policy: Omit<InsurancePolicy, "id"> = {
        userId,
        planId,
        bikeId,
        status: "active",
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        monthlyPremium: plan.monthlyPremium,
        claims: []
      }

      const docRef = await addDoc(collection(db, "insurancePolicies"), policy)
      return docRef.id
    } catch (error) {
      console.error("Error creating policy:", error)
      throw error
    }
  },

  async submitClaim(
    policyId: string,
    claim: Omit<InsuranceClaim, "id" | "status" | "submittedAt">
  ): Promise<string> {
    try {
      const claimData: Omit<InsuranceClaim, "id"> = {
        ...claim,
        status: "pending",
        submittedAt: new Date().toISOString()
      }

      const policyRef = doc(db, "insurancePolicies", policyId)
      await updateDoc(policyRef, {
        claims: arrayUnion(claimData)
      })

      return new Date().getTime().toString()
    } catch (error) {
      console.error("Error submitting claim:", error)
      throw error
    }
  },

  async getUserPolicies(userId: string): Promise<InsurancePolicy[]> {
    try {
      const policiesRef = collection(db, "insurancePolicies")
      const q = query(
        policiesRef,
        where("userId", "==", userId),
        orderBy("startDate", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InsurancePolicy[]
    } catch (error) {
      console.error("Error fetching user policies:", error)
      throw error
    }
  }
}

export { insuranceService }
