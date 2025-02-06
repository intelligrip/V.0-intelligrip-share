import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { maintenanceService, type MechanicService } from "@/services/maintenance"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Minus } from "lucide-react"

interface MechanicServiceFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onServiceAdded?: (service: MechanicService) => void
  mechanicId: string
  shopName: string
}

export function MechanicServiceForm({
  open,
  onOpenChange,
  onServiceAdded,
  mechanicId,
  shopName
}: MechanicServiceFormProps) {
  const [formData, setFormData] = useState({
    customerEmail: "",
    serviceDate: new Date().toISOString().split("T")[0],
    services: [
      {
        type: "routine" as const,
        description: "",
        cost: 0,
        componentId: ""
      }
    ],
    notes: "",
    nextServiceRecommendation: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const serviceData: Omit<MechanicService, "id"> = {
        mechanicId,
        shopName,
        customerEmail: formData.customerEmail,
        serviceDate: formData.serviceDate,
        services: formData.services,
        status: "scheduled",
        notes: formData.notes,
        nextServiceRecommendation: formData.nextServiceRecommendation
      }

      const serviceId = await maintenanceService.addMechanicService(serviceData)
      if (onServiceAdded) {
        onServiceAdded({ id: serviceId, ...serviceData })
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding mechanic service:", error)
    }
  }

  const addService = () => {
    setFormData({
      ...formData,
      services: [
        ...formData.services,
        { type: "routine", description: "", cost: 0, componentId: "" }
      ]
    })
  }

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    })
  }

  const updateService = (index: number, field: string, value: string | number) => {
    const updatedServices = [...formData.services]
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    }
    setFormData({ ...formData, services: updatedServices })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Schedule Maintenance Service</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceDate">Service Date</Label>
              <Input
                id="serviceDate"
                type="date"
                value={formData.serviceDate}
                onChange={(e) => setFormData({ ...formData, serviceDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Services</Label>
              <Button type="button" variant="outline" size="sm" onClick={addService}>
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
            {formData.services.map((service, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex justify-end">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeService(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Service Type</Label>
                    <Select
                      value={service.type}
                      onValueChange={(value) => updateService(index, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="routine">Routine Maintenance</SelectItem>
                        <SelectItem value="repair">Repair</SelectItem>
                        <SelectItem value="replacement">Replacement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Cost ($)</Label>
                    <Input
                      type="number"
                      value={service.cost}
                      onChange={(e) => updateService(index, "cost", Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={service.description}
                    onChange={(e) => updateService(index, "description", e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextService">Next Service Recommendation</Label>
            <Textarea
              id="nextService"
              value={formData.nextServiceRecommendation}
              onChange={(e) => setFormData({ ...formData, nextServiceRecommendation: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Schedule Service</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}