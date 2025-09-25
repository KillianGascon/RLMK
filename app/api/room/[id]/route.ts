import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Update a room by ID
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        // Parse room ID from route parameters
        const pieceId = Number(params.id)
        // Parse request body for updated room data
        const body = await req.json()
        const { name, type, description, area } = body

        // Update room in the database
        const updatedPiece = await prisma.piece.update({
            where: { id: pieceId },
            data: {
                Nom_Piece: name,
                Type_Piece: type,
                Description_Piece: description || null,
                Surface_m2: area,
            },
        })

        // Return updated room data as JSON
        return NextResponse.json(updatedPiece)
    } catch (err) {
        // Log and return server error
        console.error("Error PUT /api/room/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// Delete a room by ID
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        // Parse room ID from route parameters
        const pieceId = Number(params.id)

        // Delete room from the database
        await prisma.piece.delete({
            where: { id: pieceId },
        })

        // Return success response
        return NextResponse.json({ message: "Room deleted successfully", id: pieceId })
    } catch (err) {
        // Log and return server error
        console.error("Error DELETE /api/room/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}