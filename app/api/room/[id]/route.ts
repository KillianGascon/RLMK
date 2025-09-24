import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Modifier une pièce
export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const pieceId = Number(params.id)
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
    } catch (err) {
        console.error("Erreur PUT /api/room/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// Supprimer une pièce
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const pieceId = Number(params.id)

        await prisma.piece.delete({
            where: { id: pieceId },
        })

        return NextResponse.json({ message: "Pièce supprimée avec succès", id: pieceId })
    } catch (err) {
        console.error("Erreur DELETE /api/room/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
