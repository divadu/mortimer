import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export interface RecipeItem {
  id?: string;
  ingredientId?: string;
  preparationId?: string;
  quantity: number;
  notes?: string;
  ingredient?: {
    id: string;
    name: string;
    unit: string;
    currentCost: number;
  };
  preparation?: {
    id: string;
    name: string;
    servings: number;
  };
}

export interface Recipe {
  id: string;
  name: string;
  description?: string;
  servings: number;
  wastePercentage?: number;
  items: RecipeItem[];
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateRecipeDto {
  name: string;
  description?: string;
  servings: number;
  wastePercentage?: number;
  items: RecipeItem[];
}

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

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

export const recipesService = {
  async getAll(params?: { page?: number; limit?: number; search?: string }) {
    const response = await axios.get(`${API_URL}/recipes`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  async getById(id: string) {
    const response = await axios.get(`${API_URL}/recipes/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async getCost(id: string): Promise<RecipeCostCalculation> {
    const response = await axios.get(`${API_URL}/recipes/${id}/cost`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async create(data: CreateRecipeDto) {
    const response = await axios.post(`${API_URL}/recipes`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async update(id: string, data: Partial<CreateRecipeDto>) {
    const response = await axios.patch(`${API_URL}/recipes/${id}`, data, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  async delete(id: string) {
    const response = await axios.delete(`${API_URL}/recipes/${id}`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },
};
