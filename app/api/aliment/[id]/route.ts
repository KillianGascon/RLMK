import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// PUT (update a food item)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
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

        // Update the food item in the database
        const updatedAliment = await prisma.aliment.update({
            where: { id: Number(params.id) }, // Find by ID
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

        // Return the updated food item as JSON
        return NextResponse.json(updatedAliment)
    } catch (err) {
        // Log and return a server error
        console.error("Error PUT /api/aliment/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// DELETE (delete a food item)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        // Delete the food item from the database
        await prisma.aliment.delete({
            where: { id: Number(params.id) },
        })
        // Return success response
        return NextResponse.json({ success: true })
    } catch (err) {
        // Log and return a server error
        console.error("Error DELETE /api/aliment/[id]:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}