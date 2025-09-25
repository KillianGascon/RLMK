"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Home, Package, Leaf, AlertTriangle, Droplets } from "lucide-react"

interface DashboardStats {
    users: number
    rooms: number
    foodItems: number
    plants: number
    lowStockItems: number
    plantsNeedingWater: number
    recentActivity: { type: string; message: string; time: string }[]
}

export function DashboardOverview() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard")
                const data = await res.json()
                setStats(data)
            } catch (err) {
                console.error("Erreur fetch dashboard:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    if (loading) return <p>Chargement...</p>
    if (!stats) return <p>Impossible de charger les données</p>

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Membres du foyer</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pièces</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rooms}</div>
                        <p className="text-xs text-muted-foreground">Pièces configurées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Stocks</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.foodItems}</div>
                        <p className="text-xs text-muted-foreground">Articles alimentaires</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plantes</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.plants}</div>
                        <p className="text-xs text-muted-foreground">Plantes surveillées</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts and Status */}
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Alertes
                        </CardTitle>
                        <CardDescription>Éléments nécessitant votre attention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-3">
                                <Package className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium">Stock faible</span>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {stats.lowStockItems} articles
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <Droplets className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Arrosage requis</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {stats.plantsNeedingWater} plantes
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
