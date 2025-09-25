import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET all stocks (optionally filter by household)
export async function GET(req: Request) {
    try {
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const foyerId = searchParams.get("foyerId")

        // Retrieve stocks from the database, filtered by household ID if provided
        const stocks = await prisma.stock.findMany({
            where: foyerId ? { Id_Foyer: Number(foyerId) } : {},
            include: {
                Piece: true, // Include related room
                _count: { select: { Aliment: true } }, // Include count of related food items
            },
        })

        // Return the list of stocks as JSON
        return NextResponse.json(stocks)
    } catch (err) {
        // Log and return server error
        console.error("Erreur GET /api/stock:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// POST new stock
export async function POST(req: Request) {
    try {
        // Parse request body for new stock data
        const body = await req.json()
        const { Nom_Stock, Description_Stock, Id_Foyer, Id_Piece, Type_Stock } = body

        // Validate required fields
        if (!Nom_Stock || !Id_Foyer || !Id_Piece || !Type_Stock) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Create new stock in the database and link to room and household
        const newStock = await prisma.stock.create({
            data: {
                Nom_Stock,
                Description_Stock: Description_Stock || null,
                Id_Foyer,
                Id_Piece,
                Type_Stock,
            },
            include: {
                Piece: true, // Include related room
                _count: { select: { Aliment: true } }, // Include count of related food items
            },
        })

        // Return the newly created stock as JSON
        return NextResponse.json(newStock)
    } catch (err) {
        // Log and return server error
        console.error("Erreur POST /api/stock:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}