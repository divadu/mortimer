import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  CircularProgress,
  Chip,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { ingredientsService } from '../services/ingredientsService';

export default function IngredientCostHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: ingredient, isLoading: ingredientLoading } = useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => ingredientsService.getOne(id!),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ['ingredient-cost-history', id],
    queryFn: () => ingredientsService.getCostHistory(id!),
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (ingredientLoading || historyLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/ingredients')}
          sx={{ mr: 2 }}
        >
          Volver
        </Button>
        <Typography variant="h4">Historial de Costos</Typography>
      </Box>

      {ingredient && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {ingredient.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Costo Actual:
            </Typography>
            <Chip
              label={formatCurrency(ingredient.currentCost)}
              color="primary"
              size="small"
            />
          </Box>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha de Cambio</TableCell>
              <TableCell align="right">Costo</TableCell>
              <TableCell align="right">Variación</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history && history.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No hay historial de cambios
                </TableCell>
              </TableRow>
            ) : (
              history?.map((entry, index) => {
                const previousEntry = history[index + 1];
                const variation = previousEntry
                  ? ((entry.cost - previousEntry.cost) / previousEntry.cost) * 100
                  : 0;

                return (
                  <TableRow key={entry.id}>
                    <TableCell>{formatDate(entry.effectiveAt)}</TableCell>
                    <TableCell align="right">
                      <Typography fontWeight="medium">
                        {formatCurrency(entry.cost)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {previousEntry && (
                        <Chip
                          label={`${variation > 0 ? '+' : ''}${variation.toFixed(2)}%`}
                          size="small"
                          color={variation > 0 ? 'error' : variation < 0 ? 'success' : 'default'}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
