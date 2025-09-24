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
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Home, Bed, ChefHat, Bath, Sofa, Car, Settings, Trash2 } from "lucide-react"

interface Room {
    id: number
    name: string
    type: string
    description?: string
    area: number
    foyerId: number
}

export function RoomManagement({ foyerId }: { foyerId: number }) {
    const [rooms, setRooms] = useState<Room[]>([])
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)

    const [newRoom, setNewRoom] = useState({
        name: "",
        type: "other",
        description: "",
        area: 0,
    })

    // 🔹 Charger les pièces depuis la BDD
    useEffect(() => {
        const fetchRooms = async () => {
            const res = await fetch(`/api/room?foyerId=${foyerId}`)
            const data = await res.json()
            const mapped: Room[] = data.map((p: any) => ({
                id: p.id,
                name: p.Nom_Piece,
                type: p.Type_Piece,
                description: p.Description_Piece,
                area: Number(p.Surface_m2),
                foyerId: p.Id_Foyer,
            }))
            setRooms(mapped)
        }
        fetchRooms()
    }, [foyerId])

    // 🔹 Ajouter une nouvelle pièce
    const handleAddRoom = async () => {
        if (!newRoom.name || newRoom.area <= 0) return
        const res = await fetch("/api/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newRoom, foyerId }),
        })
        if (res.ok) {
            const added = await res.json()
            setRooms((prev) => [
                ...prev,
                {
                    id: added.id,
                    name: added.Nom_Piece,
                    type: added.Type_Piece,
                    description: added.Description_Piece,
                    area: Number(added.Surface_m2),
                    foyerId: added.Id_Foyer,
                },
            ])
            setNewRoom({ name: "", type: "other", description: "", area: 0 })
            setIsAddRoomOpen(false)
        }
    }

    // 🔹 Modifier une pièce
    const handleUpdateRoom = async () => {
        if (!editingRoom) return
        const res = await fetch(`/api/room/${editingRoom.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingRoom),
        })
        if (res.ok) {
            setRooms((prev) =>
                prev.map((r) => (r.id === editingRoom.id ? editingRoom : r))
            )
            setEditingRoom(null)
        }
    }

    // 🔹 Supprimer une pièce
    const handleDeleteRoom = async (id: number) => {
        const res = await fetch(`/api/room/${id}`, { method: "DELETE" })
        if (res.ok) {
            setRooms((prev) => prev.filter((r) => r.id !== id))
            setEditingRoom(null)
        }
    }

    const getRoomIcon = (type: string) => {
        switch (type) {
            case "bedroom": return <Bed className="h-4 w-4" />
            case "kitchen": return <ChefHat className="h-4 w-4" />
            case "bathroom": return <Bath className="h-4 w-4" />
            case "living": return <Sofa className="h-4 w-4" />
            case "garage": return <Car className="h-4 w-4" />
            default: return <Home className="h-4 w-4" />
        }
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestion des pièces</h2>
                <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                    <Button onClick={() => setIsAddRoomOpen(true)}>
                        <Plus className="h-4 w-4" /> Ajouter
                    </Button>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter une pièce</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <Label>Nom</Label>
                            <Input value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
                            <Label>Type</Label>
                            <Select
                                value={newRoom.type}
                                onValueChange={(val) => setNewRoom({ ...newRoom, type: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="living">Salon</SelectItem>
                                    <SelectItem value="bedroom">Chambre</SelectItem>
                                    <SelectItem value="kitchen">Cuisine</SelectItem>
                                    <SelectItem value="bathroom">Salle de bain</SelectItem>
                                    <SelectItem value="garage">Garage</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Surface (m²)</Label>
                            <Input type="number" value={newRoom.area || ""} onChange={(e) => setNewRoom({ ...newRoom, area: parseFloat(e.target.value) })} />
                            <Label>Description</Label>
                            <Textarea value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Annuler</Button>
                                <Button onClick={handleAddRoom}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total pièces</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rooms.length}</div>
                        <p className="text-sm text-muted-foreground">Pièces configurées</p>
                    </CardContent>
                </Card>
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Surface totale</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rooms.reduce((sum, r) => sum + r.area, 0)} m²
                        </div>
                        <p className="text-sm text-muted-foreground">Surface habitable</p>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des pièces */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {rooms.map((room) => (
                    <Card key={room.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="p-1.5 md:p-2 bg-primary/10 rounded-lg">
                                        {getRoomIcon(room.type)}
                                    </div>
                                    <div>
                                        <CardTitle className="text-sm md:text-lg">{room.name}</CardTitle>
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            {room.type}
                                        </Badge>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingRoom(room)} // 👈 ouvre la fenêtre de modif
                                >
                                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4">
                            {room.description && (
                                <p className="text-xs md:text-sm text-muted-foreground">{room.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Settings className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                <span>{room.area} m²</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Fenêtre de modification */}
            <Dialog
                open={!!editingRoom}
                onOpenChange={(open) => {
                    if (!open) setEditingRoom(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier la pièce</DialogTitle>
                    </DialogHeader>
                    {editingRoom && (
                        <div className="space-y-4">
                            <Label>Nom</Label>
                            <Input value={editingRoom.name} onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })} />
                            <Label>Type</Label>
                            <Select value={editingRoom.type} onValueChange={(val) => setEditingRoom({ ...editingRoom, type: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="living">Salon</SelectItem>
                                    <SelectItem value="bedroom">Chambre</SelectItem>
                                    <SelectItem value="kitchen">Cuisine</SelectItem>
                                    <SelectItem value="bathroom">Salle de bain</SelectItem>
                                    <SelectItem value="garage">Garage</SelectItem>
                                    <SelectItem value="other">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Surface (m²)</Label>
                            <Input type="number" value={editingRoom.area || ""} onChange={(e) => setEditingRoom({ ...editingRoom, area: parseFloat(e.target.value) })} />
                            <Label>Description</Label>
                            <Textarea value={editingRoom.description || ""} onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })} />
                            <div className="flex justify-between">
                                <Button variant="destructive" onClick={() => handleDeleteRoom(editingRoom.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setEditingRoom(null)}>Annuler</Button>
                                    <Button onClick={handleUpdateRoom}>Enregistrer</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
