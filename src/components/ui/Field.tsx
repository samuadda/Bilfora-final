import { cn } from "@/lib/utils";
import { Label } from "./typography";
import { ReactNode } from "react";

interface FieldProps {
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Field wrapper component for consistent form field layout.
 * Combines label, description, input, and error message.
 * 
 * Usage:
 * ```tsx
 * <Field label="Email" description="Enter your email address" error={errors.email}>
 *   <input type="email" />
 * </Field>
 * ```
 */
export function Field({
  label,
  description,
  error,
  required,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      {children}
      {error && (
        <p className="text-xs text-red-600 font-medium">{error}</p>
      )}
    </div>
  );
}

