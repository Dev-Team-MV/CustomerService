export function formatPriceInput(value) {
  let cleaned = value.replace(/[^\d.,]/g, '');
  cleaned = cleaned.replace(/,/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  const [integer, decimal] = cleaned.split('.');
  let formatted = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (decimal !== undefined) formatted += '.' + decimal;
  return formatted;
}

export function parsePriceInput(value) {
  if (!value) return '';
  const cleaned = value.replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? '' : num;
}