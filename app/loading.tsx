// Best practices for loading UI:
// - Use loading.tsx only for initial app loads or major route transitions.
// - For data fetching inside pages, show skeletons, placeholders, or partial content instead of returning null.
// - Use Suspense boundaries or local loading states for finer control.
export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="relative">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary/30 border-t-primary shadow-lg" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-7 h-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.5 6.5l3 3-3 3m3-3H6" />
            </svg>
          </div>
        </div>
        <span className="text-muted-foreground text-sm tracking-wide">Loading Pilot Handbook...</span>
      </div>
    </div>
  );
}
