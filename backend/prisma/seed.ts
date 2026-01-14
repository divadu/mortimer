import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create permissions
  const permissions = await Promise.all([
    // Auth
    prisma.permission.upsert({
      where: { module_action: { module: 'auth', action: 'login' } },
      update: {},
      create: { module: 'auth', action: 'login', description: 'Iniciar sesión' },
    }),
    // Ingredients
    prisma.permission.upsert({
      where: { module_action: { module: 'ingredients', action: 'create' } },
      update: {},
      create: { module: 'ingredients', action: 'create', description: 'Crear insumos' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'ingredients', action: 'read' } },
      update: {},
      create: { module: 'ingredients', action: 'read', description: 'Ver insumos' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'ingredients', action: 'update' } },
      update: {},
      create: { module: 'ingredients', action: 'update', description: 'Modificar insumos' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'ingredients', action: 'delete' } },
      update: {},
      create: { module: 'ingredients', action: 'delete', description: 'Eliminar insumos' },
    }),
    // Orders
    prisma.permission.upsert({
      where: { module_action: { module: 'orders', action: 'create' } },
      update: {},
      create: { module: 'orders', action: 'create', description: 'Crear pedidos' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'orders', action: 'read' } },
      update: {},
      create: { module: 'orders', action: 'read', description: 'Ver pedidos' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'orders', action: 'cancel' } },
      update: {},
      create: { module: 'orders', action: 'cancel', description: 'Cancelar pedidos' },
    }),
    // Billing
    prisma.permission.upsert({
      where: { module_action: { module: 'billing', action: 'create' } },
      update: {},
      create: { module: 'billing', action: 'create', description: 'Crear facturas' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'billing', action: 'read' } },
      update: {},
      create: { module: 'billing', action: 'read', description: 'Ver facturas' },
    }),
    // Cash register
    prisma.permission.upsert({
      where: { module_action: { module: 'cash', action: 'open' } },
      update: {},
      create: { module: 'cash', action: 'open', description: 'Abrir caja' },
    }),
    prisma.permission.upsert({
      where: { module_action: { module: 'cash', action: 'close' } },
      update: {},
      create: { module: 'cash', action: 'close', description: 'Cerrar caja' },
    }),
  ]);

  console.log('✅ Permissions created');

  // Create roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrador del sistema',
    },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {},
    create: {
      name: 'manager',
      description: 'Gerente',
    },
  });

  const cashierRole = await prisma.role.upsert({
    where: { name: 'cashier' },
    update: {},
    create: {
      name: 'cashier',
      description: 'Cajero',
    },
  });

  const waiterRole = await prisma.role.upsert({
    where: { name: 'waiter' },
    update: {},
    create: {
      name: 'waiter',
      description: 'Mozo',
    },
  });

  const kitchenRole = await prisma.role.upsert({
    where: { name: 'kitchen' },
    update: {},
    create: {
      name: 'kitchen',
      description: 'Cocina',
    },
  });

  console.log('✅ Roles created');

  // Assign all permissions to admin
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Admin permissions assigned');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@mortimer.com' },
    update: {},
    create: {
      email: 'admin@mortimer.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'Sistema',
      roleId: adminRole.id,
    },
  });

  console.log('✅ Admin user created (admin@mortimer.com / admin123)');

  // Create payment methods (Argentina)
  await prisma.paymentMethod.createMany({
    data: [
      { name: 'Efectivo', commission: 0, isActive: true },
      { name: 'Transferencia', commission: 0, isActive: true },
      { name: 'Débito', commission: 1.5, isActive: true },
      { name: 'Crédito', commission: 3.0, isActive: true },
      { name: 'Mercado Pago', commission: 4.99, isActive: true, requiresOnline: true },
      { name: 'MODO', commission: 0, isActive: true, requiresOnline: true },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Payment methods created');

  // Create product categories
  await prisma.category.createMany({
    data: [
      { name: 'Entradas', order: 1 },
      { name: 'Platos principales', order: 2 },
      { name: 'Postres', order: 3 },
      { name: 'Bebidas sin alcohol', order: 4 },
      { name: 'Bebidas con alcohol', order: 5 },
      { name: 'Cafetería', order: 6 },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Product categories created');

  // Create expense categories
  await prisma.expenseCategory.createMany({
    data: [
      { name: 'Insumos' },
      { name: 'Servicios' },
      { name: 'Sueldos' },
      { name: 'Alquileres' },
      { name: 'Impuestos' },
      { name: 'Mantenimiento' },
      { name: 'Otros' },
    ],
    skipDuplicates: true,
  });

  console.log('✅ Expense categories created');

  // Create sample tables
  await prisma.table.createMany({
    data: Array.from({ length: 10 }, (_, i) => ({
      number: i + 1,
      capacity: i % 3 === 0 ? 4 : i % 2 === 0 ? 2 : 6,
      status: 'AVAILABLE',
    })),
    skipDuplicates: true,
  });

  console.log('✅ Sample tables created');

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
