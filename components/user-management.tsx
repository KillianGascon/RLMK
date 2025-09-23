"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { Plus, Mail, Phone, Settings, UserCheck, Crown } from "lucide-react"

interface User {
    id: string
    name: string
    email: string
    role: "admin" | "member"
    avatar?: string
    phone?: string
    joinDate: string
    status: "active" | "inactive"
}

export function UserManagement() {
    const [users, setUsers] = useState<User[]>([
        {
            id: "1",
            name: "Jean Dupont",
            email: "jean.dupont@email.com",
            role: "admin",
            phone: "+33 6 12 34 56 78",
            joinDate: "2024-01-15",
            status: "active",
        },
        {
            id: "2",
            name: "Marie Martin",
            email: "marie.martin@email.com",
            role: "member",
            phone: "+33 6 98 76 54 32",
            joinDate: "2024-02-20",
            status: "active",
        },
        {
            id: "3",
            name: "Pierre Durand",
            email: "pierre.durand@email.com",
            role: "member",
            joinDate: "2024-03-10",
            status: "inactive",
        },
    ])

    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        role: "member" as "admin" | "member",
        phone: "",
    })

    const handleAddUser = () => {
        if (newUser.name && newUser.email) {
            const user: User = {
                id: Date.now().toString(),
                ...newUser,
                joinDate: new Date().toISOString().split("T")[0],
                status: "active",
            }
            setUsers([...users, user])
            setNewUser({ name: "", email: "", role: "member", phone: "" })
            setIsAddUserOpen(false)
        }
    }

    const getRoleIcon = (role: string) => {
        return role === "admin" ? <Crown className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
    }

    const getRoleBadge = (role: string) => {
        return role === "admin" ? (
            <Badge className="bg-purple-100 text-purple-800">Administrateur</Badge>
        ) : (
            <Badge variant="secondary">Membre</Badge>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Gestion des utilisateurs</h2>
                    <p className="text-muted-foreground">Gérez les membres de votre foyer et leurs permissions</p>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Ajouter un utilisateur
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un nouvel utilisateur</DialogTitle>
                            <DialogDescription>Invitez un nouveau membre à rejoindre votre foyer</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input
                                    id="name"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    placeholder="jean.dupont@email.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                                <Input
                                    id="phone"
                                    value={newUser.phone}
                                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                    placeholder="+33 6 12 34 56 78"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rôle</Label>
                                <Select
                                    value={newUser.role}
                                    onValueChange={(value: "admin" | "member") => setNewUser({ ...newUser, role: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="member">Membre</SelectItem>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                                    Annuler
                                </Button>
                                <Button onClick={handleAddUser}>Ajouter</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                                        <AvatarFallback>
                                            {user.name
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{user.name}</CardTitle>
                                        <div className="flex items-center gap-1 mt-1">
                                            {getRoleIcon(user.role)}
                                            {getRoleBadge(user.role)}
                                        </div>
                                    </div>
                                </div>
                                <div className={`w-3 h-3 rounded-full ${user.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-4 w-4" />
                                {user.email}
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Phone className="h-4 w-4" />
                                    {user.phone}
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  Rejoint le {new Date(user.joinDate).toLocaleDateString("fr-FR")}
                </span>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total utilisateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.length}</div>
                        <p className="text-xs text-muted-foreground">{users.filter((u) => u.status === "active").length} actifs</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Administrateurs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{users.filter((u) => u.role === "admin").length}</div>
                        <p className="text-xs text-muted-foreground">Permissions complètes</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Nouveaux ce mois</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">2</div>
                        <p className="text-xs text-muted-foreground">+1 par rapport au mois dernier</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
