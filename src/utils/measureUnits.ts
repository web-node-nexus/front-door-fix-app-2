import { Service } from '../api/client';

export type MeasureUnit = 'sqft' | 'kg';

export const MEASURE_UNITS: { value: MeasureUnit; label: string }[] = [
  { value: 'sqft', label: 'Square feet' },
  { value: 'kg', label: 'Kg' },
];

export const ALUM_GLASS_CATEGORY_SLUG = 'aluminium-glass-work';

/** Only Aluminium & Glass Working category gets unit (sq ft / kg) selection. */
export function isAluminiumGlassService(service: Service | null | undefined): boolean {
  if (!service) return false;
  return service.category?.slug === ALUM_GLASS_CATEGORY_SLUG;
}

export function measureLabel(unit?: MeasureUnit | string | null): string {
  return MEASURE_UNITS.find((u) => u.value === unit)?.label ?? String(unit || '');
}

/** Unit-specific rate from admin (falls back to legacy price). */
export function unitPrice(service: Service, unit?: MeasureUnit | string | null): number {
  const pick = (v: string | number | null | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const normalized =
    unit === 'inch' || unit === 'feet' ? 'sqft' : unit;

  const byUnit =
    normalized === 'sqft'
      ? pick(service.price_sqft) ?? pick(service.price_inch) ?? pick(service.price_feet)
      : normalized === 'kg'
        ? pick(service.price_kg)
        : null;

  return byUnit ?? (Number(service.price) || 0);
}

export function lineAmount(
  unitPriceValue: number,
  measure: number,
  quantity = 1,
): number {
  const m = Number.isFinite(measure) && measure > 0 ? measure : 1;
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  return Number(unitPriceValue) * m * q;
}

/** Units with a rate on this service (kg / sq ft). */
export function availableMeasureUnits(service: Service): MeasureUnit[] {
  const pick = (v: string | number | null | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const units: MeasureUnit[] = [];
  if (pick(service.price_kg)) units.push('kg');
  if (pick(service.price_sqft) ?? pick(service.price_inch) ?? pick(service.price_feet)) {
    units.push('sqft');
  }

  if (units.length > 0) {
    return units;
  }

  if (isAluminiumGlassService(service)) {
    return ['sqft', 'kg'];
  }

  return [];
}
