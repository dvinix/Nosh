import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="font-medium animate-pulse">Loading...</p>
      </div>
    </div>
  )
}
