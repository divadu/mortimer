# Testing Guide - Mortimer Frontend

## Fixed Issues ✅

All TypeScript compilation errors have been resolved:

1. **Material-UI Grid API** - Replaced incompatible Grid component with Box-based responsive layout
2. **Type-only imports** - Updated to use `import type { }` syntax for type imports
3. **Fast refresh compatibility** - Moved AuthContext definition and useAuth hook to separate files
4. **Type safety** - Fixed "any" types in authService and LoginPage error handling
5. **Cascading render warning** - Deferred setLoading state update using Promise.resolve()

## Manual Testing Steps

### 1. Open Application
Navigate to **http://localhost:5173/** in Chrome

**Expected Result:**
- Login page should display with email/password form
- Material-UI styled components visible
- No console errors

### 2. Test Authentication

**Test Invalid Login:**
```
Email: test@test.com
Password: wrong
```
Expected: Error message "Error al iniciar sesión"

**Test Valid Login:**
```
Email: admin@mortimer.com
Password: admin123
```
Expected: Redirect to dashboard

### 3. Verify Dashboard
After successful login:

**Expected Elements:**
- Top navigation bar with "Sistema de Gestión - Mortimer" title
- Sidebar with menu items:
  - Dashboard
  - Insumos
  - Recetas  
  - Productos
  - Mesas
  - Pedidos
  - Reportes
- 4 stat cards displaying:
  - Ventas Hoy: $0
  - Pedidos Activos: 0
  - Productos: 0
  - Ingresos Mes: $0
- System initialization message with backend URL

### 4. Test Protected Routes
Try accessing **http://localhost:5173/ingredients** while logged out

**Expected:** Redirect to /login

### 5. Test Logout
Click user avatar menu → Logout

**Expected:** Redirect to /login, token removed from localStorage

## Chrome DevTools Checks

### Console Tab
✅ No TypeScript compilation errors
✅ No runtime errors
❓ Check for any warnings

### Network Tab
When logging in:
- POST request to http://localhost:3000/api/auth/login
- Status: 200 (success) or 401 (invalid credentials)
- Response should include `access_token` and `user` object

### Application Tab → Local Storage
After login, check for:
- Key: `token`
- Value: JWT token string (starts with "eyJ...")

### React DevTools (if installed)
- Verify AuthContext provider wrapping App
- Check user state in AuthContext
- Verify component tree structure

## Current Status

**Backend:** ✅ Running on http://localhost:3000/api
**Frontend:** ✅ Running on http://localhost:5173
**Database:** ✅ MySQL (XAMPP) with seed data
**TypeScript:** ✅ No compilation errors
**Hot Reload:** ✅ Active

## Next Steps

After confirming the frontend works:

1. **Ingredients Module** - Create UI for ingredient management (list, add, edit, cost history)
2. **Recipes Module** - Recipe builder with escandallo calculator
3. **Products Module** - Product catalog with recipe linking
4. **POS Module** - Table/order management interface
5. **Billing Module** - Invoice generation and payment processing
6. **Reservations Module** - Table reservation calendar
7. **Reports Module** - Sales analytics and profitability reports

## Known Limitations

- Stat card data is hardcoded (requires API endpoints)
- Navigation menu items beyond Dashboard show placeholder divs
- No real-time updates for stock/orders (requires WebSocket implementation)
- AFIP integration mocked (requires government API credentials)

## Troubleshooting

**Blank page still showing:**
1. Open Chrome DevTools (F12)
2. Check Console tab for errors
3. Verify Network tab shows successful HTML/JS loading
4. Try hard refresh (Ctrl+Shift+R)

**Login not working:**
1. Verify backend is running: http://localhost:3000/api
2. Check backend terminal for errors
3. Verify MySQL is running in XAMPP
4. Check Network tab for failed requests

**TypeScript errors returning:**
1. Stop dev server (Ctrl+C)
2. Delete `node_modules/.vite` cache
3. Restart: `npm run dev`
