import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import type { Order } from "@/types/order"

export const runtime = 'nodejs';

// Define the expected structure of the request body
interface OrderRequestBody extends Omit<Order, "id" | "createdAt" | "status" | "paymentStatus" | "paymentDetails"> {}

// Define the structure of the temporary orders file content
interface TempOrdersFileContent {
  tempOrders: Order[];
}

// Path to the temporary orders file
const TEMP_ORDERS_PATH = path.join(process.cwd(), "data", "temp-orders.json")

export async function POST(request: Request) {
  console.log("POST /api/orders called"); // Add this log
  try {
    const orderData: OrderRequestBody = await request.json() // Type the request body
    console.log("Request body parsed:", orderData); // Log parsed body

    // Ensure userId is present in the request body
    if (!orderData.userId) {
      console.error("Request body is missing userId:", orderData);
      return NextResponse.json({ error: "User ID is required in the request body" }, { status: 400 });
    }

    // 读取现有临时订单
    let fileData: TempOrdersFileContent = { tempOrders: [] }; // Explicitly type fileData
    try {
      // Use TEMP_ORDERS_PATH instead of RESERVATIONS_PATH
      const fileContent = await fs.readFile(TEMP_ORDERS_PATH, "utf-8")
      const parsedData = JSON.parse(fileContent);
      // Basic runtime check before assigning to the typed variable
      if (typeof parsedData === 'object' && parsedData !== null && 'tempOrders' in parsedData && Array.isArray(parsedData.tempOrders)) {
           fileData = parsedData as TempOrdersFileContent; // Cast after basic check
           console.log("temp-orders.json read successfully. Existing orders:", fileData.tempOrders.length); // Log successful read
      } else {
          console.warn("Unexpected file format for temp-orders.json, initializing as empty.");
          fileData = { tempOrders: [] };
      }

    } catch (e: any) { // Explicitly type catch error for checking e.code
      // 文件不存在或解析错误则初始化为空数组
      if (e.code === 'ENOENT') {
        console.log("temp-orders.json not found, initializing as empty."); // Log file not found
      } else {
         console.error("Error reading or parsing temp-orders.json before writing:", e); // More specific error log
      }
      fileData = { tempOrders: [] }
    }

    // 生成新临时订单ID和补充其他字段
    // Note: We are creating a temporary order record here. The final reservation will be saved later.
    const newTempOrder: Order = { // Type the new temporary order object
      ...orderData,
      userId: orderData.userId, // Explicitly assign userId
      id: Date.now().toString(), // Simple timestamp ID for the temporary order
      status: "pending", // Temporary status
      createdAt: new Date().toISOString(),
      paymentStatus: "pending", // Temporary payment status
      paymentDetails: { // Initialize payment details as empty for temporary order
        method: "",
        lastFour: "",
        processedAt: "",
      },
    }
    console.log("New temporary order created:", newTempOrder.id); // Log new order creation


    fileData.tempOrders.push(newTempOrder)

    // Log fileData before writing
    console.log("Data to be written to temp-orders.json:", JSON.stringify(fileData, null, 2).substring(0, 500) + (JSON.stringify(fileData, null, 2).length > 500 ? "..." : ""));

    // 写回临时文件
    await fs.writeFile(TEMP_ORDERS_PATH, JSON.stringify(fileData, null, 2))
    
    console.log(`Successfully wrote temporary order ${newTempOrder.id} to ${TEMP_ORDERS_PATH}. Total temporary orders: ${fileData.tempOrders.length}`);

    // Log file content after writing (read it back)
    try {
      const postWriteData = await fs.readFile(TEMP_ORDERS_PATH, "utf-8");
      console.log("temp-orders.json content after writing:", postWriteData.substring(0, 500) + (postWriteData.length > 500 ? "..." : ""));
    } catch (readError) {
      console.error("Error reading temp-orders.json after writing:", readError);
    }

    // 返回临时订单 ID
    return NextResponse.json({ orderId: newTempOrder.id }) // Return the temporary orderId
  } catch (error) {
    console.error("Error in POST /api/orders:", error) // More general catch log
    return NextResponse.json({ error: "Failed to create temporary order" }, { status: 500 })
  }
}

// Add a GET handler to retrieve a temporary order by ID (needed for payment page)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId parameter" }, { status: 400 });
  }

  try {
    let fileData: TempOrdersFileContent = { tempOrders: [] };
    try {
      const fileContent = await fs.readFile(TEMP_ORDERS_PATH, "utf-8");
      const parsedData = JSON.parse(fileContent);
      if (typeof parsedData === 'object' && parsedData !== null && 'tempOrders' in parsedData && Array.isArray(parsedData.tempOrders)) {
           fileData = parsedData as TempOrdersFileContent;
      } else {
           console.warn("Unexpected file format for temp-orders.json when getting order. Searching in empty array.");
      }
    } catch (e) {
      console.error("Error reading temp-orders.json when getting order:", e);
      // If file doesn't exist, it's like order not found
      return NextResponse.json({ error: "Temporary order not found" }, { status: 404 });
    }

    const temporaryOrder = fileData.tempOrders.find(order => order.id === orderId);

    if (!temporaryOrder) {
      return NextResponse.json({ error: "Temporary order not found" }, { status: 404 });
    }

    return NextResponse.json(temporaryOrder);

  } catch (error) {
    console.error("Error retrieving temporary order:", error);
    return NextResponse.json({ error: "Failed to retrieve temporary order" }, { status: 500 });
  }
}
