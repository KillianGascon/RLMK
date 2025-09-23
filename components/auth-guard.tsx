"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Loader2 } from "lucide-react"

interface AuthGuardProps {
    children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem("isAuthenticated")
            if (authStatus === "true") {
                setIsAuthenticated(true)
            } else {
                setIsAuthenticated(false)
                router.push("/login")
            }
        }

        checkAuth()
    }, [router])

    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4">
                            <Home className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Vérification de l'authentification...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (!isAuthenticated) {
        return null
    }

    return <>{children}</>
}
