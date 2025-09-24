"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
// import { Progress } from "@/components/ui/progress"
import { Users, Home, Package, Leaf, AlertTriangle, Droplets } from "lucide-react"

export function DashboardOverview() {
    // Données simulées
    const stats = {
        users: 4,
        rooms: 8,
        foodItems: 23,
        plants: 6,
        lowStockItems: 3,
        plantsNeedingWater: 2,
    }

    const recentActivity = [
        { type: "food", message: "Lait ajouté au frigo", time: "Il y a 2h" },
        { type: "plant", message: "Basilic arrosé", time: "Il y a 4h" },
        { type: "user", message: "Marie a rejoint le foyer", time: "Hier" },
        { type: "alert", message: "Stock de pain faible", time: "Hier" },
    ]

    return (
  <div className="space-y-4 md:space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-xl md:text-2xl font-bold">Tableau de bord</h2>
        </div>
    </div>

        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:gap-4">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <Card>
                    <CardHeader>
                        <CardTitle>Activité récente</CardTitle>
                        <CardDescription>Dernières actions dans le foyer</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <div className="flex-1">
                                        <p className="text-sm font-medium">{activity.message}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
}
