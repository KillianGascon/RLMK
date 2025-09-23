import { prisma } from "@/lib/prisma" // ⬅️ importer l’instance ici
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { firstName, lastName, email, password, role } = body

        // Validation basique
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma.utilisateur.findUnique({
            where: { Email_Utilisateur: email },
        })

        if (existingUser) {
            return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 400 })
        }

        // Hash du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10)

        // Insertion en BDD
        const newUser = await prisma.utilisateur.create({
            data: {
                Nom_Utilisateur: lastName,
                Prenom_Utilisateur: firstName,
                Identifiant_Utilisateur: email,
                MotDePasse_Utilisateur: hashedPassword,
                Role_Utilisateur: role || "invite",
                Email_Utilisateur: email,
                Telephone_Utilisateur: null,
            },
        })

        return NextResponse.json({ message: "Utilisateur créé", user: newUser })
    } catch (error) {
        console.error("❌ Erreur Prisma:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
