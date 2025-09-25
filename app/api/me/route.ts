import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

// Set JWT secret, use environment variable or fallback to default
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key"

// Handle GET request to retrieve authenticated user info
export async function GET(req: Request) {
    try {
        // Get the Authorization header from the request
        const authHeader = req.headers.get("authorization")
        if (!authHeader) {
            // Return error if no authorization header is present
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        // Extract the token from the header (format: "Bearer <token>")
        const token = authHeader.split(" ")[1]
        if (!token) {
            // Return error if token is missing
            return NextResponse.json({ error: "Token missing" }, { status: 401 })
        }

        // Verify and decode the JWT token
        const decoded = jwt.verify(token, JWT_SECRET) as any

        // Return the decoded user information
        return NextResponse.json({ user: decoded })
    } catch (error) {
        // Return error if token is invalid or verification fails
        return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
}