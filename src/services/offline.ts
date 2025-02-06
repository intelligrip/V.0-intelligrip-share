
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, orderBy } from "firebase/firestore"

interface OfflineAction {
  id?: string
  type: "ride" | "maintenance" | "location"
  action: "create" | "update" | "delete"
  data: any
  timestamp: number
  synced: boolean
}

interface SyncResult {
  success: boolean
  error?: string
  syncedActions: number
}

export const offlineService = {
  async queueAction(action: Omit<OfflineAction, "id" | "synced">): Promise<void> {
    try {
      const offlineAction: Omit<OfflineAction, "id"> = {
        ...action,
        synced: false,
        timestamp: Date.now()
      }

      if ("indexedDB" in window) {
        const request = indexedDB.open("intelligripDB", 1)
        
        request.onerror = () => {
          console.error("Error opening IndexedDB")
        }

        request.onsuccess = (event: any) => {
          const db = event.target.result
          const transaction = db.transaction(["offlineActions"], "readwrite")
          const store = transaction.objectStore("offlineActions")
          store.add(offlineAction)
        }

        request.onupgradeneeded = (event: any) => {
          const db = event.target.result
          if (!db.objectStoreNames.contains("offlineActions")) {
            db.createObjectStore("offlineActions", { keyPath: "timestamp" })
          }
        }
      } else {
        localStorage.setItem(`offlineAction_${Date.now()}`, JSON.stringify(offlineAction))
      }
    } catch (error) {
      console.error("Error queuing offline action:", error)
    }
  },

  async syncQueuedActions(): Promise<SyncResult> {
    try {
      let syncedCount = 0
      const actions = await this.getQueuedActions()

      for (const action of actions) {
        try {
          await this.syncAction(action)
          syncedCount++
        } catch (error) {
          console.error(`Error syncing action ${action.id}:`, error)
        }
      }

      return {
        success: true,
        syncedActions: syncedCount
      }
    } catch (error) {
      console.error("Error syncing queued actions:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        syncedActions: 0
      }
    }
  },

  async getQueuedActions(): Promise<OfflineAction[]> {
    const actions: OfflineAction[] = []

    if ("indexedDB" in window) {
      return new Promise((resolve) => {
        const request = indexedDB.open("intelligripDB", 1)

        request.onsuccess = (event: any) => {
          const db = event.target.result
          const transaction = db.transaction(["offlineActions"], "readonly")
          const store = transaction.objectStore("offlineActions")
          const getAllRequest = store.getAll()

          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result)
          }
        }
      })
    } else {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith("offlineAction_")) {
          const action = JSON.parse(localStorage.getItem(key) || "{}")
          actions.push(action)
        }
      }
    }

    return actions
  },

  async syncAction(action: OfflineAction): Promise<void> {
    try {
      switch (action.type) {
        case "ride":
          await this.syncRideData(action)
          break
        case "maintenance":
          await this.syncMaintenanceData(action)
          break
        case "location":
          await this.syncLocationData(action)
          break
        default:
          console.warn("Unknown action type:", action.type)
      }

      await this.markActionSynced(action)
    } catch (error) {
      console.error("Error syncing action:", error)
      throw error
    }
  },

  async syncRideData(action: OfflineAction) {
    const { data } = action
    switch (action.action) {
      case "create":
        await addDoc(collection(db, "rides"), {
          ...data,
          syncedAt: Date.now()
        })
        break
      case "update":
        // Handle update
        break
      case "delete":
        // Handle delete
        break
    }
  },

  async syncMaintenanceData(action: OfflineAction) {
    const { data } = action
    switch (action.action) {
      case "create":
        await addDoc(collection(db, "maintenance"), {
          ...data,
          syncedAt: Date.now()
        })
        break
      case "update":
        // Handle update
        break
      case "delete":
        // Handle delete
        break
    }
  },

  async syncLocationData(action: OfflineAction) {
    const { data } = action
    switch (action.action) {
      case "create":
        await addDoc(collection(db, "locations"), {
          ...data,
          syncedAt: Date.now()
        })
        break
      case "update":
        // Handle update
        break
      case "delete":
        // Handle delete
        break
    }
  },

  async markActionSynced(action: OfflineAction): Promise<void> {
    if ("indexedDB" in window) {
      const request = indexedDB.open("intelligripDB", 1)

      request.onsuccess = (event: any) => {
        const db = event.target.result
        const transaction = db.transaction(["offlineActions"], "readwrite")
        const store = transaction.objectStore("offlineActions")
        store.delete(action.timestamp)
      }
    } else {
      localStorage.removeItem(`offlineAction_${action.timestamp}`)
    }
  }
}
