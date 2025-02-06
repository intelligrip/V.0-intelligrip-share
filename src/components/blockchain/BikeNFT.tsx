
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface BikeNFTProps {
  serialNumber: string
}

export function BikeNFT({ serialNumber }: BikeNFTProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [nftData, setNftData] = useState(null)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bike NFT</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium">Serial Number</p>
            <p className="text-lg">{serialNumber}</p>
          </div>
          <Button
            onClick={() => {}}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Connect Wallet"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
