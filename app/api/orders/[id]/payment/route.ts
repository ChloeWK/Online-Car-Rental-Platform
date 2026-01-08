import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import type { Order } from "@/types/order"

export const runtime = 'nodejs';

const tempOrdersPath = path.join(process.cwd(), "data", "temp-orders.json")

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Await params to access its properties
    const { id: orderId } = await params;
    const paymentDetails = await request.json()

    // In a real application, you would process the payment here
    // e.g., interact with a payment gateway API

    // For this simulation, we'll just update the temporary order status to 'paid'
    // and add payment details.

    let orders: Order[] = [];
    try {
      const ordersData = await fs.readFile(tempOrdersPath, "utf-8");
      const parsedData = JSON.parse(ordersData);
      // Check if the parsed data has the expected structure { tempOrders: [...] }
      if (typeof parsedData === 'object' && parsedData !== null && 'tempOrders' in parsedData && Array.isArray(parsedData.tempOrders)) {
           orders = parsedData.tempOrders; // Access the array here
      } else {
          console.warn("temp-orders.json exists but does not have the expected format. Initializing temporary orders as empty array.");
      }
    } catch (error: any) {
      // If file doesn't exist or there's a parsing error, initialize with an empty array
      if (error.code === 'ENOENT') {
        console.log("temp-orders.json not found. Initializing with empty array.");
      } else {
        console.error("Error reading or parsing temp-orders.json:", error);
      }
      orders = []; // Initialize with empty array on error
    }

    const orderIndex = orders.findIndex((order) => order.id === orderId)

    if (orderIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Update payment status and add details
    orders[orderIndex].paymentStatus = "paid"
    orders[orderIndex].paymentDetails = {
      ...paymentDetails,
      processedAt: new Date().toISOString(),
    }
    orders[orderIndex].status = "confirmed" // Assuming payment confirmation means order confirmation

    await fs.writeFile(tempOrdersPath, JSON.stringify({ tempOrders: orders }, null, 2))

    // Simulate success response
    return NextResponse.json({ success: true, orderId: orderId })
  } catch (error) {
    console.error("Error processing payment:", error)
    return NextResponse.json(
      { error: "Failed to process payment" },
      { status: 500 }
    )
  }
}
