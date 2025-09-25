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
    import { Tooltip } from "recharts"


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
        Id_ESP32?: number | null
    }

    // --Type describing ESP32 device--
    interface ESP32 {
        id: number
        AdresseMac_ESP32: string
    }

    interface SensorData {
        timestamp: string
        humidity?: number
        temperature?: number
        light?: number
        soilMoisture?: number
        esp32Id: number
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

        // Fetch ESP32 devices
        const [esp32List, setEsp32List] = useState<ESP32[]>([])
        const [loadingEsp, setLoadingEsp] = useState(true)

        useEffect(() => {
            const fetchESP32 = async () => {
                try {
                    const res = await fetch("/api/esp32")
                    const data = await res.json()

                    // map pour adapter les champs
                    const mapped: ESP32[] = data.map((esp: any) => ({
                        id: esp.id,
                        AdresseMac_ESP32: esp.AdresseMac_ESP32,
                    }))

                    setEsp32List(mapped)
                } catch (err) {
                    console.error("Error fetching ESP32:", err)
                } finally {
                    setLoadingEsp(false)
                }
            }
            fetchESP32()
        }, [])

        // // --- State for sensor data (mocked) ---
        const [selectedPlantId, setSelectedPlantId] = useState<string>("")
        // const [timeRange, setTimeRange] = useState("7d")

        const [sensorData, setSensorData] = useState<SensorData[]>([])

        // Find the selected plant
        const selectedPlant = plants.find((p) => p.id === selectedPlantId)

        useEffect(() => {
            if (plants.length === 0) return

            const fetchAllSensorData = async () => {
                try {
                    const results = await Promise.all(
                        plants.map(async (plant) => {
                            if (!plant.Id_ESP32) return null

                            const res = await fetch(`/api/plants/${plant.id}/data`)
                            const data = await res.json()

                            return {
                                timestamp: new Date().toISOString(),
                                soilMoisture: data.soilMoisture ?? data.humidity ?? null,
                                temperature: data.temperature ?? null,
                                light: data.light ?? null,
                                esp32Id: plant.Id_ESP32,
                            }
                        })
                    )

                    // Filtrer les nulls
                    const validData = results.filter((d) => d !== null) as SensorData[]

                    setSensorData(validData)
                } catch (err) {
                    console.error("Error fetching all sensor data:", err)
                }
            }

            fetchAllSensorData()
        }, [plants])

        // Historique des données de la plante sélectionnée
        useEffect(() => {
            if (!selectedPlant) return

            const fetchHistory = async () => {
                try {
                    const res = await fetch(`/api/plants/${selectedPlant.id}/history`)
                    if (!res.ok) throw new Error("Failed to fetch history")

                    const data = await res.json()

                    // Adapter le format pour le graphique
                    const formatted = data
                        .map((entry: any) => {
                            let ts: string | null = null

                            if (entry.Timestamp) {
                                // Si format MySQL style "2025-09-25 16:30:00"
                                const parsed = entry.Timestamp.includes(" ")
                                    ? new Date(entry.Timestamp.replace(" ", "T") + "Z")
                                    : new Date(entry.Timestamp)

                                if (!isNaN(parsed.getTime())) {
                                    ts = parsed.toISOString()
                                }
                            }

                            return {
                                timestamp: ts,
                                soilMoisture:
                                    entry.Type_Donnee === "SoilMoisture" || entry.Type_Donnee === "Humidite"
                                        ? Number(entry.Valeur_Donnee)
                                        : null,
                                temperature:
                                    entry.Type_Donnee === "Temperature" ? Number(entry.Valeur_Donnee) : null,
                                light:
                                    entry.Type_Donnee?.toLowerCase().includes("light")
                                        ? Number(entry.Valeur_Donnee)
                                        : null,
                            }
                        })
                        .filter((d: any) => d.timestamp) // garder uniquement les entrées avec une date valide

                    // Fusionner par timestamp (humidite + temp + light au même instant)
                    const merged: Record<string, any> = {}
                    formatted.forEach((d: any) => {
                        if (!merged[d.timestamp]) merged[d.timestamp] = { timestamp: d.timestamp }
                        if (d.soilMoisture !== null) merged[d.timestamp].soilMoisture = d.soilMoisture
                        if (d.temperature !== null) merged[d.timestamp].temperature = d.temperature
                        if (d.light !== null) merged[d.timestamp].light = d.light
                    })

                    setSensorData(Object.values(merged))
                } catch (err) {
                    console.error("Error fetching plant history:", err)
                }
            }

            fetchHistory()
        }, [selectedPlant])




        // Auto-select first plant if none is selected
        useEffect(() => {
            if (plants.length > 0 && !selectedPlantId) {
                setSelectedPlantId(plants[0].id)
            }
        }, [plants, selectedPlantId])


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

        // Ouvrir la modale d'édition
        const handleEditPlant = (plant: Plant) => {
            setEditingPlant(plant)
            setIsEditPlantOpen(true)
        }



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

                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Add Plant</DialogTitle>
                                <DialogDescription>
                                    Add a new plant to your collection
                                </DialogDescription>
                            </DialogHeader>

                            {/* Form for new plant */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Name</Label>
                                        <Input
                                            value={newPlant.name}
                                            onChange={(e) =>
                                                setNewPlant({ ...newPlant, name: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Species</Label>
                                        <Input
                                            value={newPlant.species}
                                            onChange={(e) =>
                                                setNewPlant({ ...newPlant, species: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Location</Label>
                                        <Input
                                            value={newPlant.location}
                                            onChange={(e) =>
                                                setNewPlant({ ...newPlant, location: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Watering frequency (days)</Label>
                                        <Input
                                            type="number"
                                            value={newPlant.wateringFrequency}
                                            onChange={(e) =>
                                                setNewPlant({
                                                    ...newPlant,
                                                    wateringFrequency: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Optimal humidity (%)</Label>
                                        <Input
                                            type="number"
                                            value={newPlant.optimalHumidity}
                                            onChange={(e) =>
                                                setNewPlant({
                                                    ...newPlant,
                                                    optimalHumidity: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Optimal temperature (°C)</Label>
                                        <Input
                                            type="number"
                                            value={newPlant.optimalTemperature}
                                            onChange={(e) =>
                                                setNewPlant({
                                                    ...newPlant,
                                                    optimalTemperature: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Planted date</Label>
                                        <Input
                                            type="date"
                                            value={newPlant.plantedDate}
                                            onChange={(e) =>
                                                setNewPlant({ ...newPlant, plantedDate: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Notes</Label>
                                        <Input
                                            value={newPlant.notes}
                                            onChange={(e) =>
                                                setNewPlant({ ...newPlant, notes: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Light requirement</Label>
                                        <Select
                                            value={newPlant.lightRequirement}
                                            onValueChange={(val) =>
                                                setNewPlant({
                                                    ...newPlant,
                                                    lightRequirement: val as Plant["lightRequirement"],
                                                })
                                            }
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
                                    </div>
                                </div>

                                {/* Dialog actions */}
                                <div className="flex justify-end gap-2 pt-4">
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
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="esp32">ESP32</TabsTrigger>
                    </TabsList>

                    {/* --- Overview tab with plant cards --- */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {plants.map((plant) => {
                                const plantData = sensorData.filter(
                                    (d) => plant.Id_ESP32 && d.esp32Id === plant.Id_ESP32
                                )
                                const last = plantData.length > 0 ? plantData[plantData.length - 1] : null

                                return (
                                    <Card key={plant.id} className="hover:shadow-md transition-shadow">
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
                                                <Badge className={getStatusColor(plant.status)}>
                                                    {getStatusLabel(plant.status)}
                                                </Badge>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4">
                                            {/* Location */}
                                            <div className="text-sm text-muted-foreground">📍 {plant.location}</div>

                                            {/* Humidity */}
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Droplets className="h-4 w-4 text-blue-500" />
                                                    <span>Humidité</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span>{last?.soilMoisture ?? "-"}%</span>
                                                    <span className="text-muted-foreground">
      {plant.optimalHumidity ?? "-"}%
    </span>
                                                </div>
                                                <div className="relative h-2 w-full bg-gray-200 rounded">
                                                    {/* Valeur mesurée */}
                                                    <div
                                                        className="h-2 bg-slate-500 rounded"
                                                        style={{ width: `${last?.soilMoisture ?? 0}%` }}
                                                    />
                                                    {/* Seuil optimal */}
                                                    {plant.optimalHumidity && (
                                                        <div
                                                            className="absolute top-0 h-2 w-1 bg-green-500"
                                                            style={{ left: `${plant.optimalHumidity}%` }}
                                                        />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Light + Watering frequency */}
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
                                                <span className="text-muted-foreground">
                Arrosage tous les {plant.wateringFrequency}j
              </span>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleEditPlant(plant)}
                                                >
                                                    <Settings className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    </TabsContent>

                    {/* --- Analytics tab with chart --- */}
                    <TabsContent value="analytics">
                        {selectedPlant && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>
                                        {selectedPlant.name} - Évolution de l’humidité
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={sensorData}>
                                            <defs>
                                                <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>

                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                            <XAxis
                                                dataKey="timestamp"
                                                tickFormatter={(value) =>
                                                    new Date(value).toLocaleTimeString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })
                                                }
                                            />
                                            <YAxis
                                                domain={[0, 100]}
                                                tickFormatter={(v) => `${v}%`}
                                            />

                                            {/* Tooltip natif */}
                                            <Tooltip
                                                formatter={(value) => [`${value}%`, "Humidité"]}
                                                labelFormatter={(label) =>
                                                    new Date(label).toLocaleString("fr-FR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                    })
                                                }
                                            />

                                            {/* Courbe humidité */}
                                            <Area
                                                type="monotone"
                                                dataKey="soilMoisture"
                                                stroke="#2563eb"
                                                fill="url(#colorHumidity)"
                                                strokeWidth={2}
                                                name="Humidité (%)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>


                    {/*ESP 32 Overview*/}
                    <TabsContent value="esp32" className="space-y-6">
                        <h3 className="text-xl font-semibold">ESP32 Devices</h3>
                        {loadingEsp ? (
                            <p>Loading ESP32...</p>
                        ) : esp32List.length === 0 ? (
                            <p className="text-muted-foreground">No ESP32 found</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {esp32List.map((esp) => (
                                    <Card key={esp.id} className="hover:shadow-md transition-shadow">
                                        <CardHeader>
                                            <CardTitle>ESP32 #{esp.id}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm">MAC Address: {esp.AdresseMac_ESP32}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </Tabs>

                <Dialog open={isEditPlantOpen} onOpenChange={setIsEditPlantOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Edit Plant {editingPlant?.name ? `- ${editingPlant.name}` : ""}
                            </DialogTitle>
                        </DialogHeader>

                        {editingPlant && (
                            <div className="space-y-3">
                                {/* Champs en grille pour réduire la hauteur */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label>Name</Label>
                                        <Input
                                            value={editingPlant.name}
                                            onChange={(e) =>
                                                setEditingPlant({ ...editingPlant, name: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Species</Label>
                                        <Input
                                            value={editingPlant.species}
                                            onChange={(e) =>
                                                setEditingPlant({ ...editingPlant, species: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Location</Label>
                                        <Input
                                            value={editingPlant.location}
                                            onChange={(e) =>
                                                setEditingPlant({ ...editingPlant, location: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Watering frequency (days)</Label>
                                        <Input
                                            type="number"
                                            value={editingPlant.wateringFrequency}
                                            onChange={(e) =>
                                                setEditingPlant({
                                                    ...editingPlant,
                                                    wateringFrequency: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Optimal humidity (%)</Label>
                                        <Input
                                            type="number"
                                            value={editingPlant.optimalHumidity}
                                            onChange={(e) =>
                                                setEditingPlant({
                                                    ...editingPlant,
                                                    optimalHumidity: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Optimal temperature (°C)</Label>
                                        <Input
                                            type="number"
                                            value={editingPlant.optimalTemperature}
                                            onChange={(e) =>
                                                setEditingPlant({
                                                    ...editingPlant,
                                                    optimalTemperature: Number(e.target.value),
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Planted date</Label>
                                        <Input
                                            type="date"
                                            value={
                                                editingPlant.plantedDate
                                                    ? editingPlant.plantedDate.split("T")[0]
                                                    : ""
                                            }
                                            onChange={(e) =>
                                                setEditingPlant({
                                                    ...editingPlant,
                                                    plantedDate: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Notes</Label>
                                        <Input
                                            value={editingPlant.notes ?? ""}
                                            onChange={(e) =>
                                                setEditingPlant({ ...editingPlant, notes: e.target.value })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <Label>Light requirement</Label>
                                        <Select
                                            value={editingPlant.lightRequirement}
                                            onValueChange={(val) =>
                                                setEditingPlant({
                                                    ...editingPlant,
                                                    lightRequirement: val as Plant["lightRequirement"],
                                                })
                                            }
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
                                    </div>

                                    <div>
                                        <Label>ESP32</Label>
                                        <Select
                                            value={editingPlant?.Id_ESP32?.toString() ?? ""}
                                            onValueChange={(val) =>
                                                setEditingPlant({
                                                    ...editingPlant!,
                                                    Id_ESP32: parseInt(val),
                                                })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select ESP32" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {esp32List.map((esp) => (
                                                    <SelectItem key={esp.id} value={esp.id.toString()}>
                                                        ESP32 #{esp.id} ({esp.AdresseMac_ESP32})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-between gap-2 pt-4">
                                    <Button
                                        variant="destructive"
                                        onClick={() => handleDeletePlant(editingPlant.id)}
                                    >
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
