import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function AdminLoading() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
      <LoadingSpinner className="text-white" label="Loading admin panel" />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="skeleton h-28 rounded-[2rem] opacity-40" />
        ))}
      </div>
    </div>
  );
}
