
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/contexts/UserContext"
import { privacyService, type PrivacySettings, DATA_CATEGORIES } from "@/services/privacy"

export function UserSettings() {
  const { profile, updateProfile, updatePreferences } = useUser()
 
  const [isSaving, setIsSaving] = useState(false)
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    userId: profile?.id || "default",
    dataSharing: {},
    dataCategories: DATA_CATEGORIES.map(cat => cat.id),
    estimatedEarnings: 0,
    lastUpdated: Date.now(),
    paymentPreferences: {
      preferredPayment: "paypal",
      paypalEmail: "",
      cryptoWallet: ""
    }
  })

  const [formData, setFormData] = useState({
    displayName: profile?.displayName || "",
    profileAlias: profile?.profileAlias || "",
    isAnonymous: profile?.isAnonymous || false,
    location: profile?.location || { city: "", region: "", country: "" },
    bikePreferences: profile?.bikePreferences || {
      brands: [],
      models: [],
      ridingStyle: []
    },
    preferences: profile?.preferences || {
      notifications: true,
      privacy: "public",
      measurement: "metric",
      leaderboardVisibility: "public"
    }
  })

 
  useEffect(() => {
    const loadPrivacySettings = async () => {
      if (profile?.id) {
        const settings = await privacyService.getPrivacySettings(profile.id)
        if (settings) {
          setPrivacySettings(settings)
        } else {
          const newSettings = await privacyService.initializePrivacySettings(profile.id)
          setPrivacySettings(newSettings)
        }
      }
    }
    loadPrivacySettings()
  }, [profile?.id])

  if (!profile) {
    return <p>Loading user settings...</p>
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateProfile(formData)
      await updatePreferences(formData.preferences)
      if (profile?.id) {
        await privacyService.updatePrivacySettings(profile.id, privacySettings)
      }
    } catch (error) {
      console.error("Error updating profile:", error)
    }
    setIsSaving(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profileAlias">Profile Alias (Used for Leaderboards)</Label>
              <Input
                id="profileAlias"
                value={formData.profileAlias}
                onChange={(e) => setFormData({ ...formData, profileAlias: e.target.value })}
                placeholder="Enter an alias for leaderboards"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Leaderboard Anonymity</Label>
                <p className="text-sm text-muted-foreground">Hide your real name on leaderboards</p>
              </div>
              <Switch
                checked={formData.isAnonymous}
                onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label>Leaderboard Visibility</Label>
              <Select
                value={formData.preferences.leaderboardVisibility}
                onValueChange={(value) => setFormData({
                  ...formData,
                  preferences: { ...formData.preferences, leaderboardVisibility: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Everyone can see</SelectItem>
                  <SelectItem value="friends">Friends Only</SelectItem>
                  <SelectItem value="private">Private - Only me</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.location.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, city: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  value={formData.location.region}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, region: e.target.value }
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.location.country}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, country: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
