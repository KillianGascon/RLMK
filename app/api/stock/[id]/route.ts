import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PUT: Update a stock item by ID
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Parse request body for updated stock data
        const body = await req.json()
        const { Nom_Stock, Description_Stock, Id_Piece, Type_Stock } = body

        // Validate required fields
        if (!Nom_Stock || !Id_Piece || !Type_Stock) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Update stock in the database, including related room and food count
        const updatedStock = await prisma.stock.update({
            where: { id: Number(params.id) },
            data: {
                Nom_Stock,
                Description_Stock: Description_Stock || null,
                Id_Piece,
                Type_Stock,
            },
            include: {
                Piece: true, // Include related room
                _count: { select: { Aliment: true } }, // Include count of related food items
            },
        })

        // Return updated stock as JSON
        return NextResponse.json(updatedStock)
    } catch (err) {
        // Log and return server error
        console.error("Error PUT /api/stock/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// DELETE: Remove a stock item by ID
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Delete stock from the database, including related room and food count
        const deletedStock = await prisma.stock.delete({
            where: { id: Number(params.id) },
            include: {
                Piece: true, // Include related room
                _count: { select: { Aliment: true } }, // Include count of related food items
            },
        })

        // Return deleted stock as JSON
        return NextResponse.json(deletedStock)
    } catch (err) {
        // Log and return server error
        console.error("Error DELETE /api/stock/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}