import { cn } from "@/lib/utils";
import { layout, surface } from "@/lib/ui/tokens";
import { ReactNode } from "react";

interface SectionProps {
  children: ReactNode;
  className?: string;
  /**
   * Vertical padding size
   * @default "responsive" - Uses py-16 md:py-24
   */
  padding?: "small" | "medium" | "standard" | "large" | "xlarge" | "responsive";
  /**
   * Background variant
   */
  background?: "default" | "subtle" | "muted";
  /**
   * Show top border divider
   */
  divider?: boolean;
  /**
   * HTML id for anchor links
   */
  id?: string;
}

/**
 * Section component for consistent vertical spacing and optional backgrounds.
 * 
 * Usage:
 * ```tsx
 * <Section>
 *   <h2>Section Title</h2>
 *   <p>Content</p>
 * </Section>
 * ```
 */
export function Section({
  children,
  className,
  padding = "responsive",
  background = "default",
  divider = false,
  id,
}: SectionProps) {
  const paddingClass =
    padding === "responsive"
      ? layout.section.responsive
      : layout.section[padding];

  const backgroundClass =
    background === "default"
      ? ""
      : background === "subtle"
      ? surface.background.subtle
      : surface.background.muted;

  return (
    <section
      id={id}
      className={cn(
        paddingClass,
        backgroundClass,
        divider && "border-t border-gray-200",
        className
      )}
    >
      {children}
    </section>
  );
}

