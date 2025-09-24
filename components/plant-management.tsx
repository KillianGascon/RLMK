"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Area, AreaChart } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Plus,
    Leaf,
    Droplets,
    Thermometer,
    Sun,
    AlertTriangle,
    Calendar,
    Settings,
    TrendingUp,
    TrendingDown,
} from "lucide-react"

interface Plant {
    id: string
    name: string
    species: string
    location: string
    plantedDate: string
    lastWatered: string
    wateringFrequency: number // jours
    optimalHumidity: { min: number; max: number }
    optimalTemperature: { min: number; max: number }
    currentHumidity: number
    currentTemperature: number
    lightRequirement: "low" | "medium" | "high"
    status: "healthy" | "needs_water" | "needs_attention" | "critical"
    notes?: string
}

interface SensorData {
    timestamp: string
    humidity: number
    temperature: number
    light: number
}

export function PlantManagement() {
    const [plants, setPlants] = useState<Plant[]>([
        {
            id: "1",
            name: "Basilic",
            species: "Ocimum basilicum",
            location: "Cuisine - Fenêtre",
            plantedDate: "2024-10-15",
            lastWatered: "2024-12-22",
            wateringFrequency: 2,
            optimalHumidity: { min: 60, max: 80 },
            optimalTemperature: { min: 18, max: 25 },
            currentHumidity: 45,
            currentTemperature: 22,
            lightRequirement: "high",
            status: "needs_water",
            notes: "Arroser plus fréquemment en été",
        },
        {
            id: "2",
            name: "Monstera",
            species: "Monstera deliciosa",
            location: "Salon - Coin",
            plantedDate: "2024-08-20",
            lastWatered: "2024-12-21",
            wateringFrequency: 7,
            optimalHumidity: { min: 50, max: 70 },
            optimalTemperature: { min: 16, max: 24 },
            currentHumidity: 65,
            currentTemperature: 20,
            lightRequirement: "medium",
            status: "healthy",
        },
        {
            id: "3",
            name: "Cactus",
            species: "Echinocactus grusonii",
            location: "Bureau - Étagère",
            plantedDate: "2024-06-10",
            lastWatered: "2024-12-10",
            wateringFrequency: 14,
            optimalHumidity: { min: 20, max: 40 },
            optimalTemperature: { min: 15, max: 30 },
            currentHumidity: 35,
            currentTemperature: 23,
            lightRequirement: "high",
            status: "healthy",
        },
    ])

    // Données simulées pour les graphiques d'humidité
    const [selectedPlantId, setSelectedPlantId] = useState("1")
    const [timeRange, setTimeRange] = useState("7d")

    const generateSensorData = (plantId: string, days: number): SensorData[] => {
        const plant = plants.find((p) => p.id === plantId)
        if (!plant) return []

        const data: SensorData[] = []
        const now = new Date()

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)

            // Simulation de données avec variations réalistes
            const baseHumidity = plant.currentHumidity
            const baseTemp = plant.currentTemperature

            data.push({
                timestamp: date.toISOString().split("T")[0],
                humidity: Math.max(0, Math.min(100, baseHumidity + (Math.random() - 0.5) * 20)),
                temperature: Math.max(0, Math.min(50, baseTemp + (Math.random() - 0.5) * 8)),
                light: Math.random() * 100,
            })
        }

        return data
    }

    const sensorData = generateSensorData(selectedPlantId, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
    const selectedPlant = plants.find((p) => p.id === selectedPlantId)

    const [isAddPlantOpen, setIsAddPlantOpen] = useState(false)
    const [newPlant, setNewPlant] = useState({
        name: "",
        species: "",
        location: "",
        wateringFrequency: 7,
        lightRequirement: "medium" as Plant["lightRequirement"],
        notes: "",
    })

    const [editingPlant, setEditingPlant] = useState<Plant | null>(null)
    const [isEditPlantOpen, setIsEditPlantOpen] = useState(false)

    const handleAddPlant = () => {
        if (newPlant.name && newPlant.species) {
            const plant: Plant = {
                id: Date.now().toString(),
                ...newPlant,
                plantedDate: new Date().toISOString().split("T")[0],
                lastWatered: new Date().toISOString().split("T")[0],
                optimalHumidity: { min: 40, max: 70 },
                optimalTemperature: { min: 18, max: 25 },
                currentHumidity: 50,
                currentTemperature: 22,
                status: "healthy",
            }
            setPlants([...plants, plant])
            setNewPlant({
                name: "",
                species: "",
                location: "",
                wateringFrequency: 7,
                lightRequirement: "medium",
                notes: "",
            })
            setIsAddPlantOpen(false)
        }
    }

    const handleWaterPlant = (plantId: string) => {
        setPlants(
            plants.map((plant) =>
                plant.id === plantId
                    ? {
                        ...plant,
                        lastWatered: new Date().toISOString().split("T")[0],
                        status: plant.status === "needs_water" ? "healthy" : plant.status,
                        currentHumidity: Math.min(plant.currentHumidity + 20, 100), // Simulate humidity increase
                    }
                    : plant,
            ),
        )
    }

    const handleEditPlant = (plant: Plant) => {
        setEditingPlant(plant)
        setIsEditPlantOpen(true)
    }

    const handleUpdatePlant = () => {
        if (editingPlant) {
            setPlants(plants.map((plant) => (plant.id === editingPlant.id ? editingPlant : plant)))
            setEditingPlant(null)
            setIsEditPlantOpen(false)
        }
    }

    const handleDeletePlant = (plantId: string) => {
        setPlants(plants.filter((plant) => plant.id !== plantId))
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "healthy":
                return "text-green-600 bg-green-100"
            case "needs_water":
                return "text-blue-600 bg-blue-100"
            case "needs_attention":
                return "text-orange-600 bg-orange-100"
            case "critical":
                return "text-red-600 bg-red-100"
            default:
                return "text-gray-600 bg-gray-100"
        }
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            healthy: "En bonne santé",
            needs_water: "Besoin d'eau",
            needs_attention: "Attention requise",
            critical: "Critique",
        }
        return labels[status as keyof typeof labels] || status
    }

    const getLightIcon = (requirement: string) => {
        switch (requirement) {
            case "low":
                return <Sun className="h-4 w-4 text-yellow-400" />
            case "medium":
                return <Sun className="h-4 w-4 text-yellow-500" />
            case "high":
                return <Sun className="h-4 w-4 text-yellow-600" />
            default:
                return <Sun className="h-4 w-4" />
        }
    }

    const needsWaterCount = plants.filter((p) => p.status === "needs_water").length
    const needsAttentionCount = plants.filter((p) => p.status === "needs_attention" || p.status === "critical").length
    const healthyCount = plants.filter((p) => p.status === "healthy").length

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">Gestion des plantes</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                      Surveillez la santé de vos plantes avec des données en temps réel
                    </p>
                </div>

                <Dialog open={isAddPlantOpen} onOpenChange={setIsAddPlantOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter une plante
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une nouvelle plante</DialogTitle>
                            <DialogDescription>Ajoutez une nouvelle plante à votre collection</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="plantName">Nom de la plante</Label>
                                <Input
                                    id="plantName"
                                    value={newPlant.name}
                                    onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })}
                                    placeholder="Basilic, Monstera..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="species">Espèce</Label>
                                <Input
                                    id="species"
                                    value={newPlant.species}
                                    onChange={(e) => setNewPlant({ ...newPlant, species: e.target.value })}
                                    placeholder="Ocimum basilicum..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="location">Emplacement</Label>
                                <Input
                                    id="location"
                                    value={newPlant.location}
                                    onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })}
                                    placeholder="Cuisine - Fenêtre..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="wateringFreq">Arrosage (jours)</Label>
                                    <Input
                                        id="wateringFreq"
                                        type="number"
                                        value={newPlant.wateringFrequency || ""}
                                        onChange={(e) =>
                                            setNewPlant({ ...newPlant, wateringFrequency: Number.parseInt(e.target.value) || 7 })
                                        }
                                        placeholder="7"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="lightReq">Besoin en lumière</Label>
                                    <Select
                                        value={newPlant.lightRequirement}
                                        onValueChange={(value: Plant["lightRequirement"]) =>
                                            setNewPlant({ ...newPlant, lightRequirement: value })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="low">Faible</SelectItem>
                                            <SelectItem value="medium">Moyen</SelectItem>
                                            <SelectItem value="high">Élevé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddPlantOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleAddPlant}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Plant Dialog */}
                <Dialog open={isEditPlantOpen} onOpenChange={setIsEditPlantOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Modifier la plante</DialogTitle>
                            <DialogDescription>Modifiez les paramètres de votre plante</DialogDescription>
                        </DialogHeader>
                        {editingPlant && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editName">Nom de la plante</Label>
                                        <Input
                                            id="editName"
                                            value={editingPlant.name}
                                            onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editSpecies">Espèce</Label>
                                        <Input
                                            id="editSpecies"
                                            value={editingPlant.species}
                                            onChange={(e) => setEditingPlant({ ...editingPlant, species: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="editLocation">Emplacement</Label>
                                    <Input
                                        id="editLocation"
                                        value={editingPlant.location}
                                        onChange={(e) => setEditingPlant({ ...editingPlant, location: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="editWateringFreq">Fréquence d'arrosage (jours)</Label>
                                        <Input
                                            id="editWateringFreq"
                                            type="number"
                                            value={editingPlant.wateringFrequency}
                                            onChange={(e) =>
                                                setEditingPlant({ ...editingPlant, wateringFrequency: Number.parseInt(e.target.value) || 7 })
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="editLightReq">Besoin en lumière</Label>
                                        <Select
                                            value={editingPlant.lightRequirement}
                                            onValueChange={(value: Plant["lightRequirement"]) =>
                                                setEditingPlant({ ...editingPlant, lightRequirement: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="low">Faible</SelectItem>
                                                <SelectItem value="medium">Moyen</SelectItem>
                                                <SelectItem value="high">Élevé</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <Label>Conditions optimales</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm">Humidité (%)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={editingPlant.optimalHumidity.min}
                                                    onChange={(e) =>
                                                        setEditingPlant({
                                                            ...editingPlant,
                                                            optimalHumidity: {
                                                                ...editingPlant.optimalHumidity,
                                                                min: Number.parseInt(e.target.value) || 0,
                                                            },
                                                        })
                                                    }
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={editingPlant.optimalHumidity.max}
                                                    onChange={(e) =>
                                                        setEditingPlant({
                                                            ...editingPlant,
                                                            optimalHumidity: {
                                                                ...editingPlant.optimalHumidity,
                                                                max: Number.parseInt(e.target.value) || 100,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm">Température (°C)</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    type="number"
                                                    placeholder="Min"
                                                    value={editingPlant.optimalTemperature.min}
                                                    onChange={(e) =>
                                                        setEditingPlant({
                                                            ...editingPlant,
                                                            optimalTemperature: {
                                                                ...editingPlant.optimalTemperature,
                                                                min: Number.parseInt(e.target.value) || 0,
                                                            },
                                                        })
                                                    }
                                                />
                                                <Input
                                                    type="number"
                                                    placeholder="Max"
                                                    value={editingPlant.optimalTemperature.max}
                                                    onChange={(e) =>
                                                        setEditingPlant({
                                                            ...editingPlant,
                                                            optimalTemperature: {
                                                                ...editingPlant.optimalTemperature,
                                                                max: Number.parseInt(e.target.value) || 40,
                                                            },
                                                        })
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="editNotes">Notes</Label>
                                    <Input
                                        id="editNotes"
                                        value={editingPlant.notes || ""}
                                        onChange={(e) => setEditingPlant({ ...editingPlant, notes: e.target.value })}
                                        placeholder="Notes sur l'entretien..."
                                    />
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        variant="destructive"
                                        onClick={() => {
                                            handleDeletePlant(editingPlant.id)
                                            setIsEditPlantOpen(false)
                                        }}
                                    >
                                        Supprimer la plante
                                    </Button>
                                    <div className="flex gap-2">
                                        <Button variant="outline" onClick={() => setIsEditPlantOpen(false)}>
                                            Annuler
                                        </Button>
                                        <Button onClick={handleUpdatePlant}>Sauvegarder</Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total plantes</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plants.length}</div>
                        <p className="text-xs text-muted-foreground">Plantes surveillées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En bonne santé</CardTitle>
                        <Leaf className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
                        <p className="text-xs text-muted-foreground">Plantes saines</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Besoin d'eau</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{needsWaterCount}</div>
                        <p className="text-xs text-muted-foreground">À arroser</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attention</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{needsAttentionCount}</div>
                        <p className="text-xs text-muted-foreground">Surveillance requise</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full h-auto gap-1 grid-cols-2">
                    <TabsTrigger className="hover:bg-card rounded-md" value="overview">Vue d'ensemble</TabsTrigger>
                    <TabsTrigger className="hover:bg-card rounded-md" value="analytics">Graphiques & Analyses</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    {/* Plants Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plants.map((plant) => (
                            <Card key={plant.id}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Leaf className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{plant.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground italic">{plant.species}</p>
                                            </div>
                                        </div>
                                        <Badge className={getStatusColor(plant.status)}>{getStatusLabel(plant.status)}</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-sm text-muted-foreground">📍 {plant.location}</div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                                <span>Humidité</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>{plant.currentHumidity}%</span>
                                                    <span className="text-muted-foreground">
                            {plant.optimalHumidity.min}-{plant.optimalHumidity.max}%
                          </span>
                                                </div>
                                                <Progress value={plant.currentHumidity} className="h-2" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Thermometer className="h-4 w-4 text-red-500" />
                                                <span>Température</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>{plant.currentTemperature}°C</span>
                                                    <span className="text-muted-foreground">
                            {plant.optimalTemperature.min}-{plant.optimalTemperature.max}°C
                          </span>
                                                </div>
                                                <Progress value={(plant.currentTemperature / 40) * 100} className="h-2" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {getLightIcon(plant.lightRequirement)}
                                            <span>
                        Lumière{" "}
                                                {plant.lightRequirement === "low"
                                                    ? "faible"
                                                    : plant.lightRequirement === "medium"
                                                        ? "moyenne"
                                                        : "élevée"}
                      </span>
                                        </div>
                                        <span className="text-muted-foreground">Arrosage tous les {plant.wateringFrequency}j</span>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <span>Dernier arrosage</span>
                                        <span className="text-muted-foreground">
                      {new Date(plant.lastWatered).toLocaleDateString("fr-FR")}
                    </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 bg-transparent"
                                            onClick={() => handleWaterPlant(plant.id)}
                                        >
                                            <Droplets className="h-4 w-4 mr-2" />
                                            Arroser
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => handleEditPlant(plant)}>
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    {/* Chart Controls */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <Label htmlFor="plantSelect">Sélectionner une plante</Label>
                            <Select value={selectedPlantId} onValueChange={setSelectedPlantId}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {plants.map((plant) => (
                                        <SelectItem key={plant.id} value={plant.id}>
                                            {plant.name} - {plant.species}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="timeRange">Période</Label>
                            <Select value={timeRange} onValueChange={setTimeRange}>
                                <SelectTrigger className="w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="7d">7 jours</SelectItem>
                                    <SelectItem value="30d">30 jours</SelectItem>
                                    <SelectItem value="90d">90 jours</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {selectedPlant && (
                        <>
                            {/* Current Status */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Leaf className="h-5 w-5 text-green-600" />
                                        {selectedPlant.name} - État actuel
                                    </CardTitle>
                                    <CardDescription>Conditions actuelles et recommandations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                                <span className="font-medium">Humidité</span>
                                            </div>
                                            <div className="text-2xl font-bold">{selectedPlant.currentHumidity}%</div>
                                            <div className="text-sm text-muted-foreground">
                                                Optimal: {selectedPlant.optimalHumidity.min}-{selectedPlant.optimalHumidity.max}%
                                            </div>
                                            {selectedPlant.currentHumidity < selectedPlant.optimalHumidity.min && (
                                                <div className="flex items-center gap-1 text-sm text-orange-600">
                                                    <TrendingDown className="h-4 w-4" />
                                                    Trop sec
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Thermometer className="h-4 w-4 text-red-500" />
                                                <span className="font-medium">Température</span>
                                            </div>
                                            <div className="text-2xl font-bold">{selectedPlant.currentTemperature}°C</div>
                                            <div className="text-sm text-muted-foreground">
                                                Optimal: {selectedPlant.optimalTemperature.min}-{selectedPlant.optimalTemperature.max}°C
                                            </div>
                                            {selectedPlant.currentTemperature >= selectedPlant.optimalTemperature.min &&
                                                selectedPlant.currentTemperature <= selectedPlant.optimalTemperature.max && (
                                                    <div className="flex items-center gap-1 text-sm text-green-600">
                                                        <TrendingUp className="h-4 w-4" />
                                                        Idéal
                                                    </div>
                                                )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4 text-purple-500" />
                                                <span className="font-medium">Prochain arrosage</span>
                                            </div>
                                            <div className="text-2xl font-bold">
                                                {(() => {
                                                    const lastWatered = new Date(selectedPlant.lastWatered)
                                                    const nextWatering = new Date(lastWatered)
                                                    nextWatering.setDate(lastWatered.getDate() + selectedPlant.wateringFrequency)
                                                    const today = new Date()
                                                    const diffTime = nextWatering.getTime() - today.getTime()
                                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                                                    return diffDays <= 0 ? "Maintenant" : `${diffDays}j`
                                                })()}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Fréquence: {selectedPlant.wateringFrequency} jours
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Humidity Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Évolution de l'humidité</CardTitle>
                                    <CardDescription>
                                        Suivi de l'humidité sur les{" "}
                                        {timeRange === "7d"
                                            ? "7 derniers jours"
                                            : timeRange === "30d"
                                                ? "30 derniers jours"
                                                : "90 derniers jours"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            humidity: {
                                                label: "Humidité (%)",
                                                color: "hsl(var(--chart-1))",
                                            },
                                            optimal: {
                                                label: "Zone optimale",
                                                color: "hsl(var(--chart-2))",
                                            },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={sensorData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="timestamp"
                                                    tickFormatter={(value) =>
                                                        new Date(value).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
                                                    }
                                                />
                                                <YAxis domain={[0, 100]} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="humidity"
                                                    stroke="var(--color-humidity)"
                                                    fill="var(--color-humidity)"
                                                    fillOpacity={0.3}
                                                />
                                                {/* Zone optimale */}
                                                <Area
                                                    type="monotone"
                                                    dataKey={() => selectedPlant.optimalHumidity.max}
                                                    stroke="var(--color-optimal)"
                                                    fill="var(--color-optimal)"
                                                    fillOpacity={0.1}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey={() => selectedPlant.optimalHumidity.min}
                                                    stroke="var(--color-optimal)"
                                                    fill="transparent"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>

                            {/* Temperature Chart */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Évolution de la température</CardTitle>
                                    <CardDescription>
                                        Suivi de la température sur les{" "}
                                        {timeRange === "7d"
                                            ? "7 derniers jours"
                                            : timeRange === "30d"
                                                ? "30 derniers jours"
                                                : "90 derniers jours"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer
                                        config={{
                                            temperature: {
                                                label: "Température (°C)",
                                                color: "hsl(var(--chart-3))",
                                            },
                                        }}
                                        className="h-[300px]"
                                    >
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={sensorData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis
                                                    dataKey="timestamp"
                                                    tickFormatter={(value) =>
                                                        new Date(value).toLocaleDateString("fr-FR", { month: "short", day: "numeric" })
                                                    }
                                                />
                                                <YAxis domain={[0, 40]} />
                                                <ChartTooltip content={<ChartTooltipContent />} />
                                                <Line
                                                    type="monotone"
                                                    dataKey="temperature"
                                                    stroke="var(--color-temperature)"
                                                    strokeWidth={2}
                                                    dot={{ fill: "var(--color-temperature)" }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        </>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
