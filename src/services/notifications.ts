import { db } from "@/lib/firebase"
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { SecurityAlert } from "./security"

interface NotificationPreferences {
  userId: string
  phoneNumber: string
  enableSMS: boolean
  alertTypes: {
    unauthorized_movement: boolean
    unusual_location: boolean
    unusual_time: boolean
    unusual_behavior: boolean
  }
  alertSeverities: {
    low: boolean
    medium: boolean
    high: boolean
  }
}

interface NotificationLog {
  id: string
  userId: string
  type: "sms"
  alertId: string
  timestamp: number
  status: "sent" | "failed"
  phoneNumber: string
  message: string
}

export const notificationService = {
  async sendSecurityAlertSMS(alert: SecurityAlert) {
    try {
      const userPrefs = await this.getUserNotificationPreferences(alert.userId)
      
      if (!userPrefs || !userPrefs.enableSMS || !userPrefs.phoneNumber) {
        return
      }

      if (!userPrefs.alertTypes[alert.type] || !userPrefs.alertSeverities[alert.severity]) {
        return
      }

      const message = this.formatAlertMessage(alert)
      
      const response = await fetch("/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          to: userPrefs.phoneNumber,
          message
        })
      })

      if (!response.ok) {
        throw new Error("Failed to send SMS")
      }

      await this.logNotification({
        userId: alert.userId,
        type: "sms",
        alertId: alert.id,
        timestamp: Date.now(),
        status: "sent",
        phoneNumber: userPrefs.phoneNumber,
        message
      })

    } catch (error) {
      console.error("Error sending SMS notification:", error)
      await this.logNotification({
        userId: alert.userId,
        type: "sms",
        alertId: alert.id,
        timestamp: Date.now(),
        status: "failed",
        phoneNumber: "",
        message: ""
      })
      throw error
    }
  },

  formatAlertMessage(alert: SecurityAlert): string {
    const severityEmoji = {
      low: "⚠️",
      medium: "🚨",
      high: "🔥"
    }

    const typeMessage = {
      unauthorized_movement: "Unauthorized movement detected",
      unusual_location: "Unusual location detected",
      unusual_time: "Activity at unusual time",
      unusual_behavior: "Suspicious behavior detected"
    }

    return `${severityEmoji[alert.severity]} BIKE ALERT: ${typeMessage[alert.type]} at ${new Date(alert.timestamp).toLocaleTimeString()}. Location: https://maps.google.com/?q=${alert.location.latitude},${alert.location.longitude}`
  },

  async getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const q = query(
        collection(db, "notificationPreferences"),
        where("userId", "==", userId)
      )
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) {
        return null
      }

      return snapshot.docs[0].data() as NotificationPreferences
    } catch (error) {
      console.error("Error getting notification preferences:", error)
      return null
    }
  },

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const q = query(
        collection(db, "notificationPreferences"),
        where("userId", "==", userId)
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        await addDoc(collection(db, "notificationPreferences"), {
          userId,
          ...preferences,
          alertTypes: {
            unauthorized_movement: true,
            unusual_location: true,
            unusual_time: true,
            unusual_behavior: true,
            ...preferences.alertTypes
          },
          alertSeverities: {
            low: false,
            medium: true,
            high: true,
            ...preferences.alertSeverities
          }
        })
      } else {
        const docRef = doc(db, "notificationPreferences", snapshot.docs[0].id)
        await updateDoc(docRef, preferences)
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error)
      throw error
    }
  },

  async logNotification(notification: Omit<NotificationLog, "id">): Promise<string> {
    try {
      const docRef = await addDoc(collection(db, "notificationLogs"), notification)
      return docRef.id
    } catch (error) {
      console.error("Error logging notification:", error)
      throw error
    }
  },

  async verifyPhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      const response = await fetch("/api/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ phoneNumber })
      })

      if (!response.ok) {
        throw new Error("Phone verification failed")
      }

      const data = await response.json()
      return data.isValid
    } catch (error) {
      console.error("Error verifying phone number:", error)
      return false
    }
  }
}