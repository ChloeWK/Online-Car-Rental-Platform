import { NextResponse } from "next/server"
import { getCarRentalPeriods, createRentalPeriod } from "@/lib/rental-periods"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const carVin = url.searchParams.get("carVin")

  if (!carVin) {
    return NextResponse.json({ error: "Car VIN is required" }, { status: 400 })
  }

  try {
    const rentalPeriods = await getCarRentalPeriods(carVin)
    return NextResponse.json(rentalPeriods)
  } catch (error) {
    console.error("Error fetching rental periods:", error)
    return NextResponse.json({ error: "Failed to fetch rental periods" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { carVin, startDate, endDate, userId, orderId } = await request.json()

    if (!carVin || !startDate || !endDate || !userId || !orderId) {
      return NextResponse.json(
        {
          error: "Car VIN, start date, end date, user ID, and order ID are required",
        },
        { status: 400 },
      )
    }

    const rentalPeriod = await createRentalPeriod(carVin, new Date(startDate), new Date(endDate), userId, orderId)

    return NextResponse.json(rentalPeriod)
  } catch (error) {
    console.error("Error creating rental period:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create rental period",
      },
      { status: 500 },
    )
  }
}
