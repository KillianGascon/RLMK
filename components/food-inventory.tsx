"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Refrigerator, Home, Package, Box, Edit, Trash2 } from "lucide-react"

// --- Types ---
interface Stock {
    id: number
    Nom_Stock: string
    Description_Stock?: string
    Type_Stock: string
    Id_Foyer: number
    Id_Piece: number
    Piece?: { Nom_Piece: string }
    _count?: { Aliment: number }
}

interface Room {
    id: number
    name: string
}

interface Aliment {
    id: number
    Nom_Aliment: string
    Description_Aliment?: string
    Date_Peremption?: string
    Type_Aliment?: string
    Quantite?: number
    Unite_Quantite?: string
    Id_Stock: number
    Stock?: { Nom_Stock: string }
}

// --- Utils ---
const isExpired = (date?: string) => date ? new Date(date) < new Date() : false
const isExpiringSoon = (date?: string) => {
    if (!date) return false
    const d = new Date(date)
    const now = new Date()
    const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= 7 && diff > 0
}

export function FoodInventory({ foyerId }: { foyerId: number }) {
    const [stocks, setStocks] = useState<Stock[]>([])
    const [rooms, setRooms] = useState<Room[]>([])
    const [aliments, setAliments] = useState<Aliment[]>([])
    const [loading, setLoading] = useState(true)

    // Dialogs
    const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false)
    const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false)
    const [isAddAlimentDialogOpen, setIsAddAlimentDialogOpen] = useState(false)
    const [isEditAlimentDialogOpen, setIsEditAlimentDialogOpen] = useState(false)

    // States
    const [newStock, setNewStock] = useState({
        Nom_Stock: "",
        Description_Stock: "",
        Type_Stock: "FRIGO",
        Id_Foyer: foyerId,
        Id_Piece: 0,
    })

    const [newAliment, setNewAliment] = useState({
        Nom_Aliment: "",
        Description_Aliment: "",
        Date_Peremption: "",
        Type_Aliment: "",
        Quantite: 0,
        Unite_Quantite: "",
        Id_Stock: 0,
    })

    const [editingAliment, setEditingAliment] = useState<Aliment | null>(null)
    const [editingStock, setEditingStock] = useState<Stock | null>(null)

    // --- Fetch rooms ---
    useEffect(() => {
        const fetchRooms = async () => {
            const res = await fetch(`/api/room?foyerId=${foyerId}`)
            const data = await res.json()
            setRooms(data.map((r: any) => ({ id: r.id, name: r.Nom_Piece })))
        }
        fetchRooms()
    }, [foyerId])

    // --- Fetch stocks ---
    const fetchStocks = async () => {
        const res = await fetch(`/api/stock?foyerId=${foyerId}`)
        const data = await res.json()
        setStocks(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchStocks()
    }, [foyerId])

    // --- Fetch aliments ---
    const fetchAliments = async () => {
        const res = await fetch(`/api/aliment`)
        const data = await res.json()
        setAliments(data)
    }

    useEffect(() => {
        fetchAliments()
    }, [])

    // --- Add stock ---
    const handleAddStock = async () => {
        if (!newStock.Nom_Stock || !newStock.Id_Piece) return
        const res = await fetch("/api/stock", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newStock),
        })
        const data = await res.json()
        setStocks([...stocks, data])
        setNewStock({
            Nom_Stock: "",
            Description_Stock: "",
            Type_Stock: "FRIGO",
            Id_Foyer: foyerId,
            Id_Piece: 0,
        })
        setIsAddStockDialogOpen(false)
    }

    // --- Update stock ---
    const handleUpdateStock = async () => {
        if (!editingStock) return
        const res = await fetch(`/api/stock/${editingStock.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingStock),
        })
        const data = await res.json()
        setStocks(stocks.map((s) => (s.id === data.id ? data : s)))
        setEditingStock(null)
        setIsEditStockDialogOpen(false)
    }

    // --- Delete stock ---
    const handleDeleteStock = async (id: number) => {
        await fetch(`/api/stock/${id}`, { method: "DELETE" })
        setStocks(stocks.filter((s) => s.id !== id))
    }

    // --- Add aliment ---
    const handleAddAliment = async () => {
        if (!newAliment.Nom_Aliment || !newAliment.Id_Stock) return
        const res = await fetch("/api/aliment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newAliment),
        })
        const data = await res.json()
        setAliments([...aliments, data])
        await fetchStocks()
        setNewAliment({
            Nom_Aliment: "",
            Description_Aliment: "",
            Date_Peremption: "",
            Type_Aliment: "",
            Quantite: 0,
            Unite_Quantite: "",
            Id_Stock: 0,
        })
        setIsAddAlimentDialogOpen(false)
    }

    // --- Update aliment ---
    const handleUpdateAliment = async () => {
        if (!editingAliment) return
        const res = await fetch(`/api/aliment/${editingAliment.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editingAliment),
        })
        const data = await res.json()
        setAliments(aliments.map((a) => (a.id === data.id ? data : a)))
        await fetchStocks()
        setEditingAliment(null)
        setIsEditAlimentDialogOpen(false)
    }

    // --- Delete aliment ---
    const handleDeleteAliment = async (id: number) => {
        await fetch(`/api/aliment/${id}`, { method: "DELETE" })
        setAliments(aliments.filter((a) => a.id !== id))
        await fetchStocks()
    }

    const getStockIcon = (type: string) => {
        switch (type) {
            case "FRIGO": return <Refrigerator className="h-4 w-4 text-muted-foreground" />
            case "CONGELATEUR": return <Package className="h-4 w-4 text-muted-foreground" />
            case "ETAGERES": return <Home className="h-4 w-4 text-muted-foreground" />
            default: return <Box className="h-4 w-4 text-muted-foreground" />
        }
    }

    return (
        <div className="space-y-6">
            {/* Header stocks */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestion des stocks</h2>
                <Dialog open={isAddStockDialogOpen} onOpenChange={setIsAddStockDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4" /> Ajouter un stock</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Ajouter un stock</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            <Label>Nom du stock</Label>
                            <Input value={newStock.Nom_Stock} onChange={(e) => setNewStock({ ...newStock, Nom_Stock: e.target.value })} />
                            <Label>Description</Label>
                            <Input value={newStock.Description_Stock} onChange={(e) => setNewStock({ ...newStock, Description_Stock: e.target.value })} />
                            <Label>Type</Label>
                            <Select value={newStock.Type_Stock} onValueChange={(val) => setNewStock({ ...newStock, Type_Stock: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FRIGO">Frigo</SelectItem>
                                    <SelectItem value="CONGELATEUR">Congélateur</SelectItem>
                                    <SelectItem value="ETAGERES">Étagères</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Pièce</Label>
                            <Select value={newStock.Id_Piece ? String(newStock.Id_Piece) : ""} onValueChange={(val) => setNewStock({ ...newStock, Id_Piece: Number(val) })}>
                                <SelectTrigger><SelectValue placeholder="Choisir une pièce" /></SelectTrigger>
                                <SelectContent>
                                    {rooms.map((room) => <SelectItem key={room.id} value={String(room.id)}>{room.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddStockDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleAddStock}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Liste stocks */}
            {loading ? <p>Chargement...</p> : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                    {stocks.map((stock) => (
                        <Card key={stock.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {stock.Nom_Stock}<br />
                                    <span className="text-xs text-muted-foreground">{stock.Piece?.Nom_Piece}</span>
                                </CardTitle>
                                <div className="flex gap-2 items-center">
                                    {getStockIcon(stock.Type_Stock)}
                                    {stock._count?.Aliment === 0 && (
                                        <>
                                            <Button variant="ghost" size="sm" onClick={() => { setEditingStock(stock); setIsEditStockDialogOpen(true) }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="sm" onClick={() => handleDeleteStock(stock.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stock._count?.Aliment ?? 0}</div>
                                <p className="text-xs text-muted-foreground">Articles</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Dialog édition stock */}
            <Dialog open={isEditStockDialogOpen} onOpenChange={setIsEditStockDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Modifier un stock</DialogTitle></DialogHeader>
                    {editingStock && (
                        <div className="space-y-3">
                            <Label>Nom</Label>
                            <Input value={editingStock.Nom_Stock} onChange={(e) => setEditingStock({ ...editingStock, Nom_Stock: e.target.value })} />
                            <Label>Description</Label>
                            <Input value={editingStock.Description_Stock ?? ""} onChange={(e) => setEditingStock({ ...editingStock, Description_Stock: e.target.value })} />
                            <Label>Type</Label>
                            <Select value={editingStock.Type_Stock} onValueChange={(val) => setEditingStock({ ...editingStock, Type_Stock: val })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="FRIGO">Frigo</SelectItem>
                                    <SelectItem value="CONGELATEUR">Congélateur</SelectItem>
                                    <SelectItem value="ETAGERES">Étagères</SelectItem>
                                </SelectContent>
                            </Select>
                            <Label>Pièce</Label>
                            <Select value={String(editingStock.Id_Piece)} onValueChange={(val) => setEditingStock({ ...editingStock, Id_Piece: Number(val) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{rooms.map((room) => <SelectItem key={room.id} value={String(room.id)}>{room.name}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditStockDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleUpdateStock}>Enregistrer</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* --- Section aliments --- */}
            <div className="flex justify-between items-center mt-8">
                <h3 className="text-lg font-semibold">Aliments</h3>
                <Dialog open={isAddAlimentDialogOpen} onOpenChange={setIsAddAlimentDialogOpen}>
                    <DialogTrigger asChild>
                        <Button><Plus className="h-4 w-4" /> Ajouter un aliment</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Ajouter un aliment</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                            <Label>Nom</Label>
                            <Input value={newAliment.Nom_Aliment} onChange={(e) => setNewAliment({ ...newAliment, Nom_Aliment: e.target.value })} />
                            <Label>Quantité</Label>
                            <Input type="number" value={newAliment.Quantite} onChange={(e) => setNewAliment({ ...newAliment, Quantite: Number(e.target.value) })} />
                            <Label>Unité</Label>
                            <Input value={newAliment.Unite_Quantite} onChange={(e) => setNewAliment({ ...newAliment, Unite_Quantite: e.target.value })} />
                            <Label>Date de péremption</Label>
                            <Input type="date" value={newAliment.Date_Peremption} onChange={(e) => setNewAliment({ ...newAliment, Date_Peremption: e.target.value })} />
                            <Label>Stock</Label>
                            <Select value={newAliment.Id_Stock ? String(newAliment.Id_Stock) : ""} onValueChange={(val) => setNewAliment({ ...newAliment, Id_Stock: Number(val) })}>
                                <SelectTrigger><SelectValue placeholder="Choisir un stock" /></SelectTrigger>
                                <SelectContent>{stocks.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.Nom_Stock}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddAlimentDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleAddAliment}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Liste aliments */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {aliments.map((item) => (
                    <Card key={item.id} className={`hover:shadow-md transition-shadow ${
                        isExpired(item.Date_Peremption) ? "border-red-200 bg-red-50"
                            : isExpiringSoon(item.Date_Peremption) ? "border-orange-200 bg-orange-50" : ""}`}>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-sm md:text-lg">{item.Nom_Aliment}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{item.Stock?.Nom_Stock}</p>
                                </div>
                                <div className="flex gap-1">
                                    <Button variant="ghost" size="sm" onClick={() => { setEditingAliment(item); setIsEditAlimentDialogOpen(true) }}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAliment(item.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Quantité</span>
                                <span>{item.Quantite} {item.Unite_Quantite}</span>
                            </div>
                            {item.Date_Peremption && (
                                <div className="flex justify-between text-sm">
                                    <span>Expire le</span>
                                    <span className={isExpired(item.Date_Peremption) ? "text-red-600 font-medium"
                                        : isExpiringSoon(item.Date_Peremption) ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                    {new Date(item.Date_Peremption).toLocaleDateString("fr-FR")}
                  </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Dialog édition aliment */}
            <Dialog open={isEditAlimentDialogOpen} onOpenChange={setIsEditAlimentDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Modifier un aliment</DialogTitle></DialogHeader>
                    {editingAliment && (
                        <div className="space-y-3">
                            <Label>Nom</Label>
                            <Input value={editingAliment.Nom_Aliment} onChange={(e) => setEditingAliment({ ...editingAliment, Nom_Aliment: e.target.value })} />
                            <Label>Quantité</Label>
                            <Input type="number" value={editingAliment.Quantite ?? 0} onChange={(e) => setEditingAliment({ ...editingAliment, Quantite: Number(e.target.value) })} />
                            <Label>Unité</Label>
                            <Input value={editingAliment.Unite_Quantite ?? ""} onChange={(e) => setEditingAliment({ ...editingAliment, Unite_Quantite: e.target.value })} />
                            <Label>Date de péremption</Label>
                            <Input type="date" value={editingAliment.Date_Peremption?.split("T")[0] ?? ""} onChange={(e) => setEditingAliment({ ...editingAliment, Date_Peremption: e.target.value })} />
                            <Label>Stock</Label>
                            <Select value={String(editingAliment.Id_Stock)} onValueChange={(val) => setEditingAliment({ ...editingAliment, Id_Stock: Number(val) })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>{stocks.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.Nom_Stock}</SelectItem>)}</SelectContent>
                            </Select>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsEditAlimentDialogOpen(false)}>Annuler</Button>
                                <Button onClick={handleUpdateAliment}>Enregistrer</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
