-- AlterTable
ALTER TABLE "users" ADD COLUMN "reset_otp_hash" VARCHAR(255),
ADD COLUMN "reset_otp_expires_at" TIMESTAMP(6);
