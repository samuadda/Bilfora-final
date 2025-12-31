import { cn } from "@/lib/utils";
import { layout } from "@/lib/ui/tokens";
import { ReactNode } from "react";

interface FormRowProps {
  children: ReactNode;
  className?: string;
  /**
   * Gap spacing between children
   * @default "standard"
   */
  gap?: "tight" | "standard" | "medium" | "large";
  /**
   * Responsive columns
   */
  columns?: 1 | 2 | 3;
}

/**
 * FormRow component for consistent form field spacing and layout.
 * 
 * Usage:
 * ```tsx
 * <FormRow columns={2}>
 *   <Field label="First Name">...</Field>
 *   <Field label="Last Name">...</Field>
 * </FormRow>
 * ```
 */
export function FormRow({
  children,
  className,
  gap = "standard",
  columns = 1,
}: FormRowProps) {
  const gapClass = layout.gap[gap];
  const gridClass =
    columns === 1
      ? "grid-cols-1"
      : columns === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid", gridClass, gapClass, className)}>
      {children}
    </div>
  );
}

