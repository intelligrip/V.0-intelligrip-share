import Head from "next/head"
import { DashboardLayout } from "@/components/dashboard/DashboardLayout"
import { UserSettings } from "@/components/settings/UserSettings"

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>User Settings</title>
        <meta name="description" content="Manage your account settings and preferences" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="flex min-h-screen flex-col">
        <DashboardLayout />
        <div className="p-4 md:p-8">
          <UserSettings />
        </div>
      </main>

      <main className="flex min-h-screen">
                    {/* Sidebar - Dashboard */}
                    <div className="w-64">
                      <DashboardLayout />
                    </div>
            
                    {/* Main Content */}
                    <div className="flex-1 p-4 md:p-8">
                     <UserSettings/>
                    </div>
      </main>
    </>
  )
}