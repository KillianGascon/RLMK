import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Update a user's role in the household
export async function PUT(
    req: NextRequest,
    context: { params: Promise<{ id: string; userId: string }> }
) {
    const { id, userId } = await context.params   // 👈 on attend le Promise
    const foyerId = parseInt(id, 10)
    const utilisateurId = parseInt(userId, 10)
    const { role } = await req.json()

    if (!role || !["admin", "member"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    try {
        const updated = await prisma.utilisateur_Foyer.updateMany({
            where: { Id_Foyer: foyerId, Id_Utilisateur: utilisateurId },
            data: { Role: role },
        })

        if (updated.count === 0) {
            return NextResponse.json(
                { error: "User not found in this household" },
                { status: 404 }
            )
        }

        return NextResponse.json({ message: "Role updated", userId: utilisateurId, role })
    } catch (err: unknown) {
        console.error("Error PUT role:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// Remove a user from the household
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string; userId: string }> }
) {
    const { id, userId } = await context.params   // 👈 pareil ici
    const foyerId = parseInt(id, 10)
    const utilisateurId = parseInt(userId, 10)

    try {
        const deleted = await prisma.utilisateur_Foyer.deleteMany({
            where: { Id_Foyer: foyerId, Id_Utilisateur: utilisateurId },
        })

        if (deleted.count === 0) {
            return NextResponse.json(
                { error: "User not found in this household" },
                { status: 404 }
            )
        }

        return NextResponse.json({
            message: "User removed from household",
            userId: utilisateurId,
        })
    } catch (err: unknown) {
        console.error("Error DELETE user:", err)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
