-- AlterTable
ALTER TABLE "Assignment" ADD COLUMN     "subject" "TeacherSubject";

-- AlterTable
ALTER TABLE "Notice" ADD COLUMN     "subject" "TeacherSubject";

-- AlterTable
ALTER TABLE "Resource" ADD COLUMN     "subject" "TeacherSubject";
