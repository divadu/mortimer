import { IsString, IsNotEmpty, IsNumber, IsArray, ValidateNested, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemDto {
  @IsString()
  @IsOptional()
  ingredientId?: string;

  @IsString()
  @IsOptional()
  preparationId?: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(1)
  servings!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items!: RecipeItemDto[];
}
