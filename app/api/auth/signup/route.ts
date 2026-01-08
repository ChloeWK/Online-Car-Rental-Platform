import { NextResponse } from "next/server"
import { registerUser, getUserByEmail } from "@/lib/users"

export async function POST(request: Request) {
  try {
    const userData = await request.json()

    // Check if email already exists
    const existingUser = await getUserByEmail(userData.email)

    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 })
    }

    // Register new user
    const user = await registerUser(userData)

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "An error occurred during registration" }, { status: 500 })
  }
}
