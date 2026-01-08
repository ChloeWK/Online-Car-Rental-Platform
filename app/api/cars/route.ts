import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { fetchCars } from "@/lib/data"

const RESERVATIONS_PATH = path.join(process.cwd(), "data", "reservations.json")

function isOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    // Use provided dates or default to current day + next day
    const now = new Date()
    const defaultTomorrow = new Date(now)
    defaultTomorrow.setDate(now.getDate() + 1)

    const startDate = startDateParam ? new Date(startDateParam) : now
    const endDate = endDateParam ? new Date(endDateParam) : defaultTomorrow

    const cars = await fetchCars()
    let reservations = []
    try {
      const file = await fs.readFile(RESERVATIONS_PATH, "utf-8")
      const parsedFile = JSON.parse(file)
      // 确保读取到的是 reservations 数组
      if (parsedFile && Array.isArray(parsedFile.reservations)) {
        reservations = parsedFile.reservations
      } else {
        console.warn("Unexpected reservations.json structure:", parsedFile)
        reservations = [] // fallback to empty array
      }
    } catch (e) {
      console.error("Error reading reservations.json:", e)
      reservations = [] // fallback to empty array
    }

    const carsWithAvailability = cars.map((car: any) => {
      const hasConflict = reservations.some((r: any) =>
        r.carVin === car.vin &&
        // Check overlap with the provided date range
        isOverlap(new Date(r.startDate), new Date(r.endDate), startDate, endDate)
      )
      return { ...car, isAvailable: !hasConflict }
    })

    return NextResponse.json(carsWithAvailability)
  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json({ error: "Failed to fetch cars" }, { status: 500 })
  }
}
