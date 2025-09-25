// Registration page for HomeManager
export default function RegisterPage() {
    // State for form fields, error, loading, and password visibility
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Handles input changes for form fields
    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Handles form submission and registration
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        // Validate required fields
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError("Please fill in all fields")
            setIsLoading(false)
            return
        }

        // Validate password match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            setIsLoading(false)
            return
        }

        // Validate password length
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters")
            setIsLoading(false)
            return
        }

        try {
            // Send registration request to API
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            // Handle errors from API
            if (!res.ok) {
                setError(data.error || "An error occurred")
            } else {
                router.push("/login") // Redirect to login page on success
            }
        } catch (err) {
            console.error(err)
            setError("Server connection error")
        } finally {
            setIsLoading(false)
        }
    }

    // Renders registration form UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mx-auto mb-4">
                        <Home className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Register</CardTitle>
                    <CardDescription>Create your HomeManager account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={formData.email}
                                onChange={(e) => handleInputChange("email", e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => handleInputChange("password", e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                    required
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Creating account..." : "Create my account"}
                        </Button>

                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">Already have an account? </span>
                            <Link href="/login" className="text-primary hover:underline">
                                Log in
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
