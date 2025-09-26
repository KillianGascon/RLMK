import { NextResponse } from "next/server"
import jwt, { JwtPayload } from "jsonwebtoken"

// Set JWT secret, use environment variable or fallback to default
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key"

// Type for the JWT payload you expect
interface UserPayload extends JwtPayload {
    id: number
    email: string
    role: string
}

// Handle GET request to retrieve authenticated user info
export async function GET(req: Request) {
    try {
        // Get the Authorization header from the request
        const authHeader = req.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Extract the token from the header (format: "Bearer <token>")
        const token = authHeader.split(" ")[1]
        if (!token) {
            return NextResponse.json({ error: "Token missing" }, { status: 401 })
        }

        // Verify and decode the JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload

        // Return the decoded user information
        return NextResponse.json({ user: decoded })
    } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
}
