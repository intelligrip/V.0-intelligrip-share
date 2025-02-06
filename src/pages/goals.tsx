import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { GoalTracker } from "@/components/goals/GoalTracker"

export default function GoalsPage() {
  return (
    <>
      <Head>
        <title>Cycling Goals</title>
        <meta name="description" content="Track your cycling goals and milestones" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="flex min-h-screen">
        {/* Sidebar - Dashboard */}
        <div className="w-64">
          <DashboardLayout />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
          <GoalTracker/>
        </div>
      </main>
    </>
  )
}