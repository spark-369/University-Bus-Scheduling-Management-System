/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BusLocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BusRoute` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Driver` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FuelRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StopTime` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Student` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TripStop` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_tripId_fkey";

-- DropForeignKey
ALTER TABLE "Bus" DROP CONSTRAINT "Bus_driverId_fkey";

-- DropForeignKey
ALTER TABLE "BusLocation" DROP CONSTRAINT "BusLocation_busId_fkey";

-- DropForeignKey
ALTER TABLE "BusLocation" DROP CONSTRAINT "BusLocation_tripId_fkey";

-- DropForeignKey
ALTER TABLE "BusPass" DROP CONSTRAINT "BusPass_studentId_fkey";

-- DropForeignKey
ALTER TABLE "BusRoute" DROP CONSTRAINT "BusRoute_busId_fkey";

-- DropForeignKey
ALTER TABLE "BusRoute" DROP CONSTRAINT "BusRoute_routeId_fkey";

-- DropForeignKey
ALTER TABLE "Driver" DROP CONSTRAINT "Driver_userId_fkey";

-- DropForeignKey
ALTER TABLE "FuelRecord" DROP CONSTRAINT "FuelRecord_busId_fkey";

-- DropForeignKey
ALTER TABLE "StopTime" DROP CONSTRAINT "StopTime_scheduleId_fkey";

-- DropForeignKey
ALTER TABLE "StopTime" DROP CONSTRAINT "StopTime_stopId_fkey";

-- DropForeignKey
ALTER TABLE "Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "Trip" DROP CONSTRAINT "Trip_driverId_fkey";

-- DropForeignKey
ALTER TABLE "TripStop" DROP CONSTRAINT "TripStop_stopId_fkey";

-- DropForeignKey
ALTER TABLE "TripStop" DROP CONSTRAINT "TripStop_tripId_fkey";

-- DropTable
DROP TABLE "Attendance";

-- DropTable
DROP TABLE "BusLocation";

-- DropTable
DROP TABLE "BusRoute";

-- DropTable
DROP TABLE "Driver";

-- DropTable
DROP TABLE "FuelRecord";

-- DropTable
DROP TABLE "StopTime";

-- DropTable
DROP TABLE "Student";

-- DropTable
DROP TABLE "TripStop";

-- AddForeignKey
ALTER TABLE "Bus" ADD CONSTRAINT "Bus_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trip" ADD CONSTRAINT "Trip_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusPass" ADD CONSTRAINT "BusPass_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
