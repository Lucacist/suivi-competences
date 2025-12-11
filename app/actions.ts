'use server'

import { db } from '@/db';
import { students, sessions, criteria, results } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import Papa from 'papaparse';
import { revalidatePath } from 'next/cache';

// Configuration des lignes du CSV (Selon ton image et tes explications)
// Attention: Les index commencent à 0 (Ligne 1 Excel = Index 0)
const ROWS = {
  POLE: 1,       // Ligne "PÔLE 1..."
  ACTIVITY: 3,   // Ligne "ACTIVITÉ 1.1..."
  COMPETENCE: 4, // Ligne "C1.1"
  BLOCK: 5,      // Ligne "Prise en charge du véhicule"
  LABEL: 6,      // Ligne "Les contrôles visuels..."
  DATA_START: 7  // Première ligne avec un élève
};

const START_COL_INDEX = 4; // Index de la colonne où commencent les notes (A=0, B=1...)

export async function uploadCSV(formData: FormData) {
  const file = formData.get('file') as File;
  
  if (!file) {
    return { success: false, message: "Aucun fichier fourni" };
  }

  // 1. Conversion du fichier en texte
  const text = await file.text();

  // 2. Parsing du CSV avec PapaParse
  const { data } = Papa.parse(text, {
    header: false, // On gère les headers nous-mêmes car ils sont complexes
    skipEmptyLines: true,
  });

  const rows = data as string[][];

  if (rows.length < 8) {
    return { success: false, message: "Le fichier semble vide ou mal formé" };
  }

  try {
    // 3. Création de la Session (ex: "Import du 12/12/2024")
    const sessionLabel = `Import du ${new Date().toLocaleDateString('fr-FR')}`;
    const [newSession] = await db.insert(sessions).values({
      label: sessionLabel,
    }).returning();

    // ---------------------------------------------------------
    // ETAPE CLE : ANALYSE DES EN-TÊTES (Fill Forward)
    // ---------------------------------------------------------
    
    // On garde en mémoire les valeurs "courantes" pour combler les trous
    let currentPole = "";
    let currentActivity = "";
    let currentCompetence = "";
    let currentBlock = "";

    // On stocke la correspondance : Index Colonne CSV -> ID du Critère en BDD
    const columnToCriteriaId = new Map<number, number>();

    const totalCols = rows[ROWS.LABEL].length;

    // On parcourt les colonnes de gauche à droite
    for (let i = START_COL_INDEX; i < totalCols; i++) {
      // Récupération des valeurs brutes
      const rawPole = rows[ROWS.POLE]?.[i]?.trim();
      const rawActivity = rows[ROWS.ACTIVITY]?.[i]?.trim();
      const rawCompetence = rows[ROWS.COMPETENCE]?.[i]?.trim();
      const rawBlock = rows[ROWS.BLOCK]?.[i]?.trim();
      const rawLabel = rows[ROWS.LABEL]?.[i]?.trim();

      // Logique "Fill Forward" : Si la case est remplie, on met à jour. Sinon on garde l'ancienne.
      if (rawPole) currentPole = rawPole;
      if (rawActivity) currentActivity = rawActivity;
      if (rawCompetence) currentCompetence = rawCompetence;
      if (rawBlock) currentBlock = rawBlock;

      // Si on a un Label (Critère final), c'est une colonne de note valide
      // On ignore les colonnes "Moyenne" ou vides
      if (rawLabel && rawLabel !== "" && currentActivity) {
        
        // On cherche si ce critère existe déjà (pour ne pas le dupliquer inutilement)
        // Note: Ici on simplifie en créant/cherchant par le Label + Block
        let criteriaId: number;

        // Astuce: Pour simplifier ce script V1, on insère tout le temps.
        // Idéalement, on ferait un check avant.
        const [insertedCriteria] = await db.insert(criteria).values({
          pole: currentPole,
          activity: currentActivity,
          competence: currentCompetence,
          taskBlock: currentBlock,
          label: rawLabel,
          csvIndex: i
        }).returning({ id: criteria.id });

        criteriaId = insertedCriteria.id;
        columnToCriteriaId.set(i, criteriaId);
      }
    }

    // ---------------------------------------------------------
    // ETAPE 2 : IMPORT DES ÉLÈVES ET NOTES
    // ---------------------------------------------------------

    // On parcourt les lignes à partir de la ligne 7
    for (let r = ROWS.DATA_START; r < rows.length; r++) {
      const row = rows[r];
      const lastName = row[0]?.trim();  // Col A
      const firstName = row[1]?.trim(); // Col B

      // Si pas de nom, on saute la ligne
      if (!lastName) continue;

      // 1. Gestion de l'élève (On cherche s'il existe, sinon on crée)
      // Drizzle "upsert" est pratique ici
      const [student] = await db.insert(students)
        .values({ lastName, firstName })
        .onConflictDoUpdate({
          target: [students.lastName, students.firstName],
          set: { lastName } // Hack pour récupérer l'ID si existe déjà
        })
        .returning({ id: students.id });

      // 2. Insertion des notes
      // On parcourt seulement les colonnes identifiées comme valides à l'étape précédente
      for (const [colIndex, criteriaId] of columnToCriteriaId.entries()) {
        let rawValue = row[colIndex];

        if (rawValue) {
          // Nettoyage: "68,75" -> 68.75
          rawValue = rawValue.replace(',', '.').replace('%', '').trim();
          
          const numericValue = parseFloat(rawValue);

          // On insère seulement si c'est un nombre valide (pas vide, pas NaN)
          if (!isNaN(numericValue)) {
            await db.insert(results).values({
              studentId: student.id,
              sessionId: newSession.id,
              criteriaId: criteriaId,
              value: numericValue
            });
          }
        }
      }
    }

    // On rafraichit la page pour voir les nouvelles données
    revalidatePath('/');
    return { success: true, message: "Import réussi !" };

  } catch (error) {
    console.error("Erreur lors de l'import:", error);
    return { success: false, message: "Erreur serveur lors de l'import" };
  }
}