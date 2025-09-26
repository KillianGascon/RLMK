import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PUT: Update a stock item by ID
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // ✅ attendre le Promise
        const stockId = Number(id)

        const body = await req.json()
        const { Nom_Stock, Description_Stock, Id_Piece, Type_Stock } = body

        if (!Nom_Stock || !Id_Piece || !Type_Stock) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        const updatedStock = await prisma.stock.update({
            where: { id: stockId },
            data: {
                Nom_Stock,
                Description_Stock: Description_Stock || null,
                Id_Piece,
                Type_Stock,
            },
            include: {
                Piece: true,
                _count: { select: { Aliment: true } },
            },
        })

        return NextResponse.json(updatedStock)
    } catch (err: unknown) {
        console.error("Error PUT /api/stock/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// DELETE: Remove a stock item by ID
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // ✅ idem ici
        const stockId = Number(id)

        const deletedStock = await prisma.stock.delete({
            where: { id: stockId },
            include: {
                Piece: true,
                _count: { select: { Aliment: true } },
            },
        })

        return NextResponse.json(deletedStock)
    } catch (err: unknown) {
        console.error("Error DELETE /api/stock/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
