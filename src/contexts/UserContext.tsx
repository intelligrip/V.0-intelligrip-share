
import { createContext, useContext, useState, useEffect } from "react"

interface UserProfile {
  id: string
  displayName: string
  profileAlias: string
  isAnonymous: boolean
  location: {
    city: string
    region: string
    country: string
  }
  bikePreferences: {
    brands: string[]
    models: string[]
    ridingStyle: string[]
  }
  preferences: {
    notifications: boolean
    privacy: string
    measurement: string
    leaderboardVisibility: string
  }
}

interface UserContextType {
  profile: UserProfile | null
  updateProfile: (data: Partial<UserProfile>) => Promise<void>
  updatePreferences: (preferences: UserProfile['preferences']) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null)

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (profile) {
      setProfile({ ...profile, ...data })
    }
  }

  const updatePreferences = async (preferences: UserProfile['preferences']) => {
    if (profile) {
      setProfile({ ...profile, preferences })
    }
  }

  return (
    <UserContext.Provider value={{ profile, updateProfile, updatePreferences }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
