import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PUT update stock
export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await req.json()
        const { Nom_Stock, Description_Stock, Id_Piece, Type_Stock } = body

        if (!Nom_Stock || !Id_Piece || !Type_Stock) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        const updatedStock = await prisma.stock.update({
            where: { id: Number(params.id) },
            data: {
                Nom_Stock,
                Description_Stock: Description_Stock || null,
                Id_Piece,
                Type_Stock,
            },
            include: {
                Piece: true,
                _count: { select: { Aliment: true } }, // ✅ récupère le nombre d'aliments
            },
        })

        return NextResponse.json(updatedStock)
    } catch (err) {
        console.error("Erreur PUT /api/stock/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// DELETE stock
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const deletedStock = await prisma.stock.delete({
            where: { id: Number(params.id) },
            include: {
                Piece: true,
                _count: { select: { Aliment: true } }, // ✅ renvoie aussi le compteur
            },
        })

        return NextResponse.json(deletedStock)
    } catch (err) {
        console.error("Erreur DELETE /api/stock/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
