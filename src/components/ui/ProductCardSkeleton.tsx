export function ProductCardSkeleton({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-lg border ${dark ? "border-gray-800 bg-gray-950" : "border-gray-200 bg-white"}`}>
      <div className={`skeleton aspect-square w-full ${dark ? "opacity-70" : ""}`} />
      <div className="space-y-3 p-5">
        <div className="skeleton h-5 w-2/3 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
        <div className="flex items-center justify-between pt-2">
          <div className="skeleton h-6 w-24 rounded" />
          <div className="skeleton h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}
