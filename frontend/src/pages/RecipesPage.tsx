import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Calculate as CalculateIcon } from '@mui/icons-material';
import { recipesService } from '../services/recipesService';

export default function RecipesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['recipes', page, search],
    queryFn: () => recipesService.getAll({ page, limit: 20, search }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recipesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      setDeleteDialogOpen(false);
      setRecipeToDelete(null);
    },
  });

  const handleDeleteClick = (id: string) => {
    setRecipeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (recipeToDelete) {
      deleteMutation.mutate(recipeToDelete);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Recetas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/recipes/new')}
        >
          Nueva Receta
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          label="Buscar recetas"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="center">Porciones</TableCell>
              <TableCell align="center">Merma</TableCell>
              <TableCell align="center">Ingredientes</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data?.data?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay recetas disponibles
                </TableCell>
              </TableRow>
            ) : (
              data?.data?.map((recipe: any) => (
                <TableRow key={recipe.id}>
                  <TableCell>{recipe.name}</TableCell>
                  <TableCell>{recipe.description || '-'}</TableCell>
                  <TableCell align="center">{recipe.servings}</TableCell>
                  <TableCell align="center">
                    {recipe.wastePercentage ? `${recipe.wastePercentage}%` : '-'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={recipe.items?.length || 0} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      color="info"
                      onClick={() => navigate(`/recipes/${recipe.id}/cost`)}
                      title="Ver escandallo"
                    >
                      <CalculateIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => navigate(`/recipes/${recipe.id}/edit`)}
                      title="Editar"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick(recipe.id)}
                      title="Eliminar"
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

      {data?.meta && (
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 3 }}>
          <Button
            variant="outlined"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <Typography sx={{ display: 'flex', alignItems: 'center' }}>
            Página {data.meta.page} de {data.meta.pages}
          </Typography>
          <Button
            variant="outlined"
            disabled={page >= data.meta.pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </Button>
        </Box>
      )}

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Está seguro que desea eliminar esta receta? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
