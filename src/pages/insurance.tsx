import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { InsurancePlans } from "@/components/insurance/InsurancePlans"

export default function InsurancePage() {
  return (
    <>
      <Head>
        <title>Bike Insurance & Warranty</title>
        <meta name="description" content="Purchase insurance and extended warranty for your bicycle" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
       <main className="flex min-h-screen">
              {/* Sidebar - Dashboard */}
              <div className="w-64">
                <DashboardLayout />
              </div>
      
              {/* Main Content */}
              <div className="flex-1 p-4 md:p-8">
               <InsurancePlans/>
              </div>
        </main>
    </>
  )
}