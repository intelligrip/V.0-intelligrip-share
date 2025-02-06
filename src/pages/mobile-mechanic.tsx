
import Head from "next/head"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Wrench, Clock } from "lucide-react"
import { MobileServiceRequest } from "@/components/maintenance/MobileServiceRequest"

export default function MobileMechanicPage() {
  const [currentStep, setCurrentStep] = useState<"location" | "service" | "confirmation">("location")

  return (
    <>
      <Head>
        <title>Mobile Mechanic - Bike Service</title>
        <meta name="description" content="Request mobile bike repair service" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Request Mobile Service</h1>
            <p className="text-muted-foreground">Get your bike serviced at your location</p>
          </div>

          <MobileServiceRequest
            currentStep={currentStep}
            onStepChange={setCurrentStep}
          />
        </div>
      </main>
    </>
  )
}
