"use client";

import { createElement, type ComponentPropsWithoutRef, type ElementType } from "react";
import { registerLiquidHover, unregisterLiquidHover } from "./liquid-state";

type Props<T extends ElementType = "div"> = {
  as?: T;
  className?: string;
  children?: React.ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, "as" | "className" | "children">;

/**
 * Wraps a control so global liquid turbulence intensifies while pointer is inside (SVG filter).
 */
export function LiquidMorphSurface<T extends ElementType = "div">({
  as,
  className = "",
  children,
  ...rest
}: Props<T>) {
  const Comp = (as ?? "div") as ElementType;
  return createElement(
    Comp,
    {
      className: `liquid-morph ${className}`.trim(),
      onMouseEnter: () => registerLiquidHover(),
      onMouseLeave: () => unregisterLiquidHover(),
      ...rest,
    },
    children,
  );
}
