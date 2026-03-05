'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';
import type { Student, Session, Criteria, Result } from './types';

interface DataStore {
  students: Student[];
  sessions: Session[];
  criteria: Criteria[];
  results: Result[];
}

interface DataContextType {
  data: DataStore;
  importCSV: (parsed: { students: Student[]; sessions: Session[]; criteria: Criteria[]; results: Result[] }) => void;
  getStudent: (id: number) => Student | undefined;
  getStudentResults: (studentId: number) => {
    id: number;
    value: number;
    criteriaLabel: string;
    criteriaPole: string;
    criteriaCompetence: string;
    criteriaTaskBlock: string;
    sessionLabel: string;
    sessionId: number;
  }[];
}

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [data, setData] = useState<DataStore>({
    students: [],
    sessions: [],
    criteria: [],
    results: [],
  });

  const importCSV = useCallback((parsed: DataStore) => {
    setData((prev) => ({
      students: mergeById(prev.students, parsed.students),
      sessions: [...prev.sessions, ...parsed.sessions],
      criteria: [...prev.criteria, ...parsed.criteria],
      results: [...prev.results, ...parsed.results],
    }));
  }, []);

  const getStudent = useCallback(
    (id: number) => data.students.find((s) => s.id === id),
    [data.students]
  );

  const getStudentResults = useCallback(
    (studentId: number) => {
      return data.results
        .filter((r) => r.studentId === studentId)
        .map((r) => {
          const c = data.criteria.find((cr) => cr.id === r.criteriaId);
          const s = data.sessions.find((se) => se.id === r.sessionId);
          return {
            id: r.id,
            value: r.value,
            criteriaLabel: c?.label || '',
            criteriaPole: c?.pole || '',
            criteriaCompetence: c?.competence || '',
            criteriaTaskBlock: c?.taskBlock || '',
            sessionLabel: s?.label || '',
            sessionId: s?.id || 0,
          };
        });
    },
    [data.results, data.criteria, data.sessions]
  );

  const value = useMemo(
    () => ({ data, importCSV, getStudent, getStudentResults }),
    [data, importCSV, getStudent, getStudentResults]
  );

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}

// Merge students by id (avoid duplicates on re-import)
function mergeById<T extends { id: number }>(existing: T[], incoming: T[]): T[] {
  const map = new Map(existing.map((item) => [item.id, item]));
  for (const item of incoming) {
    map.set(item.id, item);
  }
  return Array.from(map.values());
}
