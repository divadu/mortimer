import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(createIngredientDto: CreateIngredientDto, userId: string) {
    const ingredient = await this.prisma.ingredient.create({
      data: {
        ...createIngredientDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // Create cost history entry
    await this.prisma.ingredientCostHistory.create({
      data: {
        ingredientId: ingredient.id,
        cost: createIngredientDto.currentCost,
        changedAt: new Date(),
        changedBy: userId,
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'create',
        module: 'ingredients',
        entityId: ingredient.id,
        newValue: ingredient,
      },
    });

    return ingredient;
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    search?: string;
    categoryId?: string;
  }) {
    const { skip = 0, take = 20, search, categoryId } = params || {};

    const where: any = {
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [ingredients, total] = await Promise.all([
      this.prisma.ingredient.findMany({
        where,
        skip,
        take,
        include: {
          category: true,
          supplier: true,
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.ingredient.count({ where }),
    ]);

    return {
      data: ingredients,
      meta: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        pages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
      include: {
        category: true,
        supplier: true,
        costHistory: {
          orderBy: { changedAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!ingredient || ingredient.deletedAt) {
      throw new NotFoundException(`Ingrediente con ID ${id} no encontrado`);
    }

    return ingredient;
  }

  async update(id: string, updateIngredientDto: UpdateIngredientDto, userId: string) {
    const existing = await this.findOne(id);

    const updated = await this.prisma.ingredient.update({
      where: { id },
      data: {
        ...updateIngredientDto,
        updatedAt: new Date(),
      },
      include: {
        category: true,
        supplier: true,
      },
    });

    // If cost changed, create history entry
    if (updateIngredientDto.currentCost && updateIngredientDto.currentCost !== existing.currentCost) {
      await this.prisma.ingredientCostHistory.create({
        data: {
          ingredientId: id,
          cost: updateIngredientDto.currentCost,
          changedAt: new Date(),
          changedBy: userId,
        },
      });
    }

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'update',
        module: 'ingredients',
        entityId: id,
        oldValue: existing,
        newValue: updated,
      },
    });

    return updated;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id);

    // Soft delete
    const deleted = await this.prisma.ingredient.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Audit log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'delete',
        module: 'ingredients',
        entityId: id,
        oldValue: existing,
      },
    });

    return { message: 'Ingrediente eliminado correctamente' };
  }

  async getCostHistory(id: string) {
    await this.findOne(id); // Validate exists

    return this.prisma.ingredientCostHistory.findMany({
      where: { ingredientId: id },
      orderBy: { changedAt: 'desc' },
      take: 50,
    });
  }
}
