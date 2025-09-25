import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_key"

// Handle user login
export async function POST(req: Request) {
    try {
        // Parse request body for email and password
        const body = await req.json()
        const { email, password } = body

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 })
        }

        // Find user by email, including household memberships
        const user = await prisma.utilisateur.findUnique({
            where: { Email_Utilisateur: email },
            include: {
                Utilisateur_Foyer: {
                    include: {
                        Foyer: true, // Include household name
                    },
                },
            },
        })

        // If user not found, return error
        if (!user) {
            return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
        }

        // Check password validity
        const validPassword = await bcrypt.compare(password, user.MotDePasse_Utilisateur)
        if (!validPassword) {
            return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 })
        }

        // Get households and roles for the user
        const foyers = user.Utilisateur_Foyer.map((uf) => ({
            id: uf.Foyer.id,
            name: uf.Foyer.Nom_Foyer,
            role: uf.Role,
        }))

        // Main role (e.g., first household)
        const role = foyers.length > 0 ? foyers[0].role : "member"

        // Generate JWT token for authentication
        const token = jwt.sign(
            {
                id: user.id,
                email: user.Email_Utilisateur,
                role,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
        )

        // Send response to frontend with user info and token
        return NextResponse.json({
            message: "Login successful",
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
        // Log and return server error
        console.error("❌ Login error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}