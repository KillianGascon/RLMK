"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ChooseFoyerPage() {
    const [foyers, setFoyers] = useState<{ id: number; name: string; role: string }[]>([])
    const router = useRouter()

    useEffect(() => {
        const foyersFromStorage = localStorage.getItem("userFoyers")
        if (foyersFromStorage) {
            setFoyers(JSON.parse(foyersFromStorage))
        }
    }, [])

    const handleChoose = (foyerId: number) => {
        localStorage.setItem("foyerId", foyerId.toString())
        router.push("/") // redirection vers dashboard
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Choisissez un foyer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {foyers.map((f) => (
                        <Button key={f.id} className="w-full" onClick={() => handleChoose(f.id)}>
                            {f.name} ({f.role})
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}
