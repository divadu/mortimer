/*
  Warnings:

  - The values [LITER] on the enum `RecipeItem_unit` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `currentCost` on the `ingredient` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(10,4)`.
  - The values [LITER] on the enum `RecipeItem_unit` will be removed. If these variants are still used in the database, this will fail.
  - The values [LITER] on the enum `RecipeItem_unit` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `ingredient` ADD COLUMN `lastPurchaseCost` DECIMAL(10, 2) NULL,
    ADD COLUMN `lastPurchaseQuantity` DECIMAL(10, 3) NULL,
    ADD COLUMN `lastPurchaseUnit` ENUM('KILOGRAM', 'GRAM', 'MILLILITER', 'UNIT') NULL,
    MODIFY `unit` ENUM('KILOGRAM', 'GRAM', 'MILLILITER', 'UNIT') NOT NULL,
    MODIFY `currentCost` DECIMAL(10, 4) NOT NULL;

-- AlterTable
ALTER TABLE `preparation` MODIFY `yieldUnit` ENUM('KILOGRAM', 'GRAM', 'MILLILITER', 'UNIT') NOT NULL;

-- AlterTable
ALTER TABLE `recipeitem` MODIFY `unit` ENUM('KILOGRAM', 'GRAM', 'MILLILITER', 'UNIT') NOT NULL;
