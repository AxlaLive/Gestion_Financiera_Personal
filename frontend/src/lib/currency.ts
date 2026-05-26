type SupportedCurrency = 'COP' | 'USD';

const LOCALE_BY_CURRENCY: Record<SupportedCurrency, string> = {
  COP: 'es-CO',
  USD: 'en-US',
};

export function formatCurrency(amount: number, currency: SupportedCurrency = 'COP'): string {
  const locale = LOCALE_BY_CURRENCY[currency] ?? 'es-CO';
  const fractionDigits = currency === 'COP' ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function parseAmountInput(value: string): string {
  // Only allow digits and one decimal point
  const cleaned = value.replace(/[^0-9.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('');
  }
  if (parts[1] && parts[1].length > 2) {
    return parts[0] + '.' + parts[1].slice(0, 2);
  }
  return cleaned;
}

export function isValidAmount(value: string): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
}
