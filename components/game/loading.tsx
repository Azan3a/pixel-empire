export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <div className="size-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
        <div className="text-xl font-bold text-emerald-500 tracking-widest uppercase animate-pulse">
          Initializing World...
        </div>
      </div>
    </div>
  );
}
