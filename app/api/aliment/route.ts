import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET tous les aliments (optionnel : filtrer par stock)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const stockId = searchParams.get("stockId")

        const aliments = await prisma.aliment.findMany({
            where: stockId ? { Id_Stock: Number(stockId) } : {},
            include: { Stock: true }, // pour récupérer le stock lié
        })

        return NextResponse.json(aliments)
    } catch (err) {
        console.error("Erreur GET /api/aliment:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// POST un nouvel aliment
export async function POST(req: Request) {
    try {
        const body = await req.json()
        const {
            Nom_Aliment,
            Description_Aliment,
            Date_Peremption,
            Type_Aliment,
            Quantite,
            Unite_Quantite,
            Id_Stock,
        } = body

        if (!Nom_Aliment || !Id_Stock) {
            return NextResponse.json({ error: "Nom_Aliment et Id_Stock sont obligatoires" }, { status: 400 })
        }

        const newAliment = await prisma.aliment.create({
            data: {
                Nom_Aliment,
                Description_Aliment: Description_Aliment || null,
                Date_Peremption: Date_Peremption ? new Date(Date_Peremption) : null,
                Type_Aliment: Type_Aliment || null,
                Quantite: Quantite ?? null,
                Unite_Quantite: Unite_Quantite || null,
                Id_Stock,
            },
        })

        return NextResponse.json(newAliment)
    } catch (err) {
        console.error("Erreur POST /api/aliment:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
