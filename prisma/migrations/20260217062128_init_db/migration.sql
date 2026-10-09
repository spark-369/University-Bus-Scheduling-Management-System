/*
  Warnings:

  - A unique constraint covering the columns `[busId]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trip_busId_key" ON "Trip"("busId");
