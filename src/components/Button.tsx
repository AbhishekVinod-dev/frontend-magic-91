import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "dark";
  size?: "default" | "sm" | "lg" | "icon";
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-primary text-primary-foreground hover:bg-success focus-visible:ring-primary",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-accent focus-visible:ring-primary",
    ghost:
      "bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:ring-primary",
    danger: "bg-danger text-primary-foreground hover:opacity-90 focus-visible:ring-danger",
    dark: "bg-ink text-primary-foreground hover:bg-ink-soft focus-visible:ring-primary",
  };

  const sizes = {
    default: "h-10 px-4 text-sm",
    sm: "h-8 px-3 text-xs",
    lg: "h-11 px-6 text-sm",
    icon: "size-9 p-0",
  };

  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}