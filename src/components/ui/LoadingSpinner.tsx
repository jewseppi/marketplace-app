import { cn } from "@/lib/utils";

export function LoadingSpinner({
  className,
  label = "Loading",
  size = "md",
}: {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  }[size];

  return (
    <div className={cn("inline-flex items-center gap-3", className)} role="status" aria-live="polite">
      <span className={cn("animate-spin rounded-full border-black/10 border-t-current", sizeClass)} aria-hidden="true" />
      <span className="text-sm text-current opacity-80">{label}</span>
    </div>
  );
}
