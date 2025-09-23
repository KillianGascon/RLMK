import { PrismaClient } from "@prisma/client" // ⚠️ ou "@/lib/generated/prisma" si tu gardes output
import { NextResponse } from "next/server"

const prisma = new PrismaClient()

export async function GET() {
    const users = await prisma.utilisateur.findMany()
    return NextResponse.json(users)
}
