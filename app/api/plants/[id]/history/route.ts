// app/api/plants/[id]/history/route.ts
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

        // Check if the plant exists and has an ESP32 assigned
        const plant = await prisma.plante.findUnique({
            where: { id: plantId },
            select: { Id_ESP32: true },
        })

        // If no plant or no ESP32 is linked, return an empty array
        if (!plant || !plant.Id_ESP32) {
            return NextResponse.json([], { status: 200 })
        }

        // Get all sensor data related to this plant (linked via ESP32 ID)
        const history = await prisma.donnees.findMany({
            where: { Id_ESP32: plant.Id_ESP32 },
            orderBy: { Timestamp: "asc" }, // oldest → newest
            select: {
                Type_Donnee: true,
                Valeur_Donnee: true,
                Timestamp: true,
            },
        })

        // Format the data for easier use in charts
        const formatted = history.map((d) => {
            const type = d.Type_Donnee.toLowerCase()
            return {
                timestamp: d.Timestamp, // when the data was recorded
                soilMoisture:
                    type === "soilmoisture" || type === "humidite"
                        ? normalizeSoil(d.Valeur_Donnee) // corrected value
                        : null,
                temperature: type === "temperature" ? d.Valeur_Donnee : null,
                light: type.includes("light") ? d.Valeur_Donnee : null,
            }
        })

        // Return formatted data as JSON
        return NextResponse.json(formatted)
    } catch (err) {
        console.error("Error GET /api/plants/[id]/history:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
