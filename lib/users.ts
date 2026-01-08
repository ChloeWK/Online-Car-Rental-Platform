import fs from "fs"
import path from "path"
import type { User } from "@/types/user"
import { v4 as uuidv4 } from "uuid"

// Path to the users file
const usersFilePath = path.join(process.cwd(), "data/users.json")

// Function to get all users
export async function getAllUsers(): Promise<User[]> {
  try {
    // Check if the file exists
    if (!fs.existsSync(usersFilePath)) {
      // Create the directory if it doesn't exist
      const dir = path.dirname(usersFilePath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }

      // Create the file with an initial user
      const initialUsers = {
        users: [
          {
            id: "user-1",
            name: "John Doe",
            email: "john.doe@example.com",
            password: "Password123",
            phone: "+1234567890",
            driversLicense: "DL12345678",
            createdAt: "2023-01-01T00:00:00.000Z",
          },
        ],
      }
      fs.writeFileSync(usersFilePath, JSON.stringify(initialUsers, null, 2))
      return initialUsers.users
    }

    // Read the file
    const data = fs.readFileSync(usersFilePath, "utf8")
    const { users } = JSON.parse(data)
    return users
  } catch (error) {
    console.error("Error reading users:", error)
    // Return default user if there's an error
    return [
      {
        id: "user-1",
        name: "John Doe",
        email: "john.doe@example.com",
        password: "Password123",
        phone: "+1234567890",
        driversLicense: "DL12345678",
        createdAt: "2023-01-01T00:00:00.000Z",
      },
    ]
  }
}

// Get user by email
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    // Get all users
    const users = await getAllUsers()

    // Find user by email (case insensitive)
    const user = users.find((user) => user.email.toLowerCase() === email.toLowerCase())
    return user || null
  } catch (error) {
    console.error("Error getting user by email:", error)
    return null
  }
}

// Authenticate user
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    // Get all users
    const users = await getAllUsers()

    // Find user by email (case insensitive)
    const user = users.find((user) => user.email.toLowerCase() === email.toLowerCase())

    // Check if user exists and password matches (case sensitive)
    if (user && user.password === password) {
      // Return user without password
      const { password: _, ...userWithoutPassword } = user
      return userWithoutPassword as User
    }

    return null
  } catch (error) {
    console.error("Error authenticating user:", error)
    return null
  }
}

// Register new user
export async function registerUser(userData: Omit<User, "id" | "createdAt">): Promise<User | null> {
  try {
    // Get all users
    const users = await getAllUsers()

    // Check if email already exists
    const existingUser = users.find((user) => user.email.toLowerCase() === userData.email.toLowerCase())

    if (existingUser) {
      return null
    }

    // Create new user
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      createdAt: new Date().toISOString(),
    }

    // Add to users data
    users.push(newUser)

    // Write back to the file
    fs.writeFileSync(usersFilePath, JSON.stringify({ users }, null, 2))

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser
    return userWithoutPassword as User
  } catch (error) {
    console.error("Error registering user:", error)
    return null
  }
}

// Get user orders
export async function getUserOrders(userId: string) {
  // This would fetch orders from the orders database filtered by user ID
  // For now, we'll return a mock implementation
  return []
}
