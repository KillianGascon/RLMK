import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface Params {
    params: { id: string }
}

// Helper function to invert and clamp soil moisture values
// The sensor gives an inverted value (low = wet, high = dry)
// Example: sensor 40 → real humidity 60%
function normalizeSoil(value: number): number {
    const corrected = 100 - value
    return Math.max(0, Math.min(100, corrected)) // clamp between 0 and 100
}

export async function GET(req: Request, { params }: Params) {
    try {
        const plantId = parseInt(params.id)

        // Check if the plant exists and has an ESP32 linked
        const plant = await prisma.plante.findUnique({
            where: { id: plantId },
            select: { Id_ESP32: true },
        })

        // If no plant or no ESP32 is linked, return null values
        if (!plant || !plant.Id_ESP32) {
            return NextResponse.json(
                { soilMoisture: null, temperature: null, light: null },
                { status: 200 }
            )
        }

        // Get the latest soil moisture/humidity data
        const lastSoil = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                OR: [{ Type_Donnee: "SoilMoisture" }, { Type_Donnee: "Humidite" }],
            },
            orderBy: { Timestamp: "desc" }, // most recent first
            select: { Valeur_Donnee: true },
        })

        // Get the latest temperature data
        const lastTemp = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                Type_Donnee: "Temperature",
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        // Get the latest light measurement (generic match, e.g. LightSensor)
        const lastLight = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                Type_Donnee: { contains: "Light" },
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        // Return formatted response with corrected soil moisture
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