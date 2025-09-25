import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// Handle POST request for user registration
export async function POST(req: Request) {
    try {
        // Parse request body for user details
        const body = await req.json()
        const { firstName, lastName, email, password } = body

        // Basic validation for required fields
        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Check if user already exists by email
        const existingUser = await prisma.utilisateur.findUnique({
            where: { Email_Utilisateur: email },
        })

        if (existingUser) {
            return NextResponse.json({ error: "Email already in use" }, { status: 400 })
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10)

        // Create new user in the database
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

        // Check if a household (foyer) already exists
        const existingFoyer = await prisma.foyer.findFirst()

        let foyerId: number
        let role: "admin" | "invite"

        if (!existingFoyer) {
            // First user: create a new household and assign admin role
            const foyer = await prisma.foyer.create({
                data: { Nom_Foyer: `${lastName}-foyer` },
            })
            foyerId = foyer.id
            role = "admin"
        } else {
            // Household exists: assign invite role
            foyerId = existingFoyer.id
            role = "invite"
        }

        // Associate user with household and assign role
        await prisma.utilisateur_Foyer.create({
            data: {
                Id_Utilisateur: newUser.id,
                Id_Foyer: foyerId,
                Role: role,
            },
        })

        // Return success response with user and household info
        return NextResponse.json({
            message: "User created and associated with household",
            user: newUser,
            foyerId,
            role,
        })
    } catch (error) {
        // Log and return server error
        console.error("❌ Prisma error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}