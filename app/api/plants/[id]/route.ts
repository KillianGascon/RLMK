import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET plant by ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> } // 🔑 params est un Promise
) {
    try {
        const { id } = await context.params        // 🔑 il faut await
        const plantId = parseInt(id, 10)

        const p = await prisma.plante.findUnique({ where: { id: plantId } })
        if (!p) {
            return NextResponse.json({ error: "Plant not found" }, { status: 404 })
        }

        return NextResponse.json({
            id: p.id.toString(),
            name: p.Nom_Plante,
            species: p.Espece,
            location: p.Emplacement,
            plantedDate: p.Date_Plantation?.toISOString() ?? "",
            wateringFrequency: parseInt(p.Frequence_Arrosage) || 7,
            optimalHumidity: p.Humidite_Optimale ? Number(p.Humidite_Optimale) : 50,
            optimalTemperature: p.Temperature_Optimale ? Number(p.Temperature_Optimale) : 22,
            lightRequirement: p.Besoin_Lumiere.toLowerCase() as "low" | "medium" | "high",
            status: "healthy",
            notes: p.Description_Plante ?? "",
            Id_ESP32: p.Id_ESP32 ?? null,
        })
    } catch (err) {
        console.error("Error GET /api/plants/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// PUT plant by ID
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const plantId = parseInt(id, 10)
        const body = await req.json()

        if (body.Id_ESP32) {
            const existing = await prisma.plante.findFirst({
                where: { Id_ESP32: body.Id_ESP32, NOT: { id: plantId } },
            })
            if (existing) {
                return NextResponse.json(
                    { error: `ESP32 #${body.Id_ESP32} already linked to plant ${existing.id}` },
                    { status: 400 }
                )
            }
        }

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
                Id_ESP32: body.Id_ESP32 ?? null,
            },
        })

        return NextResponse.json(updated)
    } catch (err) {
        console.error("Error PUT /api/plants/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// DELETE plant by ID
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const plantId = parseInt(id, 10)

        await prisma.plante.delete({ where: { id: plantId } })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error("Error DELETE /api/plants/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
