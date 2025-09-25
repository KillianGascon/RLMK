// app/api/plants/[id]/history/route.ts
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

interface Params {
    params: { id: string }
}

export async function GET(req: Request, { params }: Params) {
    try {
        const plantId = parseInt(params.id)

        // Vérifier si la plante existe et a un ESP32
        const plant = await prisma.plante.findUnique({
            where: { id: plantId },
            select: { Id_ESP32: true },
        })

        if (!plant || !plant.Id_ESP32) {
            return NextResponse.json([], { status: 200 })
        }

        // Récupérer toutes les données liées à cette plante
        const history = await prisma.donnees.findMany({
            where: { Id_ESP32: plant.Id_ESP32 },
            orderBy: { Timestamp: "asc" },
            select: {
                Type_Donnee: true,
                Valeur_Donnee: true,
                Timestamp: true,
            },
        })

        // Transformer en format lisible par le graphique
        const formatted = history.map((d) => ({
            timestamp: d.Timestamp,
            soilMoisture:
                d.Type_Donnee.toLowerCase() === "soilmoisture" ||
                d.Type_Donnee.toLowerCase() === "humidite"
                    ? d.Valeur_Donnee
                    : null,
            temperature:
                d.Type_Donnee.toLowerCase() === "temperature"
                    ? d.Valeur_Donnee
                    : null,
            light:
                d.Type_Donnee.toLowerCase().includes("light")
                    ? d.Valeur_Donnee
                    : null,
        }))

        return NextResponse.json(formatted)
    } catch (err) {
        console.error("Error GET /api/plants/[id]/history:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
