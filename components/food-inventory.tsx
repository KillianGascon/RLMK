"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Plus, Package, Refrigerator, Home, AlertTriangle, Calendar, Trash2, Edit, Search } from "lucide-react"

interface FoodItem {
    id: string
    name: string
    category: "fruits" | "vegetables" | "dairy" | "meat" | "grains" | "beverages" | "condiments" | "frozen" | "other"
    location: "fridge" | "pantry" | "freezer" | "cellar"
    quantity: number
    unit: "kg" | "g" | "L" | "mL" | "pieces" | "packages"
    expiryDate: string
    purchaseDate: string
    minStock: number
    price?: number
    brand?: string
}

export function FoodInventory() {
    const [foodItems, setFoodItems] = useState<FoodItem[]>([
        {
            id: "1",
            name: "Lait demi-écrémé",
            category: "dairy",
            location: "fridge",
            quantity: 2,
            unit: "L",
            expiryDate: "2024-12-30",
            purchaseDate: "2024-12-20",
            minStock: 1,
            price: 1.2,
            brand: "Lactel",
        },
        {
            id: "2",
            name: "Pommes Golden",
            category: "fruits",
            location: "pantry",
            quantity: 1.5,
            unit: "kg",
            expiryDate: "2024-12-28",
            purchaseDate: "2024-12-18",
            minStock: 0.5,
            price: 2.8,
        },
        {
            id: "3",
            name: "Pain de mie",
            category: "grains",
            location: "pantry",
            quantity: 1,
            unit: "packages",
            expiryDate: "2024-12-25",
            purchaseDate: "2024-12-22",
            minStock: 1,
            price: 1.5,
        },
        {
            id: "4",
            name: "Yaourts nature",
            category: "dairy",
            location: "fridge",
            quantity: 8,
            unit: "pieces",
            expiryDate: "2024-12-27",
            purchaseDate: "2024-12-19",
            minStock: 4,
            price: 3.2,
        },
        {
            id: "5",
            name: "Pâtes",
            category: "grains",
            location: "pantry",
            quantity: 500,
            unit: "g",
            expiryDate: "2025-06-15",
            purchaseDate: "2024-11-10",
            minStock: 250,
            price: 1.8,
        },
    ])

    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedLocation, setSelectedLocation] = useState<string>("all")
    const [newItem, setNewItem] = useState({
        name: "",
        category: "other" as FoodItem["category"],
        location: "pantry" as FoodItem["location"],
        quantity: 0,
        unit: "pieces" as FoodItem["unit"],
        expiryDate: "",
        minStock: 1,
        price: 0,
        brand: "",
    })

    const [editingItem, setEditingItem] = useState<FoodItem | null>(null)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    const handleAddItem = () => {
        if (newItem.name && newItem.quantity > 0) {
            const item: FoodItem = {
                id: Date.now().toString(),
                ...newItem,
                purchaseDate: new Date().toISOString().split("T")[0],
            }
            setFoodItems([...foodItems, item])
            setNewItem({
                name: "",
                category: "other",
                location: "pantry",
                quantity: 0,
                unit: "pieces",
                expiryDate: "",
                minStock: 1,
                price: 0,
                brand: "",
            })
            setIsAddItemOpen(false)
        }
    }

    const handleDeleteItem = (itemId: string) => {
        setFoodItems(foodItems.filter((item) => item.id !== itemId))
    }

    const handleEditItem = (item: FoodItem) => {
        setEditingItem(item)
        setIsEditDialogOpen(true)
    }

    const handleUpdateItem = () => {
        if (editingItem) {
            setFoodItems(foodItems.map((item) => (item.id === editingItem.id ? editingItem : item)))
            setEditingItem(null)
            setIsEditDialogOpen(false)
        }
    }

    const getLocationIcon = (location: string) => {
        switch (location) {
            case "fridge":
                return <Refrigerator className="h-4 w-4" />
            case "freezer":
                return <Package className="h-4 w-4 text-blue-500" />
            case "pantry":
                return <Home className="h-4 w-4" />
            case "cellar":
                return <Package className="h-4 w-4 text-amber-600" />
            default:
                return <Package className="h-4 w-4" />
        }
    }

    const getLocationLabel = (location: string) => {
        const labels = {
            fridge: "Frigo",
            freezer: "Congélateur",
            pantry: "Cellier",
            cellar: "Cave",
        }
        return labels[location as keyof typeof labels] || location
    }

    const getCategoryLabel = (category: string) => {
        const labels = {
            fruits: "Fruits",
            vegetables: "Légumes",
            dairy: "Produits laitiers",
            meat: "Viande",
            grains: "Céréales",
            beverages: "Boissons",
            condiments: "Condiments",
            frozen: "Surgelés",
            other: "Autre",
        }
        return labels[category as keyof typeof labels] || category
    }

    const isExpiringSoon = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        const diffTime = expiry.getTime() - today.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 3 && diffDays >= 0
    }

    const isExpired = (expiryDate: string) => {
        const today = new Date()
        const expiry = new Date(expiryDate)
        return expiry < today
    }

    const isLowStock = (item: FoodItem) => {
        return item.quantity <= item.minStock
    }

    const filteredItems = foodItems.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.brand?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesLocation = selectedLocation === "all" || item.location === selectedLocation
        return matchesSearch && matchesLocation
    })

    const lowStockItems = foodItems.filter(isLowStock)
    const expiringSoonItems = foodItems.filter((item) => isExpiringSoon(item.expiryDate))
    const expiredItems = foodItems.filter((item) => isExpired(item.expiryDate))

    const locationStats = {
        fridge: foodItems.filter((item) => item.location === "fridge").length,
        pantry: foodItems.filter((item) => item.location === "pantry").length,
        freezer: foodItems.filter((item) => item.location === "freezer").length,
        cellar: foodItems.filter((item) => item.location === "cellar").length,
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">Gestion des stocks alimentaires</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Suivez vos provisions et évitez le gaspillage</p>
                </div>

                <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Ajouter un article</span>
                            <span className="sm:hidden">Ajouter</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouvel article</DialogTitle>
                            <DialogDescription>Ajoutez un nouvel article à votre inventaire alimentaire</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="itemName">Nom de l'article</Label>
                                <Input
                                    id="itemName"
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    placeholder="Lait, Pain, Pommes..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Select
                                        value={newItem.category}
                                        onValueChange={(value: FoodItem["category"]) => setNewItem({ ...newItem, category: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fruits">Fruits</SelectItem>
                                            <SelectItem value="vegetables">Légumes</SelectItem>
                                            <SelectItem value="dairy">Produits laitiers</SelectItem>
                                            <SelectItem value="meat">Viande</SelectItem>
                                            <SelectItem value="grains">Céréales</SelectItem>
                                            <SelectItem value="beverages">Boissons</SelectItem>
                                            <SelectItem value="condiments">Condiments</SelectItem>
                                            <SelectItem value="frozen">Surgelés</SelectItem>
                                            <SelectItem value="other">Autre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Emplacement</Label>
                                    <Select
                                        value={newItem.location}
                                        onValueChange={(value: FoodItem["location"]) => setNewItem({ ...newItem, location: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="fridge">Frigo</SelectItem>
                                            <SelectItem value="pantry">Cellier</SelectItem>
                                            <SelectItem value="freezer">Congélateur</SelectItem>
                                            <SelectItem value="cellar">Cave</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Quantité</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        value={newItem.quantity || ""}
                                        onChange={(e) => setNewItem({ ...newItem, quantity: Number.parseFloat(e.target.value) || 0 })}
                                        placeholder="1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit">Unité</Label>
                                    <Select
                                        value={newItem.unit}
                                        onValueChange={(value: FoodItem["unit"]) => setNewItem({ ...newItem, unit: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pieces">Pièces</SelectItem>
                                            <SelectItem value="kg">Kg</SelectItem>
                                            <SelectItem value="g">Grammes</SelectItem>
                                            <SelectItem value="L">Litres</SelectItem>
                                            <SelectItem value="mL">mL</SelectItem>
                                            <SelectItem value="packages">Paquets</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiryDate">Date d'expiration</Label>
                                <Input
                                    id="expiryDate"
                                    type="date"
                                    value={newItem.expiryDate}
                                    onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="minStock">Stock minimum</Label>
                                    <Input
                                        id="minStock"
                                        type="number"
                                        value={newItem.minStock || ""}
                                        onChange={(e) => setNewItem({ ...newItem, minStock: Number.parseInt(e.target.value) || 1 })}
                                        placeholder="1"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">Prix (€)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        value={newItem.price || ""}
                                        onChange={(e) => setNewItem({ ...newItem, price: Number.parseFloat(e.target.value) || 0 })}
                                        placeholder="1.50"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddItemOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleAddItem}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Alerts */}
            {(expiredItems.length > 0 || expiringSoonItems.length > 0 || lowStockItems.length > 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                    {expiredItems.length > 0 && (
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-red-800 flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    Articles expirés
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-900">{expiredItems.length}</div>
                                <p className="text-xs text-red-700">À retirer immédiatement</p>
                            </CardContent>
                        </Card>
                    )}

                    {expiringSoonItems.length > 0 && (
                        <Card className="border-orange-200 bg-orange-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Expire bientôt
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-orange-900">{expiringSoonItems.length}</div>
                                <p className="text-xs text-orange-700">Dans les 3 prochains jours</p>
                            </CardContent>
                        </Card>
                    )}

                    {lowStockItems.length > 0 && (
                        <Card className="border-yellow-200 bg-yellow-50">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-yellow-800 flex items-center gap-2">
                                    <Package className="h-4 w-4" />
                                    Stock faible
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-900">{lowStockItems.length}</div>
                                <p className="text-xs text-yellow-700">À réapprovisionner</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Frigo</CardTitle>
                        <Refrigerator className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{locationStats.fridge}</div>
                        <p className="text-xs text-muted-foreground">Articles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cellier</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{locationStats.pantry}</div>
                        <p className="text-xs text-muted-foreground">Articles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Congélateur</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{locationStats.freezer}</div>
                        <p className="text-xs text-muted-foreground">Articles</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{foodItems.length}</div>
                        <p className="text-xs text-muted-foreground">Articles</p>
                    </CardContent>
                </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher un article..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Tous les emplacements" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les emplacements</SelectItem>
                        <SelectItem value="fridge">Frigo</SelectItem>
                        <SelectItem value="pantry">Cellier</SelectItem>
                        <SelectItem value="freezer">Congélateur</SelectItem>
                        <SelectItem value="cellar">Cave</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredItems.map((item) => (
                    <Card
                        key={item.id}
                        className={`hover:shadow-md transition-shadow ${
                            isExpired(item.expiryDate)
                                ? "border-red-200 bg-red-50"
                                : isExpiringSoon(item.expiryDate)
                                    ? "border-orange-200 bg-orange-50"
                                    : isLowStock(item)
                                        ? "border-yellow-200 bg-yellow-50"
                                        : ""
                        }`}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
                                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                                        {getLocationIcon(item.location)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <CardTitle className="text-sm md:text-lg truncate">{item.name}</CardTitle>
                                        <div className="flex items-center gap-1 md:gap-2 mt-1 flex-wrap">
                                            <Badge variant="secondary" className="text-xs">
                                                {getCategoryLabel(item.category)}
                                            </Badge>
                                            <Badge variant="outline" className="text-xs">
                                                {getLocationLabel(item.location)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                    <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)}>
                                        <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id)}>
                                        <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 md:space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Quantité</span>
                                <span className="text-sm">
                  {item.quantity} {item.unit}
                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Stock</span>
                                    <span className={isLowStock(item) ? "text-yellow-600 font-medium" : ""}>
                    {Math.round((item.quantity / item.minStock) * 100)}%
                  </span>
                                </div>
                                <Progress value={Math.min((item.quantity / item.minStock) * 100, 100)} className="h-2" />
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <span>Expire le</span>
                                <span
                                    className={
                                        isExpired(item.expiryDate)
                                            ? "text-red-600 font-medium"
                                            : isExpiringSoon(item.expiryDate)
                                                ? "text-orange-600 font-medium"
                                                : "text-muted-foreground"
                                    }
                                >
                  {new Date(item.expiryDate).toLocaleDateString("fr-FR")}
                </span>
                            </div>

                            {item.brand && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>Marque</span>
                                    <span className="text-muted-foreground">{item.brand}</span>
                                </div>
                            )}

                            {item.price && item.price > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span>Prix</span>
                                    <span className="text-muted-foreground">{item.price.toFixed(2)}€</span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="w-[95vw] max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier l'article</DialogTitle>
                        <DialogDescription>Modifiez les informations de l'article</DialogDescription>
                    </DialogHeader>
                    {editingItem && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="editItemName">Nom de l'article</Label>
                                <Input
                                    id="editItemName"
                                    value={editingItem.name}
                                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="editQuantity">Quantité</Label>
                                    <Input
                                        id="editQuantity"
                                        type="number"
                                        value={editingItem.quantity || ""}
                                        onChange={(e) =>
                                            setEditingItem({ ...editingItem, quantity: Number.parseFloat(e.target.value) || 0 })
                                        }
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="editUnit">Unité</Label>
                                    <Select
                                        value={editingItem.unit}
                                        onValueChange={(value: FoodItem["unit"]) => setEditingItem({ ...editingItem, unit: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pieces">Pièces</SelectItem>
                                            <SelectItem value="kg">Kg</SelectItem>
                                            <SelectItem value="g">Grammes</SelectItem>
                                            <SelectItem value="L">Litres</SelectItem>
                                            <SelectItem value="mL">mL</SelectItem>
                                            <SelectItem value="packages">Paquets</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="editExpiryDate">Date d'expiration</Label>
                                <Input
                                    id="editExpiryDate"
                                    type="date"
                                    value={editingItem.expiryDate}
                                    onChange={(e) => setEditingItem({ ...editingItem, expiryDate: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleUpdateItem}>Sauvegarder</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {filteredItems.length === 0 && (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Package className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Aucun article trouvé</h3>
                        <p className="text-muted-foreground text-center">
                            {searchTerm || selectedLocation !== "all"
                                ? "Essayez de modifier vos critères de recherche"
                                : "Commencez par ajouter des articles à votre inventaire"}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
