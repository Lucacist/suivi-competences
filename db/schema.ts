import { pgTable, serial, text, integer, timestamp, uniqueIndex, doublePrecision } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Les Étudiants
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  lastName: text('last_name').notNull(),
  firstName: text('first_name').notNull(),
}, (t) => ({
  // Unicité Nom+Prénom pour éviter les doublons
  unq: uniqueIndex('unique_student').on(t.lastName, t.firstName),
}));

// 2. Les Sessions (Uploads du CSV)
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  label: text('label').notNull(), // ex: "Semestre 1 - 2024"
  date: timestamp('date').defaultNow(),
});

// 3. La structure du diplôme (Référentiel)
export const criteria = pgTable('criteria', {
  id: serial('id').primaryKey(),
  pole: text('pole'),           // Pôle 1
  activity: text('activity'),   // Activité 1.1
  competence: text('competence'), // C1.1
  taskBlock: text('task_block'), // Prise en charge...
  label: text('label').notNull(), // Le critère final
  csvIndex: integer('csv_index'), // Pour se repérer lors du parsing (optionnel)
});

// 4. Les Notes (Table de jointure)
export const results = pgTable('results', {
  id: serial('id').primaryKey(),
  value: doublePrecision('value'), // La note (ex: 68.75 ou 50)
  studentId: integer('student_id').references(() => students.id),
  sessionId: integer('session_id').references(() => sessions.id),
  criteriaId: integer('criteria_id').references(() => criteria.id),
});

// --- RELATIONS (Pour faciliter les requêtes avec Drizzle Query) ---

export const studentsRelations = relations(students, ({ many }) => ({
  results: many(results),
}));

export const sessionsRelations = relations(sessions, ({ many }) => ({
  results: many(results),
}));

export const criteriaRelations = relations(criteria, ({ many }) => ({
  results: many(results),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  student: one(students, {
    fields: [results.studentId],
    references: [students.id],
  }),
  session: one(sessions, {
    fields: [results.sessionId],
    references: [sessions.id],
  }),
  criteria: one(criteria, {
    fields: [results.criteriaId],
    references: [criteria.id],
  }),
}));