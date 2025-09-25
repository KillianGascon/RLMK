"use client"

// Import React hooks and required UI components
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Users, Package, Leaf, LogOut, Menu } from "lucide-react"
import { DashboardOverview } from "@/components/dashboard-overview"
import { UserManagement } from "@/components/user-management"
import { RoomManagement } from "@/components/room-management"
import { FoodInventory } from "@/components/food-inventory"
import { PlantManagement } from "@/components/plant-management"

// Main dashboard page component
export default function HomePageContent() {
  // State for active tab, user role, selected household, and mobile menu
  const [activeTab, setActiveTab] = useState("dashboard")
  const [userRole, setUserRole] = useState<string | null>(null)
  const [foyerId, setFoyerId] = useState<number | null>(null)
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Load user role and selected household from localStorage after login
  useEffect(() => {
    const role = localStorage.getItem("userRole")
    const storedFoyerId = localStorage.getItem("foyerId")

    setUserRole(role)
    if (storedFoyerId) {
      setFoyerId(parseInt(storedFoyerId, 10))
    } else {
      // Redirect to household selection if none is chosen
      router.push("/foyer")
    }
  }, [router])

  // Handles logout: clears localStorage and redirects to login
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    localStorage.removeItem("userEmail")
    localStorage.removeItem("userName")
    localStorage.removeItem("userRole")
    localStorage.removeItem("token")
    localStorage.removeItem("foyerId")
    router.push("/login")
  }

  // Handles tab change and closes mobile menu
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsMenuOpen(false)
  }

  // Render header, tab navigation, and main content
  return (
      <div className="min-h-screen bg-background">
        {/* Header with app name, user role badge, and logout/menu buttons */}
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* App logo and name */}
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg">
                  <Home className="w-4 h-4 md:w-6 md:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-foreground">RLMK</h1>
                </div>
              </div>
              {/* User role badge and logout/menu buttons */}
              <div className="flex items-center gap-2 md:gap-4">
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs md:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1 md:mr-2" />
                  <span className="hidden sm:inline capitalize">
                         Rôle : {userRole}
                  </span>
                </Badge>
                {/* Mobile menu button */}
                <div className="sm:hidden relative">
                  <Button
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent p-2"
                  >
                    <Menu className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                  {/* Mobile menu dropdown */}
                  {isMenuOpen && (
                      <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-lg border shadow-lg z-50">
                        <div className="m-1">
                          {/* Tab navigation for mobile */}
                          <button
                              onClick={() => handleTabChange("dashboard")}
                              className={`flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-left hover:bg-gray-100 hover:text-primary rounded-md transition-colors ${
                                  activeTab === "dashboard" ? "bg-primary text-primary-foreground" : ""
                              }`}
                          >
                            <Home className="w-4 h-4" />
                            <span>Dashboard</span>
                          </button>
                          <button
                              onClick={() => handleTabChange("users")}
                              className={`flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-left hover:bg-gray-100 hover:text-primary rounded-md transition-colors ${
                                  activeTab === "users" ? "bg-primary text-primary-foreground" : ""
                              }`}
                          >
                            <Users className="w-4 h-4" />
                            <span>Users</span>
                          </button>
                          <button
                              onClick={() => handleTabChange("rooms")}
                              className={`flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-left hover:bg-gray-100 hover:text-primary rounded-md transition-colors ${
                                  activeTab === "rooms" ? "bg-primary text-primary-foreground" : ""
                              }`}
                          >
                            <Package className="w-4 h-4" />
                            <span>Rooms</span>
                          </button>
                          <button
                              onClick={() => handleTabChange("inventory")}
                              className={`flex items-center gap-2 w-full px-3 py-2 mt-1 text-sm text-left hover:bg-gray-100 hover:text-primary rounded-md transition-colors ${
                                  activeTab === "inventory" ? "bg-primary text-primary-foreground" : ""
                              }`}
                          >
                            <Package className="w-4 h-4" />
                            <span>Inventory</span>
                          </button>
                          <button
                              onClick={() => handleTabChange("plants")}
                              className={`flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-gray-100 hover:text-primary rounded-md transition-colors ${
                                  activeTab === "plants" ? "bg-primary text-primary-foreground" : ""
                              }`}
                          >
                            <Leaf className="w-4 h-4" />
                            <span>Plants</span>
                          </button>
                          <div className="border-t border-border my-1"></div>
                          {/* Logout button in mobile menu */}
                          <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-destructive/10 hover:text-destructive rounded-md transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                          </button>
                        </div>
                      </div>
                  )}
                </div>
                {/* Logout button for desktop */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden sm:flex text-xs md:text-sm bg-transparent"
                >
                  <LogOut className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content with tab navigation */}
        <main className="container mx-auto px-2 md:px-4 py-4 md:py-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="relative mb-4 md:mb-6">
              {/* Tab list for desktop */}
              <TabsList className="hidden sm:grid sm:grid-cols-5 sm:p-1 h-auto gap-1 sm:w-full">
                <TabsTrigger
                    value="dashboard"
                    className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1"
                >
                  <Home className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="sm:inline">Dashboard</span>
                </TabsTrigger>
                <TabsTrigger
                    value="users"
                    className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1"
                >
                  <Users className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="sm:inline">Users</span>
                </TabsTrigger>
                <TabsTrigger
                    value="rooms"
                    className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1"
                >
                  <Package className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="sm:inline">Rooms</span>
                </TabsTrigger>
                <TabsTrigger
                    value="inventory"
                    className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1"
                >
                  <Package className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="sm:inline">Inventory</span>
                </TabsTrigger>
                <TabsTrigger
                    value="plants"
                    className="flex flex-col md:flex-row items-center gap-1 md:gap-2 cursor-pointer transition-all duration-200 hover:bg-primary/10 hover:text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs md:text-sm py-2 md:py-1"
                >
                  <Leaf className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="sm:inline">Plants</span>
                </TabsTrigger>
              </TabsList>
            </div>
            {/* Tab content for each section */}
            <TabsContent value="dashboard">
              <DashboardOverview />
            </TabsContent>
            <TabsContent value="users">
              <UserManagement foyerId={foyerId!} />
            </TabsContent>
            <TabsContent value="rooms">
              <RoomManagement foyerId={foyerId!}/>
            </TabsContent>
            <TabsContent value="inventory">
              <FoodInventory foyerId={foyerId!}/>
            </TabsContent>
            <TabsContent value="plants">
              <PlantManagement foyerId={foyerId!}/>
            </TabsContent>
          </Tabs>
        </main>
      </div>
  )
}