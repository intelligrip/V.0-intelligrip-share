import { db, realTimeDb } from "@/lib/firebase"
import { ref, set, onValue, off } from "firebase/database"

export interface ProximityEvent {
  deviceId: string
  distance: number
  timestamp: number
  brightness: number
  batteryLevel: number
  location: {
    latitude: number
    longitude: number
  }
}

export interface PowerMode {
  mode: "normal" | "low"
  batteryLevel: number
  lastUpdated: number
}

export const firmwareService = {
  async handleCarProximity(deviceId: string, distance: number): Promise<void> {
    try {
      const brightness = distance <= 10 ? 100 : distance <= 20 ? 75 : 50
      
      // Update device state
      await set(ref(realTimeDb, `devices/${deviceId}`), {
        distance,
        brightness,
        lastUpdate: Date.now()
      })
    } catch (error) {
      console.error("Error handling car proximity:", error)
      throw error
    }
  },

  async setPowerMode(deviceId: string, mode: PowerMode["mode"]): Promise<void> {
    try {
      await set(ref(realTimeDb, `devices/${deviceId}/power`), {
        mode,
        lastUpdated: Date.now()
      })
    } catch (error) {
      console.error("Error setting power mode:", error)
      throw error
    }
  },

  async getBatteryLevel(deviceId: string): Promise<number> {
    return new Promise((resolve) => {
      const batteryRef = ref(realTimeDb, `devices/${deviceId}/battery`)
      onValue(batteryRef, (snapshot) => {
        resolve(snapshot.val()?.level || 0)
        off(batteryRef)
      })
    })
  }
}