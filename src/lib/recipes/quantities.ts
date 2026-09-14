import type { Ingredient, Quantity } from './schema';
import { units } from './units';

export function scaledQuantity(quantity: Quantity, factor: number): Quantity {
  if (!Number.isFinite(factor) || factor <= 0)
    throw new Error('Scaling factor must be positive and finite');
  if (quantity.kind === 'text') return quantity;
  if (quantity.kind === 'range')
    return {
      kind: 'range',
      min: quantity.min * factor,
      max: quantity.max * factor,
    };
  return { kind: 'number', value: quantity.value * factor };
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('cs-CZ', { maximumSignificantDigits: 4 }).format(
    value,
  );
}

function unitLabel(unit: Ingredient['unit'], quantity: Quantity) {
  if (!unit) return '';
  if (!['cup', 'tbsp', 'tsp'].includes(unit)) return units[unit];
  const value =
    quantity.kind === 'number'
      ? quantity.value
      : quantity.kind === 'range'
        ? quantity.max
        : 0;
  const forms = {
    cup: ['hrnek', 'hrnky', 'hrnku'],
    tbsp: ['lžíce', 'lžíce', 'lžíce'],
    tsp: ['lžička', 'lžičky', 'lžičky'],
  };
  const options = forms[unit as keyof typeof forms];
  return options[
    value === 1
      ? 0
      : Number.isInteger(value) && value >= 2 && value <= 4
        ? 1
        : 2
  ];
}

export function formatIngredient(ingredient: Ingredient, factor = 1): string {
  const q = scaledQuantity(ingredient.quantity, factor);
  if (q.kind === 'text') return q.text;
  const amount =
    q.kind === 'number'
      ? formatNumber(q.value)
      : `${formatNumber(q.min)}–${formatNumber(q.max)}`;
  return `${ingredient.approximate ? 'cca ' : ''}${amount} ${unitLabel(ingredient.unit, q)}`.trim();
}
