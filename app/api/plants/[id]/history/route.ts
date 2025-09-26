import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Helper function to invert and clamp soil moisture values
function normalizeSoil(value: number): number {
    const corrected = 100 - value
    return Math.max(0, Math.min(100, corrected)) // clamp between 0 and 100
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }   // ✅ corrige ici
) {
    try {
        const { id } = await context.params           // ✅ on attend le Promise
        const plantId = parseInt(id, 10)

        if (isNaN(plantId)) {
            return NextResponse.json({ error: "Invalid plant ID" }, { status: 400 })
        }

        const plant = await prisma.plante.findUnique({
            where: { id: plantId },
            select: { Id_ESP32: true },
        })

        if (!plant || !plant.Id_ESP32) {
            return NextResponse.json([], { status: 200 })
        }

        const history = await prisma.donnees.findMany({
            where: { Id_ESP32: plant.Id_ESP32 },
            orderBy: { Timestamp: "asc" },
            select: {
                Type_Donnee: true,
                Valeur_Donnee: true,
                Timestamp: true,
            },
        })

        const formatted = history.map((d) => {
            const type = d.Type_Donnee.toLowerCase()
            return {
                timestamp: d.Timestamp,
                soilMoisture:
                    type === "soilmoisture" || type === "humidite"
                        ? normalizeSoil(d.Valeur_Donnee)
                        : null,
                temperature: type === "temperature" ? d.Valeur_Donnee : null,
                light: type.includes("light") ? d.Valeur_Donnee : null,
            }
        })

        return NextResponse.json(formatted)
    } catch (err) {
        console.error("Error GET /api/plants/[id]/history:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
