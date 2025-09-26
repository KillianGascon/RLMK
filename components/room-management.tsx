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

// --- Type definition for a room ---
interface Room {
    id: number
    name: string
    type: string
    description?: string
    area: number
    foyerId: number
}

interface RoomApiResponse {
    id: number
    Nom_Piece: string
    Type_Piece: string
    Description_Piece?: string
    Surface_m2: string | number
    Id_Foyer: number
}


export function RoomManagement({ foyerId }: { foyerId: number }) {
    // --- State for rooms list, add dialog, and edit dialog ---
    const [rooms, setRooms] = useState<Room[]>([])
    const [isAddRoomOpen, setIsAddRoomOpen] = useState(false)
    const [editingRoom, setEditingRoom] = useState<Room | null>(null)

    // --- State for new room form ---
    const [newRoom, setNewRoom] = useState({
        name: "",
        type: "other",
        description: "",
        area: 0,
    })

    // 🔹 Fetch rooms from the database when component mounts or foyerId changes
    useEffect(() => {
        const fetchRooms = async () => {
            const res = await fetch(`/api/room?foyerId=${foyerId}`)
            const data: RoomApiResponse[] = await res.json()

            const mapped: Room[] = data.map((p) => ({
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

    // 🔹 Add a new room
    const handleAddRoom = async () => {
        if (!newRoom.name || newRoom.area <= 0) return // basic validation
        const res = await fetch("/api/room", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...newRoom, foyerId }),
        })
        if (res.ok) {
            const added = await res.json()
            // Append the newly created room to the list
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
            // Reset form and close dialog
            setNewRoom({ name: "", type: "other", description: "", area: 0 })
            setIsAddRoomOpen(false)
        }
    }

    // 🔹 Update an existing room
    const handleUpdateRoom = async () => {
        if (!editingRoom) return
        const res = await fetch(`/api/room/${editingRoom.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingRoom),
        })
        if (res.ok) {
            // Replace updated room in the state
            setRooms((prev) =>
                prev.map((r) => (r.id === editingRoom.id ? editingRoom : r))
            )
            setEditingRoom(null)
        }
    }

    // 🔹 Delete a room
    const handleDeleteRoom = async (id: number) => {
        const res = await fetch(`/api/room/${id}`, { method: "DELETE" })
        if (res.ok) {
            // Remove deleted room from the state
            setRooms((prev) => prev.filter((r) => r.id !== id))
            setEditingRoom(null)
        }
    }

    // 🔹 Return appropriate icon for room type
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
            {/* --- Header with Add Room button --- */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Room Management</h2>
                <Dialog open={isAddRoomOpen} onOpenChange={setIsAddRoomOpen}>
                    {/* Button to open add dialog */}
                    <Button onClick={() => setIsAddRoomOpen(true)}>
                        <Plus className="h-4 w-4" /> Add
                    </Button>
                    {/* Add room dialog */}
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a Room</DialogTitle>
                        </DialogHeader>
                        {/* Form for new room */}
                        <div className="space-y-4">
                            <Label>Name</Label>
                            <Input value={newRoom.name} onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })} />
                            <Label>Type</Label>
                            <Select
                                value={newRoom.type}
                                onValueChange={(val) => setNewRoom({ ...newRoom, type: val })}
                            >
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="living">Living Room</SelectItem>
                                    <SelectItem value="bedroom">Bedroom</SelectItem>
                                    <SelectItem value="kitchen">Kitchen</SelectItem>
                                    <SelectItem value="bathroom">Bathroom</SelectItem>
                                    <SelectItem value="garage">Garage</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Area (m²)</Label>
                            <Input
                                type="number"
                                value={newRoom.area || ""}
                                onChange={(e) => setNewRoom({ ...newRoom, area: parseFloat(e.target.value) })}
                            />
                            <Label>Description</Label>
                            <Textarea value={newRoom.description} onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })} />
                            {/* Dialog actions */}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddRoomOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddRoom}>Add</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* --- Stats cards --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {/* Total rooms */}
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Rooms</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rooms.length}</div>
                        <p className="text-sm text-muted-foreground">Configured rooms</p>
                    </CardContent>
                </Card>
                {/* Total area */}
                <Card className="w-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Area</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {rooms.reduce((sum, r) => sum + r.area, 0)} m²
                        </div>
                        <p className="text-sm text-muted-foreground">Living space</p>
                    </CardContent>
                </Card>
            </div>

            {/* --- Room cards list --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {rooms.map((room) => (
                    <Card key={room.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                {/* Room icon + name + type */}
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
                                {/* Edit button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingRoom(room)} // open edit dialog
                                >
                                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 md:space-y-4">
                            {/* Room description if available */}
                            {room.description && (
                                <p className="text-xs md:text-sm text-muted-foreground">{room.description}</p>
                            )}
                            {/* Room area */}
                            <div className="flex items-center gap-2 text-xs md:text-sm">
                                <Settings className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                                <span>{room.area} m²</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* --- Edit room dialog --- */}
            <Dialog
                open={!!editingRoom}
                onOpenChange={(open) => {
                    if (!open) setEditingRoom(null)
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Room</DialogTitle>
                    </DialogHeader>
                    {editingRoom && (
                        <div className="space-y-4">
                            <Label>Name</Label>
                            <Input value={editingRoom.name} onChange={(e) => setEditingRoom({ ...editingRoom, name: e.target.value })} />
                            <Label>Type</Label>
                            <Select value={editingRoom.type} onValueChange={(val) => setEditingRoom({ ...editingRoom, type: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="living">Living Room</SelectItem>
                                    <SelectItem value="bedroom">Bedroom</SelectItem>
                                    <SelectItem value="kitchen">Kitchen</SelectItem>
                                    <SelectItem value="bathroom">Bathroom</SelectItem>
                                    <SelectItem value="garage">Garage</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Area (m²)</Label>
                            <Input
                                type="number"
                                value={editingRoom.area || ""}
                                onChange={(e) => setEditingRoom({ ...editingRoom, area: parseFloat(e.target.value) })}
                            />
                            <Label>Description</Label>
                            <Textarea
                                value={editingRoom.description || ""}
                                onChange={(e) => setEditingRoom({ ...editingRoom, description: e.target.value })}
                            />
                            {/* Actions: Delete, Cancel, Save */}
                            <div className="flex justify-between">
                                <Button variant="destructive" onClick={() => handleDeleteRoom(editingRoom.id)}>
                                    <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setEditingRoom(null)}>Cancel</Button>
                                    <Button onClick={handleUpdateRoom}>Save</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
