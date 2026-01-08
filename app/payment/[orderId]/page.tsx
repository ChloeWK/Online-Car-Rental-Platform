"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CreditCard, CheckCircle } from "lucide-react"
import React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { locations } from "@/lib/locations"
import { saveReservationDetails, testServerAction } from "@/app/actions"
import type { Order } from "@/types/order"

// Form schema
const formSchema = z.object({
  paymentMethod: z.enum(["credit", "debit", "paypal"], {
    required_error: "Please select a payment method",
  }),
  cardholderName: z.string().min(2, { message: "Please enter the cardholder name" }),
  cardNumber: z.string().regex(/^[0-9]{16}$/, { message: "Card number must be 16 digits" }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "Expiry date must be in MM/YY format" }),
  cvv: z.string().regex(/^[0-9]{3,4}$/, { message: "CVV must be 3 or 4 digits" }),
})

type FormValues = z.infer<typeof formSchema>

export default function PaymentPage({ params }: { params: { orderId: string } }) {
  const router = useRouter()
  const orderId = params.orderId;
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderDetails, setOrderDetails] = useState<Order | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      paymentMethod: "credit",
      cardholderName: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    },
  })

  useEffect(() => {
    // Fetch order details
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }

        const data = await response.json()
        console.log("Fetched order details:", JSON.stringify(data, null, 2))
        console.log("Rental data:", data.rental)
        console.log("Start date:", data.rental?.startDate)
        console.log("End date:", data.rental?.endDate)
        setOrderDetails(data)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError("Could not load order details. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [orderId])

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)
    setError(null)
    try {
      // 处理支付逻辑
      const paymentResponse = await fetch(`/api/orders/${orderId}/payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethod: data.paymentMethod,
          cardholderName: data.cardholderName,
          cardNumber: data.cardNumber,
          expiryDate: data.expiryDate,
          cvv: data.cvv,
        }),
      })

      if (!paymentResponse.ok) {
        throw new Error("Payment failed")
      }

      // 使用已加载的订单详情，而不是重新获取
      if (!orderDetails) {
        throw new Error("Order details not available")
      }

      console.log("Order details before validation:", JSON.stringify(orderDetails, null, 2))
      console.log("Rental data:", orderDetails.rental)

      // 验证必要的订单数据
      if (!orderDetails.car?.vin) {
        throw new Error("Car information is missing")
      }

      if (!orderDetails.startDate || !orderDetails.endDate) {
        console.error("Missing rental dates:", {
          startDate: orderDetails.startDate,
          endDate: orderDetails.endDate
        })
        throw new Error("Rental dates are missing")
      }

      if (!orderDetails.pickupLocationId || !orderDetails.returnLocationId) {
        throw new Error("Location information is missing")
      }

      // 直接构造预约记录
      const reservationRecord = {
        carVin: orderDetails.car.vin,
        userId: orderDetails.userId,
        startDate: typeof orderDetails.startDate === 'string' ? orderDetails.startDate : orderDetails.startDate.toISOString(),
        endDate: typeof orderDetails.endDate === 'string' ? orderDetails.endDate : orderDetails.endDate.toISOString(),
        pickupLocationId: orderDetails.pickupLocationId,
        returnLocationId: orderDetails.returnLocationId,
        totalPrice: orderDetails.totalPrice,
        id: orderDetails.id,
        status: "Confirmed",
        createdAt: orderDetails.createdAt,
        paymentStatus: "paid",
        paymentDetails: {
          method: data.paymentMethod,
          lastFour: data.cardNumber.slice(-4),
          processedAt: new Date().toISOString()
        }
      }

      console.log("Constructed reservation record:", reservationRecord)

      // 直接保存到 reservations.json
      const saveResponse = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reservationRecord),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        throw new Error(errorData.error || "Failed to save reservation")
      }

      // 删除临时订单
      await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      })

      setIsSuccess(true)

      // 等待2秒后重定向到确认页面
      setTimeout(() => {
        router.push(`/confirmation/${orderId}`)
      }, 2000)

    } catch (err) {
      console.error("Payment error:", err)
      setError(err instanceof Error ? err.message : "An error occurred during payment processing")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-center">Payment Successful!</h2>
            <p className="text-center mt-2">
              Your payment has been processed successfully. Redirecting to confirmation page...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Payment</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription>Complete your payment to confirm your reservation</CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="credit" id="credit" />
                              <Label htmlFor="credit">Credit Card</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="debit" id="debit" />
                              <Label htmlFor="debit">Debit Card</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="paypal" id="paypal" />
                              <Label htmlFor="paypal">PayPal</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="cardholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="1234 5678 9012 3456"
                                {...field}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/\D/g, "")
                                  field.onChange(value)
                                }}
                                maxLength={16}
                              />
                              <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="MM/YY"
                                {...field}
                                onChange={(e) => {
                                  let value = e.target.value.replace(/[^\d]/g, "")
                                  if (value.length > 2) {
                                    value = `${value.slice(0, 2)}/${value.slice(2, 4)}`
                                  }
                                  field.onChange(value)
                                }}
                                maxLength={5}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="123"
                                {...field}
                                onChange={(e) => {
                                  // Only allow numbers
                                  const value = e.target.value.replace(/\D/g, "")
                                  field.onChange(value)
                                }}
                                maxLength={4}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !orderDetails}
                    onClick={() => console.log('Pay Now button clicked!')}
                  >
                    {isLoading ? "Processing..." : "Pay Now"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading order details...</div>
              ) : orderDetails ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Car Details</h3>
                    <p>
                      {orderDetails.car?.brand} {orderDetails.car?.carModel}
                    </p>
                    <p className="text-sm text-muted-foreground">{orderDetails.car?.carType}</p>
                  </div>

                  <div>
                    <h3 className="font-medium">Rental Period</h3>
                    <p>
                      {format(new Date(orderDetails.startDate), "MMM dd, yyyy")} -
                      {format(new Date(orderDetails.endDate), " MMM dd, yyyy")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {Math.ceil((new Date(orderDetails.endDate).getTime() - new Date(orderDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>

                  <div>
                    <h3 className="font-medium">Pickup & Return</h3>
                    <p>
                      Pickup:{" "}
                      {locations.find((loc) => loc.id === orderDetails.pickupLocationId)?.name ||
                        "Unknown location"}
                    </p>
                    <p>
                      Return:{" "}
                      {locations.find((loc) => loc.id === orderDetails.returnLocationId)?.name ||
                        "Unknown location"}
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span>Daily Rate:</span>
                    <span>${orderDetails.car?.pricePerDay}/day</span>
                  </div>

                  <div className="flex justify-between">
                    <span>Rental Period:</span>
                    <span>{Math.ceil((new Date(orderDetails.endDate).getTime() - new Date(orderDetails.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>${orderDetails.totalPrice}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">Loading order details...</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
