"use client"

// Import React hooks and UI components
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Home, Package, Leaf, AlertTriangle, Droplets } from "lucide-react"

// Type for dashboard statistics
interface DashboardStats {
    users: number
    rooms: number
    foodItems: number
    plants: number
    lowStockItems: number
    plantsNeedingWater: number
    recentActivity: { type: string; message: string; time: string }[]
}

// DashboardOverview component displays stats and alerts
export function DashboardOverview() {
    // State for stats data and loading status
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch dashboard stats from API on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch("/api/dashboard")
                const data = await res.json()
                setStats(data)
            } catch (err) {
                console.error("Error fetching dashboard:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    // Show loading or error messages
    if (loading) return <p>Loading...</p>
    if (!stats) return <p>Unable to load data</p>

    // Render dashboard stats and alerts
    return (
        <div className="space-y-6">
            {/* Statistics cards for users, rooms, food items, and plants */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.users}</div>
                        <p className="text-xs text-muted-foreground">Household members</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rooms</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.rooms}</div>
                        <p className="text-xs text-muted-foreground">Configured rooms</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.foodItems}</div>
                        <p className="text-xs text-muted-foreground">Food items</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Plants</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.plants}</div>
                        <p className="text-xs text-muted-foreground">Monitored plants</p>
                    </CardContent>
                </Card>
            </div>

            {/* Alerts for low stock and plants needing water */}
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            Alerts
                        </CardTitle>
                        <CardDescription>Items needing your attention</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="flex items-center gap-3">
                                <Package className="h-4 w-4 text-orange-600" />
                                <span className="text-sm font-medium">Low stock</span>
                            </div>
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {stats.lowStockItems} items
                            </Badge>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <Droplets className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium">Watering required</span>
                            </div>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {stats.plantsNeedingWater} plants
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}