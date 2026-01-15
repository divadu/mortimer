import { UnitType } from '@prisma/client';

/**
 * Convierte una cantidad de cualquier unidad a su unidad BASE
 * Sólidos: BASE = GRAM
 * Líquidos: BASE = MILLILITER
 * Unidades: sin conversión (1:1)
 */
export function convertToBaseUnit(
  amount: number,
  fromUnit: UnitType,
): number {
  switch (fromUnit) {
    case 'KILOGRAM':
      return amount * 1000; // 1 kg = 1000 g
    case 'GRAM':
      return amount; // Ya está en unidad base
    case 'MILLILITER':
      return amount; // Ya está en unidad base
    case 'UNIT':
      return amount; // Unidades no se convierten
    default:
      throw new Error(`Unidad no soportada: ${fromUnit}`);
  }
}

/**
 * Convierte una cantidad desde la unidad BASE a la unidad deseada
 * Sólidos: BASE = GRAM
 * Líquidos: BASE = MILLILITER
 */
export function convertFromBaseUnit(
  baseAmount: number,
  toUnit: UnitType,
): number {
  switch (toUnit) {
    case 'KILOGRAM':
      return baseAmount / 1000; // 1000 g = 1 kg
    case 'GRAM':
      return baseAmount; // Ya está en gramos
    case 'MILLILITER':
      return baseAmount; // Ya está en ml
    case 'UNIT':
      return baseAmount; // Unidades no se convierten
    default:
      throw new Error(`Unidad no soportada: ${toUnit}`);
  }
}

/**
 * Obtiene la unidad base para un tipo de unidad dado
 */
export function getBaseUnit(unit: UnitType): UnitType {
  switch (unit) {
    case 'KILOGRAM':
    case 'GRAM':
      return 'GRAM';
    case 'MILLILITER':
      return 'MILLILITER';
    case 'UNIT':
      return 'UNIT';
    default:
      throw new Error(`Unidad no soportada: ${unit}`);
  }
}

/**
 * Determina si dos unidades son del mismo tipo (compatible para conversión)
 */
export function areUnitsCompatible(unit1: UnitType, unit2: UnitType): boolean {
  return getBaseUnit(unit1) === getBaseUnit(unit2);
}

/**
 * Obtiene el nombre de la unidad en español para display
 */
export function getUnitLabel(unit: UnitType, plural = false): string {
  const labels = {
    KILOGRAM: plural ? 'kilogramos' : 'kilogramo',
    GRAM: plural ? 'gramos' : 'gramo',
    MILLILITER: plural ? 'mililitros' : 'mililitro',
    UNIT: plural ? 'unidades' : 'unidad',
  };
  return labels[unit] || unit;
}

/**
 * Obtiene la abreviatura de la unidad
 */
export function getUnitAbbreviation(unit: UnitType): string {
  const abbreviations = {
    KILOGRAM: 'kg',
    GRAM: 'g',
    MILLILITER: 'ml',
    UNIT: 'u',
  };
  return abbreviations[unit] || unit;
}
