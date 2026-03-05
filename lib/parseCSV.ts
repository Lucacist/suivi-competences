import Papa from 'papaparse';
import type { Student, Session, Criteria, Result } from './types';

// Configuration des lignes du CSV
const ROWS = {
  POLE: 1,
  ACTIVITY: 3,
  COMPETENCE: 4,
  BLOCK: 5,
  LABEL: 6,
  DATA_START: 7,
};

const START_COL_INDEX = 4;

let nextStudentId = 1;
let nextSessionId = 1;
let nextCriteriaId = 1;
let nextResultId = 1;

export function parseCSVFile(
  text: string,
  existingStudents: Student[]
): {
  students: Student[];
  sessions: Session[];
  criteria: Criteria[];
  results: Result[];
} | { error: string } {
  const { data } = Papa.parse(text, {
    header: false,
    skipEmptyLines: true,
  });

  const rows = data as string[][];

  if (rows.length < 8) {
    return { error: 'Le fichier semble vide ou mal formé' };
  }

  // Création de la session
  const sessionId = nextSessionId++;
  const session: Session = {
    id: sessionId,
    label: `Import du ${new Date().toLocaleDateString('fr-FR')}`,
    date: new Date().toISOString(),
  };

  // Analyse des en-têtes (Fill Forward)
  let currentPole = '';
  let currentActivity = '';
  let currentCompetence = '';
  let currentBlock = '';

  const columnToCriteria = new Map<number, Criteria>();
  const newCriteria: Criteria[] = [];

  const totalCols = rows[ROWS.LABEL]?.length || 0;

  for (let i = START_COL_INDEX; i < totalCols; i++) {
    const rawPole = rows[ROWS.POLE]?.[i]?.trim() || '';
    const rawActivity = rows[ROWS.ACTIVITY]?.[i]?.trim() || '';
    const rawCompetence = rows[ROWS.COMPETENCE]?.[i]?.trim() || '';
    const rawBlock = rows[ROWS.BLOCK]?.[i]?.trim() || '';
    const rawLabel = rows[ROWS.LABEL]?.[i]?.trim() || '';

    if (rawPole) currentPole = rawPole;
    if (rawActivity) currentActivity = rawActivity;
    if (rawCompetence) currentCompetence = rawCompetence;
    if (rawBlock) currentBlock = rawBlock;

    if (rawLabel && rawLabel !== '' && currentActivity) {
      const c: Criteria = {
        id: nextCriteriaId++,
        pole: currentPole,
        activity: currentActivity,
        competence: currentCompetence,
        taskBlock: currentBlock,
        label: rawLabel,
        csvIndex: i,
      };
      newCriteria.push(c);
      columnToCriteria.set(i, c);
    }
  }

  // Import des élèves et notes
  const studentMap = new Map<string, Student>();
  // Charger les élèves existants
  for (const s of existingStudents) {
    studentMap.set(`${s.lastName}|${s.firstName}`, s);
    if (s.id >= nextStudentId) nextStudentId = s.id + 1;
  }

  const newStudents: Student[] = [];
  const newResults: Result[] = [];

  for (let r = ROWS.DATA_START; r < rows.length; r++) {
    const row = rows[r];
    const lastName = row[0]?.trim() || '';
    const firstName = row[1]?.trim() || '';

    if (!lastName) continue;

    const key = `${lastName}|${firstName}`;
    let student = studentMap.get(key);
    if (!student) {
      student = { id: nextStudentId++, lastName, firstName };
      studentMap.set(key, student);
      newStudents.push(student);
    }

    for (const [colIndex, crit] of columnToCriteria.entries()) {
      let rawValue = row[colIndex];
      if (rawValue) {
        rawValue = rawValue.replace(',', '.').replace('%', '').trim();
        const numericValue = parseFloat(rawValue);

        if (!isNaN(numericValue)) {
          newResults.push({
            id: nextResultId++,
            value: numericValue,
            studentId: student.id,
            sessionId: session.id,
            criteriaId: crit.id,
          });
        }
      }
    }
  }

  return {
    students: newStudents,
    sessions: [session],
    criteria: newCriteria,
    results: newResults,
  };
}
