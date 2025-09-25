// Displays a list of foyers for the user to choose from.
// Loads foyers from localStorage on mount.
export default function ChooseFoyerPage() {
    const [foyers, setFoyers] = useState<{ id: number; name: string; role: string }[]>([])
    const router = useRouter()

    useEffect(() => {
        // Retrieve foyers from localStorage
        const foyersFromStorage = localStorage.getItem("userFoyers")
        if (foyersFromStorage) {
            setFoyers(JSON.parse(foyersFromStorage))
        }
    }, [])

    // Handles foyer selection: saves ID and redirects
    const handleChoose = (foyerId: number) => {
        localStorage.setItem("foyerId", foyerId.toString())
        router.push("/") // Redirect to dashboard
    }

    // Renders foyer selection UI
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Choisissez un foyer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {foyers.map((f) => (
                        <Button key={f.id} className="w-full" onClick={() => handleChoose(f.id)}>
                            {f.name} ({f.role})
                        </Button>
                    ))}
                </CardContent>
            </Card>
        </div>
    )
}