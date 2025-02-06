
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar } from "lucide-react"
import Image from "next/image"
import type { BicycleListing } from "./BicycleMarketplace"

interface ListingCardProps {
  listing: BicycleListing
}

export function ListingCard({ listing }: ListingCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video w-full overflow-hidden relative">
        <div className="relative w-full h-full">
          <Image
            src={listing.imageUrl}
            alt={listing.title}
            width={1280}
            height={720}
            className="object-cover transition-transform hover:scale-105"
            unoptimized
          />
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{listing.title}</CardTitle>
          <Badge variant="secondary">${listing.price.toLocaleString()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{listing.description}</p>
        <div className="mt-4 flex flex-col space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            {listing.location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Listed on {listing.createdAt}
          </div>
          <Badge className="w-fit">{listing.condition}</Badge>
        </div>
        <div className="mt-4">
          <Button className="w-full">Contact Seller</Button>
        </div>
      </CardContent>
    </Card>
  )
}
