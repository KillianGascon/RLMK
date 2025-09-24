import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 🔹 Récupérer tous les utilisateurs d’un foyer (avec leur rôle)
export async function GET(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const foyerId = parseInt(context.params.id, 10)

        if (isNaN(foyerId)) {
            return NextResponse.json({ error: "ID du foyer invalide" }, { status: 400 })
        }

        const users = await prisma.utilisateur_Foyer.findMany({
            where: { Id_Foyer: foyerId },
            include: { Utilisateur: true },
        })

        const formatted = users.map((u) => ({
            id: u.Utilisateur.id,
            name: `${u.Utilisateur.Prenom_Utilisateur} ${u.Utilisateur.Nom_Utilisateur}`,
            email: u.Utilisateur.Email_Utilisateur,
            phone: u.Utilisateur.Telephone_Utilisateur,
            role: u.Role,
        }))

        return NextResponse.json(formatted)
    } catch (error) {
        console.error("❌ Erreur GET foyer users:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}

// 🔹 Ajouter un utilisateur au foyer avec son rôle
export async function POST(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const foyerId = parseInt(context.params.id, 10)

        if (isNaN(foyerId)) {
            return NextResponse.json({ error: "ID du foyer invalide" }, { status: 400 })
        }

        const body = await req.json()
        const { userId, role } = body

        if (!userId) {
            return NextResponse.json({ error: "userId requis" }, { status: 400 })
        }

        const link = await prisma.utilisateur_Foyer.create({
            data: {
                Id_Utilisateur: userId,
                Id_Foyer: foyerId,
                Role: role && ["admin", "member"].includes(role) ? role : "member",
            },
        })

        return NextResponse.json({ message: "Utilisateur ajouté au foyer", link })
    } catch (error) {
        console.error("❌ Erreur POST foyer users:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
