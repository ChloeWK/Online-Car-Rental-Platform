"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Car } from "@/types/car"
import type { Order } from "@/types/order"
import ReservationForm from "@/components/reservation-form"
import CarDetails from "@/components/car-details"
import { Button } from "@/components/ui/button"
import { fetchCarByVin, checkCarAvailability, getUserById } from "@/lib/data"

export default function ReservationPage() {
  const router = useRouter()
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    // Get the selected car VIN from localStorage
    const vin = localStorage.getItem("selectedCarVin")

    if (!vin) {
      return
    }

    const loadCar = async () => {
      try {
        const car = await fetchCarByVin(vin)
        setSelectedCar(car)

        // Check if car is still available
        const available = await checkCarAvailability(vin)
        setIsAvailable(available)
      } catch (error) {
        console.error("Error loading car:", error)
      }
    }

    loadCar()
  }, [])

  const handleSubmitOrder = async (formData: {
    startDate: Date
    endDate: Date
    rentalPeriod: number
    pickupLocationId: string
    returnLocationId: string
    totalPrice: number
    userId: string
  }) => {
    if (!selectedCar) {
      alert("No car selected")
      return
    }

    try {
      // Fetch user details is no longer strictly necessary here if userId is in formData
      // but keeping it for now if other user details are needed elsewhere before the API call.
      // const user = getUserById(formData.userId);
      // if (!user) { alert("User not found"); return; }

      // Prepare data for the API call
      const orderData = {
        userId: formData.userId,
        // Customer details are now handled in the API based on userId
        // or should be included here if the API expects them in the body.
        // Based on the current /api/orders POST, it expects customer details in the body.
        // We need to fetch user details to include them.
        customer: { // Fetch user details to include customer info
           name: "", // Placeholder - need to fetch user or get from auth context
           phoneNumber: "", // Placeholder
           email: "", // Placeholder
           driversLicenseNumber: "", // Placeholder
        },
        car: {
          vin: selectedCar.vin,
          brand: selectedCar.brand,
          model: selectedCar.carModel,
          type: selectedCar.carType,
          image: selectedCar.image,
          pricePerDay: selectedCar.pricePerDay, // Include pricePerDay
        },
        rental: {
          startDate: formData.startDate.toISOString(), // Send as ISO string
          endDate: formData.endDate.toISOString(), // Send as ISO string
          rentalPeriod: formData.rentalPeriod,
          totalPrice: formData.totalPrice,
          // orderDate is generated in the API
          pickupLocationId: formData.pickupLocationId,
          returnLocationId: formData.returnLocationId,
        },
      };

       // Fetch user details to include in orderData.customer
       // Assuming useAuth() hook or similar is available to get current user details,
       // or fetch from API if not available client-side.
       // For now, let's assume userId is enough and API fetches user details.
       // REVISITING: The API expects customer details, so we MUST fetch them here or pass from context.
       const user = getUserById(formData.userId); // Use the mock getUserById for now
       if (!user) {
         alert("User details not found. Cannot create order.");
         return; // Exit if user not found
       }

       orderData.customer = {
          name: user.name,
          phoneNumber: user.phone ?? "",
          email: user.email,
          driversLicenseNumber: user.driversLicense,
       };

      // Make the API call to create the temporary order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData), // Send orderData in the body
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error creating temporary order:", errorData);
        throw new Error(errorData.error || "Failed to create temporary order");
      }

      const result = await response.json();
      const newOrderId = result.orderId; // Get orderId from the API response

      if (newOrderId) {
        setOrderPlaced(true);
        setOrderId(newOrderId);
        // Update car availability in UI (this might need re-fetching cars on homepage)
        setIsAvailable(false);
         // Store orderId for payment page redirection
        localStorage.setItem("tempOrderId", newOrderId);

        // Redirect to payment page
        router.push(`/payment/${newOrderId}`);

      } else {
        alert("Failed to create order: API did not return orderId.");
      }
    } catch (error: any) { // Catch any errors during the fetch or processing
      console.error("Error creating reservation:", error);
      alert(error.message || "Failed to place order. The car may no longer be available.");
    }
  };

  const handleConfirmOrder = async () => {
    if (!orderId) return

    try {
      // Confirm the order (implementation in lib/data.ts)
      await fetch(`/api/orders/${orderId}/confirm`, {
        method: "POST",
      })

      // Clear the selected car from localStorage
      localStorage.removeItem("selectedCarVin")

      // Redirect to homepage
      router.push("/")
    } catch (error) {
      console.error("Error confirming order:", error)
    }
  }

  const handleCancel = () => {
    // Clear the form data from localStorage
    localStorage.removeItem("reservationFormData")
    // Redirect to homepage
    router.push("/")
  }

  if (!selectedCar) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">No Car Selected</h1>
        <p className="mb-6">Please select a car from our inventory first.</p>
        <Button onClick={() => router.push("/")}>Browse Cars</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Car Reservation</h1>

      <CarDetails car={selectedCar} />

      {orderPlaced ? (
        <div className="mt-8 p-6 border rounded-lg bg-green-50">
          <h2 className="text-xl font-semibold mb-4">Order Placed Successfully!</h2>
          <p className="mb-4">
            Your order has been placed but is not yet confirmed. Please click the link below to confirm your order.
          </p>
          <Button onClick={handleConfirmOrder} className="mt-2">
            Confirm Order
          </Button>
        </div>
      ) : isAvailable ? (
        <ReservationForm car={selectedCar} onSubmit={handleSubmitOrder} onCancel={handleCancel} />
      ) : (
        <div className="mt-8 p-6 border rounded-lg bg-red-50">
          <h2 className="text-xl font-semibold mb-4">Car Not Available</h2>
          <p className="mb-4">
            We're sorry, but this car is no longer available for rent. Please choose another car from our inventory.
          </p>
          <Button onClick={() => router.push("/")}>Browse Other Cars</Button>
        </div>
      )}
    </div>
  )
}
