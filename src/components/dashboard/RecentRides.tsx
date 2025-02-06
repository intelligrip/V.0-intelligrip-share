
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { RideValidator } from "@/components/blockchain/RideValidator"
import { MapPin, Clock } from "lucide-react"

interface Ride {
  id: string
  distance: string
  location: string
  timestamp: number
  miles: number
}

export function RecentRides() {
  const [rides] = useState<Ride[]>([
    {
      id: "ride1",
      distance: "15.2 km",
      location: "Central Park Loop",
      timestamp: Date.now() - 1000 * 60 * 60 * 2,
      miles: 9.4
    },
    {
      id: "ride2",
      distance: "8.7 km",
      location: "Riverside Trail",
      timestamp: Date.now() - 1000 * 60 * 60 * 24,
      miles: 5.4
    }
  ])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recent Rides</h2>
      <div className="grid gap-4">
        {rides.map((ride) => (
          <Card key={ride.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-1 h-4 w-4" />
                    {ride.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-1 h-4 w-4" />
                    {new Date(ride.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-lg font-medium">{ride.distance}</div>
                  <RideValidator miles={ride.miles} timestamp={ride.timestamp} rideId={ride.id} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
