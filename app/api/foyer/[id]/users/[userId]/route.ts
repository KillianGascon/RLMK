import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
    params: { id: string; userId: string } // id = foyerId, userId = utilisateur
}

// 🔹 Modifier le rôle d’un utilisateur dans le foyer
export async function PUT(req: Request, { params }: Params) {
    const foyerId = parseInt(params.id, 10)
    const userId = parseInt(params.userId, 10)
    const { role } = await req.json()

    if (!role || !["admin", "member"].includes(role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 })
    }

    try {
        const updated = await prisma.utilisateur_Foyer.updateMany({
            where: { Id_Foyer: foyerId, Id_Utilisateur: userId },
            data: { Role: role },
        })

        if (updated.count === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé dans ce foyer" }, { status: 404 })
        }

        return NextResponse.json({ message: "Rôle mis à jour", userId, role })
    } catch (err) {
        console.error("Erreur PUT rôle:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// 🔹 Supprimer un utilisateur du foyer
export async function DELETE(req: Request, { params }: Params) {
    const foyerId = parseInt(params.id, 10)
    const userId = parseInt(params.userId, 10)

    try {
        const deleted = await prisma.utilisateur_Foyer.deleteMany({
            where: { Id_Foyer: foyerId, Id_Utilisateur: userId },
        })

        if (deleted.count === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé dans ce foyer" }, { status: 404 })
        }

        return NextResponse.json({ message: "Utilisateur supprimé du foyer", userId })
    } catch (err) {
        console.error("Erreur DELETE user:", err)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
