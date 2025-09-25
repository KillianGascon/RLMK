import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// GET all food items (optional: filter by stock)
export async function GET(req: Request) {
    try {
        // Extract search parameters from the request URL
        const { searchParams } = new URL(req.url)
        const stockId = searchParams.get("stockId")

        // Fetch food items from the database, optionally filtered by stock ID
        const aliments = await prisma.aliment.findMany({
            where: stockId ? { Id_Stock: Number(stockId) } : {},
            include: { Stock: true }, // Include related stock information
        })

        // Return the list of food items as JSON
        return NextResponse.json(aliments)
    } catch (err) {
        // Log and return a server error
        console.error("Error GET /api/aliment:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// POST a new food item
export async function POST(req: Request) {
    try {
        // Parse the request body as JSON
        const body = await req.json()
        const {
            Nom_Aliment,           // Food name
            Description_Aliment,   // Food description
            Date_Peremption,       // Expiration date
            Type_Aliment,          // Food type
            Quantite,              // Quantity
            Unite_Quantite,        // Quantity unit
            Id_Stock,              // Stock ID
        } = body

        // Validate required fields
        if (!Nom_Aliment || !Id_Stock) {
            return NextResponse.json({ error: "Nom_Aliment and Id_Stock are required" }, { status: 400 })
        }

        // Create a new food item in the database
        const newAliment = await prisma.aliment.create({
            data: {
                Nom_Aliment,
                Description_Aliment: Description_Aliment || null,
                Date_Peremption: Date_Peremption ? new Date(Date_Peremption) : null,
                Type_Aliment: Type_Aliment || null,
                Quantite: Quantite ?? null,
                Unite_Quantite: Unite_Quantite || null,
                Id_Stock,
            },
        })

        // Return the newly created food item as JSON
        return NextResponse.json(newAliment)
    } catch (err) {
        // Log and return a server error
        console.error("Error POST /api/aliment:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}