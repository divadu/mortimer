# Mortimer - Restaurant Management System

Sistema integral de gestión gastronómica para Argentina. Stack: **NestJS + Prisma + PostgreSQL** backend, **React + TypeScript** frontend.

## Architecture

**Domain-Driven Modular Architecture**: Each functional domain is a NestJS module with controller → service → Prisma layer separation.

### Module Structure Pattern
```
src/
  ├── auth/          # Users, roles, JWT, audit logs
  ├── ingredients/   # Raw materials, cost history
  ├── recipes/       # Recipes, preparations, cost calculations
  ├── products/      # Menu items, categories
  ├── stock/         # Inventory, movements, alerts
  ├── pos/           # Tables, orders, kitchen commands
  ├── billing/       # Invoices, payments, cash register
  ├── reservations/  # Table reservations, time slots
  ├── purchases/     # Suppliers, expenses
  └── reports/       # Analytics, profitability
```

Each module must include: Controller, Service, DTOs (with `class-validator`), Prisma models, basic tests.

### Prisma Model Relationships

```prisma
// Core relationships (example patterns)
Recipe → RecipeItem → Ingredient | Preparation
Recipe → RecipeItem → Preparation (recursive: preparations use other preparations)
Product → Recipe (1:1 for costed items)
Order → OrderItem → Product
OrderItem → Recipe (for cost tracking)
StockMovement → Product | Ingredient (polymorphic source)
Invoice → Payment (1:many for split payments)
Payment → PaymentMethod
CashRegister → User (opened/closed by)
Reservation → Table
AuditLog → User (actor)
```

**Key Constraints**:
- Use `@relation` fields with explicit names for multiple relations between same models
- Soft delete critical records (add `deletedAt DateTime?`) - never hard delete Orders, Invoices, AuditLogs
- Use composite indexes for frequent queries: `@@index([tableId, status])` on Orders
- Timestamps required: `createdAt`, `updatedAt` on all models

## Critical Business Rules

1. **Stock Integrity**: Sales/production automatically decrement stock in transactions. Block sales without sufficient inventory.
2. **Cost Calculation**: Recipe costs auto-calculate from ingredient costs + wastage (merma). Use historical cost tracking.
3. **Audit Trail**: Log ALL critical operations (price changes, cancellations, cash closures) to `AuditLog` with user context.
4. **AFIP Compliance**: Invoice types A/B/C, IVA handling. Keep AFIP integration services decoupled from core business logic.
5. **No Orphaned Data**: Orders must link to tables, payments to invoices, stock movements to source transactions.

## Domain-Specific Patterns

### Gastronomy Domain (Ingredients/Recipes)
- **Unit Conversions**: Support kg/g/l/unit with automatic conversion logic
- **Wastage (Merma)**: Can be percentage OR gross/net weight ratio
- **Reusable Preparations**: `Preparation` entities can be ingredients in `Recipe` (recursive relationship)
- **Cost Calculation Service**: Separate service for escandallo (cost breakdown) calculations

```typescript
// Example: Recipe cost includes nested preparations
GET /recipes/:id/cost → {
  totalCost: number,
  costPerServing: number,
  breakdown: { ingredient: string, amount: number, cost: number }[]
}
```

### POS Operations
- **Order States**: `OPEN → IN_PROGRESS → READY → DELIVERED → CLOSED | CANCELED`
- **Table Operations**: Support merge/split, track capacity and current order
- **Split Bills**: One order can generate multiple payments/invoices
- **Kitchen Commands**: Separate commands by station (kitchen/bar) via `OrderItem.station`

### Cash & Billing
- **Payment Methods**: efectivo, transferencia, crédito, débito, QR (Mercado Pago/MODO)
- **Commission Tracking**: Each payment method has configurable commission percentage
- **Cash Register Flow**: `CashRegister.open(user, initialAmount)` → operations → `.close()`
- **Invoice Generation**: Must validate customer tax ID (CUIT/CUIL) for type A invoices

## Data Initialization

Seed database with Argentina-specific defaults:
- Payment methods: Efectivo, Transferencia, Débito, Crédito, Mercado Pago, MODO
- IVA rates: 21%, 10.5%, 0% (exento)
- Default roles: admin, manager, cashier, waiter, kitchen
- Common product categories: Entradas, Platos principales, Postres, Bebidas

## REST API Conventions

### Endpoint Patterns
```
GET    /resources              # List with pagination (?page=1&limit=20)
GET    /resources/:id          # Get single resource
POST   /resources              # Create new resource
PATCH  /resources/:id          # Partial update
DELETE /resources/:id          # Soft delete (set deletedAt)

# Action endpoints (non-CRUD operations)
POST   /orders/:id/close       # State transitions
POST   /orders/:id/cancel
POST   /cash-register/open
POST   /cash-register/close
GET    /recipes/:id/cost       # Computed values
POST   /tables/:id/merge       # Complex operations
```

### Response Format
```typescript
// Success (200/201)
{ data: T | T[], meta?: { total, page, limit } }

// Error (400/404/500)
{ statusCode: number, message: string, error: string }
```

### Query Parameters
- **Pagination**: `?page=1&limit=20` (default limit: 20, max: 100)
- **Filtering**: `?status=OPEN&tableId=5` (exact match)
- **Sorting**: `?sortBy=createdAt&order=DESC`
- **Search**: `?search=pizza` (full-text where applicable)
- **Date ranges**: `?startDate=2026-01-01&endDate=2026-01-31`

## Code Conventions

- **Language Mix**: Domain concepts in Spanish (e.g., `merma`, `escandallo`), code in English (variables, functions)
- **Strict Typing**: Enable TypeScript strict mode, no `any` types
- **Validation**: Use `class-validator` decorators on all DTOs
- **Error Handling**: Throw NestJS exceptions (`BadRequestException`, `NotFoundException`) with descriptive Spanish messages
- **Comments**: Only when explaining complex business logic (e.g., cost calculation formulas)

## Frontend Conventions

### Component Structure
```
src/
  ├── components/
  │   ├── common/        # Reusable UI (Button, Modal, Table)
  │   └── [domain]/      # Domain components (OrderCard, RecipeForm)
  ├── pages/             # Route components
  ├── hooks/             # Custom hooks (useAuth, useOrder)
  ├── services/          # API clients (React Query)
  └── types/             # TypeScript interfaces from backend
```

### Patterns
- **State Management**: React Query for server state, Context for UI state (theme, user session)
- **Forms**: React Hook Form + Yup validation (mirror backend DTOs)
- **API Calls**: Centralize in `services/api.ts`, use React Query hooks
- **Routing**: Protected routes check JWT token, redirect to `/login` if missing
- **Currency**: Always display as ARS with `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`
- **Dates**: Use `date-fns` with `es` locale for consistency

### Key Components
```typescript
// Example: POS order form
<OrderForm onSubmit={handleCreateOrder}>
  <ProductSelector /> {/* Search products, show real-time stock */}
  <TableSelector />   {/* Only show available tables */}
  <OrderItemsList />  {/* Editable quantities, observations */}
</OrderForm>
```

## Development Workflow

1. **Implementation Order**: Auth → Ingredients/Recipes → Products/Stock → POS → Billing → Reservations → Reports
2. **Testing**: See Testing Strategy below
3. **Prisma Migrations**: Run `npx prisma migrate dev` after schema changes
4. **Environment**: Use `c:\xampp\htdocs\mortimer` as workspace root (Windows/XAMPP setup)

## Testing Strategy

### Backend (NestJS)
- **Unit Tests**: All services, especially:
  - Cost calculation logic (recipes, escandallos)
  - Stock deduction/validation (must use transactions)
  - Payment commission calculations
- **Integration Tests**: Database operations via Prisma
- **E2E Tests**: Critical flows:
  - Complete order: create → add items → close → payment → invoice
  - Cash register: open → transactions → close with balance validation
  - Stock: purchase → stock increase → sale → stock decrease
- **Mock Prisma** in unit tests with `jest.mock('@prisma/client')`
- **Always test error cases**: insufficient stock, invalid state transitions

### Frontend (React)
- **Component Tests**: Forms validate correctly, protected routes redirect
- **Integration Tests**: API calls work with mock service worker (MSW)
- **Focus on**: User flows (create order, split bill), real-time stock updates

## Key Files

- [README.md](README.md) - Complete project specification (source of truth)
- [prompts](prompts) - Module-by-module implementation prompts for incremental development
- `schema.prisma` - Data model definitions (to be created in implementation phase)

## When Implementing

- **Reference README.md** for complete module requirements before starting
- **Use prompts file** for detailed module-specific guidance
- **Prioritize transactional integrity** for stock movements and financial operations
- **Mock AFIP services** initially; keep interface contracts clear for future integration
- **Generate TypeScript types** from Prisma schema with `npx prisma generate`
- **API-First**: Define DTOs and endpoints before implementing services
- **Test business rules**: Write failing tests for critical rules (e.g., "should block sale when stock insufficient") before implementation
- **Seed data early**: Create meaningful seed data for each module to test realistic scenarios
