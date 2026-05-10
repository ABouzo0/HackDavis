let liquidHoverDepth = 0;

export function registerLiquidHover() {
  liquidHoverDepth += 1;
}

export function unregisterLiquidHover() {
  liquidHoverDepth = Math.max(0, liquidHoverDepth - 1);
}

export function getLiquidHoverBoost(): number {
  return liquidHoverDepth > 0 ? 1 : 0;
}
