
import { db, realTimeDb } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { ref, set, onValue, off } from "firebase/database"
import { notificationService } from "./notifications"
import { privacyService } from "./privacy"

export interface SecurityAlert {
  id: string
  bikeId: string
  userId: string
  type: "unauthorized_movement" | "unusual_location" | "unusual_time" | "unusual_behavior"
  severity: "low" | "medium" | "high"
  timestamp: number
  location: {
    latitude: number
    longitude: number
  }
  description: string
  status: "active" | "resolved" | "false_alarm"
}

export interface VehicleTransportEvent {
  id: string
  bikeId: string
  timestamp: number
  location: {
    latitude: number
    longitude: number
  }
  speed: number
  acceleration: number
  isMoving: boolean
  confidence: number
}

interface AccelerationThresholds {
  max: number
  sustained: number
  duration: number
}

const CYCLING_THRESHOLDS: AccelerationThresholds = {
  max: 2.5,
  sustained: 1.2,
  duration: 5000
}

export const securityService = {
  async createAlert(alert: Omit<SecurityAlert, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "securityAlerts"), alert)
      return docRef.id
    } catch (error) {
      console.error("Error creating security alert:", error)
      throw error
    }
  },

  async updateAlertStatus(alertId: string, status: SecurityAlert["status"]): Promise<void> {
    try {
      const alertRef = doc(db, "securityAlerts", alertId)
      await updateDoc(alertRef, { status })
    } catch (error) {
      console.error("Error updating alert status:", error)
      throw error
    }
  },

  detectVehicleTransport(events: VehicleTransportEvent[]): {
    isVehicleTransport: boolean
    confidence: number
    reason?: string
  } {
    if (events.length < 2) {
      return { isVehicleTransport: false, confidence: 0, reason: "Insufficient data points" }
    }

    const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp)

    let sustainedHighAccelCount = 0
    let maxAcceleration = 0
    let sustainedDuration = 0
    let lastHighAccelTimestamp = 0

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i]
      maxAcceleration = Math.max(maxAcceleration, Math.abs(event.acceleration))

      if (Math.abs(event.acceleration) > CYCLING_THRESHOLDS.sustained) {
        if (lastHighAccelTimestamp === 0) {
          lastHighAccelTimestamp = event.timestamp
        }
        sustainedHighAccelCount++
        sustainedDuration = event.timestamp - lastHighAccelTimestamp
      } else {
        lastHighAccelTimestamp = 0
        sustainedDuration = 0
      }
    }

    const speeds = sortedEvents.map(e => e.speed)
    const avgSpeed = speeds.reduce((sum, speed) => sum + speed, 0) / speeds.length
    const speedVariance = speeds.reduce((sum, speed) => sum + Math.pow(speed - avgSpeed, 2), 0) / speeds.length

    const isSustainedHighAccel = sustainedDuration > CYCLING_THRESHOLDS.duration
    const isHighMaxAccel = maxAcceleration > CYCLING_THRESHOLDS.max
    const isLowSpeedVariance = speedVariance < 1.0

    let confidence = 0
    let reasons: string[] = []

    if (isSustainedHighAccel) {
      confidence += 0.4
      reasons.push("Sustained high acceleration")
    }
    if (isHighMaxAccel) {
      confidence += 0.3
      reasons.push("Excessive maximum acceleration")
    }
    if (isLowSpeedVariance) {
      confidence += 0.3
      reasons.push("Unusually consistent speed")
    }

    return {
      isVehicleTransport: confidence > 0.6,
      confidence,
      reason: reasons.join(", ")
    }
  }
}
