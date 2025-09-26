import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

interface AddUserBody {
    userId: number
    role?: "admin" | "member"
}

// 🔹 Get all users in a household (with their role)
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // 👈 ici on attend le Promise
        const foyerId = parseInt(id, 10)

        if (isNaN(foyerId)) {
            return NextResponse.json({ error: "Invalid household ID" }, { status: 400 })
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
    } catch (error: unknown) {
        console.error("❌ Error GET household users:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}

// 🔹 Add a user to the household with their role
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params   // 👈 idem
        const foyerId = parseInt(id, 10)

        if (isNaN(foyerId)) {
            return NextResponse.json({ error: "Invalid household ID" }, { status: 400 })
        }

        const body: AddUserBody = await req.json()
        const { userId, role } = body

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 })
        }

        const link = await prisma.utilisateur_Foyer.create({
            data: {
                Id_Utilisateur: userId,
                Id_Foyer: foyerId,
                Role: role && ["admin", "member"].includes(role) ? role : "member",
            },
        })

        return NextResponse.json({ message: "User added to household", link })
    } catch (error: unknown) {
        console.error("❌ Error POST household users:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
