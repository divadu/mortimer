import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min, Max } from 'class-validator';
import { $Enums } from '@prisma/client';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum($Enums.UnitType)
  unit!: $Enums.UnitType;

  @IsNumber()
  @Min(0)
  currentCost!: number; // Costo por unidad BASE (gramo o ml según tipo)

  @IsNumber()
  @Min(0)
  @IsOptional()
  minStock?: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  wastePercentage?: number;

  // Campos opcionales para registrar compra y calcular costo automáticamente
  @IsNumber()
  @Min(0)
  @IsOptional()
  purchaseQuantity?: number; // Cantidad comprada en purchaseUnit

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchaseCost?: number; // Costo total de la compra

  @IsEnum($Enums.UnitType)
  @IsOptional()
  purchaseUnit?: $Enums.UnitType; // Unidad de la compra
}
