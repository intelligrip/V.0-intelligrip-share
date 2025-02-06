import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ListingCard } from "./ListingCard"
import { CreateListingDialog } from "./CreateListingDialog"

export interface BicycleListing {
  id: string
  title: string
  price: number
  description: string
  condition: string
  location: string
  imageUrl: string
  sellerName: string
  createdAt: string
}

export function TyreMarketplace() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [listings] = useState<BicycleListing[]>([
    {
      id: "1",
      title: "Trek Madone SLR 9",
      price: 12500,
      description: "Professional racing bicycle, perfect condition",
      condition: "Like New",
      location: "New York, NY",
      imageUrl: "https://images.unsplash.com/photo-1532298229144-0ec0c57515c7",
      sellerName: "John Doe",
      createdAt: "2025-01-04"
    },
    {
      id: "2",
      title: "Specialized Roubaix",
      price: 3200,
      description: "Endurance road bike, great for long rides",
      condition: "Good",
      location: "Brooklyn, NY",
      imageUrl: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
      sellerName: "Jane Smith",
      createdAt: "2025-01-03"
    }
  ])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tyre Marketplace</CardTitle>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          List a Bicycle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </CardContent>
      <CreateListingDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </Card>
  )
}