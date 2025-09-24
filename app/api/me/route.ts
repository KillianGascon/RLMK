import { NextResponse } from "next/server"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key"

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization")
        if (!authHeader) {
            return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
        }

        const token = authHeader.split(" ")[1]
        if (!token) {
            return NextResponse.json({ error: "Token manquant" }, { status: 401 })
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any

        return NextResponse.json({ user: decoded })
    } catch (error) {
        return NextResponse.json({ error: "Token invalide" }, { status: 401 })
    }
}
