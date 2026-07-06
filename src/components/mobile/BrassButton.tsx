"use client";

import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type BrassButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  href?: string;
  variant?: "primary" | "secondary" | "text";
};

export function BrassButton({ children, href, variant = "primary", className = "", ...buttonProps }: BrassButtonProps) {
  const classes = `xs-brass-button xs-brass-button--${variant} xs-pressable ${className}`.trim();

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button {...buttonProps} className={classes}>{children}</button>;
}
