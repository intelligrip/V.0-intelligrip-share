import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, GeoPoint, updateDoc, doc } from "firebase/firestore"
import { type CO2Savings } from "./co2"

export interface BikeModel {
  id: string
  manufacturerId: string
  name: string
  category: "road" | "mountain" | "hybrid" | "electric" | "city"
  yearReleased: number
  specifications: {
    weight: number
    frameSize: string[]
    color: string[]
    features: string[]
  }
}

export interface RideAnalytics {
  modelId: string
  manufacturerId: string
  totalRides: number
  totalDistance: number
  averageSpeed: number
  popularRoutes: {
    startLocation: {
      latitude: number
      longitude: number
      city: string
    }
    endLocation: {
      latitude: number
      longitude: number
      city: string
    }
    frequency: number
  }[]
  rideTimes: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
  terrain: {
    road: number
    trail: number
    urban: number
    mixed: number
  }
}

export interface MarketingCampaign {
  id: string
  manufacturerId: string
  title: string
  description: string
  targetAudience: {
    bikeModels: string[]
    ridePatterns: {
      minDistance?: number
      maxDistance?: number
      preferredTerrain?: string[]
      timeOfDay?: string[]
    }
    locations: {
      city: string
      state: string
      radius: number
      coordinates: {
        latitude: number
        longitude: number
      }
    }[]
  }
  content: {
    type: "promotion" | "maintenance" | "upgrade" | "event" | "survey"
    title: string
    description: string
    imageUrl?: string
    actionUrl?: string
    validUntil?: number
  }
  status: "draft" | "active" | "completed"
  startDate: number
  endDate: number
  metrics: {
    impressions: number
    engagements: number
    conversions: number
  }
}

export const manufacturerService = {
  async trackRideData(
    rideData: {
      userId: string
      modelId: string
      distance: number
      speed: number
      startLocation: {
        latitude: number
        longitude: number
        city: string
      }
      endLocation: {
        latitude: number
        longitude: number
        city: string
      }
      terrain: string
      timestamp: number
    }
  ): Promise<void> {
    try {
      const model = await this.getBikeModel(rideData.modelId)
      if (!model) throw new Error("Bike model not found")

      // Update analytics
      const analyticsRef = doc(db, "rideAnalytics", model.manufacturerId)
      const analytics = (await getDocs(query(
        collection(db, "rideAnalytics"),
        where("manufacturerId", "==", model.manufacturerId)
      ))).docs[0]?.data() as RideAnalytics | undefined

      if (!analytics) {
        await addDoc(collection(db, "rideAnalytics"), {
          modelId: model.id,
          manufacturerId: model.manufacturerId,
          totalRides: 1,
          totalDistance: rideData.distance,
          averageSpeed: rideData.speed,
          popularRoutes: [{
            startLocation: rideData.startLocation,
            endLocation: rideData.endLocation,
            frequency: 1
          }],
          rideTimes: this.calculateRideTimeSlot(rideData.timestamp),
          terrain: {
            road: rideData.terrain === "road" ? 1 : 0,
            trail: rideData.terrain === "trail" ? 1 : 0,
            urban: rideData.terrain === "urban" ? 1 : 0,
            mixed: rideData.terrain === "mixed" ? 1 : 0
          }
        })
      } else {
        await updateDoc(analyticsRef, {
          totalRides: analytics.totalRides + 1,
          totalDistance: analytics.totalDistance + rideData.distance,
          averageSpeed: (analytics.averageSpeed * analytics.totalRides + rideData.speed) / (analytics.totalRides + 1),
          [`terrain.${rideData.terrain}`]: analytics.terrain[rideData.terrain as keyof typeof analytics.terrain] + 1
        })
      }

      // Check for relevant marketing campaigns
      await this.checkAndDeliverMarketing(rideData)
    } catch (error) {
      console.error("Error tracking ride data:", error)
      throw error
    }
  },

  async getBikeModel(modelId: string): Promise<BikeModel | null> {
    try {
      const snapshot = await getDocs(
        query(collection(db, "bikeModels"), where("id", "==", modelId))
      )
      if (snapshot.empty) return null
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as BikeModel
    } catch (error) {
      console.error("Error getting bike model:", error)
      return null
    }
  },

  calculateRideTimeSlot(timestamp: number): RideAnalytics["rideTimes"] {
    const hour = parseInt(new Date(timestamp).toISOString().slice(11, 13), 10); // Extracts hour in UTC
    return {
      morning: hour >= 5 && hour < 12 ? 1 : 0,
      afternoon: hour >= 12 && hour < 17 ? 1 : 0,
      evening: hour >= 17 && hour < 21 ? 1 : 0,
      night: hour >= 21 || hour < 5 ? 1 : 0
    };
  }
,  

  async createMarketingCampaign(campaign: Omit<MarketingCampaign, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "marketingCampaigns"), {
        ...campaign,
        metrics: {
          impressions: 0,
          engagements: 0,
          conversions: 0
        }
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating marketing campaign:", error)
      throw error
    }
  },

  async checkAndDeliverMarketing(rideData: {
    userId: string
    modelId: string
    startLocation: {
      latitude: number
      longitude: number
      city: string
    }
    distance: number
    terrain: string
    timestamp: number
  }): Promise<MarketingCampaign[]> {
    try {
      const model = await this.getBikeModel(rideData.modelId)
      if (!model) return []

      const campaignsQuery = query(
        collection(db, "marketingCampaigns"),
        where("manufacturerId", "==", model.manufacturerId),
        where("status", "==", "active")
      )
      
      const campaigns = (await getDocs(campaignsQuery))
        .docs.map(doc => ({ id: doc.id, ...doc.data() })) as MarketingCampaign[]

      const relevantCampaigns = campaigns.filter(campaign => {
        // Check if bike model is targeted
        if (!campaign.targetAudience.bikeModels.includes(rideData.modelId)) {
          return false
        }

        // Check location relevance
        const isInTargetLocation = campaign.targetAudience.locations.some(location => 
          this.calculateDistance(
            location.coordinates.latitude,
            location.coordinates.longitude,
            rideData.startLocation.latitude,
            rideData.startLocation.longitude
          ) <= location.radius
        )

        if (!isInTargetLocation) {
          return false
        }

        // Check ride pattern match
        const patterns = campaign.targetAudience.ridePatterns
        if (patterns.minDistance && rideData.distance < patterns.minDistance) {
          return false
        }
        if (patterns.maxDistance && rideData.distance > patterns.maxDistance) {
          return false
        }
        if (patterns.preferredTerrain && !patterns.preferredTerrain.includes(rideData.terrain)) {
          return false
        }

        return true
      })

      // Update campaign metrics
      await Promise.all(relevantCampaigns.map(campaign =>
        updateDoc(doc(db, "marketingCampaigns", campaign.id), {
          "metrics.impressions": campaign.metrics.impressions + 1
        })
      ))

      return relevantCampaigns
    } catch (error) {
      console.error("Error checking marketing campaigns:", error)
      return []
    }
  },

  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371
    const dLat = this.toRad(lat2 - lat1)
    const dLon = this.toRad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  toRad(value: number): number {
    return (value * Math.PI) / 180
  },

  async getManufacturerAnalytics(manufacturerId: string): Promise<{
    totalRides: number
    totalDistance: number
    popularModels: { modelId: string; rides: number }[]
    riderDemographics: {
      age: { [key: string]: number }
      gender: { [key: string]: number }
      experience: { [key: string]: number }
    }
  }> {
    try {
      const analyticsRef = doc(db, "manufacturerAnalytics", manufacturerId)
      const analytics = (await getDocs(query(
        collection(db, "rideAnalytics"),
        where("manufacturerId", "==", manufacturerId)
      ))).docs.map(doc => doc.data() as RideAnalytics)

      return {
        totalRides: analytics.reduce((sum, a) => sum + a.totalRides, 0),
        totalDistance: analytics.reduce((sum, a) => sum + a.totalDistance, 0),
        popularModels: analytics.map(a => ({
          modelId: a.modelId,
          rides: a.totalRides
        })).sort((a, b) => b.rides - a.rides),
        riderDemographics: {
          age: {},
          gender: {},
          experience: {}
        }
      }
    } catch (error) {
      console.error("Error getting manufacturer analytics:", error)
      throw error
    }
  }
}