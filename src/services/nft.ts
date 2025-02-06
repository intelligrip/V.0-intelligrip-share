
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js"
import { db } from "@/lib/firebase"
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from "firebase/firestore"

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
}

export const nftService = {
  async mintBikeNFT(
    userId: string,
    bikeSerialNumber: string,
    metadata: NFTMetadata
  ): Promise<string> {
    try {
      const nftData = {
        userId,
        bikeSerialNumber,
        metadata,
        mintedAt: Date.now(),
        network: "solana",
        status: "minted"
      }

      const docRef = await addDoc(collection(db, "bikeNFTs"), nftData)
      return docRef.id
    } catch (error) {
      console.error("Error minting bike NFT:", error)
      throw error
    }
  },

  async getBikeNFT(bikeSerialNumber: string): Promise<any> {
    try {
      const q = query(
        collection(db, "bikeNFTs"),
        where("bikeSerialNumber", "==", bikeSerialNumber)
      )
      const snapshot = await getDocs(q)
      if (snapshot.empty) return null
      return {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data()
      }
    } catch (error) {
      console.error("Error getting bike NFT:", error)
      throw error
    }
  },

  async updateNFTMetadata(
    nftId: string,
    metadata: Partial<NFTMetadata>
  ): Promise<void> {
    try {
      const nftRef = doc(db, "bikeNFTs", nftId)
      await updateDoc(nftRef, {
        metadata: metadata,
        updatedAt: Date.now()
      })
    } catch (error) {
      console.error("Error updating NFT metadata:", error)
      throw error
    }
  }
}
