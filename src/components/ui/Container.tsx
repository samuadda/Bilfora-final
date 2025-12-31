import { cn } from "@/lib/utils";
import { layout } from "@/lib/ui/tokens";
import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "full" | "content" | "dashboard";
}

/**
 * Container component for consistent max-width and horizontal padding.
 * 
 * Usage:
 * ```tsx
 * <Container>
 *   <h1>Content</h1>
 * </Container>
 * ```
 */
export function Container({
  children,
  className,
  maxWidth = "full",
}: ContainerProps) {
  const maxWidthClass = layout.container[maxWidth];
  const paddingClass = layout.paddingX.responsive;

  return (
    <div
      className={cn(
        "mx-auto",
        maxWidthClass,
        paddingClass,
        className
      )}
    >
      {children}
    </div>
  );
}

