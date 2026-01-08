import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

export const runtime = 'nodejs';

interface Reservation {
  id: string;
  carVin: string;
  userId: string;
  startDate: string;
  endDate: string;
  pickupLocationId: string;
  returnLocationId: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  paymentStatus: string;
  paymentDetails: {
    method: string;
    lastFour: string;
    processedAt: string;
  };
}

const reservationsPath = path.join(process.cwd(), "data", "reservations.json")

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: reservationId } = await params;

    // 读取预约数据
    let reservations: Reservation[] = [];
    try {
      const data = await fs.readFile(reservationsPath, "utf-8");
      const parsedData = JSON.parse(data);
      if (typeof parsedData === 'object' && parsedData !== null && 'reservations' in parsedData && Array.isArray(parsedData.reservations)) {
        reservations = parsedData.reservations;
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log("reservations.json not found.");
      } else {
        console.error("Error reading or parsing reservations.json:", error);
      }
    }

    const reservation = reservations.find((res: Reservation) => res.id === reservationId);

    if (!reservation) {
      return NextResponse.json({ error: "Reservation not found" }, { status: 404 });
    }

    return NextResponse.json(reservation);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    return NextResponse.json({ error: "Failed to fetch reservation details" }, { status: 500 });
  }
} 