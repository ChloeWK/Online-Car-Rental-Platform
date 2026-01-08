import { NextResponse } from "next/server"
import { authenticateUser } from "@/lib/users"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Authenticate user
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "An error occurred during login" }, { status: 500 })
  }
}
