import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { RideShareForm } from "./RideShareForm"
import { RideSharePost } from "./RideSharePost"
import { MapPin, Calendar, Users, Bike, Trophy, Search } from "lucide-react"

interface MeetUp {
  id: string
  title: string
  date: string
  time: string
  location: string
  description: string
  type: "casual" | "training" | "competition"
  bikeTypes: string[]
  skillLevel: "beginner" | "intermediate" | "advanced"
  maxParticipants: number
  currentParticipants: number
  organizer: {
    id: string
    name: string
    avatar: string
  }
}

export function CommunityList() {
  const [activeTab, setActiveTab] = useState("meetups")
  const [meetups] = useState<MeetUp[]>([
    {
      id: "1",
      title: "Weekend Trail Ride",
      date: "2025-01-10",
      time: "09:00",
      location: "Central Park Entrance",
      description: "Join us for a casual morning ride through scenic trails. All skill levels welcome!",
      type: "casual",
      bikeTypes: ["Mountain", "Hybrid"],
      skillLevel: "intermediate",
      maxParticipants: 15,
      currentParticipants: 8,
      organizer: {
        id: "org1",
        name: "Sarah Wilson",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"
      }
    }
  ])

  const handleCreateMeetup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    console.log("Creating meetup:", Object.fromEntries(formData))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cycling Community</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Create Meet-up</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create a New Meet-up</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateMeetup} className="grid gap-4 py-4">
              <Input placeholder="Meet-up Title" name="title" required />
              <div className="grid grid-cols-2 gap-4">
                <Input type="date" name="date" required />
                <Input type="time" name="time" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Select name="type">
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="casual">Casual Ride</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                  </SelectContent>
                </Select>
                <Select name="skillLevel">
                  <SelectTrigger>
                    <SelectValue placeholder="Skill Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Input placeholder="Location" name="location" required />
              <Input 
                type="number" 
                placeholder="Maximum Participants" 
                name="maxParticipants"
                min="1"
                required 
              />
              <Select name="bikeType">
                <SelectTrigger>
                  <SelectValue placeholder="Bike Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="road">Road Bike</SelectItem>
                  <SelectItem value="mountain">Mountain Bike</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
              <Input 
                placeholder="Description" 
                name="description"
                required 
              />
              <Button type="submit">Create Meet-up</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4 bg-muted/50 rounded-lg p-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search meetups, rides, or challenges..."
          className="border-0 bg-transparent focus-visible:ring-0"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meetups">Meet-ups</TabsTrigger>
          <TabsTrigger value="rides">Shared Rides</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        <TabsContent value="meetups" className="space-y-4">
          {meetups.map((meetup) => (
            <Card key={meetup.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{meetup.title}</span>
                  <Badge variant={meetup.type === "casual" ? "secondary" : "default"}>
                    {meetup.type}
                  </Badge>
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(`${meetup.date}T${meetup.time}`).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {meetup.location}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">{meetup.description}</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">
                      {meetup.currentParticipants}/{meetup.maxParticipants} riders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bike className="h-4 w-4" />
                    <span className="text-sm">{meetup.bikeTypes.join(", ")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    <span className="text-sm capitalize">{meetup.skillLevel}</span>
                  </div>
                  <Button>Join Meet-up</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rides" className="space-y-4">
          <RideShareForm onSubmit={async (formData) => {
            console.log("Ride share form data:", Object.fromEntries(formData))
          }} />
          <RideSharePost
            post={{
              id: "1",
              userId: "user1",
              userName: "John Doe",
              userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
              rideStats: {
                distance: 25.5,
                duration: "1h 30m",
                speed: 17
              },
              location: "Mountain Trail Loop",
              timestamp: Date.now(),
              media: [{
                type: "image",
                url: "https://images.unsplash.com/photo-1622977266039-dbb162254c12"
              }],
              likes: 12,
              comments: 3,
              description: "Amazing morning ride through the trails!"
            }}
            currentUser={{
              id: "current",
              name: "Current User",
              avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde"
            }}
          />
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Distance Challenge</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Join our monthly distance challenge and compete with cyclists worldwide!</p>
              <div className="mt-4">
                <Button>Join Challenge</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}