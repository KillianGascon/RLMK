import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Update a room by ID
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // 🔑 il faut await
        const pieceId = Number(id)

        const body = await req.json()
        const { name, type, description, area } = body

        const updatedPiece = await prisma.piece.update({
            where: { id: pieceId },
            data: {
                Nom_Piece: name,
                Type_Piece: type,
                Description_Piece: description || null,
                Surface_m2: area,
            },
        })

        return NextResponse.json(updatedPiece)
    } catch (err: unknown) {
        console.error("Error PUT /api/room/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// Delete a room by ID
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // 🔑 idem
        const pieceId = Number(id)

        await prisma.piece.delete({
            where: { id: pieceId },
        })

        return NextResponse.json({ message: "Room deleted successfully", id: pieceId })
    } catch (err: unknown) {
        console.error("Error DELETE /api/room/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
