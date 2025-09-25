import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Define the type for route parameters
interface Params {
    params: { id: string }
}

// 🔵 GET a single plant by ID
export async function GET(req: Request, { params }: Params) {
    try {
        // Parse plant ID from route parameters
        const plantId = parseInt(params.id)
        // Fetch plant from database
        const p = await prisma.plante.findUnique({ where: { id: plantId } })

        // If plant not found, return 404 error
        if (!p) {
            return NextResponse.json({ error: "Plant not found" }, { status: 404 })
        }

        // Format plant data for response
        const formatted = {
            id: p.id.toString(),
            name: p.Nom_Plante,
            species: p.Espece,
            location: p.Emplacement,
            plantedDate: p.Date_Plantation?.toISOString() ?? "",
            lastWatered: "",
            wateringFrequency: parseInt(p.Frequence_Arrosage) || 7,
            optimalHumidity: p.Humidite_Optimale ? Number(p.Humidite_Optimale) : 50,
            optimalTemperature: p.Temperature_Optimale ? Number(p.Temperature_Optimale) : 22,
            currentHumidity: 50,
            currentTemperature: 22,
            lightRequirement: p.Besoin_Lumiere.toLowerCase() as "low" | "medium" | "high",
            status: "healthy",
            notes: p.Description_Plante ?? "",
        }

        // Return formatted plant data as JSON
        return NextResponse.json(formatted)
    } catch (err) {
        // Log and return server error
        console.error("Error GET /api/plants/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// 🟡 PUT update plant by ID
export async function PUT(req: Request, { params }: Params) {
    try {
        // Parse plant ID from route parameters
        const plantId = parseInt(params.id)
        // Parse request body for updated plant data
        const body = await req.json()

        // Update plant in database
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
            },
        })

        // Return updated plant data as JSON
        return NextResponse.json(updated)
    } catch (err) {
        // Log and return server error
        console.error("Error PUT /api/plants/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// 🔴 DELETE plant by ID
export async function DELETE(req: Request, { params }: Params) {
    try {
        // Parse plant ID from route parameters
        const plantId = parseInt(params.id)

        // Delete plant from database
        await prisma.plante.delete({
            where: { id: plantId },
        })

        // Return success response
        return NextResponse.json({ success: true })
    } catch (err) {
        // Log and return server error
        console.error("Error DELETE /api/plants/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}