import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import type { Order } from "@/types/order"

export const runtime = 'nodejs';

// Define the structure of the temporary orders file content
interface TempOrdersFileContent {
  tempOrders: Order[];
}

const tempOrdersPath = path.join(process.cwd(), "data", "temp-orders.json")

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: orderId } = await params;

    // In a real application, you would fetch the order from a database

    // For this demo, we'll read from the temporary orders file
    let temporaryOrders: Order[] = []; // Use a different variable name for clarity
    try {
      const ordersData = await fs.readFile(tempOrdersPath, "utf-8");
      const parsedData = JSON.parse(ordersData);
      // Check if the parsed data has the expected structure { tempOrders: [...] }
      if (typeof parsedData === 'object' && parsedData !== null && 'tempOrders' in parsedData && Array.isArray(parsedData.tempOrders)) {
           temporaryOrders = parsedData.tempOrders; // Access the array here
      } else {
          console.warn("temp-orders.json exists but does not have the expected format when getting order. Searching in empty array.");
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log("temp-orders.json not found when getting order.");
      } else {
        console.error("Error reading or parsing temp-orders.json when getting order:", error);
      }
      // If file doesn't exist or there's a parsing error, temporaryOrders remains an empty array
    }

    const temporaryOrder = temporaryOrders.find((order) => order.id === orderId);

    if (!temporaryOrder) {
      return NextResponse.json({ error: "Temporary order not found" }, { status: 404 });
    }

    // Add log to check the temporary order object before returning
    console.log("Temporary order fetched for payment page:", temporaryOrder);
    console.log("Temporary order fetched userId:", temporaryOrder.userId);

    // Mock order data
    // const mockOrder = {
    //   id: orderId,
    //   customer: {
    //     name: "John Doe",
    //     email: "john.doe@example.com",
    //     phoneNumber: "+1234567890",
    //   },
    //   car: {
    //     brand: "Toyota",
    //     model: "Camry",
    //     type: "Sedan",
    //     pricePerDay: 60,
    //   },
    //   rental: {
    //     startDate: new Date().toISOString(),
    //     rentalPeriod: 5,
    //     totalPrice: 300,
    //   },
    //   paymentDetails: {
    //     method: "credit",
    //     lastFour: "1234",
    //     processedAt: new Date().toISOString(),
    //   },
    //   status: "confirmed",
    // }

    return NextResponse.json(temporaryOrder) // Return the actual temporary order
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = await params;
    
    // Read existing orders
    let fileData: TempOrdersFileContent = { tempOrders: [] };
    try {
      const ordersData = await fs.readFile(tempOrdersPath, "utf-8");
      const parsedData = JSON.parse(ordersData);
      // Check if the parsed data has the expected structure { tempOrders: [...] }
      if (typeof parsedData === 'object' && parsedData !== null && 'tempOrders' in parsedData && Array.isArray(parsedData.tempOrders)) {
           fileData = parsedData as TempOrdersFileContent;
      } else {
           console.warn("temp-orders.json exists but does not have the expected format when deleting order. Starting with empty array.");
      }
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.log("temp-orders.json not found when deleting order. Starting with empty array.");
      } else {
        console.error("Error reading or parsing temp-orders.json when deleting order:", error);
      }
      // If file doesn't exist or there's a parsing error, fileData.tempOrders remains an empty array
    }

    // Find and remove the order
    const orderIndex = fileData.tempOrders.findIndex((order: any) => order.id === orderId);
    if (orderIndex === -1) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }
    
    fileData.tempOrders.splice(orderIndex, 1)
    
    // Write back to file
    await fs.writeFile(tempOrdersPath, JSON.stringify(fileData, null, 2))
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting order:", error)
    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}
