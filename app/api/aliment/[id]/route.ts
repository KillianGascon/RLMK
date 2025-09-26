import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params   // 👈 obligé car TS croit que c’est un Promise

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
            where: { id: Number(id) },
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

        return NextResponse.json(updatedAliment, { status: 200 })
    } catch (err) {
        console.error("Error PUT /api/aliment/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params   // 👈 pareil ici

    try {
        await prisma.aliment.delete({
            where: { id: Number(id) },
        })
        return NextResponse.json({ success: true }, { status: 200 })
    } catch (err) {
        console.error("Error DELETE /api/aliment/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
