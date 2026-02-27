import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
            <h2 className="text-3xl font-bold">404 - Not Found</h2>
            <p className="text-muted-foreground">Could not find requested resource</p>
            <Link
                href="/"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
                Return Home
            </Link>
        </div>
    )
}
