# Règle d'Enrichissement Systématique des Programmes BourseFi

## Règle Absolue
Chaque programme de formation créé, importé ou mis à jour dans la base de données BourseFi doit IMPÉRATIVEMENT être renseigné avec des données académiques et professionnelles 100% complètes.

Aucune fiche de formation ne doit avoir de champs à `null` ou génériques.

## Champs Obligatoires pour Chaque Programme (`Programme` model) :

1. **`description`** : Présentation détaillée du cursus, des enjeux et du positionnement académique (minimum 2 à 3 phrases).
2. **`objectifs`** : Liste à puces (`•`) des 4 à 5 objectifs pédagogiques et managériaux majeurs.
3. **`competences`** : Liste séparée par des virgules des 5 à 6 compétences techniques et professionnelles clés (affichées sous forme de cartes d'acquis avec icônes vertes sur la fiche publique).
4. **`debouches`** : Liste des 5 à 7 métiers et postes visés (affichés sous forme de badges violets).
5. **`secteurs`** : Liste des industries et types d'entreprises cibles.
6. **`programmePedagogique`** : Découpage des modules et matières enseignées par semestre (Semestre 1/3 à Semestre 4/6).
7. **`conditionsAdmission`** : Critères d'accès précis selon le niveau (Baccalauréat scientifique/technique/général pour les Licences, Licence L3 pour les Masters).
8. **`documentsRequis`** : Liste complète des pièces à fournir pour le dossier de candidature.
9. **`modalites`** : Mode d'enseignement (cours magistraux, travaux pratiques en laboratoire, ateliers informatiques/BIM).
10. **`stage`** : Durée du stage obligatoire en entreprise (3 à 6 mois) et modalité du mémoire de fin d'études.
11. **`perspectives`** : Poursuite d'études ou insertion professionnelle.
12. **`eligibilite`** : Résumé des critères d'admissibilité académique.

## Automatisation
Si un script d'importation ou d'upsert est rédigé à l'avenir, il doit utiliser les helpers de génération de contenus enrichis issus de `scripts/enrich-all-programmes.mjs`.
