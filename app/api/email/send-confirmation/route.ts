import { NextResponse } from "next/server"
import { sendConfirmationEmail } from "@/lib/data"

export async function POST(request: Request) {
  try {
    const { email, orderDetails } = await request.json()

    // Send confirmation email
    const success = await sendConfirmationEmail(email, orderDetails)

    if (!success) {
      return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Email sending error:", error)
    return NextResponse.json({ error: "An error occurred while sending the email" }, { status: 500 })
  }
}
