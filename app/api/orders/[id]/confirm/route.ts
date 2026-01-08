import { NextResponse } from "next/server"
import { confirmOrder } from "@/lib/data"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    // Confirm the order
    const success = await confirmOrder(orderId)

    if (!success) {
      return NextResponse.json({ error: "Order confirmation failed" }, { status: 400 })
    }

    // In a real application, you would send a confirmation email here
    // For this demo, we'll just log it
    console.log(`Order ${orderId} confirmed successfully`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Order confirmation error:", error)
    return NextResponse.json({ error: "An error occurred during order confirmation" }, { status: 500 })
  }
}
