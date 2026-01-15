import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  Chip,
  Divider,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { recipesService } from '../services/recipesService';

export default function RecipeCostPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: recipe } = useQuery({
    queryKey: ['recipe', id],
    queryFn: () => recipesService.getById(id!),
  });

  const { data: costData, isLoading, error } = useQuery({
    queryKey: ['recipe-cost', id],
    queryFn: () => recipesService.getCost(id!),
  });

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
          Escandallo de Receta
        </Typography>
      </Box>

      {recipe && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            {recipe.name}
          </Typography>
          {recipe.description && (
            <Typography color="text.secondary" paragraph>
              {recipe.description}
            </Typography>
          )}
          <Chip label={`${recipe.servings} porciones`} color="primary" />
        </Paper>
      )}

      {isLoading && (
        <Alert severity="info">Calculando costos...</Alert>
      )}

      {error && (
        <Alert severity="error">Error al calcular costos. Verifique que la receta tenga ingredientes.</Alert>
      )}

      {costData && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Costos
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ flex: '1 1 300px' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Costo Total (sin merma)
                  </Typography>
                  <Typography variant="h5" color="primary">
                    {formatCurrency(costData.totalCost)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Costo por Porción (sin merma)
                  </Typography>
                  <Typography variant="h6">
                    {formatCurrency(costData.costPerServing)}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ flex: '1 1 300px' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Costo Total (con merma)
                  </Typography>
                  <Typography variant="h5" color="error">
                    {formatCurrency(costData.costWithWaste)}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Costo por Porción (con merma)
                  </Typography>
                  <Typography variant="h6" color="error">
                    {formatCurrency(costData.costPerServingWithWaste)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Desglose de Ingredientes
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Ingrediente / Preparación</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Cantidad</TableCell>
                    <TableCell>Unidad</TableCell>
                    <TableCell align="right">Costo Unitario</TableCell>
                    <TableCell align="right">Costo Total</TableCell>
                    <TableCell align="right">% del Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {costData.breakdown.map((item, index) => {
                    const percentage = (item.totalCost / costData.totalCost) * 100;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <strong>{item.name}</strong>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.type === 'ingredient' ? 'Ingrediente' : 'Preparación'}
                            size="small"
                            color={item.type === 'ingredient' ? 'default' : 'secondary'}
                          />
                        </TableCell>
                        <TableCell align="right">{item.quantity.toFixed(2)}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitCost)}</TableCell>
                        <TableCell align="right">
                          <strong>{formatCurrency(item.totalCost)}</strong>
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${percentage.toFixed(1)}%`} 
                            size="small"
                            color={percentage > 30 ? 'error' : percentage > 15 ? 'warning' : 'success'}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  <TableRow sx={{ backgroundColor: 'action.hover' }}>
                    <TableCell colSpan={5} align="right">
                      <strong>TOTAL</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>{formatCurrency(costData.totalCost)}</strong>
                    </TableCell>
                    <TableCell align="right">
                      <Chip label="100%" size="small" color="primary" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Container>
  );
}
