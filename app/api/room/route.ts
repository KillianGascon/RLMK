import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Handle GET request to fetch all rooms for a household
export async function GET(req: Request) {
    try {
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const foyerId = searchParams.get("foyerId")

        // Retrieve rooms from the database, filtered by household ID if provided
        const pieces = await prisma.piece.findMany({
            where: foyerId ? { Id_Foyer: Number(foyerId) } : {},
        })

        // Return the list of rooms as JSON
        return NextResponse.json(pieces)
    } catch (err) {
        // Log and return server error
        console.error("Error GET /api/room:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// Handle POST request to add a new room
export async function POST(req: Request) {
    try {
        // Parse request body for new room data
        const body = await req.json()
        const { name, type, description, area, foyerId } = body

        // Validate required fields
        if (!name || !type || !area || !foyerId) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Create new room in the database and link to household
        const newPiece = await prisma.piece.create({
            data: {
                Nom_Piece: name,
                Type_Piece: type,
                Description_Piece: description || null,
                Surface_m2: area,
                Id_Foyer: foyerId,
            },
        })

        // Return the newly created room as JSON
        return NextResponse.json(newPiece)
    } catch (err) {
        // Log and return server error
        console.error("Error POST /api/room:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}