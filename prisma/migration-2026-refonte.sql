-- ============================================
-- MIGRATION REFONTE BOURSEFI — NON DESTRUCTIVE
-- Date: 2026-08-10
-- ============================================

-- ÉTAPE 1: Enums
DO $$ BEGIN
    CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContactVerificationStatus" AS ENUM ('VERIFIED', 'TO_VERIFY', 'UNVERIFIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContactType" AS ENUM ('PHONE', 'WHATSAPP', 'EMAIL', 'WEBSITE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ContactSource" AS ENUM ('OFFICIAL_WEBSITE', 'ESTABLISHMENT', 'DIRECTORY', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TarifSource" AS ENUM ('OFFICIAL_WEBSITE', 'ESTABLISHMENT', 'DOCUMENT', 'PARTNER', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ÉTAPE 2: Alter Table Etablissement
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "adresse" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "phoneSecondary" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "source" "ContactSource";
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "contactStatus" "ContactVerificationStatus" NOT NULL DEFAULT 'TO_VERIFY';
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "contactVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "updatedBy" TEXT;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Etablissement" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ÉTAPE 3: Create Table EtablissementContact
CREATE TABLE IF NOT EXISTS "EtablissementContact" (
    "id" TEXT NOT NULL,
    "etablissementId" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "valeur" TEXT NOT NULL,
    "label" TEXT,
    "isPrincipal" BOOLEAN NOT NULL DEFAULT false,
    "isWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "status" "ContactVerificationStatus" NOT NULL DEFAULT 'TO_VERIFY',
    "source" "ContactSource",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EtablissementContact_pkey" PRIMARY KEY ("id")
);

-- ÉTAPE 4: Alter Table Programme
ALTER TABLE "Programme" ADD COLUMN IF NOT EXISTS "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE';
ALTER TABLE "Programme" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Programme" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- ÉTAPE 5: Create Table Tarif
CREATE TABLE IF NOT EXISTS "Tarif" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "anneeAcademique" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "frequence" TEXT NOT NULL DEFAULT 'ANNUEL',
    "devise" TEXT NOT NULL DEFAULT 'FCFA',
    "label" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT true,
    "source" "TarifSource",
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedBy" TEXT,
    CONSTRAINT "Tarif_pkey" PRIMARY KEY ("id")
);

-- ÉTAPE 6: Alter Table Bourse
ALTER TABLE "Bourse" ADD COLUMN IF NOT EXISTS "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE';

-- ÉTAPE 7: Foreign Keys (Restrict sur EtablissementContact)
DO $$ BEGIN
    ALTER TABLE "EtablissementContact" ADD CONSTRAINT "EtablissementContact_etablissementId_fkey" 
        FOREIGN KEY ("etablissementId") REFERENCES "Etablissement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "Tarif" ADD CONSTRAINT "Tarif_programmeId_fkey" 
        FOREIGN KEY ("programmeId") REFERENCES "Programme"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ÉTAPE 8: Indexes
CREATE INDEX IF NOT EXISTS "EtablissementContact_etablissementId_idx" ON "EtablissementContact"("etablissementId");
CREATE INDEX IF NOT EXISTS "Tarif_programmeId_anneeAcademique_idx" ON "Tarif"("programmeId", "anneeAcademique");
CREATE INDEX IF NOT EXISTS "Bourse_status_idx" ON "Bourse"("status");
