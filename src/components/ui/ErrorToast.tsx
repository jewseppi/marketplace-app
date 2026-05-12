import { cn } from "@/lib/utils";

export function ErrorToast({
  title = "Something went wrong",
  message,
  className,
}: {
  title?: string;
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 shadow-sm",
        className,
      )}
      role="alert"
      aria-live="assertive"
    >
      <p className="font-semibold">{title}</p>
      <p className="mt-1 text-rose-700">{message}</p>
    </div>
  );
}
