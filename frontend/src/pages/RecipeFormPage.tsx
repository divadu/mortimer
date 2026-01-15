import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Stack,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { recipesService, type RecipeItem } from '../services/recipesService';
import { ingredientsService } from '../services/ingredientsService';
import { getBaseUnit, getUnitAbbreviation } from '../utils/unitConverter';
import type { UnitType } from '../services/ingredientsService';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  currentCost: number;
}

interface FormData {
  name: string;
  description: string;
  servings: number;
  items: RecipeItem[];
}

export default function RecipeFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    servings: 1,
    items: [],
  });

  const [newItem, setNewItem] = useState<{
    type: 'ingredient' | 'preparation';
    selectedId: string;
    quantity: number;
    notes: string;
  }>({
    type: 'ingredient',
    selectedId: '',
    quantity: 0,
    notes: '',
  });

  // Load ingredients for autocomplete
  const { data: ingredientsData } = useQuery({
    queryKey: ['ingredients', 'all'],
    queryFn: () => ingredientsService.getAll({ limit: 1000 }),
  });

  // Load recipe if editing
  const { data: recipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipesService.getById(id!),
    enabled: isEditing,
  });

  useEffect(() => {
    if (recipe) {
      setFormData({
        name: recipe.name,
        description: recipe.description || '',
        servings: recipe.servings,
        items: recipe.items || [],
      });
    }
  }, [recipe]);

  const createMutation = useMutation({
    mutationFn: (data: FormData) => recipesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      navigate('/recipes');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => recipesService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      queryClient.invalidateQueries({ queryKey: ['recipe', id] });
      navigate('/recipes');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      alert('Debe agregar al menos un ingrediente');
      return;
    }

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleAddItem = () => {
    if (!newItem.selectedId || newItem.quantity <= 0) {
      alert('Debe seleccionar un ingrediente y especificar cantidad');
      return;
    }

    const ingredient = ingredientsData?.data?.find((i: Ingredient) => i.id === newItem.selectedId);
    
    if (!ingredient) return;

    const item: RecipeItem = {
      ingredientId: newItem.selectedId,
      quantity: newItem.quantity,
      notes: newItem.notes,
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        unit: getBaseUnit(ingredient.unit as UnitType), // Usar unidad base (g/ml/u)
        currentCost: ingredient.currentCost,
      },
    };

    setFormData({
      ...formData,
      items: [...formData.items, item],
    });

    setNewItem({
      type: 'ingredient',
      selectedId: '',
      quantity: 0,
      notes: '',
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/recipes')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {isEditing ? 'Editar Receta' : 'Nueva Receta'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                required
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <TextField
                fullWidth
                type="number"
                required
                label="Porciones"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Descripción"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Stack>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ingredientes
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
              <Autocomplete
                options={ingredientsData?.data || []}
                getOptionLabel={(option: Ingredient) => `${option.name} (${option.unit})`}
                value={ingredientsData?.data?.find((i: Ingredient) => i.id === newItem.selectedId) || null}
                onChange={(_, value) => setNewItem({ ...newItem, selectedId: value?.id || '' })}
                renderInput={(params) => (
                  <TextField {...params} label="Ingrediente" fullWidth />
                )}
              />
            </Box>
            <TextField
              sx={{ flex: '0 1 150px', minWidth: 100 }}
              type="number"
              label="Cantidad"
              value={newItem.quantity || ''}
              onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              sx={{ flex: '1 1 150px', minWidth: 100 }}
              label="Notas"
              value={newItem.notes}
              onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
            />
            <Button
              variant="outlined"
              onClick={handleAddItem}
              sx={{ flex: '0 0 auto', height: '56px', minWidth: '56px' }}
            >
              <AddIcon />
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ingrediente</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell>Unidad</TableCell>
                  <TableCell align="right">Costo Unit.</TableCell>
                  <TableCell align="right">Costo Total</TableCell>
                  <TableCell>Notas</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No hay ingredientes agregados
                    </TableCell>
                  </TableRow>
                ) : (
                  formData.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.ingredient?.name || item.preparation?.name}</TableCell>
                      <TableCell align="right">{item.quantity}</TableCell>
                      <TableCell>
                        {item.ingredient 
                          ? getUnitAbbreviation(getBaseUnit(item.ingredient.unit as UnitType))
                          : 'porción'
                        }
                      </TableCell>
                      <TableCell align="right">
                        {item.ingredient ? formatCurrency(item.ingredient.currentCost) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {item.ingredient 
                          ? formatCurrency(item.ingredient.currentCost * item.quantity)
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{item.notes || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/recipes')}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            {isEditing ? 'Actualizar' : 'Crear'} Receta
          </Button>
        </Box>
      </form>
    </Container>
  );
}
