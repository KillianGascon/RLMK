import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface Params {
    params: { id: string }
}

// 🔵 GET une seule plante
export async function GET(req: Request, { params }: Params) {
    try {
        const plantId = parseInt(params.id)
        const p = await prisma.plante.findUnique({ where: { id: plantId } })

        if (!p) {
            return NextResponse.json({ error: "Plante non trouvée" }, { status: 404 })
        }

        const formatted = {
            id: p.id.toString(),
            name: p.Nom_Plante,
            species: p.Espece,
            location: p.Emplacement,
            plantedDate: p.Date_Plantation?.toISOString() ?? "",
            lastWatered: "",
            wateringFrequency: parseInt(p.Frequence_Arrosage) || 7,
            optimalHumidity: p.Humidite_Optimale ? Number(p.Humidite_Optimale) : 50,
            optimalTemperature: p.Temperature_Optimale ? Number(p.Temperature_Optimale) : 22,
            currentHumidity: 50,
            currentTemperature: 22,
            lightRequirement: p.Besoin_Lumiere.toLowerCase() as "low" | "medium" | "high",
            status: "healthy",
            notes: p.Description_Plante ?? "",
        }

        return NextResponse.json(formatted)
    } catch (err) {
        console.error("Erreur GET /api/plants/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// 🟡 PUT update plante
export async function PUT(req: Request, { params }: Params) {
    try {
        const plantId = parseInt(params.id)
        const body = await req.json()

        const updated = await prisma.plante.update({
            where: { id: plantId },
            data: {
                Nom_Plante: body.name,
                Espece: body.species,
                Emplacement: body.location,
                Frequence_Arrosage: body.wateringFrequency?.toString(),
                Besoin_Lumiere: body.lightRequirement,
                Description_Plante: body.notes ?? null,
                Date_Plantation: body.plantedDate ? new Date(body.plantedDate) : null,
                Humidite_Optimale: body.optimalHumidity ?? null,
                Temperature_Optimale: body.optimalTemperature ?? null,
            },
        })

        return NextResponse.json(updated)
    } catch (err) {
        console.error("Erreur PUT /api/plants/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// 🔴 DELETE plante
export async function DELETE(req: Request, { params }: Params) {
    try {
        const plantId = parseInt(params.id)

        await prisma.plante.delete({
            where: { id: plantId },
        })

        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Erreur DELETE /api/plants/[id]:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
