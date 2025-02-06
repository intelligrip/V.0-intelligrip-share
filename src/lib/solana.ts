
import { Connection } from "@solana/web3.js"

export const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com")

export async function validateRideMiles(
  miles: number,
  timestamp: number,
  rideId: string
): Promise<boolean> {
  try {
    if (miles <= 0) return false
    if (timestamp > Date.now()) return false
    if (!rideId) return false
    
    return true
  } catch (error) {
    console.error("Error validating ride miles:", error)
    return false
  }
}

export async function mintRideNFT(
  serialNumber: string,
  metadata: {
    miles: number
    timestamp: number
    location: string
  }
): Promise<string> {
  try {
    return "dummy_token_id"
  } catch (error) {
    console.error("Error minting ride NFT:", error)
    throw error
  }
}
