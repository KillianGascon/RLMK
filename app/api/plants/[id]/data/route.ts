import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

function normalizeSoil(value: number): number {
    const corrected = 100 - value
    return Math.max(0, Math.min(100, corrected))
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const plantId = parseInt(id, 10)

        if (isNaN(plantId)) {
            return NextResponse.json({ error: "Invalid plant ID" }, { status: 400 })
        }

        const plant = await prisma.plante.findUnique({
            where: { id: plantId },
            select: { Id_ESP32: true },
        })

        if (!plant || !plant.Id_ESP32) {
            return NextResponse.json(
                { soilMoisture: null, temperature: null, light: null },
                { status: 200 }
            )
        }

        const lastSoil = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                OR: [{ Type_Donnee: "SoilMoisture" }, { Type_Donnee: "Humidite" }],
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        const lastTemp = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                Type_Donnee: "Temperature",
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        const lastLight = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                Type_Donnee: { contains: "Light" },
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        return NextResponse.json({
            soilMoisture:
                lastSoil?.Valeur_Donnee != null
                    ? normalizeSoil(lastSoil.Valeur_Donnee)
                    : null,
            temperature: lastTemp?.Valeur_Donnee ?? null,
            light: lastLight?.Valeur_Donnee ?? null,
        })
    } catch (err) {
        console.error("Error GET /api/plants/[id]/data:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
