/** Placeholder shown in the match feed while the multicall is still loading —
 *  mirrors MatchCard's layout so the feed doesn't jump when real data lands. */
export function MatchCardSkeleton() {
  return (
    <div aria-hidden className="card">
      <div className="h-1 animate-pulse rounded-full bg-white/10" />
      <div className="mt-4 flex items-center justify-between">
        <div className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
        <div className="h-4 w-16 animate-pulse rounded-full bg-white/10" />
      </div>
      <div className="mt-3 h-9 animate-pulse rounded-xl bg-white/5" />
      <div className="mt-3 h-10 animate-pulse rounded-xl bg-white/5" />
    </div>
  );
}
