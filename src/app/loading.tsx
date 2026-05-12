import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <LoadingSpinner size="lg" label="Loading the marketplace" />
    </div>
  );
}
