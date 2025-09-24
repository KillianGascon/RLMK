import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: "Champs manquants" }, { status: 400 })
        }

        // Vérifier si l’utilisateur existe
        const user = await prisma.utilisateur.findUnique({
            where: { Email_Utilisateur: email },
            include: {
                Utilisateur_Foyer: {
                    include: {
                        Foyer: true, // 🔹 pour récupérer le nom du foyer
                    },
                },
            },
        })

        if (!user) {
            return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
        }

        // Vérifier le mot de passe
        const validPassword = await bcrypt.compare(password, user.MotDePasse_Utilisateur)
        if (!validPassword) {
            return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 })
        }

        // Récupérer les foyers + rôles
        const foyers = user.Utilisateur_Foyer.map((uf) => ({
            id: uf.Foyer.id,
            name: uf.Foyer.Nom_Foyer,
            role: uf.Role,
        }))

        // Rôle principal (ex: premier foyer)
        const role = foyers.length > 0 ? foyers[0].role : "member"

        // Générer un JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.Email_Utilisateur,
                role,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        // Réponse envoyée au frontend
        return NextResponse.json({
            message: "Connexion réussie",
            token,
            user: {
                id: user.id,
                name: `${user.Prenom_Utilisateur} ${user.Nom_Utilisateur}`,
                email: user.Email_Utilisateur,
                role,
                foyers,
            },
        })
    } catch (error) {
        console.error("❌ Erreur login:", error)
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }
}
