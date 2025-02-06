
import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { RecentRides } from "@/components/dashboard/RecentRides"
import { BikeNFT } from "@/components/blockchain/BikeNFT"

export default function Home() {
  const bikeSerialNumber = "BIKE123456789"

  return (
    <>
      <Head>
        <title>Cycling Dashboard</title>
        <meta name="description" content="Track your cycling progress and achievements" />
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <main className="flex min-h-screen">
        {/* Sidebar - Dashboard */}
        <div className="w-64">
          <DashboardLayout />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8 space-y-8">
        <BikeNFT serialNumber={bikeSerialNumber} />
        <RecentRides />
        </div>
      </main>
    </>
  )
}
