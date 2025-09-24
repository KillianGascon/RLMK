"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Users, Package, Leaf, LogOut } from "lucide-react"
import { DashboardOverview } from "@/components/dashboard-overview"
import { UserManagement } from "@/components/user-management"
import { RoomManagement } from "@/components/room-management"
import { FoodInventory } from "@/components/food-inventory"
import { PlantManagement } from "@/components/plant-management"

function HomePageContent() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [foyerId, setFoyerId] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Récupérer le rôle et le foyer stockés dans le localStorage après login
    const role = localStorage.getItem("userRole")
    const storedFoyerId = localStorage.getItem("foyerId")

    setUserRole(role)
    if (storedFoyerId) {
      setFoyerId(parseInt(storedFoyerId, 10))
    } else {
      // si pas de foyer choisi → retour à la sélection
      router.push("/foyer")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.removeItem("token")
    localStorage.removeItem("foyerId")
    router.push("/login")
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg">
                  <Home className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-foreground">RLMK</h1>
                  <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                    Gestion complète de votre foyer
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                {userRole && foyerId && (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs md:text-sm flex items-center"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1 md:mr-2" />
                      <span className="hidden sm:inline capitalize">
                        Rôle : {userRole} | Foyer #{foyerId}
                      </span>
                                        <span className="sm:hidden capitalize">
                        {userRole} | {foyerId}
                      </span>
                    </Badge>
                )}

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="text-xs md:text-sm bg-transparent"
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Déconnexion</span>
                  <span className="sm:hidden">Exit</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-2 md:px-4 py-4 md:py-6">
          {foyerId && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="mb-4 md:mb-6">
                  <TabsList className="grid w-full grid-cols-5 h-auto md:h-10 gap-1 md:gap-0 p-1 overflow-x-auto">
                    <TabsTrigger value="dashboard" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1">
                      <Home className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Tableau de bord</span>
                      <span className="sm:hidden">Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger value="users" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1">
                      <Users className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Utilisateurs</span>
                      <span className="sm:hidden">Users</span>
                    </TabsTrigger>
                    <TabsTrigger value="rooms" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1">
                      <Package className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Pièces</span>
                      <span className="sm:hidden">Rooms</span>
                    </TabsTrigger>
                    <TabsTrigger value="inventory" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1">
                      <Package className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Stocks</span>
                      <span className="sm:hidden">Stock</span>
                    </TabsTrigger>
                    <TabsTrigger value="plants" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:scale-105 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1">
                      <Leaf className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Plantes</span>
                      <span className="sm:hidden">Plants</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="dashboard">
                  <DashboardOverview />
                </TabsContent>

                <TabsContent value="users">
                  <UserManagement foyerId={foyerId} />
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
          )}
        </main>
      </div>
  )
}

export default HomePageContent
