// app/api/esp32/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const esp32List = await prisma.eSP32.findMany({
            select: {
                id: true,
                AdresseMac_ESP32: true,
            },
        })

        return NextResponse.json(esp32List)
    } catch (error) {
        console.error("Error fetching ESP32:", error)
        return NextResponse.json(
            { error: "Failed to fetch ESP32" },
            { status: 500 }
        )
    }
}
