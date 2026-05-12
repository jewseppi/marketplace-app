import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function SellerLoading() {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-8">
      <LoadingSpinner className="text-white" label="Loading seller dashboard" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="skeleton h-32 rounded-[2rem] opacity-40" />
        ))}
      </div>
    </div>
  );
}
