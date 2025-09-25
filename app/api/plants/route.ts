import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Handle GET request to fetch all plants
export async function GET() {
    try {
        // Retrieve all plants from the database
        const plants = await prisma.plante.findMany()

        // Format each plant for the response
        const formatted = plants.map((p) => {
            return {
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
        })

        // Return the formatted list of plants as JSON
        return NextResponse.json(formatted)
    } catch (err) {
        // Log and return server error
        console.error("Erreur GET /api/plants:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// Handle POST request to create a new plant
export async function POST(req: Request) {
    try {
        // Parse request body for new plant data
        const body = await req.json()

        // Create new plant in the database
        const newPlant = await prisma.plante.create({
            data: {
                Nom_Plante: body.name,
                Espece: body.species,
                Emplacement: body.location,
                Frequence_Arrosage: body.wateringFrequency.toString(),
                Besoin_Lumiere: body.lightRequirement,
                Description_Plante: body.notes ?? null,
                Date_Plantation: body.plantedDate ? new Date(body.plantedDate) : new Date(),
                Id_Foyer: body.foyerId,
                Humidite_Optimale: body.optimalHumidity ?? null,
                Temperature_Optimale: body.optimalTemperature ?? null,
            },
        })

        // Format the newly created plant for the response
        const formatted = {
            id: newPlant.id.toString(),
            name: newPlant.Nom_Plante,
            species: newPlant.Espece,
            location: newPlant.Emplacement,
            plantedDate: newPlant.Date_Plantation?.toISOString() ?? "",
            lastWatered: "",
            wateringFrequency: parseInt(newPlant.Frequence_Arrosage) || 7,
            optimalHumidity: newPlant.Humidite_Optimale ?? 50,
            optimalTemperature: newPlant.Temperature_Optimale ?? 22,
            currentHumidity: 50,
            currentTemperature: 22,
            lightRequirement: newPlant.Besoin_Lumiere.toLowerCase() as "low" | "medium" | "high",
            status: "healthy",
            notes: newPlant.Description_Plante ?? "",
        }

        // Return the formatted new plant as JSON
        return NextResponse.json(formatted)
    } catch (err) {
        // Log and return server error
        console.error("Erreur POST /api/plants:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}