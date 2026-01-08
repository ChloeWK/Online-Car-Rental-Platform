import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { getCompletedReservationRecordsByUserId } from "@/lib/reservations"

export const runtime = 'nodejs';

const RESERVATIONS_PATH = path.join(process.cwd(), "data", "reservations.json")

export async function GET(
  request: Request,
  context: { params: { userId: string } }
) {
  try {
    // Await context.params to access userId
    const { userId } = await context.params;

    console.log(`Fetching reservations for user: ${userId}`)

    if (!userId) {
      console.error("GET /api/users/[userId]/reservations: User ID is missing")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const file = await fs.readFile(RESERVATIONS_PATH, "utf-8")
    const parsedFile = JSON.parse(file)

    let reservations = []
    // Ensure we read the reservations array from the correct structure
    if (parsedFile && Array.isArray(parsedFile.reservations)) {
      reservations = parsedFile.reservations
      console.log(`Successfully read ${reservations.length} reservations from file.`)
    } else {
      console.warn("Unexpected reservations.json structure in user reservations API:", parsedFile)
      // Fallback to empty array if structure is unexpected
      reservations = []
    }

    const userReservations = reservations.filter((r: any) => r.userId === userId)
    console.log(`Found ${userReservations.length} reservations for user ${userId}.`)
    return NextResponse.json(userReservations)
  } catch (error) {
    console.error("Error reading reservations.json or filtering reservations:", error)
    return NextResponse.json({ error: "Failed to read reservations" }, { status: 500 })
  }
}
