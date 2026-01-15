import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Divider,
  Alert,
} from '@mui/material';
import { ArrowBack, Save, Calculate } from '@mui/icons-material';
import {
  ingredientsService,
  UnitTypeEnum,
  type CreateIngredientDto,
  type UnitType,
} from '../services/ingredientsService';
import { calculateCostPerBaseUnit, getUnitLabel } from '../utils/unitConverter';

const UNIT_OPTIONS = [
  { value: UnitTypeEnum.KILOGRAM, label: 'Kilogramos (kg)' },
  { value: UnitTypeEnum.GRAM, label: 'Gramos (g)' },
  { value: UnitTypeEnum.MILLILITER, label: 'Mililitros (ml)' },
  { value: UnitTypeEnum.UNIT, label: 'Unidad' },
];

export default function IngredientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  // Estados para cálculo de merma
  const [grossWeight, setGrossWeight] = useState<string>('');
  const [netWeight, setNetWeight] = useState<string>('');
  const [calculatedWaste, setCalculatedWaste] = useState<number | null>(null);

  // Estados para cálculo de costo
  const [purchaseQuantity, setPurchaseQuantity] = useState<string>('');
  const [purchaseCost, setPurchaseCost] = useState<string>('');
  const [purchaseUnit, setPurchaseUnit] = useState<string>(UnitTypeEnum.KILOGRAM);
  const [calculatedCostPerUnit, setCalculatedCostPerUnit] = useState<number | null>(null);

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<CreateIngredientDto>({
    defaultValues: {
      name: '',
      description: '',
      unit: UnitTypeEnum.KILOGRAM,
      currentCost: 0,
      wastePercentage: 0,
    },
  });

  const { data: ingredient, isLoading } = useQuery({
    queryKey: ['ingredient', id],
    queryFn: () => ingredientsService.getOne(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (ingredient) {
      reset({
        name: ingredient.name,
        description: ingredient.description || '',
        unit: ingredient.unit,
        currentCost: ingredient.currentCost,
        wastePercentage: ingredient.wastePercentage || 0,
      });
    }
  }, [ingredient, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateIngredientDto) => ingredientsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      navigate('/ingredients');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CreateIngredientDto) => ingredientsService.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ingredients'] });
      queryClient.invalidateQueries({ queryKey: ['ingredient', id] });
      navigate('/ingredients');
    },
  });

  const calculateWasteFromWeights = () => {
    const gross = parseFloat(grossWeight);
    const net = parseFloat(netWeight);

    if (!gross || !net || gross <= 0 || net <= 0) {
      setCalculatedWaste(null);
      return;
    }

    if (net > gross) {
      setCalculatedWaste(null);
      return;
    }

    const wastePercentage = ((gross - net) / gross) * 100;
    setCalculatedWaste(wastePercentage);
    setValue('wastePercentage', parseFloat(wastePercentage.toFixed(2)));
  };

  const calculateCostFromPurchase = () => {
    const quantity = parseFloat(purchaseQuantity);
    const cost = parseFloat(purchaseCost);

    if (!quantity || !cost || quantity <= 0 || cost <= 0) {
      setCalculatedCostPerUnit(null);
      return;
    }

    try {
      const costPerUnit = calculateCostPerBaseUnit(
        quantity,
        cost,
        purchaseUnit as UnitType,
      );
      setCalculatedCostPerUnit(costPerUnit);
      setValue('currentCost', parseFloat(costPerUnit.toFixed(4)));
      
      // También guardamos los datos de compra para enviar al backend
      setValue('purchaseQuantity', quantity);
      setValue('purchaseCost', cost);
      setValue('purchaseUnit', purchaseUnit as UnitType);
    } catch (error) {
      console.error('Error al calcular costo:', error);
      setCalculatedCostPerUnit(null);
    }
  };

  const onSubmit = (data: CreateIngredientDto) => {
    if (isEdit) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  if (isEdit && isLoading) {
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
        <Typography variant="h4">
          {isEdit ? 'Editar Insumo' : 'Nuevo Insumo'}
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ display: 'grid', gap: 3, maxWidth: 800 }}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Descripción"
                  fullWidth
                  multiline
                  rows={3}
                />
              )}
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Controller
                name="unit"
                control={control}
                rules={{ required: 'La unidad es obligatoria' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="Unidad de Medida"
                    fullWidth
                    error={!!errors.unit}
                    helperText={errors.unit?.message}
                  >
                    {UNIT_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />

              <Controller
                name="currentCost"
                control={control}
                rules={{
                  required: 'El costo es obligatorio',
                  min: { value: 0, message: 'El costo debe ser mayor a 0' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Costo por Unidad Base (g o ml)"
                    type="number"
                    fullWidth
                    inputProps={{ step: '0.0001', min: 0 }}
                    error={!!errors.currentCost}
                    helperText={errors.currentCost?.message || 'Costo por gramo o mililitro'}
                  />
                )}
              />
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              O calcula el costo desde datos de compra:
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 2, alignItems: 'start' }}>
              <TextField
                label="Cantidad Comprada"
                type="number"
                value={purchaseQuantity}
                onChange={(e) => setPurchaseQuantity(e.target.value)}
                inputProps={{ step: '0.01', min: 0 }}
                helperText="Ej: 400 (gramos)"
              />
              <TextField
                label="Costo Total"
                type="number"
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(e.target.value)}
                inputProps={{ step: '0.01', min: 0 }}
                helperText="Ej: $8000"
              />
              <TextField
                select
                label="Unidad de Compra"
                value={purchaseUnit}
                onChange={(e) => setPurchaseUnit(e.target.value)}
                helperText="Unidad usada"
              >
                {UNIT_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                onClick={calculateCostFromPurchase}
                sx={{ height: '56px' }}
                startIcon={<Calculate />}
              >
                Calcular
              </Button>
            </Box>

            {calculatedCostPerUnit !== null && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Costo calculado: <strong>${calculatedCostPerUnit.toFixed(4)}</strong> por gramo/ml
                <br />
                <Typography variant="caption">
                  (${purchaseCost} ÷ {purchaseQuantity} {getUnitLabel(purchaseUnit as UnitType, parseFloat(purchaseQuantity) > 1)} = ${calculatedCostPerUnit.toFixed(4)}/g o ml)
                </Typography>
              </Alert>
            )}

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Merma / Desperdicio
            </Typography>

            <Controller
              name="wastePercentage"
              control={control}
              rules={{
                min: { value: 0, message: 'La merma debe ser mayor o igual a 0' },
                max: { value: 100, message: 'La merma no puede ser mayor a 100%' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Porcentaje de Merma (%)"
                  type="number"
                  fullWidth
                  inputProps={{ step: '0.1', min: 0, max: 100 }}
                  error={!!errors.wastePercentage}
                  helperText={errors.wastePercentage?.message || 'Desperdicio al procesar (ej: 15% al pelar papas)'}
                />
              )}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
              O calcula la merma desde peso bruto/neto:
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 2, alignItems: 'start' }}>
              <TextField
                label="Peso Bruto"
                type="number"
                value={grossWeight}
                onChange={(e) => setGrossWeight(e.target.value)}
                inputProps={{ step: '0.01', min: 0 }}
                helperText="Peso antes de procesar"
              />
              <TextField
                label="Peso Neto"
                type="number"
                value={netWeight}
                onChange={(e) => setNetWeight(e.target.value)}
                inputProps={{ step: '0.01', min: 0 }}
                helperText="Peso después de procesar"
              />
              <Button
                variant="outlined"
                onClick={calculateWasteFromWeights}
                sx={{ height: '56px' }}
                startIcon={<Calculate />}
              >
                Calcular
              </Button>
            </Box>

            {calculatedWaste !== null && (
              <Alert severity="success">
                Merma calculada: <strong>{calculatedWaste.toFixed(2)}%</strong> (actualizado automáticamente)
              </Alert>
            )}

            {grossWeight && netWeight && parseFloat(netWeight) > parseFloat(grossWeight) && (
              <Alert severity="error">
                El peso neto no puede ser mayor al peso bruto
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/ingredients')}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={<Save />}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEdit ? 'Actualizar' : 'Crear'}
              </Button>
            </Box>
          </Box>
        </form>
      </Paper>
    </Box>
  );
}
