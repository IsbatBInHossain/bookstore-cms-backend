-- CreateEnum
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN');

-- DropIndex
DROP INDEX "User_name_email_created_at_updated_at_idx";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "User_name_email_role_created_at_updated_at_idx" ON "User"("name", "email", "role", "created_at", "updated_at");
