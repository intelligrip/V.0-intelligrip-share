
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Home,
  Map,
  ShoppingBag,
  Users,
  Trophy,
  Target,
  Wrench,
  Shield,
  Settings
} from "lucide-react"

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
}

const mainNavItems: NavItem[] = [
  { icon: <Home className="h-5 w-5" />, label: "Dashboard", href: "/" },
  { icon: <Map className="h-5 w-5" />, label: "Map", href: "/map" },
  { icon: <ShoppingBag className="h-5 w-5" />, label: "Marketplace", href: "/marketplace" },
  { icon: <Users className="h-5 w-5" />, label: "Communities", href: "/communities" },
]

const competitiveNavItems: NavItem[] = [
  { icon: <Trophy className="h-5 w-5" />, label: "Leaderboards", href: "/leaderboards" },
  { icon: <Target className="h-5 w-5" />, label: "Goals", href: "/goals" },
]

const servicesNavItems: NavItem[] = [
  { icon: <Wrench className="h-5 w-5" />, label: "Maintenance", href: "/maintenance" },
  { icon: <Shield className="h-5 w-5" />, label: "Insurance", href: "/insurance" },
]

export function DashboardLayout() {
  const [userProfile] = useState({
    name: "John Doe",
    avatar: "/default-avatar.png",
    level: 42,
    xp: 8750,
    nextLevelXp: 10000
  })

  const renderNavSection = (items: NavItem[]) => (
    <div className="space-y-1">
      {items.map((item) => (
        <Link key={item.href} href={item.href}>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
          >
            {item.icon}
            {item.label}
          </Button>
        </Link>
      ))}
    </div>
  )

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card">
        <div className="p-6 space-y-6">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full overflow-hidden">
              <Image
                src={userProfile.avatar}
                alt={userProfile.name}
                width={48}
                height={48}
                className="rounded-full"
                unoptimized
              />
            </div>
            <div>
              <h2 className="font-semibold">{userProfile.name}</h2>
              <p className="text-sm text-muted-foreground">Level {userProfile.level}</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>XP Progress</span>
                  <span>{userProfile.xp} / {userProfile.nextLevelXp}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{
                      width: `${(userProfile.xp / userProfile.nextLevelXp) * 100}%`
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <nav className="space-y-6">
            {renderNavSection(mainNavItems)}
            
            <div>
              <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
                Competitive
              </h3>
              {renderNavSection(competitiveNavItems)}
            </div>

            <div>
              <h3 className="mb-2 px-4 text-sm font-semibold text-muted-foreground">
                Services
              </h3>
              {renderNavSection(servicesNavItems)}
            </div>

            <Link href="/settings">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="h-5 w-5" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-6">
        </div>
      </main>
    </div>
  )
}
