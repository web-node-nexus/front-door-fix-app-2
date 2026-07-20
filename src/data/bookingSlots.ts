export const TIME_SLOTS = [
  '08:00 - 10:00',
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
];

function localDateValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function nextDates(count = 14): { label: string; value: string }[] {
  const dates: { label: string; value: string }[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const value = localDateValue(d);
    const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    dates.push({ label, value });
  }
  return dates;
}
