
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock } from "lucide-react"

interface MechanicTrackerProps {
  mechanicId: string
  serviceId: string
  estimatedArrival: Date
}

export function MechanicTracker({ mechanicId, serviceId, estimatedArrival }: MechanicTrackerProps) {
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null)
  const [eta, setEta] = useState<string>("")
  const [status, setStatus] = useState<"en-route" | "arrived" | "completed">("en-route")

  const calculateETA = useCallback(() => {
    if (!currentLocation || !estimatedArrival) return ""
    const now = new Date()
    const minutesUntilArrival = Math.max(
      0,
      Math.round((estimatedArrival.getTime() - now.getTime()) / 1000 / 60)
    )
    return minutesUntilArrival > 0 ? `${minutesUntilArrival} minutes` : "Arriving now"
  }, [currentLocation, estimatedArrival])

  useEffect(() => {
    const interval = setInterval(() => {
      const etaString = calculateETA()
      setEta(etaString)
    }, 60000)

    return () => clearInterval(interval)
  }, [calculateETA])

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Mechanic Status</h3>
          <Badge variant={status === "completed" ? "default" : "secondary"}>
            {status}
          </Badge>
        </div>
        
        {currentLocation && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Currently {eta} away</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Estimated arrival: {estimatedArrival.toLocaleTimeString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
