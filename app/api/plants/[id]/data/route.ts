import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface Params {
    params: { id: string }
}

export async function GET(req: Request, { params }: Params) {
    try {
        const plantId = parseInt(params.id)

        // Vérifie si la plante existe et a un ESP32
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

        // Dernière mesure d'humidité/soil moisture
        const lastSoil = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                OR: [{ Type_Donnee: "SoilMoisture" }, { Type_Donnee: "Humidite" }],
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        // Dernière température
        const lastTemp = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                Type_Donnee: "Temperature",
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        // Dernière mesure de lumière (match générique)
        const lastLight = await prisma.donnees.findFirst({
            where: {
                Id_ESP32: plant.Id_ESP32,
                Type_Donnee: { contains: "Light" }, // 🔥 plus de `mode`
            },
            orderBy: { Timestamp: "desc" },
            select: { Valeur_Donnee: true },
        })

        return NextResponse.json({
            soilMoisture: lastSoil?.Valeur_Donnee ?? null,
            temperature: lastTemp?.Valeur_Donnee ?? null,
            light: lastLight?.Valeur_Donnee ?? null,
        })
    } catch (err) {
        console.error("Error GET /api/plants/[id]/data:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
