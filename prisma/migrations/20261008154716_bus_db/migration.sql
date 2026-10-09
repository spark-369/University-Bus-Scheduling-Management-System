/*
  Warnings:

  - You are about to drop the column `stopId` on the `Notification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `link` to the `Notification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userRole` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'BUS_PASS_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'MAINTENANCE_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'ROUTE_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'TRIP_STARTED';
ALTER TYPE "NotificationType" ADD VALUE 'FEEDBACK_RECEIVED';
ALTER TYPE "NotificationType" ADD VALUE 'STOP_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'TRIP_SCHEDULED';

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_stopId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropIndex
DROP INDEX "Trip_busId_key";

-- DropIndex
DROP INDEX "Trip_driverId_key";

-- AlterTable
ALTER TABLE "Booking" ALTER COLUMN "seatNumber" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "stopId",
DROP COLUMN "userId",
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "userRole" TEXT NOT NULL;
