import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
    params: { id: string; userId: string } // id = foyerId, userId = utilisateur
}

// 🔹 Update a user's role in the household
export async function PUT(req: Request, { params }: Params) {
    const foyerId = parseInt(params.id, 10) // Parse household ID
    const userId = parseInt(params.userId, 10) // Parse user ID
    const { role } = await req.json() // Extract role from request body

    // Validate role value
    if (!role || !["admin", "member"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    try {
        // Update the user's role in the household
        const updated = await prisma.utilisateur_Foyer.updateMany({
            where: { Id_Foyer: foyerId, Id_Utilisateur: userId },
            data: { Role: role },
        })

        // If no user was updated, return not found
        if (updated.count === 0) {
            return NextResponse.json({ error: "User not found in this household" }, { status: 404 })
        }

        // Return success response
        return NextResponse.json({ message: "Role updated", userId, role })
    } catch (err) {
        // Log and return a server error
        console.error("Error PUT role:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// 🔹 Remove a user from the household
export async function DELETE(req: Request, { params }: Params) {
    const foyerId = parseInt(params.id, 10) // Parse household ID
    const userId = parseInt(params.userId, 10) // Parse user ID

    try {
        // Delete the user from the household
        const deleted = await prisma.utilisateur_Foyer.deleteMany({
            where: { Id_Foyer: foyerId, Id_Utilisateur: userId },
        })

        // If no user was deleted, return not found
        if (deleted.count === 0) {
            return NextResponse.json({ error: "User not found in this household" }, { status: 404 })
        }

        // Return success response
        return NextResponse.json({ message: "User removed from household", userId })
    } catch (err) {
        // Log and return a server error
        console.error("Error DELETE user:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}