import {database} from './database';
import {defaultResultRequirements,parseResultRequirements,type ResultRequirements} from './result-requirements';

export const resultRequirementsSchema='CREATE TABLE IF NOT EXISTS course_result_requirements(course TEXT PRIMARY KEY,enabled INTEGER NOT NULL DEFAULT 0 CHECK(enabled IN (0,1)),minimum_percent INTEGER NOT NULL DEFAULT 80 CHECK(minimum_percent BETWEEN 1 AND 100),updated TEXT NOT NULL)';
const prepared=new WeakMap<object,Promise<void>>();
export async function ensureResultRequirements(){
  const db=database();let ready=prepared.get(db);
  if(!ready){ready=db.prepare(resultRequirementsSchema).run().then(()=>{}).catch(error=>{prepared.delete(db);throw error;});prepared.set(db,ready);}
  await ready;
}
export async function getResultRequirements(course:string):Promise<ResultRequirements>{
  await ensureResultRequirements();
  const row=await database().prepare('SELECT enabled,minimum_percent FROM course_result_requirements WHERE course=?').bind(course).first<{enabled:number;minimum_percent:number}>();
  return row?{enabled:!!row.enabled,minimumPercent:row.minimum_percent}:{...defaultResultRequirements};
}
export async function saveResultRequirements(course:string,value:ResultRequirements){
  const settings=parseResultRequirements(value);await ensureResultRequirements();
  await database().prepare('INSERT INTO course_result_requirements(course,enabled,minimum_percent,updated) VALUES(?,?,?,?) ON CONFLICT(course) DO UPDATE SET enabled=excluded.enabled,minimum_percent=excluded.minimum_percent,updated=excluded.updated').bind(course,Number(settings.enabled),settings.minimumPercent,new Date().toISOString()).run();
  return settings;
}
