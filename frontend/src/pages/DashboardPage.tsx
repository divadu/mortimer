import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import {
  TrendingUp,
  Restaurant,
  ShoppingCart,
  AttachMoney,
} from '@mui/icons-material';

const StatCard: React.FC<{
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography color="text.secondary" variant="body2" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            backgroundColor: color,
            borderRadius: 2,
            p: 1,
            color: 'white',
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export const DashboardPage: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Bienvenido al sistema de gestión gastronómica Mortimer
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <StatCard
          title="Ventas Hoy"
          value="$0"
          icon={<AttachMoney />}
          color="#4caf50"
        />
        <StatCard
          title="Pedidos Activos"
          value="0"
          icon={<Restaurant />}
          color="#2196f3"
        />
        <StatCard
          title="Productos"
          value="0"
          icon={<ShoppingCart />}
          color="#ff9800"
        />
        <StatCard
          title="Ingresos Mes"
          value="$0"
          icon={<TrendingUp />}
          color="#9c27b0"
        />
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sistema Inicializado
        </Typography>
        <Typography variant="body2" color="text.secondary">
          El backend está corriendo en <strong>http://localhost:3000/api</strong>
          <br />
          Comienza agregando insumos, creando recetas y configurando productos.
        </Typography>
      </Paper>
    </Box>
  );
};
