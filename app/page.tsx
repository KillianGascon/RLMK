"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Users, Package, Leaf, LogOut } from "lucide-react"
import { DashboardOverview } from "@/components/dashboard-overview"
import { UserManagement } from "@/components/user-management"
import { RoomManagement } from "@/components/room-management"
import { FoodInventory } from "@/components/food-inventory"
import { PlantManagement } from "@/components/plant-management"
import { AuthGuard } from "@/components/auth-guard"
import { useRouter } from "next/navigation"

function HomePageContent() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const router = useRouter()

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    router.push("/login")
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  <Home className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">HomeManager</h1>
                  <p className="text-sm text-muted-foreground">Gestion complète de votre foyer</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  Système actif
                </Badge>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Tableau de bord
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Utilisateurs
              </TabsTrigger>
              <TabsTrigger value="rooms" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Pièces
              </TabsTrigger>
              <TabsTrigger value="inventory" className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Stocks
              </TabsTrigger>
              <TabsTrigger value="plants" className="flex items-center gap-2">
                <Leaf className="w-4 h-4" />
                Plantes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="rooms">
              <RoomManagement />
            </TabsContent>

            <TabsContent value="inventory">
              <FoodInventory />
            </TabsContent>

            <TabsContent value="plants">
              <PlantManagement />
            </TabsContent>
          </Tabs>
        </main>
      </div>
  )
}

export default function HomePage() {
  return (
      <AuthGuard>
        <HomePageContent />
      </AuthGuard>
  )
}
