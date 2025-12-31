import { cn } from "@/lib/utils";
import { layout } from "@/lib/ui/tokens";
import { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  className?: string;
  /**
   * Max width variant
   * @default "dashboard" - Uses max-w-[1600px]
   */
  maxWidth?: "full" | "content" | "dashboard";
  /**
   * Padding variant
   * @default "standard" - Uses p-4 md:p-8 pt-20 md:pt-8
   */
  padding?: "standard" | "minimal";
}

/**
 * PageShell component for consistent page layout with safe area and background.
 * Designed for dashboard and content pages.
 * 
 * Usage:
 * ```tsx
 * <PageShell>
 *   <h1>Page Title</h1>
 *   <p>Content</p>
 * </PageShell>
 * ```
 */
export function PageShell({
  children,
  className,
  maxWidth = "dashboard",
  padding = "standard",
}: PageShellProps) {
  const maxWidthClass = layout.container[maxWidth];
  const paddingClass =
    padding === "standard"
      ? "p-4 md:p-8 pt-20 md:pt-8"
      : "p-4 md:p-6 pt-20 md:pt-6";

  return (
    <div
      className={cn(
        "min-h-screen bg-[#f8f9fc]",
        maxWidthClass,
        paddingClass,
        "mx-auto",
        className
      )}
    >
      {children}
    </div>
  );
}

