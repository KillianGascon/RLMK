"use client"

import { useEffect, useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
    ResponsiveContainer,
    Area,
    AreaChart,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
    Plus,
    Leaf,
    Droplets,
    Thermometer,
    Sun,
    AlertTriangle,
    Settings,
} from "lucide-react"

// --- Types describing Plant and Sensor data ---
interface Plant {
    id: string
    name: string
    species: string
    location: string
    plantedDate: string
    lastWatered: string
    wateringFrequency: number
    optimalHumidity?: number
    optimalTemperature?: number
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

export function PlantManagement({ foyerId }: { foyerId: number }) {
    // --- State for plants and loading status ---
    const [plants, setPlants] = useState<Plant[]>([])
    const [loading, setLoading] = useState(true)

    // --- Fetch all plants from API on mount ---
    useEffect(() => {
        const fetchPlants = async () => {
            try {
                const res = await fetch("/api/plants")
                const data = await res.json()
                setPlants(data)
            } catch (err) {
                console.error("Error fetching plants:", err)
            } finally {
                setLoading(false)
            }
        }
        fetchPlants()
    }, [])

    // --- State for sensor data (mocked) ---
    const [selectedPlantId, setSelectedPlantId] = useState<string>("")
    const [timeRange, setTimeRange] = useState("7d")

    // Auto-select first plant if none is selected
    useEffect(() => {
        if (plants.length > 0 && !selectedPlantId) {
            setSelectedPlantId(plants[0].id)
        }
    }, [plants, selectedPlantId])

    // Function to generate fake sensor data (humidity, temp, light)
    const generateSensorData = (plant: Plant, days: number): SensorData[] => {
        const data: SensorData[] = []
        const now = new Date()

        // Create a record for each day
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(now)
            date.setDate(date.getDate() - i)

            data.push({
                timestamp: date.toISOString().split("T")[0], // YYYY-MM-DD
                humidity: Math.max(0, Math.min(100, plant.currentHumidity + (Math.random() - 0.5) * 20)),
                temperature: Math.max(0, Math.min(50, plant.currentTemperature + (Math.random() - 0.5) * 8)),
                light: Math.random() * 100,
            })
        }

        return data
    }

    // Find the selected plant
    const selectedPlant = plants.find((p) => p.id === selectedPlantId)
    // Generate sensor data depending on the selected time range
    const sensorData = selectedPlant
        ? generateSensorData(selectedPlant, timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90)
        : []

    // --- State for dialogs and plant forms ---
    const [isAddPlantOpen, setIsAddPlantOpen] = useState(false)
    const [newPlant, setNewPlant] = useState({
        name: "",
        species: "",
        location: "",
        wateringFrequency: 7,
        optimalHumidity: 50,
        optimalTemperature: 22,
        plantedDate: "",
        notes: "",
        lightRequirement: "medium" as Plant["lightRequirement"],
    })

    const [editingPlant, setEditingPlant] = useState<Plant | null>(null)
    const [isEditPlantOpen, setIsEditPlantOpen] = useState(false)

    // --- CRUD actions for plants ---
    // Add a new plant
    const handleAddPlant = async () => {
        try {
            const res = await fetch("/api/plants", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...newPlant,
                    foyerId, // Attach foyerId
                }),
            })
            if (res.ok) {
                const created = await res.json()
                setPlants([...plants, created])
                setIsAddPlantOpen(false)
            }
        } catch (err) {
            console.error("Error adding plant:", err)
        }
    }

    // Update a plant
    const handleUpdatePlant = async () => {
        if (!editingPlant) return
        try {
            const res = await fetch(`/api/plants/${editingPlant.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editingPlant),
            })
            if (res.ok) {
                setPlants(plants.map((p) => (p.id === editingPlant.id ? editingPlant : p)))
            }
        } catch (err) {
            console.error("Error updating plant:", err)
        }
        setIsEditPlantOpen(false)
    }

    // Delete a plant
    const handleDeletePlant = async (plantId: string) => {
        try {
            const res = await fetch(`/api/plants/${plantId}`, { method: "DELETE" })
            if (res.ok) {
                setPlants(plants.filter((p) => p.id !== plantId))
            }
        } catch (err) {
            console.error("Error deleting plant:", err)
        }
        setIsEditPlantOpen(false)
    }

    // --- Helper functions for UI display ---
    // Choose badge color depending on plant status
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

    // Map status to user-friendly label
    const getStatusLabel = (status: string) => {
        const labels = {
            healthy: "Healthy",
            needs_water: "Needs water",
            needs_attention: "Needs attention",
            critical: "Critical",
        }
        return labels[status as keyof typeof labels] || status
    }

    // Return icon depending on light requirement
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

    // Stats counters
    const needsWaterCount = plants.filter((p) => p.status === "needs_water").length
    const needsAttentionCount = plants.filter(
        (p) => p.status === "needs_attention" || p.status === "critical",
    ).length
    const healthyCount = plants.filter((p) => p.status === "healthy").length

    // Display loading while plants are being fetched
    if (loading) return <p>Loading plants...</p>

    return (
        <div className="space-y-6">
            {/* --- HEADER section with add button --- */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Plant Management</h2>
                    <p className="text-muted-foreground">Monitor plant health with real-time data</p>
                </div>
                {/* Add plant button opens dialog */}
                <Dialog open={isAddPlantOpen} onOpenChange={setIsAddPlantOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Plant
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Plant</DialogTitle>
                            <DialogDescription>Add a new plant to your collection</DialogDescription>
                        </DialogHeader>
                        {/* Form for new plant */}
                        <div className="space-y-3">
                            <Label>Name</Label>
                            <Input value={newPlant.name} onChange={(e) => setNewPlant({ ...newPlant, name: e.target.value })} />
                            <Label>Species</Label>
                            <Input value={newPlant.species} onChange={(e) => setNewPlant({ ...newPlant, species: e.target.value })} />
                            <Label>Location</Label>
                            <Input value={newPlant.location} onChange={(e) => setNewPlant({ ...newPlant, location: e.target.value })} />
                            <Label>Watering frequency (days)</Label>
                            <Input
                                type="number"
                                value={newPlant.wateringFrequency}
                                onChange={(e) => setNewPlant({ ...newPlant, wateringFrequency: Number(e.target.value) })}
                            />
                            <Label>Optimal humidity (%)</Label>
                            <Input
                                type="number"
                                value={newPlant.optimalHumidity}
                                onChange={(e) => setNewPlant({ ...newPlant, optimalHumidity: Number(e.target.value) })}
                            />
                            <Label>Optimal temperature (°C)</Label>
                            <Input
                                type="number"
                                value={newPlant.optimalTemperature}
                                onChange={(e) => setNewPlant({ ...newPlant, optimalTemperature: Number(e.target.value) })}
                            />
                            <Label>Planted date</Label>
                            <Input
                                type="date"
                                value={newPlant.plantedDate}
                                onChange={(e) => setNewPlant({ ...newPlant, plantedDate: e.target.value })}
                            />
                            <Label>Notes</Label>
                            <Input value={newPlant.notes} onChange={(e) => setNewPlant({ ...newPlant, notes: e.target.value })} />
                            <Label>Light requirement</Label>
                            <Select
                                value={newPlant.lightRequirement}
                                onValueChange={(val) => setNewPlant({ ...newPlant, lightRequirement: val as Plant["lightRequirement"] })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Dialog actions */}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddPlantOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddPlant}>Add</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* --- STATS overview --- */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Total plants */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plants.length}</div>
                        <p className="text-xs text-muted-foreground">Monitored plants</p>
                    </CardContent>
                </Card>

                {/* Healthy plants */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Healthy</CardTitle>
                        <Leaf className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{healthyCount}</div>
                    </CardContent>
                </Card>

                {/* Needs water */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Needs Water</CardTitle>
                        <Droplets className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{needsWaterCount}</div>
                    </CardContent>
                </Card>

                {/* Needs attention */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Attention</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{needsAttentionCount}</div>
                    </CardContent>
                </Card>
            </div>

            {/* --- TABS for overview and analytics --- */}
            <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>

                {/* --- Overview tab with plant cards --- */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {plants.map((plant) => (
                            <Card key={plant.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        {/* Plant info with icon */}
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg">
                                                <Leaf className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-lg">{plant.name}</CardTitle>
                                                <p className="text-sm text-muted-foreground italic">{plant.species}</p>
                                            </div>
                                        </div>
                                        {/* Status badge */}
                                        <Badge className={getStatusColor(plant.status)}>
                                            {getStatusLabel(plant.status)}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="space-y-4">
                                    {/* Location */}
                                    <div className="text-sm text-muted-foreground">📍 {plant.location}</div>

                                    {/* Humidity and Temperature progress bars */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Humidity */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Droplets className="h-4 w-4 text-blue-500" />
                                                <span>Humidity</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>{plant.currentHumidity}%</span>
                                                    <span className="text-muted-foreground">{plant.optimalHumidity}%</span>
                                                </div>
                                                <Progress value={plant.currentHumidity} className="h-2" />
                                            </div>
                                        </div>

                                        {/* Temperature */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Thermometer className="h-4 w-4 text-red-500" />
                                                <span>Temperature</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>{plant.currentTemperature}°C</span>
                                                    <span className="text-muted-foreground">{plant.optimalTemperature}°C</span>
                                                </div>
                                                <Progress
                                                    value={(plant.currentTemperature / 40) * 100}
                                                    className="h-2"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Light + watering frequency */}
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2">
                                            {getLightIcon(plant.lightRequirement)}
                                            <span>
                                                Light {plant.lightRequirement}
                                            </span>
                                        </div>
                                        <span className="text-muted-foreground">
                                            Water every {plant.wateringFrequency}d
                                        </span>
                                    </div>

                                    {/* Last watered */}
                                    <div className="flex items-center justify-between text-sm">
                                        <span>Last watered</span>
                                        <span className="text-muted-foreground">
                                            {new Date(plant.lastWatered).toLocaleDateString("fr-FR")}
                                        </span>
                                    </div>

                                    {/* Edit button */}
                                    <div className="flex gap-2">
                                        <Button
                                            className="w-full"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setEditingPlant(plant)
                                                setIsEditPlantOpen(true)
                                            }}
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* --- Analytics tab with chart --- */}
                <TabsContent value="analytics">
                    {selectedPlant && (
                        <Card>
                            <CardHeader>
                                <CardTitle>{selectedPlant.name} - Humidity/Temperature tracking</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart data={sensorData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="timestamp" />
                                        <YAxis />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="humidity" stroke="blue" fill="blue" fillOpacity={0.2} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            {/* --- Dialog for editing a plant --- */}
            <Dialog open={isEditPlantOpen} onOpenChange={setIsEditPlantOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Plant</DialogTitle>
                    </DialogHeader>
                    {editingPlant && (
                        <div className="space-y-3">
                            <Label>Name</Label>
                            <Input value={editingPlant.name} onChange={(e) => setEditingPlant({ ...editingPlant, name: e.target.value })} />
                            <Label>Species</Label>
                            <Input value={editingPlant.species} onChange={(e) => setEditingPlant({ ...editingPlant, species: e.target.value })} />
                            <Label>Location</Label>
                            <Input value={editingPlant.location} onChange={(e) => setEditingPlant({ ...editingPlant, location: e.target.value })} />
                            <Label>Watering frequency (days)</Label>
                            <Input
                                type="number"
                                value={editingPlant.wateringFrequency}
                                onChange={(e) => setEditingPlant({ ...editingPlant, wateringFrequency: Number(e.target.value) })}
                            />
                            <Label>Optimal humidity (%)</Label>
                            <Input
                                type="number"
                                value={editingPlant.optimalHumidity}
                                onChange={(e) => setEditingPlant({ ...editingPlant, optimalHumidity: Number(e.target.value) })}
                            />
                            <Label>Optimal temperature (°C)</Label>
                            <Input
                                type="number"
                                value={editingPlant.optimalTemperature}
                                onChange={(e) => setEditingPlant({ ...editingPlant, optimalTemperature: Number(e.target.value) })}
                            />
                            <Label>Planted date</Label>
                            <Input
                                type="date"
                                value={editingPlant.plantedDate ? editingPlant.plantedDate.split("T")[0] : ""}
                                onChange={(e) => setEditingPlant({ ...editingPlant, plantedDate: e.target.value })}
                            />
                            <Label>Notes</Label>
                            <Input value={editingPlant.notes ?? ""} onChange={(e) => setEditingPlant({ ...editingPlant, notes: e.target.value })} />
                            <Label>Light requirement</Label>
                            <Select
                                value={editingPlant.lightRequirement}
                                onValueChange={(val) => setEditingPlant({ ...editingPlant, lightRequirement: val as Plant["lightRequirement"] })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                </SelectContent>
                            </Select>
                            {/* Actions: Delete, Cancel, Save */}
                            <div className="flex justify-between gap-2">
                                <Button variant="destructive" onClick={() => handleDeletePlant(editingPlant.id)}>
                                    Delete
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsEditPlantOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={handleUpdatePlant}>Save</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
