import {database} from './database';
import {competitionState,defaultCompetition,type CompetitionSettings} from './competition';
export const competitionSchema=`CREATE TABLE IF NOT EXISTS course_competitions(course TEXT PRIMARY KEY,enabled INTEGER NOT NULL DEFAULT 0,show_countdown INTEGER NOT NULL DEFAULT 1,ends_at TEXT,prize TEXT NOT NULL DEFAULT '',updated TEXT NOT NULL)`;
const prepared=new WeakMap<object,Promise<void>>();
export async function ensureCompetitions(){
  const db=database();let ready=prepared.get(db);
  if(!ready){ready=db.prepare(competitionSchema).run().then(()=>{}).catch(e=>{prepared.delete(db);throw e;});prepared.set(db,ready);}
  await ready;
}
export async function getCompetition(course:string){
  await ensureCompetitions();
  const row=await database().prepare('SELECT enabled,show_countdown,ends_at,prize,updated FROM course_competitions WHERE course=?').bind(course).first<{enabled:number;show_countdown:number;ends_at:string|null;prize:string;updated:string}>();
  const settings:CompetitionSettings=row?{enabled:!!row.enabled,showCountdown:!!row.show_countdown,endsAt:row.ends_at,prize:row.prize,updated:row.updated}:defaultCompetition(course);
  return competitionState(settings);
}
export async function saveCompetition(course:string,settings:CompetitionSettings){
  await ensureCompetitions();
  await database().prepare('INSERT INTO course_competitions(course,enabled,show_countdown,ends_at,prize,updated) VALUES(?,?,?,?,?,?) ON CONFLICT(course) DO UPDATE SET enabled=excluded.enabled,show_countdown=excluded.show_countdown,ends_at=excluded.ends_at,prize=excluded.prize,updated=excluded.updated').bind(course,Number(settings.enabled),Number(settings.showCountdown),settings.endsAt,settings.prize,settings.updated).run();
  return getCompetition(course);
}
