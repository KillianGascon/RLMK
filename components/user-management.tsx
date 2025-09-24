"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
    id: number
    name: string
    email: string
    phone?: string
    role: "admin" | "member" | null
    joinDate: string
}

export function UserManagement({ foyerId }: { foyerId: number }) {
    const [users, setUsers] = useState<User[]>([])
    const [isAddUserOpen, setIsAddUserOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        email: "",
        role: "member" as "admin" | "member",
    })

    // 🔹 Charger les utilisateurs du foyer
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`/api/foyer/1/users`)
            const data = await res.json()

            const mapped: User[] = data.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role as "admin" | "member" | null,
                phone: u.phone || undefined,
                joinDate: new Date().toISOString().split("T")[0],
            }))

            setUsers(mapped)
        }

        fetchUsers()
    }, [foyerId])


    // 🔹 Ajouter un utilisateur dans le foyer
    const handleAddUser = async () => {
        if (!newUser.email) return

        const res = await fetch(`/api/foyers/${foyerId}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: 1, // ⚠️ ici tu devras récupérer l'ID de l'utilisateur via un SELECT sur son email
                role: newUser.role,
            }),
        })

        if (res.ok) {
            setIsAddUserOpen(false)
            setNewUser({ email: "", role: "member" })
            // Recharge les users
            const data = await res.json()
            console.log("✅ Utilisateur ajouté:", data)
        } else {
            console.error("❌ Erreur lors de l’ajout")
        }
    }

    const getRoleIcon = (role: string | null) => {
        return role === "admin" ? <Crown className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
    }

    const getRoleBadge = (role: string | null) => {
        return role === "admin" ? (
            <Badge className="bg-purple-100 text-purple-800">Administrateur</Badge>
        ) : (
            <Badge variant="secondary">Membre</Badge>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">Gestion des utilisateurs</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Gérez les membres de votre foyer et leurs permissions
                    </p>
                </div>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Avatar className="w-8 h-8 md:w-10 md:h-10">
                                        {/*<AvatarImage src={user.avatar || "/placeholder.svg"} />*/}
                                        <AvatarFallback className="text-xs md:text-sm">
                                            {user.name.split(" ").map((n) => n[0]).join("")}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-sm md:text-lg">{user.name}</CardTitle>
                                        <div className="flex items-center gap-1 mt-1">
                                            {getRoleIcon(user.role)}
                                            {getRoleBadge(user.role)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2 md:space-y-3">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Rejoint le </span>
                    {new Date(user.joinDate).toLocaleDateString("fr-FR")}
                </span>
                                <Button variant="ghost" size="sm">
                                    <Settings className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
