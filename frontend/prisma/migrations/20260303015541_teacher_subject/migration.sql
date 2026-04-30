-- CreateEnum
CREATE TYPE "TeacherSubject" AS ENUM ('Physics', 'Chemistry');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "teacherSubject" "TeacherSubject";
