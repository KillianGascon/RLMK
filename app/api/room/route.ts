import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Récupérer toutes les pièces d’un foyer
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const foyerId = searchParams.get("foyerId")

        const pieces = await prisma.piece.findMany({
            where: foyerId ? { Id_Foyer: Number(foyerId) } : {}, // 👈 objet vide au lieu de undefined
        })

        return NextResponse.json(pieces)
    } catch (err) {
        console.error("Erreur GET /api/room:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// Ajouter une pièce
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, type, description, area, foyerId } = body

        if (!name || !type || !area || !foyerId) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        const newPiece = await prisma.piece.create({
            data: {
                Nom_Piece: name,
                Type_Piece: type,
                Description_Piece: description || null,
                Surface_m2: area,
                Id_Foyer: foyerId, // 🔹 liaison au foyer
            },
        })

        return NextResponse.json(newPiece)
    } catch (err) {
        console.error("Erreur POST /api/pieces:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
