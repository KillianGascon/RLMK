"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Settings, UserCheck, Crown, Trash2 } from "lucide-react"

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
    const [currentUserRole, setCurrentUserRole] = useState<"admin" | "member">("member")

    // 🔹 Charger les utilisateurs du foyer
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`/api/foyer/${foyerId}/users`)
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

            // rôle de l'utilisateur connecté (ex: stocké en localStorage)
            const role = localStorage.getItem("userRole") as "admin" | "member" | null
            if (role) setCurrentUserRole(role)
        }

        fetchUsers()
    }, [foyerId])

    // 🔹 Modifier le rôle
    const handleRoleChange = async (userId: number, newRole: "admin" | "member") => {
        const res = await fetch(`/api/foyer/${foyerId}/users/${userId}/role`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        })

        if (res.ok) {
            setUsers((prev) =>
                prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
            )
        }
    }

    // 🔹 Supprimer un utilisateur
    const handleDelete = async (userId: number) => {
        const res = await fetch(`/api/foyer/${foyerId}/users/${userId}`, {
            method: "DELETE",
        })

        if (res.ok) {
            setUsers((prev) => prev.filter((u) => u.id !== userId))
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

                                {/* Icônes actions seulement si admin */}
                                {currentUserRole === "admin" && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                handleRoleChange(user.id, user.role === "admin" ? "member" : "admin")
                                            }
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(user.id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
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
                            <div className="pt-2 border-t text-xs text-muted-foreground">
                                Rejoint le {new Date(user.joinDate).toLocaleDateString("fr-FR")}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
