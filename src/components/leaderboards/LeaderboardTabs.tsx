
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface LeaderboardEntry {
  id: string
  rank: number
  userName: string
  userAvatar: string
  score: number
  change: number
  achievements: string[]
}

const MOCK_DATA: LeaderboardEntry[] = [
  {
    id: "1",
    rank: 1,
    userName: "John Doe",
    userAvatar: "/default-avatar.png",
    score: 2500,
    change: 2,
    achievements: ["Distance King", "Early Bird"]
  },
  {
    id: "2",
    rank: 2,
    userName: "Jane Smith",
    userAvatar: "/default-avatar.png",
    score: 2350,
    change: -1,
    achievements: ["Hill Climber", "Night Rider"]
  }
]

export function LeaderboardTabs() {
  const [timeframe, setTimeframe] = useState("weekly")
  const [scope, setScope] = useState("global")

  const renderLeaderboard = (entries: LeaderboardEntry[]) => (
    <div className="space-y-4">
      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold w-8">{entry.rank}</span>
              <Avatar className="h-12 w-12">
                <Image
                  src={entry.userAvatar}
                  alt={entry.userName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              </Avatar>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{entry.userName}</h3>
                <div className="flex gap-1">
                  {entry.achievements.map((achievement) => (
                    <Badge key={achievement} variant="secondary">
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Score: {entry.score.toLocaleString()}
              </p>
            </div>
            <div className={`text-sm ${entry.change > 0 ? "text-green-500" : "text-red-500"}`}>
              {entry.change > 0 ? "↑" : "↓"} {Math.abs(entry.change)} positions
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <Tabs defaultValue="global" className="space-y-4">
      <div className="flex justify-between">
        <TabsList>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="local">Local</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="allTime">All Time</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="global">
        {renderLeaderboard(MOCK_DATA)}
      </TabsContent>
      <TabsContent value="local">
        {renderLeaderboard(MOCK_DATA)}
      </TabsContent>
      <TabsContent value="friends">
        {renderLeaderboard(MOCK_DATA)}
      </TabsContent>
    </Tabs>
  )
}
