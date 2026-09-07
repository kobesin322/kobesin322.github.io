export const PRICE_MIN = 176;
export const PRICE_MAX = 204;
export const CHART_Y0 = 0.32;
export const CHART_H = 2.28;

export function yForPrice(price: number): number {
  const t = (price - PRICE_MIN) / (PRICE_MAX - PRICE_MIN);
  return CHART_Y0 + t * CHART_H;
}

export function priceForY(y: number): number {
  const t = Math.min(1, Math.max(0, (y - CHART_Y0) / CHART_H));
  return PRICE_MIN + t * (PRICE_MAX - PRICE_MIN);
}

export function roundPrice(price: number): number {
  return Math.round(price * 10) / 10;
}
