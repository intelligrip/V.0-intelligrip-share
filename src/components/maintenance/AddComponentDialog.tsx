
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { maintenanceService, type BikeComponent } from "@/services/maintenance"

interface AddComponentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddComponent: (component: BikeComponent) => void
}

export function AddComponentDialog({ open, onOpenChange, onAddComponent }: AddComponentDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    installationDate: new Date().toISOString().split("T")[0],
    expectedLifespan: 0,
    currentMileage: 0,
    maintenanceInterval: 30,
    lastMaintenanceDate: new Date().toISOString().split("T")[0],
    lastMaintenance: {
      timestamp: Date.now()
    },
    recommendedInterval: 30,
    condition: "excellent" as const
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const userId = "current-user-id"
      const componentData: Omit<BikeComponent, "id"> = {
        ...formData,
        lastMaintenance: {
          timestamp: new Date(formData.lastMaintenanceDate).getTime()
        },
        recommendedInterval: formData.recommendedInterval
      }
      const componentId = await maintenanceService.addBikeComponent(userId, componentData)
      onAddComponent({ 
        id: componentId,
        ...componentData
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding component:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Component</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Component Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="installationDate">Installation Date</Label>
            <Input
              id="installationDate"
              type="date"
              value={formData.installationDate}
              onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expectedLifespan">Expected Lifespan (km)</Label>
            <Input
              id="expectedLifespan"
              type="number"
              value={formData.expectedLifespan}
              onChange={(e) => setFormData({ ...formData, expectedLifespan: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMileage">Current Mileage (km)</Label>
            <Input
              id="currentMileage"
              type="number"
              value={formData.currentMileage}
              onChange={(e) => setFormData({ ...formData, currentMileage: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maintenanceInterval">Maintenance Interval (days)</Label>
            <Input
              id="maintenanceInterval"
              type="number"
              value={formData.maintenanceInterval}
              onChange={(e) => setFormData({ ...formData, maintenanceInterval: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recommendedInterval">Recommended Service Interval (days)</Label>
            <Input
              id="recommendedInterval"
              type="number"
              value={formData.recommendedInterval}
              onChange={(e) => setFormData({ ...formData, recommendedInterval: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastMaintenanceDate">Last Maintenance Date</Label>
            <Input
              id="lastMaintenanceDate"
              type="date"
              value={formData.lastMaintenanceDate}
              onChange={(e) => setFormData({
                ...formData,
                lastMaintenanceDate: e.target.value,
                lastMaintenance: {
                  timestamp: new Date(e.target.value).getTime()
                }
              })}
              required
            />
          </div>
          <Button type="submit">Add Component</Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
