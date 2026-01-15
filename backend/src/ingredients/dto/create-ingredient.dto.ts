import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, Min } from 'class-validator';
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
}
