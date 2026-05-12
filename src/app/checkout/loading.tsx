import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-white px-6 pt-32">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="skeleton h-10 w-48 rounded" />
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-4 border-b border-gray-100 pb-6">
                <div className="skeleton h-24 w-24 rounded-xl" />
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-5 w-2/5 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-1/3 rounded" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-gray-200 p-6">
            <LoadingSpinner label="Loading checkout details" />
          </div>
        </div>
      </div>
    </div>
  );
}
