
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface Goal {
  id: string
  title: string
  target: number
  current: number
  unit: string
  deadline: Date
  type: "distance" | "rides" | "elevation" | "time"
}

export function GoalTracker() {
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: "1",
      title: "Monthly Distance",
      target: 500,
      current: 325,
      unit: "km",
      deadline: new Date(new Date().setDate(new Date().getDate() + 14)),
      type: "distance"
    },
    {
      id: "2",
      title: "Weekly Rides",
      target: 5,
      current: 3,
      unit: "rides",
      deadline: new Date(new Date().setDate(new Date().getDate() + 4)),
      type: "rides"
    }
  ])

  const calculateProgress = (current: number, target: number) => {
    return Math.min(100, (current / target) * 100)
  }

  const getRemainingDays = (deadline: Date) => {
    const diff = deadline.getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const getStatusBadge = (current: number, target: number, deadline: Date) => {
    const progress = calculateProgress(current, target)
    const daysLeft = getRemainingDays(deadline)
    
    if (progress >= 100) return { label: "Completed", variant: "default" as const }
    if (daysLeft <= 0) return { label: "Expired", variant: "destructive" as const }
    if (progress < (daysLeft / 30) * 100) return { label: "Behind", variant: "destructive" as const }
    if (progress >= (daysLeft / 30) * 100) return { label: "On Track", variant: "secondary" as const }
    return { label: "In Progress", variant: "secondary" as const }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Active Goals</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target)
          const status = getStatusBadge(goal.current, goal.target, goal.deadline)
          const daysLeft = getRemainingDays(goal.deadline)

          return (
            <Card key={goal.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">
                  {goal.title}
                </CardTitle>
                <Badge variant={status.variant}>{status.label}</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>
                        {goal.current} / {goal.target} {goal.unit}
                      </span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {daysLeft > 0 ? (
                      <span>{daysLeft} days remaining</span>
                    ) : (
                      <span>Goal expired</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
