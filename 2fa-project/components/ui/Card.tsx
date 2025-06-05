import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outline" | "glass" | "flat" | "hover";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
}

export function Card({
  className,
  children,
  variant = "default",
  padding = "md",
  ...props
}: CardProps) {
  // Base styles for all card variants
  const baseStyles = "rounded-lg transition-all duration-200";

  // Padding options
  const paddingStyles = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
    xl: "p-8",
  };

  // Variant-specific styles
  const variantStyles = {
    default:
      "bg-white dark:bg-[var(--neutral-800)] border border-[var(--border-light)] dark:border-[var(--border-dark)] shadow-sm",
    elevated:
      "bg-white dark:bg-[var(--neutral-800)] border border-[var(--border-light)] dark:border-[var(--border-dark)] shadow-[var(--shadow-medium)]",
    outline:
      "bg-transparent border border-[var(--border-light)] dark:border-[var(--border-dark)]",
    glass: "glass-card",
    flat: "bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)] border-none",
    hover:
      "bg-white dark:bg-[var(--neutral-800)] border border-[var(--border-light)] dark:border-[var(--border-dark)] shadow-sm hover:shadow-md hover:-translate-y-1",
  };

  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  bordered?: boolean;
  withBg?: boolean;
}

export function CardHeader({
  className,
  children,
  bordered = false,
  withBg = false,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={cn(
        "mb-4 px-1",
        bordered &&
          "pb-4 border-b border-[var(--border-light)] dark:border-[var(--border-dark)]",
        withBg &&
          "bg-[var(--neutral-50)] dark:bg-[var(--neutral-900)] p-4 -mx-5 -mt-5 rounded-t-lg",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({
  className,
  children,
  as: Component = "h3",
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn("text-xl font-medium text-[var(--foreground)]", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn("text-sm text-[var(--neutral-500)] mt-1.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardContent({
  className,
  children,
  ...props
}: CardContentProps) {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  bordered?: boolean;
  alignment?: "left" | "center" | "right" | "between";
}

export function CardFooter({
  className,
  children,
  bordered = false,
  alignment = "left",
  ...props
}: CardFooterProps) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn(
        "mt-6 pt-4 flex items-center",
        alignmentClasses[alignment],
        bordered &&
          "border-t border-[var(--border-light)] dark:border-[var(--border-dark)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardActionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function CardAction({ className, children, ...props }: CardActionProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)} {...props}>
      {children}
    </div>
  );
}

interface CardBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info";
}

export function CardBadge({
  className,
  children,
  variant = "default",
  ...props
}: CardBadgeProps) {
  const variantClasses = {
    default:
      "bg-[var(--neutral-100)] dark:bg-[var(--neutral-800)] text-[var(--neutral-600)] dark:text-[var(--neutral-300)]",
    primary: "bg-[var(--primary)] bg-opacity-10 text-[var(--foreground)]",
    secondary: "bg-[var(--secondary)] bg-opacity-10 text-[var(--foreground)]",
    success: "bg-[var(--success)] bg-opacity-10 text-[var(--foreground)]",
    warning: "bg-[var(--warning)] bg-opacity-10 text-[var(--foreground)]",
    error: "bg-[var(--error)] bg-opacity-10 text-[var(--foreground)]",
    info: "bg-[var(--info)] bg-opacity-10 text-[var(--foreground)]",
  };

  return (
    <div
      className={cn(
        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
