// Login page for HomeManager
export default function LoginPage() {
    // State for form fields, error, loading, and password visibility
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    // Handles form submission and authentication
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            // Send login request to API
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            })
            const data = await res.json()

            // Handle errors from API
            if (!res.ok) {
                setError(data.error || "Login failed")
                setIsLoading(false)
                return
            }

            // Store user info and available households in localStorage
            localStorage.setItem("isAuthenticated", "true")
            localStorage.setItem("token", data.token)
            localStorage.setItem("userEmail", data.user.email)
            localStorage.setItem("userName", data.user.name)
            localStorage.setItem("userRole", data.user.role)
            if (data.user.foyers) {
                localStorage.setItem("userFoyers", JSON.stringify(data.user.foyers))
            }

            // Redirect to household selection page
            router.push("/foyer")
        } catch (err) {
            console.error("Frontend error:", err)
            setError("Server error, please try again later.")
        } finally {
            setIsLoading(false)
        }
    }

    // Renders login form UI
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex items-center justify-center w-16 h-16 bg-primary rounded-lg mx-auto mb-4">
                        <Home className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Login</CardTitle>
                    <CardDescription>Sign in to your HomeManager account</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Logging in..." : "Login"}
                        </Button>
                        <div className="text-center text-sm">
                            <span className="text-muted-foreground">No account yet? </span>
                            <Link href="/register" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}