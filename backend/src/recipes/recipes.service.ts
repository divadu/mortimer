import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { $Enums } from '@prisma/client';

export interface CostBreakdownItem {
  name: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  type: 'ingredient' | 'preparation';
}

export interface RecipeCostCalculation {
  totalCost: number;
  costPerServing: number;
  costWithWaste: number;
  costPerServingWithWaste: number;
  breakdown: CostBreakdownItem[];
}

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  async create(createRecipeDto: CreateRecipeDto, userId: string) {
    const { items, ...recipeData } = createRecipeDto;

    const recipe = await this.prisma.recipe.create({
      data: {
        ...recipeData,
        items: {
          create: items.map((item) => ({
            ingredientId: item.ingredientId,
            preparationId: item.preparationId,
            amount: item.quantity,
            unit: $Enums.UnitType.UNIT, // Unidad por defecto, cada ingrediente tiene su propia unidad
          })),
        },
      },
      include: {
        items: {
          include: {
            ingredient: true,
            preparation: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'create',
        module: 'recipes',
        entityId: recipe.id,
        newValue: recipe,
      },
    });

    return recipe;
  }

  async findAll(params?: { skip?: number; take?: number; search?: string }) {
    const { skip = 0, take = 20, search } = params || {};

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take,
        include: {
          items: {
            include: {
              ingredient: true,
              preparation: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.recipe.count({ where }),
    ]);

    return {
      data: recipes,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            ingredient: true,
            preparation: true,
          },
        },
      },
    });

    if (!recipe || recipe.deletedAt) {
      throw new NotFoundException(`Receta con ID ${id} no encontrada`);
    }

    return recipe;
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto, userId: string) {
    const existing = await this.findOne(id);
    const { items, ...recipeData } = updateRecipeDto;

    // Delete existing items and create new ones
    await this.prisma.recipeItem.deleteMany({
      where: { recipeId: id },
    });

    const updated = await this.prisma.recipe.update({
      where: { id },
      data: {
        ...recipeData,
        items: items
          ? {
              create: items.map((item) => ({
                ingredientId: item.ingredientId,
                preparationId: item.preparationId,
                amount: item.quantity,
                unit: $Enums.UnitType.UNIT,
              })),
            }
          : undefined,
      },
      include: {
        items: {
          include: {
            ingredient: true,
            preparation: true,
          },
        },
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'update',
        module: 'recipes',
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);

    await this.prisma.recipe.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'delete',
        module: 'recipes',
        entityId: id,
        oldValue: existing,
      },
    });

    return { message: 'Receta eliminada correctamente' };
  }

  async calculateCost(id: string): Promise<RecipeCostCalculation> {
    const recipe = await this.findOne(id);

    if (!recipe.items || recipe.items.length === 0) {
      throw new BadRequestException('La receta no tiene ingredientes');
    }

    const breakdown: CostBreakdownItem[] = [];
    let totalCost = 0;
    let totalCostWithWaste = 0;

    for (const item of recipe.items) {
      if (item.ingredient) {
        // Calcular costo base usando 'amount' del schema
        const baseCost = Number(item.ingredient.currentCost) * Number(item.amount);
        
        // Aplicar merma del ingrediente
        const wasteMultiplier = item.ingredient.wastePercentage
          ? 1 + (Number(item.ingredient.wastePercentage) / 100)
          : 1;
        
        const costWithWaste = baseCost * wasteMultiplier;
        
        totalCost += baseCost;
        totalCostWithWaste += costWithWaste;

        breakdown.push({
          name: item.ingredient.name,
          quantity: Number(item.amount),
          unit: item.ingredient.unit,
          unitCost: Number(item.ingredient.currentCost),
          totalCost: costWithWaste, // Mostrar costo con merma en el desglose
          type: 'ingredient',
        });
      } else if (item.preparation) {
        // Recursive cost calculation for preparations
        const prepCost = await this.calculatePreparationCost(item.preparation.id);
        const cost = prepCost * Number(item.amount);
        totalCost += cost;
        totalCostWithWaste += cost; // Las preparaciones ya incluyen su merma

        breakdown.push({
          name: item.preparation.name,
          quantity: Number(item.amount),
          unit: 'porción',
          unitCost: prepCost,
          totalCost: cost,
          type: 'preparation',
        });
      }
    }

    const costPerServing = totalCost / recipe.servings;
    const costPerServingWithWaste = totalCostWithWaste / recipe.servings;

    return {
      totalCost,
      costPerServing,
      costWithWaste: totalCostWithWaste,
      costPerServingWithWaste,
      breakdown,
    };
  }

  private async calculatePreparationCost(preparationId: string): Promise<number> {
    const preparation = await this.prisma.preparation.findUnique({
      where: { id: preparationId },
    });

    if (!preparation) {
      return 0;
    }

    // Por ahora solo retornamos el costo de mano de obra
    // En el futuro, cuando Preparation tenga sus propios items, calcularemos el costo total
    return Number(preparation.laborCost) / Number(preparation.yield);
  }
}
