import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET all stocks (optionnel : filtrer par foyer)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const foyerId = searchParams.get("foyerId")

        const stocks = await prisma.stock.findMany({
            where: foyerId ? { Id_Foyer: Number(foyerId) } : {},
            include: {
                Piece: true,
                _count: { select: { Aliment: true } }, // ✅ corrige ici
            },
        })

        return NextResponse.json(stocks)
    } catch (err) {
        console.error("Erreur GET /api/stock:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// POST new stock
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { Nom_Stock, Description_Stock, Id_Foyer, Id_Piece, Type_Stock } = body

        if (!Nom_Stock || !Id_Foyer || !Id_Piece || !Type_Stock) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        const newStock = await prisma.stock.create({
            data: {
                Nom_Stock,
                Description_Stock: Description_Stock || null,
                Id_Foyer,
                Id_Piece,
                Type_Stock,
            },
            include: {
                Piece: true,
                _count: { select: { Aliment: true } }, // ✅ cohérence directe au retour
            },
        })

        return NextResponse.json(newStock)
    } catch (err) {
        console.error("Erreur POST /api/stock:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
