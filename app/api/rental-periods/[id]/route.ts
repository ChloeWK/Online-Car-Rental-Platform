import { NextResponse } from "next/server"
import { cancelRentalPeriod, completeRentalPeriod } from "@/lib/rental-periods"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const rentalId = params.id
    const success = await cancelRentalPeriod(rentalId)

    if (!success) {
      return NextResponse.json({ error: "Failed to cancel rental period" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error cancelling rental period:", error)
    return NextResponse.json({ error: "An error occurred while cancelling the rental period" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const rentalId = params.id
    const { action } = await request.json()

    if (action === "complete") {
      const success = await completeRentalPeriod(rentalId)

      if (!success) {
        return NextResponse.json({ error: "Failed to complete rental period" }, { status: 400 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Error updating rental period:", error)
    return NextResponse.json({ error: "An error occurred while updating the rental period" }, { status: 500 })
  }
}
