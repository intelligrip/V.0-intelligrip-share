
import { FC, useState } from "react"
import { validateRideMiles } from "@/lib/solana"
import { tokenService } from "@/services/token"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Coins } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RideValidatorProps {
  miles: number
  timestamp: number
  rideId: string
}

export function RideValidator({ miles, timestamp, rideId }: RideValidatorProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [earnedTokens, setEarnedTokens] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleValidation = async () => {
    setIsValidating(true)
    setError(null)
    try {
      const result = await validateRideMiles(miles, timestamp, rideId)
      
      if (result) {
        const tokens = await tokenService.earnTokensForRide(
          rideId,
          miles,
          new Date(timestamp).toISOString()
        )
        setEarnedTokens(tokens.amount)
        setIsValidated(true)
      }
    } catch (error) {
      console.error("Validation error:", error)
      setError("Failed to validate ride")
    }
    setIsValidating(false)
  }

  return (
    <div className="flex items-center gap-2">
      {isValidated ? (
        <div className="flex items-center gap-2">
          <Badge variant="default" className="bg-green-500">
            Verified on Blockchain
          </Badge>
          {earnedTokens && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    +{earnedTokens} tokens earned
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tokens earned for this verified ride</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating
              </>
            ) : (
              "Validate on Blockchain"
            )}
          </Button>
          {!isValidating && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Coins className="h-3 w-3" />
                    {tokenService.calculateTokensForMiles(miles)} potential tokens
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tokens earned after validating this ride</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {error && (
        <Badge variant="destructive">
          {error}
        </Badge>
      )}
    </div>
  )
}
