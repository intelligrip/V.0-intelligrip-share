
import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { LeaderboardTabs } from "@/components/leaderboards/LeaderboardTabs"

export default function LeaderboardsPage() {
  return (
    <>
      <Head>
        <title>Leaderboards - Cycling Dashboard</title>
        <meta name="description" content="View cycling leaderboards and rankings" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

       <main className="flex min-h-screen">
              {/* Sidebar - Dashboard */}
              <div className="w-64">
                <DashboardLayout />
              </div>
      
              {/* Main Content */}
              <div className="flex-1 p-4 md:p-8">
               <LeaderboardTabs/>
              </div>
      </main>
    </>
  )
}
