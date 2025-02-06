import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { CommunityList } from "@/components/communities/CommunityList"

export default function CommunitiesPage() {
  return (
    <>
      <Head>
        <title>Cycling Communities</title>
        <meta name="description" content="Join cycling communities and share your rides" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="flex min-h-screen">
        {/* Sidebar - Dashboard */}
        <div className="w-64">
          <DashboardLayout />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 md:p-8">
         <CommunityList/>
        </div>
      </main>
    </>
  )
}