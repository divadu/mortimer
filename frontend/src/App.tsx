import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import IngredientsPage from './pages/IngredientsPage';
import IngredientFormPage from './pages/IngredientFormPage';
import IngredientCostHistoryPage from './pages/IngredientCostHistoryPage';
import RecipesPage from './pages/RecipesPage';
import RecipeFormPage from './pages/RecipeFormPage';
import RecipeCostPage from './pages/RecipeCostPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="ingredients" element={<IngredientsPage />} />
                <Route path="ingredients/new" element={<IngredientFormPage />} />
                <Route path="ingredients/:id/edit" element={<IngredientFormPage />} />
                <Route path="ingredients/:id/history" element={<IngredientCostHistoryPage />} />
                <Route path="recipes" element={<RecipesPage />} />
                <Route path="recipes/new" element={<RecipeFormPage />} />
                <Route path="recipes/:id/edit" element={<RecipeFormPage />} />
                <Route path="recipes/:id/cost" element={<RecipeCostPage />} />
                <Route path="products" element={<div>Productos (próximamente)</div>} />
                <Route path="tables" element={<div>Mesas (próximamente)</div>} />
                <Route path="orders" element={<div>Pedidos (próximamente)</div>} />
                <Route path="reports" element={<div>Reportes (próximamente)</div>} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
