import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { BicycleMarketplace } from "@/components/marketplace/BicycleMarketplace"

export default function MarketplacePage() {
  return (
    <>
      <Head>
        <title>Bicycle Marketplace</title>
        <meta name="description" content="Buy and sell bicycles in our marketplace" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
       <main className="flex min-h-screen">
                   {/* Sidebar - Dashboard */}
                   <div className="w-64">
                     <DashboardLayout />
                   </div>
           
                   {/* Main Content */}
                   <div className="flex-1 p-4 md:p-8">
                    <BicycleMarketplace/>
                    <BicycleMarketplace/>
                    <BicycleMarketplace/>
                   </div>
        </main>
      
    </>
  )
}