
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { maintenanceService, type MobileServiceRequest } from "@/services/maintenance"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface MobileServiceRequestProps {
  currentStep: "location" | "service" | "confirmation"
  onStepChange: (step: "location" | "service" | "confirmation") => void
}

const locationSchema = z.object({
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "Please use 2-letter state code"),
  zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code")
})

const serviceSchema = z.object({
  type: z.enum(["tune-up", "repair", "emergency"], {
    required_error: "Please select a service type"
  }),
  description: z.string().min(10, "Please provide more details"),
  urgency: z.enum(["low", "normal", "high"])
})

const contactSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Invalid phone number"),
  email: z.string().email("Invalid email address")
})

type ServiceType = "tune-up" | "repair" | "emergency"
type UrgencyLevel = "low" | "normal" | "high"

const calculatePrice = (serviceType: ServiceType, urgency: UrgencyLevel): number => {
  const basePrice = {
    "tune-up": 75,
    "repair": 100,
    "emergency": 150
  }[serviceType] || 0

  const urgencyMultiplier = {
    "low": 1,
    "normal": 1.2,
    "high": 1.5
  }[urgency] || 1

  return basePrice * urgencyMultiplier
}

export function MobileServiceRequest({
  currentStep,
  onStepChange
}: MobileServiceRequestProps) {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    location: {
      address: "",
      city: "",
      state: "",
      zip: ""
    },
    service: {
      type: "" as ServiceType,
      description: "",
      urgency: "normal" as UrgencyLevel
    },
    contact: {
      name: "",
      phone: "",
      email: ""
    }
  })

  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null)

  const validateLocation = () => {
    try {
      locationSchema.parse(formData.location)
      onStepChange("service")
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: "Validation Error",
            description: err.message,
            variant: "destructive"
          })
        })
      }
    }
  }

  const validateService = () => {
    try {
      serviceSchema.parse(formData.service)
      if (formData.service.type) {
        const price = calculatePrice(formData.service.type, formData.service.urgency)
        setEstimatedPrice(price)
      }
      onStepChange("confirmation")
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: "Validation Error",
            description: err.message,
            variant: "destructive"
          })
        })
      }
    }
  }

  const handleConfirmation = async () => {
    try {
      contactSchema.parse(formData.contact)
      
      const serviceRequest: Omit<MobileServiceRequest, "id"> = {
        location: formData.location,
        service: {
          type: formData.service.type,
          description: formData.service.description,
          urgency: formData.service.urgency
        },
        contact: formData.contact,
        status: "pending",
        createdAt: new Date().toISOString()
      }
      
      await maintenanceService.createMobileRequest(serviceRequest)
      
      toast({
        title: "Service Request Submitted",
        description: "A mechanic will be assigned to your request shortly.",
        duration: 5000
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast({
            title: "Validation Error",
            description: err.message,
            variant: "destructive"
          })
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to submit service request. Please try again.",
          variant: "destructive"
        })
      }
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        {currentStep === "location" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, address: e.target.value }
                  })}
                  placeholder="Enter your street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="state">State (2 letters)</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value.toUpperCase().slice(0, 2) }
                    })}
                    placeholder="CA"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP Code</Label>
                <Input
                  id="zip"
                  value={formData.location.zip}
                  onChange={(e) => setFormData({
                    ...formData,
                    location: { ...formData.location, zip: e.target.value.slice(0, 5) }
                  })}
                  placeholder="12345"
                />
              </div>
            </div>
            <Button onClick={validateLocation} className="w-full">
              Continue to Service Details
            </Button>
          </div>
        )}

        {currentStep === "service" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Service Type</Label>
              <Select
                value={formData.service.type}
                onValueChange={(value: ServiceType) => {
                  setFormData({
                    ...formData,
                    service: { ...formData.service, type: value }
                  })
                  const price = calculatePrice(value, formData.service.urgency)
                  setEstimatedPrice(price)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select service type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tune-up">Basic Tune-Up ($75)</SelectItem>
                  <SelectItem value="repair">Repair ($100)</SelectItem>
                  <SelectItem value="emergency">Emergency Repair ($150)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.service.description}
                onChange={(e) => setFormData({
                  ...formData,
                  service: { ...formData.service, description: e.target.value }
                })}
                placeholder="Describe the service needed (minimum 10 characters)..."
              />
            </div>

            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select
                value={formData.service.urgency}
                onValueChange={(value: UrgencyLevel) => {
                  setFormData({
                    ...formData,
                    service: { ...formData.service, urgency: value }
                  })
                  if (formData.service.type) {
                    const price = calculatePrice(formData.service.type, value)
                    setEstimatedPrice(price)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select urgency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Not Urgent (Standard Rate)</SelectItem>
                  <SelectItem value="normal">Normal (+20% Rate)</SelectItem>
                  <SelectItem value="high">Urgent (+50% Rate)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {estimatedPrice && (
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">Estimated Price: ${estimatedPrice.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Final price may vary based on actual service needs</p>
              </div>
            )}

            <div className="flex justify-between gap-4">
              <Button variant="outline" onClick={() => onStepChange("location")}>
                Back
              </Button>
              <Button onClick={validateService}>
                Continue to Contact Details
              </Button>
            </div>
          </div>
        )}

        {currentStep === "confirmation" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.contact.name}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, name: e.target.value }
                  })}
                  placeholder="Full Name"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData({
                    ...formData,
                    contact: { ...formData.contact, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }
                  })}
                  placeholder="1234567890"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({
                  ...formData,
                  contact: { ...formData.contact, email: e.target.value }
                })}
                placeholder="email@example.com"
              />
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="font-medium">Service Summary</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p><span className="font-medium">Location:</span> {formData.location.address}</p>
                <p><span className="font-medium">Service Type:</span> {formData.service.type}</p>
                <p><span className="font-medium">Urgency:</span> {formData.service.urgency}</p>
                {estimatedPrice && (
                  <p><span className="font-medium">Estimated Price:</span> ${estimatedPrice.toFixed(2)}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <Button variant="outline" onClick={() => onStepChange("service")}>
                Back
              </Button>
              <Button onClick={handleConfirmation}>
                Request Mobile Service
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
