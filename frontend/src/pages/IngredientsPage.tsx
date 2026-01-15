import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  History,
} from '@mui/icons-material';
import { ingredientsService, type Ingredient } from '../services/ingredientsService';

const UNIT_LABELS = {
  KILOGRAM: 'Kilogramos',
  GRAM: 'Gramos',
  LITER: 'Litros',
  MILLILITER: 'Mililitros',
  UNIT: 'Unidad',
};

export default function IngredientsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['ingredients', page + 1, rowsPerPage, search],
    queryFn: () =>
      ingredientsService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ingredientsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      setDeleteDialogOpen(false);
      setSelectedIngredient(null);
    },
  });

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setSelectedIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedIngredient) {
      deleteMutation.mutate(selectedIngredient.id);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Insumos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/ingredients/new')}
        >
          Nuevo Insumo
        </Button>
      </Box>

      <Paper sx={{ mb: 2, p: 2 }}>
        <TextField
          fullWidth
          placeholder="Buscar insumos..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Unidad</TableCell>
              <TableCell align="right">Costo Actual</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : data?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No se encontraron insumos
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((ingredient) => (
                <TableRow key={ingredient.id} hover>
                  <TableCell>
                    <Typography fontWeight="medium">{ingredient.name}</Typography>
                  </TableCell>
                  <TableCell>{ingredient.description || '-'}</TableCell>
                  <TableCell>
                    <Chip label={UNIT_LABELS[ingredient.unit]} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight="medium">
                      {formatCurrency(ingredient.currentCost)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/ingredients/${ingredient.id}/history`)}
                      title="Historial de costos"
                    >
                      <History />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/ingredients/${ingredient.id}/edit`)}
                      title="Editar"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(ingredient)}
                      title="Eliminar"
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {data && (
          <TablePagination
            component="div"
            count={data.meta.total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count}`
            }
          />
        )}
      </TableContainer>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Eliminación</DialogTitle>
        <DialogContent>
          ¿Está seguro que desea eliminar el insumo "{selectedIngredient?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
