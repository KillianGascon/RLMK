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
import { Textarea } from "@/components/ui/textarea"
import { Plus, Home, Bed, ChefHat, Bath, Sofa, Car, Settings, Thermometer, Lightbulb, Wifi } from "lucide-react"

interface Room {
    id: string
    name: string
    type: "bedroom" | "kitchen" | "bathroom" | "living" | "garage" | "office" | "other"
    description?: string
    temperature?: number
    devices: string[]
    area: number
    hasWifi: boolean
    hasLighting: boolean
}

export function RoomManagement() {
    const [rooms, setRooms] = useState<Room[]>([
        {
            id: "1",
            name: "Salon principal",
            type: "living",
            description: "Grand salon avec canapé et télévision",
            temperature: 22,
            devices: ["Télévision", "Climatisation", "Éclairage intelligent"],
            area: 35,
            hasWifi: true,
            hasLighting: true,
        },
        {
            id: "2",
            name: "Cuisine",
            type: "kitchen",
            description: "Cuisine équipée avec îlot central",
            temperature: 20,
            devices: ["Réfrigérateur", "Four", "Lave-vaisselle", "Micro-ondes"],
            area: 25,
            hasWifi: true,
            hasLighting: true,
        },
        {
            id: "3",
            name: "Chambre parentale",
            type: "bedroom",
            description: "Chambre principale avec dressing",
            temperature: 19,
            devices: ["Climatisation", "Éclairage"],
            area: 20,
            hasWifi: true,
            hasLighting: true,
        },
        {
            id: "4",
            name: "Salle de bain",
            type: "bathroom",
            description: "Salle de bain avec douche et baignoire",
            temperature: 23,
            devices: ["Chauffage", "VMC", "Éclairage"],
            area: 12,
            hasWifi: false,
            hasLighting: true,
        },
    ])

    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
    const [newRoom, setNewRoom] = useState({
        name: "",
        type: "other" as Room["type"],
        description: "",
        area: 0,
        hasWifi: false,
        hasLighting: false,
    })

    const handleAddRoom = () => {
        if (newRoom.name && newRoom.area > 0) {
            const room: Room = {
                id: Date.now().toString(),
                ...newRoom,
                devices: [],
                temperature: 20,
            }
            setRooms([...rooms, room])
            setNewRoom({ name: "", type: "other", description: "", area: 0, hasWifi: false, hasLighting: false })
            setIsAddRoomOpen(false)
        }
    }

    const getRoomIcon = (type: string) => {
        switch (type) {
            case "bedroom":
                return <Bed className="h-4 w-4 md:h-5 md:w-5" />
            case "kitchen":
                return <ChefHat className="h-4 w-4 md:h-5 md:w-5" />
            case "bathroom":
                return <Bath className="h-4 w-4 md:h-5 md:w-5" />
            case "living":
                return <Sofa className="h-4 w-4 md:h-5 md:w-5" />
            case "garage":
                return <Car className="h-4 w-4 md:h-5 md:w-5" />
            default:
                return <Home className="h-4 w-4 md:h-5 md:w-5" />
        }
    }

    const getRoomTypeLabel = (type: string) => {
        const labels = {
            bedroom: "Chambre",
            kitchen: "Cuisine",
            bathroom: "Salle de bain",
            living: "Salon",
            garage: "Garage",
            office: "Bureau",
            other: "Autre",
        }
        return labels[type as keyof typeof labels] || "Autre"
    }

    const totalArea = rooms.reduce((sum, room) => sum + room.area, 0)
    const averageTemp = rooms.reduce((sum, room) => sum + (room.temperature || 0), 0) / rooms.length

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">Gestion des pièces</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Configurez et surveillez les pièces de votre foyer
                    </p>
                </div>

                <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2 w-full sm:w-auto">
                            <Plus className="h-4 w-4" />
                            <span className="hidden sm:inline">Ajouter une pièce</span>
                            <span className="sm:hidden">Ajouter</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                            <DialogTitle>Ajouter une nouvelle pièce</DialogTitle>
                            <DialogDescription>Configurez une nouvelle pièce dans votre foyer</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="roomName">Nom de la pièce</Label>
                                <Input
                                    id="roomName"
                                    value={newRoom.name}
                                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                                    placeholder="Salon, Chambre, Cuisine..."
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="roomType">Type de pièce</Label>
                                <Select
                                    value={newRoom.type}
                                    onValueChange={(value: Room["type"]) => setNewRoom({ ...newRoom, type: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="living">Salon</SelectItem>
                                        <SelectItem value="bedroom">Chambre</SelectItem>
                                        <SelectItem value="kitchen">Cuisine</SelectItem>
                                        <SelectItem value="bathroom">Salle de bain</SelectItem>
                                        <SelectItem value="office">Bureau</SelectItem>
                                        <SelectItem value="garage">Garage</SelectItem>
                                        <SelectItem value="other">Autre</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="area">Surface (m²)</Label>
                                <Input
                                    id="area"
                                    type="number"
                                    value={newRoom.area || ""}
                                    onChange={(e) => setNewRoom({ ...newRoom, area: Number.parseInt(e.target.value) || 0 })}
                                    placeholder="25"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optionnel)</Label>
                                <Textarea
                                    id="description"
                                    value={newRoom.description}
                                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                                    placeholder="Description de la pièce..."
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleAddRoom}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium">Total pièces</CardTitle>
                        <Home className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{rooms.length}</div>
                        <p className="text-xs text-muted-foreground">Pièces configurées</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium">Surface totale</CardTitle>
                        <Settings className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{totalArea}m²</div>
                        <p className="text-xs text-muted-foreground">Surface habitable</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium">Température moy.</CardTitle>
                        <Thermometer className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{averageTemp.toFixed(1)}°C</div>
                        <p className="text-xs text-muted-foreground">Température moyenne</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs md:text-sm font-medium">Connectées</CardTitle>
                        <Wifi className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{rooms.filter((r) => r.hasWifi).length}</div>
                        <p className="text-xs text-muted-foreground">Pièces avec WiFi</p>
                    </CardContent>
                </Card>
            </div>

            {/* Rooms Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {rooms.map((room) => (
                    <Card key={room.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">{getRoomIcon(room.type)}</div>
                                    <div>
                                        <CardTitle className="text-sm md:text-lg">{room.name}</CardTitle>
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            {getRoomTypeLabel(room.type)}
                                        </Badge>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4">
                            {room.description && <p className="text-xs md:text-sm text-muted-foreground">{room.description}</p>}

                            <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <Settings className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                    <span>{room.area}m²</span>
                                </div>
                                {room.temperature && (
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <Thermometer className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                        <span>{room.temperature}°C</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                {room.hasWifi && (
                                    <Badge variant="outline" className="text-xs">
                                        <Wifi className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                                        WiFi
                                    </Badge>
                                )}
                                {room.hasLighting && (
                                    <Badge variant="outline" className="text-xs">
                                        <Lightbulb className="h-2 w-2 md:h-3 md:w-3 mr-1" />
                                        Éclairage
                                    </Badge>
                                )}
                            </div>

                            {room.devices.length > 0 && (
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Appareils ({room.devices.length})</p>
                                    <div className="flex flex-wrap gap-1">
                                        {room.devices.slice(0, 2).map((device, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                {device}
                                            </Badge>
                                        ))}
                                        {room.devices.length > 2 && (
                                            <Badge variant="secondary" className="text-xs">
                                                +{room.devices.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
