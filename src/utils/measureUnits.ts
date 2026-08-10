import { Service } from '../api/client';

export type MeasureUnit = 'inch' | 'feet' | 'kg';

export const MEASURE_UNITS: { value: MeasureUnit; label: string }[] = [
  { value: 'inch', label: 'Inch' },
  { value: 'feet', label: 'Feet' },
  { value: 'kg', label: 'Kg' },
];

export const ALUM_GLASS_CATEGORY_SLUG = 'aluminium-glass-work';

/** Only Aluminium & Glass Working category gets unit (inch/feet/kg) selection. */
export function isAluminiumGlassService(service: Service | null | undefined): boolean {
  if (!service) return false;
  return service.category?.slug === ALUM_GLASS_CATEGORY_SLUG;
}

export function measureLabel(unit?: MeasureUnit | string | null): string {
  return MEASURE_UNITS.find((u) => u.value === unit)?.label ?? String(unit || '');
}

export function lineAmount(
  unitPrice: number,
  measure: number,
  quantity = 1,
): number {
  const m = Number.isFinite(measure) && measure > 0 ? measure : 1;
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  return Number(unitPrice) * m * q;
}
