
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { insuranceService, type InsurancePlan } from "@/services/insurance"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/components/ui/use-toast"

interface PurchaseDialogProps {
  plan: InsurancePlan | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PurchaseDialog({ plan, open, onOpenChange }: PurchaseDialogProps) {
  const { toast } = useToast()
  const [bikeSerialNumber, setBikeSerialNumber] = useState("")
  const [paymentSchedule, setPaymentSchedule] = useState<"monthly" | "annual" | "one-time">("one-time")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!plan) return null

  const calculatePayment = () => {
    switch (paymentSchedule) {
      case "monthly":
        return plan.monthlyPremium
      case "annual":
        return plan.monthlyPremium * 11 // One month free for annual
      default:
        return plan.monthlyPremium * 12
    }
  }

  const handlePurchase = async () => {
    if (!bikeSerialNumber) {
      toast({
        title: "Error",
        description: "Please enter your bike's serial number",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      await insuranceService.createPolicy(
        "current-user-id", // Replace with actual user ID from auth
        plan.id,
        bikeSerialNumber,
        plan
      )
      toast({
        title: "Success",
        description: "Your insurance policy has been purchased successfully",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase insurance policy. Please try again.",
        variant: "destructive"
      })
    }
    setIsProcessing(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Purchase {plan.name}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="serialNumber">Bike Serial Number</Label>
            <Input
              id="serialNumber"
              value={bikeSerialNumber}
              onChange={(e) => setBikeSerialNumber(e.target.value)}
              placeholder="Enter your bike's serial number"
            />
          </div>
          <div className="space-y-2">
            <Label>Payment Schedule</Label>
            <RadioGroup value={paymentSchedule} onValueChange={(value: "monthly" | "annual" | "one-time") => setPaymentSchedule(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="one-time" id="one-time" />
                <Label htmlFor="one-time">
                  One-time payment (${(plan.monthlyPremium * 12).toFixed(2)})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="annual" id="annual" />
                <Label htmlFor="annual">
                  Annual (${(plan.monthlyPremium * 11).toFixed(2)}/year)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="monthly" id="monthly" />
                <Label htmlFor="monthly">
                  Monthly (${plan.monthlyPremium.toFixed(2)}/month)
                </Label>
              </div>
            </RadioGroup>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Coverage includes:
              <ul className="list-disc list-inside mt-2">
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePurchase} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Purchase"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
