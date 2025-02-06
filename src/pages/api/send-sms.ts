import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const { to, message } = req.body

    if (!to || !message) {
      return res.status(400).json({ error: "Missing required parameters" })
    }

    // Here you would integrate with your SMS provider (Twilio, MessageBird, etc.)
    // For demo purposes, we'll just log the message
    console.log(`Sending SMS to ${to}: ${message}`)

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error("Error sending SMS:", error)
    return res.status(500).json({ error: "Failed to send SMS" })
  }
}