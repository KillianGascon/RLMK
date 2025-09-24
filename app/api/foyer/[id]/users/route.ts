import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

type Params = {
    params: { id: string }
}

// 🔹 Récupérer tous les utilisateurs d’un foyer (avec leur rôle)
export async function GET(req: Request, { params }: Params) {
    try {
        const foyerId = parseInt(params.id, 10)

        const users = await prisma.utilisateur_Foyer.findMany({
            where: { Id_Foyer: foyerId },
            include: {
                Utilisateur: true,
            },
        })

        // 🔹 Nettoyage du retour pour le front
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
export async function POST(req: Request, { params }: Params) {
    try {
        const foyerId = parseInt(params.id, 10)
        const body = await req.json()
        const { userId, role } = body

        if (!userId) {
            return NextResponse.json({ error: "userId requis" }, { status: 400 })
        }

        const link = await prisma.utilisateur_Foyer.create({
            data: {
                Id_Utilisateur: userId,
                Id_Foyer: foyerId,
                Role: role || "member", // 🔹 rôle par défaut : member
            },
        })

        return NextResponse.json({ message: "Utilisateur ajouté au foyer", link })
    } catch (error) {
        console.error("❌ Erreur POST foyer users:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
