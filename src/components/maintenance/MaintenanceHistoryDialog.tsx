import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { maintenanceService, type BikeComponent, type MaintenanceRecord } from "@/services/maintenance"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MaintenanceHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  component: BikeComponent
}

export function MaintenanceHistoryDialog({
  open,
  onOpenChange,
  component
}: MaintenanceHistoryDialogProps) {
  const [history, setHistory] = useState<MaintenanceRecord[]>([])
  const [isAddingRecord, setIsAddingRecord] = useState(false)
  const [newRecord, setNewRecord] = useState<Partial<MaintenanceRecord>>({
    date: new Date().toISOString().split("T")[0],
    type: "routine",
    mileageAtService: component.currentMileage,
    description: "",
    cost: 0
  })

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const userId = "current-user-id" // Replace with actual user ID from auth
        const records = await maintenanceService.getMaintenanceHistory(userId, component.id)
        setHistory(records)
      } catch (error) {
        console.error("Error loading maintenance history:", error)
      }
    }
    if (open) {
      loadHistory()
    }
  }, [open, component.id])

  const handleAddRecord = async () => {
    try {
      const userId = "current-user-id" // Replace with actual user ID from auth
      const recordId = await maintenanceService.addMaintenanceRecord(userId, {
        ...newRecord as Omit<MaintenanceRecord, "id">,
        componentId: component.id
      })
      setHistory([{ id: recordId, ...newRecord, componentId: component.id } as MaintenanceRecord, ...history])
      setIsAddingRecord(false)
      setNewRecord({
        date: new Date().toISOString().split("T")[0],
        type: "routine",
        mileageAtService: component.currentMileage,
        description: "",
        cost: 0
      })
    } catch (error) {
      console.error("Error adding maintenance record:", error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Maintenance History - {component.name}</DialogTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingRecord(true)}
            className="ml-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Record
          </Button>
        </DialogHeader>

        {isAddingRecord ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newRecord.date}
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={newRecord.type}
                  onValueChange={(value) => setNewRecord({ ...newRecord, type: value as MaintenanceRecord["type"] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="routine">Routine</SelectItem>
                    <SelectItem value="repair">Repair</SelectItem>
                    <SelectItem value="replacement">Replacement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newRecord.description}
                onChange={(e) => setNewRecord({ ...newRecord, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage at Service</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={newRecord.mileageAtService}
                  onChange={(e) => setNewRecord({ ...newRecord, mileageAtService: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Cost ($)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={newRecord.cost}
                  onChange={(e) => setNewRecord({ ...newRecord, cost: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingRecord(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRecord}>Save Record</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((record) => (
              <div
                key={record.id}
                className="flex items-start justify-between border-b pb-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-muted-foreground capitalize">
                      {record.type}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{record.description}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{record.mileageAtService} km</span>
                    <span>${record.cost}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}