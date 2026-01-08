import { type NextRequest, NextResponse } from "next/server"
import { isCarAvailableForDates, getConflictingReservation } from "@/lib/reservations"
import fs from "fs/promises"
import path from "path"

const RESERVATIONS_PATH = path.join(process.cwd(), "data", "reservations.json")

function isOverlap(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const vin = searchParams.get("vin")
  const start = searchParams.get("start")
  const end = searchParams.get("end")

  if (!vin || !start || !end) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
  }

  try {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const isAvailable = await isCarAvailableForDates(vin, startDate, endDate)

    if (!isAvailable) {
      const conflict = await getConflictingReservation(vin, startDate, endDate)
      return NextResponse.json({
        available: false,
        conflictingReservation: conflict,
      })
    }

    return NextResponse.json({ available: true })
  } catch (error) {
    console.error("Error checking availability:", error)
    return NextResponse.json({ error: "Failed to check availability", available: false }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { carVin, startDate, endDate } = await request.json()
    console.log("Availability check request received:", { carVin, startDate, endDate })
    let reservations = []
    try {
      const file = await fs.readFile(RESERVATIONS_PATH, "utf-8")
      const parsedFile = JSON.parse(file)
      // 确保读取到的是 reservations 数组
      if (parsedFile && Array.isArray(parsedFile.reservations)) {
        reservations = parsedFile.reservations
      } else {
        console.warn("Unexpected reservations.json structure in availability check:", parsedFile)
        reservations = [] // fallback to empty array
      }
    } catch (e) {
      console.error("Error reading reservations.json in availability check:", e)
      // 继续执行，使用空预约列表，可能会导致所有车都显示 available
      reservations = []
    }
    const start = new Date(startDate)
    const end = new Date(endDate)

    // 查找是否有重叠订单
    const conflicting = reservations.find((r: any) =>
      r.carVin === carVin &&
      isOverlap(new Date(r.startDate), new Date(r.endDate), start, end)
    )

    if (conflicting) {
      console.log("Availability check result: Unavailable", { conflicting })
      return NextResponse.json({ available: false, conflictingReservation: conflicting })
    }
    console.log("Availability check result: Available")
    return NextResponse.json({ available: true })
  } catch (error) {
    console.error("Error in /api/cars/availability POST:", error)
    return NextResponse.json({ error: "Failed to check availability" }, { status: 500 })
  }
}
