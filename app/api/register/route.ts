import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { firstName, lastName, email, password } = body

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

        // Créer utilisateur
        const newUser = await prisma.utilisateur.create({
            data: {
                Nom_Utilisateur: lastName,
                Prenom_Utilisateur: firstName,
                Identifiant_Utilisateur: email,
                MotDePasse_Utilisateur: hashedPassword,
                Email_Utilisateur: email,
                Telephone_Utilisateur: null,
            },
        })

        // Vérifier s'il existe déjà un foyer
        const existingFoyer = await prisma.foyer.findFirst()

        let foyerId: number
        let role: "admin" | "member"

        if (!existingFoyer) {
            // Premier utilisateur => créer un foyer
            const foyer = await prisma.foyer.create({
                data: { Nom_Foyer: `${lastName}-foyer` },
            })
            foyerId = foyer.id
            role = "admin"
        } else {
            // Foyer déjà existant => membre simple
            foyerId = existingFoyer.id
            role = "member"
        }

        // Associer l’utilisateur au foyer avec un rôle
        await prisma.utilisateur_Foyer.create({
            data: {
                Id_Utilisateur: newUser.id,
                Id_Foyer: foyerId,
                Role: role,
            },
        })

        return NextResponse.json({
            message: "Utilisateur créé et associé au foyer",
            user: newUser,
            foyerId,
            role,
        })
    } catch (error) {
        console.error("❌ Erreur Prisma:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
