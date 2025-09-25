import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET dashboard statistics and recent activity
export async function GET() {
    try {
        // Count total users
        const users = await prisma.utilisateur.count()
        // Count total rooms
        const rooms = await prisma.piece.count()
        // Count total food items
        const foodItems = await prisma.aliment.count()
        // Count total plants
        const plants = await prisma.plante.count()

        // Count food items with low stock (quantity <= 2)
        const lowStockItems = await prisma.aliment.count({
            where: { Quantite: { lte: 2 } },
        })

        // Count plants needing daily watering (frequency = "quotidien")
        const plantsNeedingWater = await prisma.plante.count({
            where: { Frequence_Arrosage: "quotidien" },
        })

        // Example: recent activity (to adapt based on your model)
        const recentActivity = [
            { type: "food", message: "Milk added to fridge", time: "2 hours ago" },
            { type: "plant", message: "Basil watered", time: "4 hours ago" },
        ]

        // Return dashboard data as JSON
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
        // Log and return a server error
        console.error("Error GET /api/dashboard:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}