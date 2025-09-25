import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PUT (modifier un aliment)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

        const updatedAliment = await prisma.aliment.update({
            where: { id: Number(params.id) },
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

        return NextResponse.json(updatedAliment)
    } catch (err) {
        console.error("Erreur PUT /api/aliment/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// DELETE (supprimer un aliment)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.aliment.delete({
            where: { id: Number(params.id) },
        })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Erreur DELETE /api/aliment/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
