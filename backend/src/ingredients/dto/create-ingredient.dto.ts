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
  currentCost!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  wastePercentage?: number;
}
