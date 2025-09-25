import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// 🔹 Get all users in a household (with their role)
export async function GET(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const foyerId = parseInt(context.params.id, 10) // Parse household ID

        if (isNaN(foyerId)) {
            // Return error if household ID is invalid
            return NextResponse.json({ error: "Invalid household ID" }, { status: 400 })
        }

        // Find all users linked to the household, including user details
        const users = await prisma.utilisateur_Foyer.findMany({
            where: { Id_Foyer: foyerId },
            include: { Utilisateur: true },
        })

        // Format user data for response
        const formatted = users.map((u) => ({
            id: u.Utilisateur.id,
            name: `${u.Utilisateur.Prenom_Utilisateur} ${u.Utilisateur.Nom_Utilisateur}`,
            email: u.Utilisateur.Email_Utilisateur,
            phone: u.Utilisateur.Telephone_Utilisateur,
            role: u.Role,
        }))

        // Return formatted user list as JSON
        return NextResponse.json(formatted)
    } catch (error) {
        // Log and return server error
        console.error("❌ Error GET household users:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// 🔹 Add a user to the household with their role
export async function POST(
    req: Request,
    context: { params: { id: string } }
) {
    try {
        const foyerId = parseInt(context.params.id, 10) // Parse household ID

        if (isNaN(foyerId)) {
            // Return error if household ID is invalid
            return NextResponse.json({ error: "Invalid household ID" }, { status: 400 })
        }

        // Parse request body for user ID and role
        const body = await req.json()
        const { userId, role } = body

        if (!userId) {
            // Return error if user ID is missing
            return NextResponse.json({ error: "userId required" }, { status: 400 })
        }

        // Create link between user and household, default role to "member" if invalid
        const link = await prisma.utilisateur_Foyer.create({
            data: {
                Id_Utilisateur: userId,
                Id_Foyer: foyerId,
                Role: role && ["admin", "member"].includes(role) ? role : "member",
            },
        })

        // Return success message and link data
        return NextResponse.json({ message: "User added to household", link })
    } catch (error) {
        // Log and return server error
        console.error("❌ Error POST household users:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}