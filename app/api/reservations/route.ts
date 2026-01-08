import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const RESERVATIONS_FILE_PATH = path.join(process.cwd(), "data", "reservations.json")

export async function POST(request: Request) {
  try {
    const reservation = await request.json()

    // 读取现有的预约记录
    let reservations = []
    try {
      const data = await fs.readFile(RESERVATIONS_FILE_PATH, "utf-8")
      const parsedData = JSON.parse(data)
      if (parsedData && Array.isArray(parsedData.reservations)) {
        reservations = parsedData.reservations
      }
    } catch (error: any) {
      if (error.code !== 'ENOENT') {
        console.error("Error reading reservations file:", error)
        throw error
      }
    }

    // 添加新的预约记录
    reservations.push(reservation)

    // 写入文件
    await fs.writeFile(
      RESERVATIONS_FILE_PATH,
      JSON.stringify({ reservations }, null, 2)
    )

    return NextResponse.json({ success: true, reservation })
  } catch (error) {
    console.error("Error saving reservation:", error)
    return NextResponse.json(
      { error: "Failed to save reservation" },
      { status: 500 }
    )
  }
} 