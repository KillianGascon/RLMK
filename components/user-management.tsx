"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Mail, Phone, Settings, UserCheck, Crown, Trash2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// --- User type definition ---
interface User {
    id: number
    name: string
    email: string
    phone?: string
    role: "admin" | "member" | null
    joinDate: string
}

interface UserApiResponse {
    id: number
    name: string
    email: string
    phone?: string | null
    role?: "admin" | "member" | null
}


export function UserManagement({ foyerId }: { foyerId: number }) {
    // --- State: list of users ---
    const [users, setUsers] = useState<User[]>([])

    // --- State: current logged-in user's role (default member) ---
    const [currentUserRole, setCurrentUserRole] = useState<"admin" | "member">("member")

    // --- State for role edit dialog ---
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [newRole, setNewRole] = useState<"admin" | "member">("member")

    // 🔹 Fetch users for this foyer
    useEffect(() => {
        const fetchUsers = async () => {
            const res = await fetch(`/api/foyer/${foyerId}/users`)
            const data: UserApiResponse[] = await res.json()

            // Map API -> User
            const mapped: User[] = data.map((u) => ({
                id: u.id,
                name: u.name,
                email: u.email,
                role: u.role ?? null,
                phone: u.phone || undefined,
                // TODO: à remplacer par la vraie valeur si ton API renvoie "joinDate"
                joinDate: new Date().toISOString().split("T")[0],
            }))

            setUsers(mapped)

            // Charger rôle utilisateur connecté
            const role = localStorage.getItem("userRole") as "admin" | "member" | null
            if (role) setCurrentUserRole(role)
        }

        fetchUsers()
    }, [foyerId])


    // 🔹 Change a user's role (API + local state update)
    const handleRoleChange = async () => {
        if (!selectedUser) return
        const res = await fetch(`/api/foyer/${foyerId}/users/${selectedUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ role: newRole }),
        })

        if (res.ok) {
            // Update local state
            setUsers((prev) =>
                prev.map((u) => (u.id === selectedUser.id ? { ...u, role: newRole } : u))
            )
            setSelectedUser(null) // close dialog
        }
    }

    // 🔹 Delete a user
    const handleDelete = async (userId: number) => {
        const res = await fetch(`/api/foyer/${foyerId}/users/${userId}`, {
            method: "DELETE",
        })

        if (res.ok) {
            // Remove user from local state
            setUsers((prev) => prev.filter((u) => u.id !== userId))
        }
    }

    // 🔹 Return role icon
    const getRoleIcon = (role: string | null) => {
        return role === "admin" ? <Crown className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />
    }

    // 🔹 Return role badge
    const getRoleBadge = (role: string | null) => {
        return role === "admin" ? (
            <Badge className="bg-purple-100 text-purple-800">Administrator</Badge>
        ) : (
            <Badge variant="secondary">Member</Badge>
        )
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* --- Page Header --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold">User Management</h2>
                    <p className="text-sm md:text-base text-muted-foreground">
                        Manage your household members and their permissions
                    </p>
                </div>
            </div>

            {/* --- Users Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {users.map((user) => (
                    <Card key={user.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                {/* User avatar + name + role */}
                                <div className="flex items-center gap-2 md:gap-3">
                                    <Avatar className="w-8 h-8 md:w-10 md:h-10">
                                        <AvatarFallback className="text-xs md:text-sm">
                                            {/* Initials based on name */}
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

                                {/* Action buttons only if current user is admin AND not their own account */}
                                {currentUserRole === "admin" && localStorage.getItem("userEmail") !== user.email && (
                                    <div className="flex gap-2">
                                        {/* Edit role button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedUser(user)
                                                setNewRole(user.role ?? "member")
                                            }}
                                        >
                                            <Settings className="h-4 w-4" />
                                        </Button>

                                        {/* Delete user button */}
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

                        {/* --- User info content --- */}
                        <CardContent className="space-y-2 md:space-y-3">
                            {/* Email */}
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            {/* Phone (optional) */}
                            {user.phone && (
                                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                                    <Phone className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            {/* Join date */}
                            <div className="pt-2 border-t text-xs text-muted-foreground">
                                Joined on {new Date(user.joinDate).toLocaleDateString("fr-FR")}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* --- Role edit dialog --- */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Role</DialogTitle>
                        <DialogDescription>
                            Choose a new role for {selectedUser?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Select role */}
                    <Select value={newRole} onValueChange={(v: "admin" | "member") => setNewRole(v)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="admin">Administrator</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Dialog actions */}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedUser(null)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRoleChange}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
