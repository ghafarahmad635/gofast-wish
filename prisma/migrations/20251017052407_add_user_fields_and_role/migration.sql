-- AlterTable
ALTER TABLE "user" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "loginStatus" SET DEFAULT true,
ALTER COLUMN "timezone" SET DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "updatedAt" DROP DEFAULT;
