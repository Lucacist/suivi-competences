export interface Student {
  id: number;
  lastName: string;
  firstName: string;
}

export interface Session {
  id: number;
  label: string;
  date: string;
}

export interface Criteria {
  id: number;
  pole: string;
  activity: string;
  competence: string;
  taskBlock: string;
  label: string;
  csvIndex: number;
}

export interface Result {
  id: number;
  value: number;
  studentId: number;
  sessionId: number;
  criteriaId: number;
}
