import api from './api';

export type UnitType = 'KILOGRAM' | 'GRAM' | 'LITER' | 'MILLILITER' | 'UNIT';

export const UnitTypeEnum = {
  KILOGRAM: 'KILOGRAM' as UnitType,
  GRAM: 'GRAM' as UnitType,
  LITER: 'LITER' as UnitType,
  MILLILITER: 'MILLILITER' as UnitType,
  UNIT: 'UNIT' as UnitType,
};

export interface Category {
  id: string;
  name: string;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Ingredient {
  id: string;
  name: string;
  description?: string;
  unit: UnitType;
  currentCost: number;
  wastePercentage?: number;
  categoryId?: string;
  supplierId?: string;
  category?: Category;
  supplier?: Supplier;
  createdAt: string;
  updatedAt: string;
}

export interface IngredientCostHistory {
  id: string;
  ingredientId: string;
  cost: number;
  effectiveAt: string;
  createdAt: string;
}

export interface CreateIngredientDto {
  name: string;
  description?: string;
  unit: UnitType;
  currentCost: number;
  wastePercentage?: number;
}

export interface UpdateIngredientDto extends Partial<CreateIngredientDto> {}

export interface IngredientsResponse {
  data: Ingredient[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export const ingredientsService = {
  async getAll(params?: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
  }): Promise<IngredientsResponse> {
    const response = await api.get<IngredientsResponse>('/ingredients', { params });
    return response.data;
  },

  async getOne(id: string): Promise<Ingredient> {
    const response = await api.get<Ingredient>(`/ingredients/${id}`);
    return response.data;
  },

  async getCostHistory(id: string): Promise<IngredientCostHistory[]> {
    const response = await api.get<IngredientCostHistory[]>(`/ingredients/${id}/cost-history`);
    return response.data;
  },

  async create(data: CreateIngredientDto): Promise<Ingredient> {
    const response = await api.post<Ingredient>('/ingredients', data);
    return response.data;
  },

  async update(id: string, data: UpdateIngredientDto): Promise<Ingredient> {
    const response = await api.patch<Ingredient>(`/ingredients/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/ingredients/${id}`);
    return response.data;
  },
};
