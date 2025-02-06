
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { insuranceService, type InsurancePlan } from "@/services/insurance"
import { PurchaseDialog } from "./PurchaseDialog"
import { Shield, Check } from "lucide-react"

export function InsurancePlans() {
  const [selectedPlan, setSelectedPlan] = useState<InsurancePlan | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [plans, setPlans] = useState<InsurancePlan[]>([])

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="relative">
          <CardHeader>
            <CardTitle>
              <div className="flex items-center justify-between">
                <span>{plan.name}</span>
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-2 text-3xl font-bold">
                ${plan.monthlyPremium}
                <span className="text-sm font-normal text-muted-foreground">/month</span>
              </p>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    setSelectedPlan(plan)
                    setIsDialogOpen(true)
                  }}
                >
                  Choose Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      <PurchaseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        plan={selectedPlan}
      />
    </div>
  )
}
