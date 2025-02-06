
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy, GeoPoint, updateDoc, doc } from "firebase/firestore"

export interface BikeComponent {
  id: string
  name: string
  brand: string
  installationDate: string
  expectedLifespan: number
  currentMileage: number
  maintenanceInterval: number
  lastMaintenanceDate: string
  lastMaintenance: {
    timestamp: number
  }
  recommendedInterval: number
  condition: "excellent" | "good" | "fair" | "needs-attention" | "critical"
}

export interface MaintenanceRecord {
  id: string
  componentId: string
  date: string
  type: "routine" | "repair" | "replacement"
  description: string
  mileageAtService: number
  cost: number
  technician?: string
  notes?: string
  mechanicId?: string
  shopName?: string
  customerEmail?: string
  status: "pending" | "completed" | "cancelled"
  nextServiceDate?: string
}

export interface MechanicService {
  id: string
  mechanicId: string
  shopName: string
  customerEmail: string
  serviceDate: string
  completedDate?: string
  services: {
    type: "routine" | "repair" | "replacement"
    description: string
    cost: number
    componentId?: string
  }[]
  status: "scheduled" | "in-progress" | "completed" | "cancelled"
  notes?: string
  nextServiceRecommendation?: string
}

export interface MobileServiceRequest {
  id: string
  location: {
    address: string
    city: string
    state: string
    zip: string
    coordinates?: GeoPoint
  }
  service: {
    type: string
    description: string
    urgency: "low" | "normal" | "high"
  }
  contact: {
    name: string
    phone: string
    email: string
  }
  status: "pending" | "accepted" | "en-route" | "in-progress" | "completed" | "cancelled"
  mechanicId?: string
  createdAt: string
  scheduledTime?: string
  completedTime?: string
  estimatedArrival?: string
}

export const maintenanceService = {
  async addBikeComponent(userId: string, component: Omit<BikeComponent, "id">) {
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/components`), {
        ...component,
        createdAt: new Date().toISOString()
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding component:", error)
      throw error
    }
  },

  async getBikeComponents(bikeId: string): Promise<BikeComponent[]> {
    try {
      const q = query(collection(db, `bikes/${bikeId}/components`))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BikeComponent[]
    } catch (error) {
      console.error("Error fetching bike components:", error)
      throw error
    }
  },

  async getComponents(userId: string): Promise<BikeComponent[]> {
    try {
      const q = query(collection(db, `users/${userId}/components`))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BikeComponent[]
    } catch (error) {
      console.error("Error fetching components:", error)
      throw error
    }
  },

  async addMaintenanceRecord(userId: string, record: Omit<MaintenanceRecord, "id">) {
    try {
      const docRef = await addDoc(collection(db, `users/${userId}/maintenance`), {
        ...record,
        createdAt: new Date().toISOString(),
        status: "completed"
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding maintenance record:", error)
      throw error
    }
  },

  async getMaintenanceHistory(userId: string, componentId?: string): Promise<MaintenanceRecord[]> {
    try {
      let q = query(collection(db, `users/${userId}/maintenance`), orderBy("date", "desc"))
      if (componentId) {
        q = query(q, where("componentId", "==", componentId))
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceRecord[]
    } catch (error) {
      console.error("Error fetching maintenance history:", error)
      throw error
    }
  },

  async addMechanicService(mechanicService: Omit<MechanicService, "id">) {
    try {
      const docRef = await addDoc(collection(db, "mechanicServices"), {
        ...mechanicService,
        createdAt: new Date().toISOString()
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding mechanic service:", error)
      throw error
    }
  },

  async getMechanicServices(mechanicId: string): Promise<MechanicService[]> {
    try {
      const q = query(
        collection(db, "mechanicServices"),
        where("mechanicId", "==", mechanicId),
        orderBy("serviceDate", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MechanicService[]
    } catch (error) {
      console.error("Error fetching mechanic services:", error)
      throw error
    }
  },

  async createMobileRequest(request: Omit<MobileServiceRequest, "id">) {
    try {
      const docRef = await addDoc(collection(db, "mobileServiceRequests"), {
        ...request,
        status: "pending",
        createdAt: new Date().toISOString()
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating mobile service request:", error)
      throw error
    }
  },

  async getMobileRequests(status?: MobileServiceRequest["status"]): Promise<MobileServiceRequest[]> {
    try {
      let q = query(collection(db, "mobileServiceRequests"), orderBy("createdAt", "desc"))
      if (status) {
        q = query(q, where("status", "==", status))
      }
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MobileServiceRequest[]
    } catch (error) {
      console.error("Error fetching mobile requests:", error)
      throw error
    }
  },

  async updateMobileRequestStatus(
    requestId: string,
    status: MobileServiceRequest["status"],
    updates: Partial<MobileServiceRequest> = {}
  ) {
    try {
      const docRef = doc(db, "mobileServiceRequests", requestId)
      await updateDoc(docRef, {
        status,
        ...updates,
        updatedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error("Error updating mobile request status:", error)
      throw error
    }
  },

  async getCustomerServices(customerEmail: string): Promise<MechanicService[]> {
    try {
      const q = query(
        collection(db, "mechanicServices"),
        where("customerEmail", "==", customerEmail),
        orderBy("serviceDate", "desc")
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MechanicService[]
    } catch (error) {
      console.error("Error fetching customer services:", error)
      throw error
    }
  },

  predictMaintenanceNeeds(component: BikeComponent): {
    daysUntilMaintenance: number
    condition: BikeComponent["condition"]
    recommendation: string
  } {
    const lastMaintenance = new Date(component.lastMaintenanceDate)
    const today = new Date()
    const daysSinceLastMaintenance = Math.floor((today.getTime() - lastMaintenance.getTime()) / (1000 * 60 * 60 * 24))
    const usageIntensity = component.currentMileage / daysSinceLastMaintenance

    const daysUntilMaintenance = Math.max(0, component.maintenanceInterval - daysSinceLastMaintenance)
    const wearPercentage = (component.currentMileage / component.expectedLifespan) * 100

    let condition: BikeComponent["condition"]
    let recommendation: string

    if (wearPercentage >= 90) {
      condition = "critical"
      recommendation = "Immediate replacement recommended"
    } else if (wearPercentage >= 75) {
      condition = "needs-attention"
      recommendation = "Plan for replacement soon"
    } else if (wearPercentage >= 50) {
      condition = "fair"
      recommendation = "Monitor wear and schedule maintenance"
    } else if (wearPercentage >= 25) {
      condition = "good"
      recommendation = "Regular maintenance recommended"
    } else {
      condition = "excellent"
      recommendation = "Continue regular maintenance"
    }

    return {
      daysUntilMaintenance,
      condition,
      recommendation
    }
  }
}
