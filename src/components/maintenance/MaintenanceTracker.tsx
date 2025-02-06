
import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { maintenanceService, type BikeComponent } from "@/services/maintenance"

interface MaintenanceTrackerProps {
  bikeId: string
  serialNumber: string
}

export function MaintenanceTracker({ bikeId, serialNumber }: MaintenanceTrackerProps) {
  const [components, setComponents] = useState<BikeComponent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadComponents = useCallback(async () => {
    try {
      const loadedComponents = await maintenanceService.getBikeComponents(bikeId)
      setComponents(loadedComponents)
    } catch (error) {
      console.error("Error loading components:", error)
    } finally {
      setIsLoading(false)
    }
  }, [bikeId])

  useEffect(() => {
    loadComponents()
  }, [loadComponents])

  const getMaintenanceStatus = (component: BikeComponent) => {
    const { lastMaintenance, recommendedInterval } = component
    if (!lastMaintenance) return "needs-service"
    
    const daysSinceService = Math.floor(
      (Date.now() - lastMaintenance.timestamp) / (1000 * 60 * 60 * 24)
    )
    
    if (daysSinceService >= recommendedInterval) return "needs-service"
    if (daysSinceService >= recommendedInterval * 0.8) return "service-soon"
    return "good"
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Maintenance Status</h3>
          <Badge variant="outline">SN: {serialNumber}</Badge>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Clock className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            {components.map((component) => {
              const status = getMaintenanceStatus(component)
              return (
                <div key={component.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {status === "needs-service" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : status === "service-soon" ? (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      <span className="font-medium">{component.name}</span>
                    </div>
                    <Badge
                      variant={
                        status === "needs-service"
                          ? "destructive"
                          : status === "service-soon"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {status === "needs-service"
                        ? "Needs Service"
                        : status === "service-soon"
                        ? "Service Soon"
                        : "Good"}
                    </Badge>
                  </div>
                  <Progress
                    value={
                      component.lastMaintenance
                        ? Math.min(
                            100,
                            ((Date.now() - component.lastMaintenance.timestamp) /
                              (component.recommendedInterval * 24 * 60 * 60 * 1000)) *
                              100
                          )
                        : 100
                    }
                    className={
                      status === "needs-service"
                        ? "bg-destructive/20"
                        : status === "service-soon"
                        ? "bg-yellow-500/20"
                        : "bg-green-500/20"
                    }
                  />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
