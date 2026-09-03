import { Service } from '../api/client';

export type MeasureUnit =
  | 'sqft'
  | 'kg'
  | 'qty'
  | 'room'
  | 'person'
  | 'point'
  | 'unit'
  | 'piece';

export type CategoryMeasure = {
  mode: 'dual' | 'single';
  unit: MeasureUnit;
  label: string;
  singular: string;
  short: string;
  placeholder: string;
  hint: string;
};

function single(
  unit: MeasureUnit,
  label: string,
  singular: string,
  short: string,
  placeholder: string,
  hint: string,
): CategoryMeasure {
  return { mode: 'single', unit, label, singular, short, placeholder, hint };
}

/** Matches website CategoryQuantity — each category has its own quantity unit. */
export function categoryMeasure(slug?: string | null): CategoryMeasure {
  const s = String(slug || '').toLowerCase().trim();

  if (s === 'aluminium-glass-work' || s.includes('aluminium') || s.includes('glass-work')) {
    return {
      mode: 'dual',
      unit: 'sqft',
      label: 'Square feet / Kilogram',
      singular: 'sq ft',
      short: 'sq ft',
      placeholder: 'e.g. 100',
      hint: 'Select unit, then enter how much you need. Total = rate × quantity.',
    };
  }

  if (s.includes('paint')) {
    return single('sqft', 'Square feet', 'sq ft', 'sq ft', 'e.g. 400', 'Price is for 1 sq ft. Enter the area.');
  }
  if (s.includes('clean')) {
    return single('room', 'Rooms', 'room', 'rooms', 'e.g. 3', 'Price is for 1 room. Enter how many rooms.');
  }
  if (s.includes('pest')) {
    return single('room', 'Rooms / BHK', 'room', 'rooms', 'e.g. 2', 'Price is for 1 room. Enter rooms / BHK to treat.');
  }
  if (s.includes('salon') || s.includes('beauty') || s.includes('spa')) {
    return single('person', 'Persons', 'person', 'persons', 'e.g. 2', 'Price is for 1 person. Enter how many people.');
  }
  if (s.includes('plumb')) {
    return single('point', 'Points', 'point', 'points', 'e.g. 2', 'Price is for 1 point. Enter taps / toilets / pipe points.');
  }
  if (s.includes('electric')) {
    return single('point', 'Points', 'point', 'points', 'e.g. 4', 'Price is for 1 point. Enter switches / fans / wiring points.');
  }
  if (s.includes('ac') || s.includes('air-condition') || s.includes('cooler')) {
    return single('unit', 'AC / cooler units', 'unit', 'units', 'e.g. 2', 'Price is for 1 AC/cooler. Enter how many units.');
  }
  if (s.includes('appliance')) {
    return single('unit', 'Appliances', 'appliance', 'units', 'e.g. 1', 'Price is for 1 appliance. Enter how many appliances.');
  }
  if (s.includes('carpent') || s.includes('wood') || s.includes('furnitur')) {
    return single('piece', 'Pieces', 'piece', 'pcs', 'e.g. 2', 'Price is for 1 piece. Enter how many items.');
  }

  return single('qty', 'Quantity', 'quantity', 'qty', 'e.g. 1', 'Price is for 1 quantity. Enter how many you need.');
}

export function isDualUnitService(service: Service | null | undefined): boolean {
  return categoryMeasure(service?.category?.slug).mode === 'dual';
}

/** @deprecated use isDualUnitService */
export function isAluminiumGlassService(service: Service | null | undefined): boolean {
  return isDualUnitService(service);
}

export const MEASURE_UNITS: { value: MeasureUnit; label: string }[] = [
  { value: 'sqft', label: 'Square feet' },
  { value: 'kg', label: 'Kg' },
];

export function measureLabel(unit?: MeasureUnit | string | null): string {
  return (
    {
      sqft: 'Square feet',
      kg: 'Kg',
      qty: 'Quantity',
      room: 'Rooms',
      person: 'Persons',
      point: 'Points',
      unit: 'Units',
      piece: 'Pieces',
    }[String(unit || '')] || String(unit || '')
  );
}

export function measureShort(unit?: MeasureUnit | string | null): string {
  return (
    {
      sqft: 'sq ft',
      kg: 'kg',
      qty: 'qty',
      room: 'rooms',
      person: 'persons',
      point: 'points',
      unit: 'units',
      piece: 'pcs',
    }[String(unit || '')] || String(unit || '')
  );
}

export function unitPrice(service: Service, unit?: MeasureUnit | string | null): number {
  const pick = (v: string | number | null | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const normalized = unit === 'inch' || unit === 'feet' ? 'sqft' : unit;

  const byUnit =
    normalized === 'sqft'
      ? pick(service.price_sqft) ?? pick(service.price_inch) ?? pick(service.price_feet)
      : normalized === 'kg'
        ? pick(service.price_kg)
        : null;

  return byUnit ?? (Number(service.price) || 0);
}

export function lineAmount(unitPriceValue: number, measure: number, quantity = 1): number {
  const m = Number.isFinite(measure) && measure > 0 ? measure : 0;
  const q = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
  return Number(unitPriceValue) * m * q;
}

export function availableMeasureUnits(service: Service): MeasureUnit[] {
  const meta = categoryMeasure(service.category?.slug);
  if (meta.mode !== 'dual') {
    return [meta.unit];
  }

  const pick = (v: string | number | null | undefined) => {
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  const units: MeasureUnit[] = [];
  if (pick(service.price_kg)) units.push('kg');
  if (pick(service.price_sqft) ?? pick(service.price_inch) ?? pick(service.price_feet)) {
    units.push('sqft');
  }

  return units.length > 0 ? units : ['sqft', 'kg'];
}

export function defaultMeasureUnit(service: Service): MeasureUnit {
  return availableMeasureUnits(service)[0] ?? categoryMeasure(service.category?.slug).unit;
}
