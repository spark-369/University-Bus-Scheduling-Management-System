-- Rename the UserRole enum value STUDENT -> PASSENGER
ALTER TYPE "UserRole" RENAME VALUE 'STUDENT' TO 'PASSENGER';

-- Rename User.studentId -> User.passengerId (column + unique index)
ALTER TABLE "User" RENAME COLUMN "studentId" TO "passengerId";
ALTER INDEX "User_studentId_key" RENAME TO "User_passengerId_key";

-- Rename BusPass.studentId -> BusPass.passengerId (column + unique index + FK)
ALTER TABLE "BusPass" RENAME COLUMN "studentId" TO "passengerId";
ALTER INDEX "BusPass_studentId_key" RENAME TO "BusPass_passengerId_key";
ALTER TABLE "BusPass" RENAME CONSTRAINT "BusPass_studentId_fkey" TO "BusPass_passengerId_fkey";
