import type {Rank} from './result-ranking';

export const studentModerationSchema='CREATE TABLE IF NOT EXISTS student_moderation(student TEXT PRIMARY KEY REFERENCES students(id),removed TEXT NOT NULL)';
export type StudentParticipation=Rank&{removedAt:string|null;competing:boolean};
