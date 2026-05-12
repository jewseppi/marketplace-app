"use client";

import { ErrorToast } from "@/components/ui/ErrorToast";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-6">
      <div className="w-full max-w-xl space-y-6">
        <ErrorToast
          title="Marketplace error"
          message={error.message || "An unexpected issue interrupted this page."}
        />
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
