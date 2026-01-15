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
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { recipesService, RecipeItem } from '../services/recipesService';
import { ingredientsService } from '../services/ingredientsService';

interface FormData {
  name: string;
  description: string;
  servings: number;
  wastePercentage: number;
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
    wastePercentage: 0,
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
        wastePercentage: recipe.wastePercentage || 0,
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

    const ingredient = ingredientsData?.data?.find((i: any) => i.id === newItem.selectedId);
    
    if (!ingredient) return;

    const item: RecipeItem = {
      ingredientId: newItem.selectedId,
      quantity: newItem.quantity,
      notes: newItem.notes,
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        unit: ingredient.unit,
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
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Nombre"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                required
                label="Porciones"
                value={formData.servings}
                onChange={(e) => setFormData({ ...formData, servings: parseInt(e.target.value) || 1 })}
                inputProps={{ min: 1 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Descripción"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="number"
                label="Porcentaje de Merma (%)"
                value={formData.wastePercentage}
                onChange={(e) => setFormData({ ...formData, wastePercentage: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100, step: 0.1 }}
              />
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Ingredientes
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={5}>
              <Autocomplete
                options={ingredientsData?.data || []}
                getOptionLabel={(option: any) => `${option.name} (${option.unit})`}
                value={ingredientsData?.data?.find((i: any) => i.id === newItem.selectedId) || null}
                onChange={(_, value) => setNewItem({ ...newItem, selectedId: value?.id || '' })}
                renderInput={(params) => (
                  <TextField {...params} label="Ingrediente" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                type="number"
                label="Cantidad"
                value={newItem.quantity || ''}
                onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Notas"
                value={newItem.notes}
                onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={1}>
              <Button
                fullWidth
                variant="outlined"
                onClick={handleAddItem}
                sx={{ height: '56px' }}
              >
                <AddIcon />
              </Button>
            </Grid>
          </Grid>

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
                      <TableCell>{item.ingredient?.unit || 'porción'}</TableCell>
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
