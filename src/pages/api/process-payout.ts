
import { NextApiRequest, NextApiResponse } from "next"
import { paymentService } from "@/services/payments"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  const { userId } = req.body

  if (!userId) {
    return res.status(400).json({ error: "Missing userId parameter" })
  }

  try {
    const transaction = await paymentService.processDataMonetizationPayment(userId)

    return res.status(200).json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error("Error processing payout:", error)
    return res.status(500).json({
      success: false,
      error: "Failed to process payout"
    })
  }
}
