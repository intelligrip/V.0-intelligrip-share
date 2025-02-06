
import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { MaintenanceTracker } from "@/components/maintenance/MaintenanceTracker"

export default function MaintenancePage() {
  const mockBikeId = "default-bike-id"
  const mockSerialNumber = "BIKE123456789"

  return (
    <>
      <Head>
        <title>Maintenance - Cycling Dashboard</title>
        <meta name="description" content="Track and manage your bike maintenance" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

       <main className="flex min-h-screen">
              {/* Sidebar - Dashboard */}
              <div className="w-64">
                <DashboardLayout />
              </div>
      
              {/* Main Content */}
              <div className="flex-1 p-4 md:p-8">
              <MaintenanceTracker bikeId={mockBikeId} serialNumber={mockSerialNumber} />
              </div>
      </main>
    </>
  )
}
