
import Head from "next/head"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
import { MechanicServiceForm } from "@/components/maintenance/MechanicServiceForm"
import { maintenanceService, type MechanicService } from "@/services/maintenance"

export default function MechanicPortalPage() {
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false)
  const [services, setServices] = useState<MechanicService[]>([])

  const mechanicId = "sample-mechanic-id"
  const shopName = "Elite Bike Service"

  const handleServiceAdded = (service: MechanicService) => {
    setServices([service, ...services])
  }

  return (
    <>
      <Head>
        <title>Mechanic Portal - Bike Maintenance</title>
        <meta name="description" content="Manage bike maintenance services and customer records" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Mechanic Portal</h1>
              <p className="text-muted-foreground">{shopName}</p>
            </div>
            <Button onClick={() => setIsServiceFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Service Record
            </Button>
          </div>

          <MechanicServiceForm
            open={isServiceFormOpen}
            onOpenChange={setIsServiceFormOpen}
            onServiceAdded={handleServiceAdded}
            mechanicId={mechanicId}
            shopName={shopName}
          />

          <div className="grid gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Service for {service.customerEmail}</CardTitle>
                    <Badge variant={
                      service.status === "completed" ? "default" :
                      service.status === "in-progress" ? "secondary" :
                      "outline"
                    }>
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium">Service Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(service.serviceDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Services Performed</p>
                      <div className="space-y-2 mt-2">
                        {service.services.map((item, index) => (
                          <div key={index} className="flex items-start justify-between border-b pb-2">
                            <div>
                              <p className="font-medium capitalize">{item.type}</p>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <p className="font-medium">${item.cost}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {service.notes && (
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{service.notes}</p>
                      </div>
                    )}
                    {service.nextServiceRecommendation && (
                      <div>
                        <p className="text-sm font-medium">Next Service Recommendation</p>
                        <p className="text-sm text-muted-foreground">{service.nextServiceRecommendation}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}
