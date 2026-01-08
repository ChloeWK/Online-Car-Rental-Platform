import { NextResponse } from "next/server"
import { fetchCarByVin } from "@/lib/data"

export async function GET(
  request: Request,
  { params }: { params: { vin: string } }
) {
  try {
    // Await params to access the vin property
    const { vin } = await params

    if (!vin) {
      return NextResponse.json({ error: "Car VIN is required" }, { status: 400 })
    }

    const car = await fetchCarByVin(vin)

    if (!car) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error("Error fetching car details:", error)
    return NextResponse.json({ error: "Failed to fetch car details" }, { status: 500 })
  }
}
