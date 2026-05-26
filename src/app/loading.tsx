export default function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 animate-pulse" />
        <p className="text-sm text-zinc-500 animate-pulse-soft">Loading...</p>
      </div>
    </div>
  );
}
