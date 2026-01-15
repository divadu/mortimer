import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';

export enum UnitType {
  KG = 'kg',
  G = 'g',
  L = 'l',
  ML = 'ml',
  UNIT = 'unit',
}

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(UnitType)
  unit!: UnitType;

  @IsNumber()
  @Min(0)
  currentCost!: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  supplierId?: string;
}
