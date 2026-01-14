
---

# 🍽️ Sistema de Gestión Gastronómica (RMS) – Argentina

Sistema integral de gestión para restaurantes en Argentina, orientado a **costos gastronómicos profesionales, operación diaria (POS), stock, reservas y facturación electrónica AFIP**.

Este proyecto está diseñado para ser desarrollado **con asistencia de GitHub Copilot**, utilizando una arquitectura modular, escalable y alineada con la operación real de un restaurante.

Nombre de la aplicación: Mortimer

---

## 🎯 Objetivo del proyecto

Construir una **aplicación web full-stack** que permita:

* Gestionar recetas, escandallos y costos reales.
* Controlar stock y mercadería con consumo automático.
* Operar salón, mesas y pedidos (POS).
* Administrar reservas.
* Emitir tickets y facturación electrónica conforme a AFIP.
* Gestionar usuarios, roles y auditoría.
* Obtener reportes de ventas y rentabilidad.

---

## 🧠 Rol de Copilot en este proyecto

Copilot debe actuar como:

> **Arquitecto de software senior y desarrollador full-stack**, con conocimiento en:
>
> * Gastronomía profesional.
> * Costos, recetas y mermas.
> * Sistemas POS.
> * Normativa fiscal argentina (AFIP).

Este README es la **fuente única de verdad** para la generación de código.

---

## 🧱 Stack tecnológico

### Backend

* Node.js
* TypeScript
* **NestJS**
* **Prisma ORM**
* PostgreSQL
* Autenticación JWT
* Validaciones con `class-validator`
* API REST

### Frontend

* React
* TypeScript
* Material UI (o equivalente)
* React Query
* React Hook Form
* Preparado para internacionalización (`es-AR`)

---

## 🏗️ Arquitectura

Arquitectura **modular por dominio**, con separación clara de responsabilidades.

Cada módulo debe incluir:

* Controller
* Service
* DTOs
* Entity / Model
* Tests básicos

Separación por capas:

* Dominio gastronómico
* Operación (POS)
* Administración
* Seguridad y auditoría

---

## 📦 Módulos funcionales

### 1. Insumos, recetas y escandallos

**Modelos:**

* Ingredient (Materia Prima)
* IngredientCostHistory
* Preparation (Elaboración)
* Recipe
* RecipeItem

**Requisitos:**

* Unidades de medida convertibles.
* Merma (% o peso neto/bruto).
* Costos históricos.
* Escandallo automático.
* Sub-recetas reutilizables.
* Cálculo de costo por porción y margen.

---

### 2. Productos y stock

**Modelos:**

* Product
* ProductVariant
* Category
* Stock
* StockMovement

**Requisitos:**

* Consumo automático de stock por ventas y producción.
* Stock mínimo con alertas.
* Inventarios físicos y ajustes.
* Registro de desperdicios y vencimientos.
* No permitir ventas sin stock suficiente.

---

### 3. Salón, mesas y pedidos (POS)

**Modelos:**

* Table
* Order
* OrderItem
* OrderStatus

**Requisitos:**

* Gestión de mesas (unión/separación).
* Estados del pedido bien definidos.
* Envío de comandas a cocina/bar.
* Observaciones por ítem.
* División de cuentas.
* Gestión de anulaciones con auditoría.

---

### 4. Tickets, pagos y facturación

**Modelos:**

* Ticket
* Invoice
* Payment
* PaymentMethod
* CashRegister

**Requisitos:**

* Facturas A, B y C.
* Preparar integración AFIP (servicios desacoplados).
* Manejo de IVA.
* Métodos de pago:

  * Efectivo
  * Transferencia
  * Tarjeta crédito / débito
  * QR (Mercado Pago, MODO)
* Cierre y arqueo de caja por turno.
* Registro de comisiones por medio de pago.

---

### 5. Reservas

**Modelos:**

* Reservation
* TimeSlot

**Requisitos:**

* Frontend público para clientes.
* Asignación automática de mesas.
* Gestión de horarios y turnos.
* Políticas de reserva.
* Gestión de no-shows y lista de espera.

---

### 6. Administración y compras

**Modelos:**

* Purchase
* Supplier
* Expense
* ExpenseCategory

**Requisitos:**

* Registro de compras de insumos y servicios.
* Clasificación de gastos.
* Proveedores con historial.
* Cuentas a pagar y vencimientos.

---

### 7. Usuarios, roles y seguridad

**Modelos:**

* User
* Role
* Permission
* AuditLog

**Requisitos:**

* Autenticación segura (JWT).
* Permisos por módulo y acción.
* Auditoría obligatoria para:

  * Cambios de precios.
  * Anulaciones.
  * Cierres de caja.
* Gestión de turnos de usuario.

---

## 📊 Reportes

* Ventas por producto, categoría y horario.
* Rentabilidad real por plato.
* Consumo de insumos.
* Ingeniería de menú.
* Proyección de compras.
* Exportación CSV / Excel.
* API preparada para análisis con IA.

---

## 📡 Endpoints esperados (ejemplo)

```http
POST   /auth/login
POST   /ingredients
POST   /recipes
GET    /recipes/{id}/cost
POST   /orders
POST   /orders/{id}/close
POST   /invoices
POST   /cash-register/close
POST   /reservations
```

Copilot debe inferir y completar el resto.

---

## 🌱 Datos iniciales (Seed)

Generar seeds con:

* Categorías de productos.
* Métodos de pago comunes en Argentina.
* Roles por defecto.
* Impuestos IVA configurados.

---

## ✅ Reglas de negocio obligatorias

* El costo de un plato se calcula automáticamente.
* Una venta descuenta stock en tiempo real.
* No permitir ventas sin stock.
* Toda anulación debe quedar auditada.
* Facturación conforme a normativa argentina.
* Servicios AFIP desacoplados del core.

---

## 🧪 Calidad del código

* Tipado estricto.
* Validaciones explícitas.
* Manejo correcto de errores.
* Código limpio y consistente.
* Comentarios solo donde aporten valor.
* Dominio en español, código en inglés.

---

## 🚀 Orden de implementación (prioridad)

1. Usuarios y autenticación
2. Insumos, recetas y costos
3. Productos y stock
4. Pedidos y POS
5. Facturación
6. Reservas
7. Reportes

---

## 🏁 Instrucción final para Copilot

> Genera el proyecto completo respetando este README como **fuente única de verdad**.
> No omitas entidades ni reglas de negocio.
> Prioriza consistencia, claridad y mantenibilidad.

---

Si quieres, el próximo paso puede ser:

* Crear la **estructura de carpetas inicial**.
* Generar el **schema.prisma completo**.
* Dividir este README en **prompts por módulo** para Copilot Chat.
* Reducir todo a un **MVP funcional**.
