/*
  Warnings:

  - A unique constraint covering the columns `[driverId]` on the table `Trip` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Trip_driverId_key" ON "Trip"("driverId");
