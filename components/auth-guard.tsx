"use client"

// Import React types and hooks
import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Home, Loader2 } from "lucide-react"

// Props type for AuthGuard: expects children to render if authenticated
interface AuthGuardProps {
    children: React.ReactNode
}

// AuthGuard component to protect routes
export function AuthGuard({ children }: AuthGuardProps) {
    // State to track authentication status: true, false, or null (loading)
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
    const router = useRouter()

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = () => {
            const authStatus = localStorage.getItem("isAuthenticated")
            if (authStatus === "true") {
                setIsAuthenticated(true) // User is authenticated
            } else {
                setIsAuthenticated(false) // Not authenticated
                router.push("/login") // Redirect to login
            }
        }

        checkAuth()
    }, [router])

    // Show loading spinner while checking authentication
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mb-4">
                            <Home className="w-8 h-8 text-primary-foreground" />
                        </div>
                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Checking authentication...</p>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // If not authenticated, render nothing (redirect happens)
    if (!isAuthenticated) {
        return null
    }

    // If authenticated, render children components
    return <>{children}</>
}