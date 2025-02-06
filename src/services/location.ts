import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, GeoPoint } from "firebase/firestore"

export interface BikeShop {
  id: string
  name: string
  location: {
    latitude: number
    longitude: number
    address: string
    city: string
    state: string
    zipCode: string
  }
  contact: {
    phone: string
    email?: string
    website?: string
  }
  details: {
    services: string[]
    hours: {
      [key: string]: {
        open: string
        close: string
      }
    }
    rating?: number
    specialties?: string[]
  }
  amenities: string[]
}

export const locationService = {
  async addBikeShop(shop: Omit<BikeShop, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "bikeShops"), shop)
      return docRef.id
    } catch (error) {
      console.error("Error adding bike shop:", error)
      throw error
    }
  },

  async getNearbyBikeShops(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<BikeShop[]> {
    try {
      const q = query(collection(db, "bikeShops"))
      const snapshot = await getDocs(q)
      
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BikeShop[]

      return shops.filter(shop => {
        const distance = this.calculateDistance(
          latitude,
          longitude,
          shop.location.latitude,
          shop.location.longitude
        )
        return distance <= radiusKm
      }).sort((a, b) => {
        const distanceA = this.calculateDistance(
          latitude,
          longitude,
          a.location.latitude,
          a.location.longitude
        )
        const distanceB = this.calculateDistance(
          latitude,
          longitude,
          b.location.latitude,
          b.location.longitude
        )
        return distanceA - distanceB
      })
    } catch (error) {
      console.error("Error getting nearby bike shops:", error)
      return []
    }
  },

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371 // Earth's radius in km
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

  async searchBikeShops(query: string): Promise<BikeShop[]> {
    try {
      const q = collection(db, "bikeShops")
      const snapshot = await getDocs(q)
      
      const shops = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BikeShop[]

      return shops.filter(shop =>
        shop.name.toLowerCase().includes(query.toLowerCase()) ||
        shop.location.city.toLowerCase().includes(query.toLowerCase()) ||
        shop.details.services.some(service =>
          service.toLowerCase().includes(query.toLowerCase())
        )
      )
    } catch (error) {
      console.error("Error searching bike shops:", error)
      return []
    }
  },

  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`
    }
    return `${km.toFixed(1)}km`
  }
}