"use server"

import { createOrder, getUserById } from "@/lib/data"
import type { Car } from "@/types/car"
import { isCarAvailableForDates, getConflictingReservation, addCompletedReservationRecord } from "@/lib/reservations"
import type { Order } from "@/types/order"
import type { CompletedReservationRecord } from "@/lib/reservations"

export async function handleReservationSubmit(formData: {
  startDate: Date
  endDate: Date
  rentalPeriod: number
  pickupLocationId: string
  returnLocationId: string
  totalPrice: number
  car: Car
  userId: string
}) {
  try {
    // First check if the car is available for the selected dates
    const isAvailable = await isCarAvailableForDates(
      formData.car.vin,
      new Date(formData.startDate),
      new Date(formData.endDate),
    )

    if (!isAvailable) {
      const conflict = await getConflictingReservation(
        formData.car.vin,
        new Date(formData.startDate),
        new Date(formData.endDate),
      )

      return {
        success: false,
        error: "Car is not available for the selected dates",
        conflictingReservation: conflict,
      }
    }

    // Fetch user details for the customer object
    const user = getUserById(formData.userId);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Create the order in the system
    const order = await createOrder({
      userId: formData.userId,
      customer: {
        name: user.name,
        phoneNumber: user.phone ?? "",
        email: user.email,
        driversLicenseNumber: user.driversLicense,
      },
      car: {
        vin: formData.car.vin,
        brand: formData.car.brand,
        model: formData.car.carModel,
        type: formData.car.carType,
        image: formData.car.image,
      },
      rental: {
        startDate: formData.startDate,
        endDate: formData.endDate,
        rentalPeriod: formData.rentalPeriod,
        totalPrice: formData.totalPrice,
        orderDate: new Date().toISOString(),
        pickupLocationId: formData.pickupLocationId,
        returnLocationId: formData.returnLocationId,
      },
    })

    if (!order || !order.id) {
      return { success: false, error: "Failed to create order" }
    }

    // Return success and order ID
    return { success: true, orderId: order.id, reservationId: order.id }
  } catch (error) {
    console.error("Error creating reservation:", error)
    return { success: false, error: "Failed to create reservation" }
  }
}

// Server Action to save reservation details after successful payment
export async function saveReservationDetails(order: Order) {
  console.log("--> Entering saveReservationDetails Server Action");
  console.log("saveReservationDetails called with order:", order);
  console.log("Checking order.rental in Server Action:", order?.rental);
  try {
    // 构造符合 CompletedReservationRecord 接口的记录
    const completedRecord: CompletedReservationRecord = {
      carVin: order.car.vin,
      userId: order.userId ?? (() => { throw new Error("User ID is required") })(),
      startDate: typeof order.rental.startDate === 'string' ? order.rental.startDate : order.rental.startDate.toISOString(),
      endDate: typeof order.rental.endDate === 'string' ? order.rental.endDate : order.rental.endDate.toISOString(),
      pickupLocationId: order.rental.pickupLocationId ?? (() => { throw new Error("Pickup location is required") })(),
      returnLocationId: order.rental.returnLocationId ?? (() => { throw new Error("Return location is required") })(),
      totalPrice: order.rental.totalPrice,
      id: order.id,
      status: (order.status.charAt(0).toUpperCase() + order.status.slice(1)) as "pending" | "confirmed" | "completed" | "cancelled",
      createdAt: order.createdAt,
      paymentStatus: order.paymentStatus,
      paymentDetails: order.paymentDetails ? {
        method: order.paymentDetails.method || "",
        lastFour: order.paymentDetails.lastFour || "",
        processedAt: order.paymentDetails.processedAt || new Date().toISOString()
      } : undefined
    };

    // 调用函数添加完成的预约记录
    console.log("--> Calling addCompletedReservationRecord with record:", completedRecord.id);
    const savedRecord = await addCompletedReservationRecord(completedRecord);
    console.log("--> addCompletedReservationRecord finished. Saved record:", savedRecord.id);

    // 删除临时订单
    console.log(`--> Attempting to delete temporary order ${order.id}`);
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        console.warn("Failed to delete temporary order:", await response.text());
      }
    } catch (error) {
      console.error("Error deleting temporary order:", error);
    }

    return { success: true, reservation: savedRecord };
  } catch (error) {
    console.error("Error saving reservation details:", error);
    return { success: false, error: "Failed to save reservation details" };
  }
}

// API route to check car availability
export async function checkCarAvailability(carVin: string, startDate: string, endDate: string) {
  try {
    const isAvailable = await isCarAvailableForDates(carVin, new Date(startDate), new Date(endDate))

    if (!isAvailable) {
      const conflict = await getConflictingReservation(carVin, new Date(startDate), new Date(endDate))

      return {
        available: false,
        conflictingReservation: conflict,
      }
    }

    return { available: true }
  } catch (error) {
    console.error("Error checking car availability:", error)
    return { available: false, error: "Failed to check availability" }
  }
}

export async function testServerAction() {
  console.log("--> Inside testServerAction");
}
