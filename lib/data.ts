import type { Car } from "@/types/car"
import type { Order } from "@/types/order"
import type { User } from "@/types/user"
import { v4 as uuidv4 } from "uuid"

// Mock car data
const carsData: Car[] = [
  {
    carType: "Sedan",
    brand: "Toyota",
    carModel: "Camry",
    image: "/toyota-camry-sedan.png",
    yearOfManufacture: 2022,
    mileage: "15,000 km",
    fuelType: "Gasoline",
    pricePerDay: 60,
    description: "A reliable and fuel-efficient sedan perfect for daily commuting.",
    vin: "1HGBH41JXMN109186",
    inventory: 1,
    currentLocationId: "loc-1", // Downtown Office
    color: "White",
    transmission: "Automatic",
    seats: 5,
    features: ["Air Conditioning", "Bluetooth"]
  },
  {
    carType: "Sedan",
    brand: "Honda",
    carModel: "Accord",
    image: "/honda-accord.png",
    yearOfManufacture: 2021,
    mileage: "22,000 km",
    fuelType: "Hybrid",
    pricePerDay: 65,
    description: "A spacious and comfortable sedan with excellent fuel economy.",
    vin: "1HGCV2F34MA123456",
    inventory: 1,
    currentLocationId: "loc-2", // Airport Terminal
    color: "Black",
    transmission: "Automatic",
    seats: 5,
    features: ["Sunroof", "Heated Seats"]
  },
  {
    carType: "SUV",
    brand: "Toyota",
    carModel: "RAV4",
    image: "/toyota-rav4-suv.png",
    yearOfManufacture: 2023,
    mileage: "8,000 km",
    fuelType: "Hybrid",
    pricePerDay: 80,
    description: "A versatile and efficient compact SUV with plenty of cargo space.",
    vin: "JTMWFREV0MD123789",
    inventory: 1,
    currentLocationId: "loc-3", // Central Station
    color: "Silver",
    transmission: "Automatic",
    seats: 5,
    features: ["All-Wheel Drive", "Backup Camera"]
  },
  {
    carType: "SUV",
    brand: "Honda",
    carModel: "CR-V",
    image: "/honda-crv-suv.png",
    yearOfManufacture: 2022,
    mileage: "18,000 km",
    fuelType: "Gasoline",
    pricePerDay: 75,
    description: "A reliable and spacious SUV perfect for family trips.",
    vin: "2HKRW2H80NH123456",
    inventory: 1,
    currentLocationId: "loc-1", // Downtown Office
    color: "Blue",
    transmission: "Automatic",
    seats: 5,
    features: ["Roof Rack", "Bluetooth"]
  },
  {
    carType: "Luxury",
    brand: "BMW",
    carModel: "5 Series",
    image: "/bmw-5-series.png",
    yearOfManufacture: 2023,
    mileage: "10,000 km",
    fuelType: "Gasoline",
    pricePerDay: 120,
    description: "A premium luxury sedan with powerful performance and elegant design.",
    vin: "WBA5A7C50JG123456",
    inventory: 1,
    currentLocationId: "loc-4", // Harbor Point
    color: "Gray",
    transmission: "Automatic",
    seats: 5,
    features: ["Leather Seats", "Navigation"]
  },
  {
    carType: "Luxury",
    brand: "Mercedes-Benz",
    carModel: "E-Class",
    image: "/mercedes-e-class.png",
    yearOfManufacture: 2022,
    mileage: "15,000 km",
    fuelType: "Hybrid",
    pricePerDay: 130,
    description: "A sophisticated luxury sedan with cutting-edge technology and comfort.",
    vin: "WDDZF4JB6KA123456",
    inventory: 1,
    currentLocationId: "loc-5", // Suburban Mall
    color: "White",
    transmission: "Automatic",
    seats: 5,
    features: ["Sunroof", "Heated Seats"]
  },
  {
    carType: "Sports",
    brand: "Ford",
    carModel: "Mustang",
    image: "/ford-mustang-sports-car.png",
    yearOfManufacture: 2023,
    mileage: "5,000 km",
    fuelType: "Gasoline",
    pricePerDay: 110,
    description: "An iconic American muscle car with exhilarating performance.",
    vin: "1FA6P8TH6J5123456",
    inventory: 1,
    currentLocationId: "loc-2", // Airport Terminal
    color: "Red",
    transmission: "Automatic",
    seats: 4,
    features: ["Convertible Top", "Premium Audio"]
  },
  {
    carType: "Hatchback",
    brand: "Volkswagen",
    carModel: "Golf",
    image: "/volkswagen-golf-mk8-night.png",
    yearOfManufacture: 2022,
    mileage: "12,000 km",
    fuelType: "Gasoline",
    pricePerDay: 55,
    description: "A practical and fun-to-drive hatchback with German engineering.",
    vin: "WVWAA7AJ6JW123456",
    inventory: 1,
    currentLocationId: "loc-3", // Central Station
    color: "Gray",
    transmission: "Automatic",
    seats: 5,
    features: ["Apple CarPlay", "Android Auto"]
  },
  {
    carType: "Minivan",
    brand: "Toyota",
    carModel: "Sienna",
    image: "/toyota-sienna.png",
    yearOfManufacture: 2023,
    mileage: "9,000 km",
    fuelType: "Hybrid",
    pricePerDay: 95,
    description: "A spacious and comfortable minivan perfect for family vacations.",
    vin: "5TDKZ3DC8MS123456",
    inventory: 1,
    currentLocationId: "loc-6", // Business District
    color: "Silver",
    transmission: "Automatic",
    seats: 7,
    features: ["Sliding Doors", "Rear-Seat Entertainment"]
  },
  {
    carType: "Truck",
    brand: "Ford",
    carModel: "F-150",
    image: "/ford-f-150.png",
    yearOfManufacture: 2022,
    mileage: "20,000 km",
    fuelType: "Gasoline",
    pricePerDay: 100,
    description: "A powerful and capable pickup truck for work and adventure.",
    vin: "1FTFW1ET6MFA12345",
    inventory: 1,
    currentLocationId: "loc-4", // Harbor Point
    color: "Black",
    transmission: "Automatic",
    seats: 5,
    features: ["Towing Package", "Four-Wheel Drive"]
  },
  // Adding more car brands and types
  {
    carType: "SUV",
    brand: "Audi",
    carModel: "Q5",
    image: "/audi-q5-urban.png",
    yearOfManufacture: 2023,
    mileage: "7,500 km",
    fuelType: "Gasoline",
    pricePerDay: 115,
    description: "A premium compact SUV with sophisticated styling and advanced technology.",
    vin: "WAUZZZFY1N2123456",
    inventory: 1,
    currentLocationId: "loc-1", // Downtown Office
    color: "Blue",
    transmission: "Automatic",
    seats: 5,
    features: ["Leather Seats", "Panoramic Sunroof"]
  },
  {
    carType: "Sedan",
    brand: "Tesla",
    carModel: "Model 3",
    image: "/tesla-model-3.png",
    yearOfManufacture: 2023,
    mileage: "5,000 km",
    fuelType: "Electric",
    pricePerDay: 125,
    description: "A high-performance electric sedan with cutting-edge technology and impressive range.",
    vin: "5YJ3E1EA1PF123456",
    inventory: 1,
    currentLocationId: "loc-2", // Airport Terminal
    color: "White",
    transmission: "Automatic",
    seats: 5,
    features: ["Autopilot", "Fast Charging"]
  },
  {
    carType: "Convertible",
    brand: "BMW",
    carModel: "4 Series",
    image: "/bmw-4-series-convertible.png",
    yearOfManufacture: 2022,
    mileage: "12,000 km",
    fuelType: "Gasoline",
    pricePerDay: 135,
    description: "A stylish convertible with dynamic performance and luxurious comfort.",
    vin: "WBA23AJ01NCF12345",
    inventory: 1,
    currentLocationId: "loc-5", // Suburban Mall
    color: "Red",
    transmission: "Automatic",
    seats: 4,
    features: ["Convertible Top", "Sport Package"]
  },
  {
    carType: "Coupe",
    brand: "Mercedes-Benz",
    carModel: "C-Class Coupe",
    image: "/Mercedes-Benz C-Class Coupe.jpg",
    yearOfManufacture: 2022,
    mileage: "9,000 km",
    fuelType: "Gasoline",
    pricePerDay: 120,
    description: "An elegant coupe with sporty handling and premium features.",
    vin: "WDDWF5EB1MA123456",
    inventory: 1,
    currentLocationId: "loc-4", // Harbor Point
    color: "Black",
    transmission: "Automatic",
    seats: 4,
    features: ["AMG Styling", "Sunroof"]
  },
  {
    carType: "Compact SUV",
    brand: "Mazda",
    carModel: "CX-5",
    image: "/Mazda CX-5.png",
    yearOfManufacture: 2023,
    mileage: "6,000 km",
    fuelType: "Hybrid",
    pricePerDay: 70,
    description: "A stylish and practical compact SUV with excellent value and features.",
    vin: "JM3KFCDA1P0123456",
    inventory: 1,
    currentLocationId: "loc-1", // Downtown Office
    color: "Red",
    transmission: "Automatic",
    seats: 5,
    features: ["Apple CarPlay", "Blind Spot Monitoring"]
  },
  {
    carType: "Hatchback",
    brand: "Mini",
    carModel: "Cooper",
    image: "/Mini Cooper.jpg",
    yearOfManufacture: 2023,
    mileage: "8,500 km",
    fuelType: "Gasoline",
    pricePerDay: 75,
    description: "A fun-to-drive compact hatchback with iconic styling and nimble handling.",
    vin: "WMWXC2C0XW1234567",
    inventory: 1,
    currentLocationId: "loc-3", // Central Station
    color: "Blue",
    transmission: "Automatic",
    seats: 4,
    features: ["Iconic Design", "Sport Suspension"]
  },
  {
    carType: "Sedan",
    brand: "Nissan",
    carModel: "Altima",
    image: "/Nissan Altima.jpg",
    yearOfManufacture: 2022,
    mileage: "7,000 km",
    fuelType: "Hybrid",
    pricePerDay: 65,
    description: "A stylish midsize sedan with advanced technology and excellent fuel economy.",
    vin: "1N4AL1AP8NC123456",
    inventory: 1,
    currentLocationId: "loc-2", // Airport Terminal
    color: "Gray",
    transmission: "Automatic",
    seats: 5,
    features: ["NissanConnect", "Safety Shield 360"]
  },
  {
    carType: "SUV",
    brand: "Subaru",
    carModel: "Outback",
    image: "/Subaru Outback.jpg",
    yearOfManufacture: 2023,
    mileage: "14,000 km",
    fuelType: "Gasoline",
    pricePerDay: 75,
    description: "A refined compact SUV with engaging driving dynamics and upscale interior.",
    vin: "4S4BFAMC7P1123456",
    inventory: 1,
    currentLocationId: "loc-6", // Business District
    color: "Green",
    transmission: "Automatic",
    seats: 5,
    features: ["Symmetrical All-Wheel Drive", "EyeSight Driver Assist"]
  },
  {
    carType: "Truck",
    brand: "Chevrolet",
    carModel: "Silverado 1500",
    image: "/Chevrolet Silverado 1500.jpg",
    yearOfManufacture: 2022,
    mileage: "10,000 km",
    fuelType: "Gasoline",
    pricePerDay: 95,
    description: "A rugged and capable full-size pickup truck with impressive towing capacity.",
    vin: "3GCPCREC8NG123456",
    inventory: 1,
    currentLocationId: "loc-4", // Harbor Point
    color: "White",
    transmission: "Automatic",
    seats: 6,
    features: ["Trailering Package", "Infotainment System"]
  },
  {
    carType: "Sports Car",
    brand: "Porsche",
    carModel: "911",
    image: "/Porsche 911.jpg",
    yearOfManufacture: 2023,
    mileage: "5,500 km",
    fuelType: "Gasoline",
    pricePerDay: 250,
    description: "An iconic sports car with exhilarating performance and timeless design.",
    vin: "WP0AA2A98PS123456",
    inventory: 1,
    currentLocationId: "loc-5", // Suburban Mall
    color: "Yellow",
    transmission: "Automatic",
    seats: 4,
    features: ["Porsche Dynamic Chassis Control", "Sport Chrono Package"]
  },
]

// Mock order data
const orders: Order[] = []

// Mock user data
const users: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    password: "Password123", // In a real app, this would be hashed
    phone: "+1234567890",
    driversLicense: "DL12345678",
    createdAt: "2024-01-01T00:00:00.000Z",
  },
]

export async function fetchCarByVin(vin: string): Promise<Car | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const car = carsData.find((car) => car.vin === vin)
  return car || null
}

export async function checkCarAvailability(vin: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))

  const car = carsData.find((car) => car.vin === vin)
  // Ensure a boolean is always returned
  return car?.isAvailable ?? false
}

export async function fetchCars(): Promise<Car[]> {
  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800))
    return carsData
  } catch (error) {
    console.error("Error fetching cars:", error)
    throw new Error("Failed to fetch cars data")
  }
}

export async function sendConfirmationEmail(email: string, orderDetails: any): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  console.log(`Confirmation email sent to ${email} with details:`, orderDetails)
  return true
}

export async function confirmOrder(orderId: string): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  console.log(`Order ${orderId} confirmed`)
  return true
}

export async function processPayment(orderId: string, paymentDetails: any): Promise<boolean> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))

  console.log(`Payment processed for order ${orderId} with details:`, paymentDetails)
  return true
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))

  // Mock implementation: return an empty array
  return []
}

export async function createOrder(
  orderData: Omit<Order, "id" | "createdAt" | "status" | "paymentStatus" | "paymentDetails">,
): Promise<Order> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700))

  const newOrder: Order = {
    id: uuidv4(), // Generate a random ID using uuidv4
    ...orderData,
    status: "pending",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    paymentDetails: {
      method: "credit",
      lastFour: "1234",
      processedAt: new Date().toISOString(),
    },
  }

  orders.push(newOrder)
  return newOrder // Return the full order object
}

export function getCarByVin(vin: string): Car | undefined {
  return carsData.find((car) => car.vin === vin)
}

// Function to get user by ID
export function getUserById(userId: string): User | undefined {
  return users.find(user => user.id === userId);
}
