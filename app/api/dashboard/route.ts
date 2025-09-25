import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        const users = await prisma.utilisateur.count()
        const rooms = await prisma.piece.count()
        const foodItems = await prisma.aliment.count()
        const plants = await prisma.plante.count()

        // Exemple: stock faible si Quantite <= 2
        const lowStockItems = await prisma.aliment.count({
            where: { Quantite: { lte: 2 } },
        })

        // Exemple simplifié: plantes "à arroser" si fréquence = "quotidien"
        const plantsNeedingWater = await prisma.plante.count({
            where: { Frequence_Arrosage: "quotidien" },
        })

        // Récup dernière activité → à adapter selon ton modèle
        const recentActivity = [
            { type: "food", message: "Lait ajouté au frigo", time: "Il y a 2h" },
            { type: "plant", message: "Basilic arrosé", time: "Il y a 4h" },
        ]

        return NextResponse.json({
            users,
            rooms,
            foodItems,
            plants,
            lowStockItems,
            plantsNeedingWater,
            recentActivity,
        })
    } catch (err) {
        console.error("Erreur GET /api/dashboard:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
