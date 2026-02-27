'use client'

import { useEffect } from 'react'

export default function AircraftError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Aircraft route error:", error)
    }, [error])

    return (
        <div className="flex h-full min-h-[400px] flex-col items-center justify-center space-y-4 p-8 border border-red-200 rounded-lg bg-red-50/50 dark:bg-red-950/10 dark:border-red-900/50">
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">Aircraft Module Error</h2>
            <p className="text-sm text-muted-foreground">{error.message || "An error occurred while loading aircraft data."}</p>
            <button
                className="px-4 py-2 border bg-background hover:bg-accent rounded-md text-sm transition"
                onClick={() => reset()}
            >
                Try again
            </button>
        </div>
    )
}
