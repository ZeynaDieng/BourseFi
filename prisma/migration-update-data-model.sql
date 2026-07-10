-- Migration pour mettre à jour le modèle de données BourseFi
-- Ce script doit être exécuté sur la base de données PostgreSQL en ligne
-- Date: 2025-01-XX

-- ============================================
-- ÉTAPE 1: Ajouter la nouvelle colonne fraisDossierEtranger
-- ============================================
ALTER TABLE "Programme" ADD COLUMN IF NOT EXISTS "fraisDossierEtranger" INTEGER NOT NULL DEFAULT 30000;

-- ============================================
-- ÉTAPE 2: Mettre à jour la valeur par défaut de fraisDossier
-- ============================================
ALTER TABLE "Programme" ALTER COLUMN "fraisDossier" SET DEFAULT 20000;

-- ============================================
-- ÉTAPE 3: Mettre à jour les valeurs existantes de fraisDossierEtranger
-- (si des programmes existent déjà)
-- ============================================
UPDATE "Programme" SET "fraisDossierEtranger" = 30000 WHERE "fraisDossierEtranger" IS NULL;

-- ============================================
-- ÉTAPE 4: Supprimer la colonne fraisScolarite (si elle existe)
-- ============================================
ALTER TABLE "Programme" DROP COLUMN IF EXISTS "fraisScolarite";

-- ============================================
-- ÉTAPE 5: Supprimer la colonne placesRestantes de la table Bourse
-- ============================================
ALTER TABLE "Bourse" DROP COLUMN IF EXISTS "placesRestantes";

-- ============================================
-- ÉTAPE 6: Vérification des contraintes
-- ============================================
-- S'assurer que les colonnes ont les bonnes valeurs par défaut
ALTER TABLE "Programme" ALTER COLUMN "fraisDossier" SET NOT NULL;
ALTER TABLE "Programme" ALTER COLUMN "fraisDossierEtranger" SET NOT NULL;

-- ============================================
-- ÉTAPE 7: Nettoyage des données potentiellement corrompues
-- ============================================
-- S'assurer que tous les programmes ont des fraisDossier valides
UPDATE "Programme" SET "fraisDossier" = 20000 WHERE "fraisDossier" IS NULL OR "fraisDossier" < 0;
UPDATE "Programme" SET "fraisDossierEtranger" = 30000 WHERE "fraisDossierEtranger" IS NULL OR "fraisDossierEtranger" < 0;

-- ============================================
-- FIN DE LA MIGRATION
-- ============================================
