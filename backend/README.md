# Mortimer Backend

Backend API for Mortimer Restaurant Management System.

## Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Production database
- **TypeScript** - Type safety
- **JWT** - Authentication
- **Passport** - Authentication middleware

## Prerequisites

- Node.js 18+ (recommended: use nvm)
- PostgreSQL 14+
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set your database credentials:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/mortimer?schema=public"
   JWT_SECRET="your-super-secret-key"
   ```

3. **Create database:**
   ```bash
   # Using psql
   createdb mortimer
   
   # Or using SQL
   CREATE DATABASE mortimer;
   ```

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

5. **Generate Prisma Client:**
   ```bash
   npx prisma generate
   ```

6. **Seed database:**
   ```bash
   npm run prisma:seed
   ```

   This creates:
   - Default roles (admin, manager, cashier, waiter, kitchen)
   - Admin user (admin@mortimer.com / admin123)
   - Argentina payment methods (Efectivo, Transferencia, Débito, Crédito, Mercado Pago, MODO)
   - Product categories
   - Sample tables

## Development

```bash
# Development with watch mode
npm run start:dev

# Production build
npm run build
npm run start:prod
```

API runs on: http://localhost:3000/api

## Available Endpoints

### Auth
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user (requires JWT)
- `POST /api/auth/register` - Register new user
- `GET /api/auth/users` - List all users (requires JWT)

### Database Tools

```bash
# Open Prisma Studio (database GUI)
npm run prisma:studio

# Create new migration
npx prisma migrate dev --name migration_name

# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Format schema
npx prisma format
```

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Project Structure

```
src/
├── auth/              # Authentication & users
│   ├── dto/          # Data transfer objects
│   ├── guards/       # JWT & local auth guards
│   ├── strategies/   # Passport strategies
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── users.service.ts
├── prisma/           # Prisma service
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── app.module.ts     # Root module
└── main.ts           # Application entry

prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Seed data
```

## Next Steps

Implement modules in this order:
1. ✅ Auth & Users
2. ⏳ Ingredients & Recipes
3. ⏳ Products & Stock
4. ⏳ POS & Orders
5. ⏳ Billing & Payments
6. ⏳ Reservations
7. ⏳ Reports

See [../prompts](../prompts) for detailed implementation guides per module.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | - |
| `JWT_SECRET` | Secret key for JWT tokens | - |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `PORT` | API port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## License

UNLICENSED - Private project
