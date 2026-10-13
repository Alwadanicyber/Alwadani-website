import {database} from './database';
import {defaultRankingMode,type RankingMode,type RankingChoice} from './ranking-mode';
export const rankingSchema="CREATE TABLE IF NOT EXISTS course_ranking_settings(course TEXT PRIMARY KEY,mode TEXT NOT NULL CHECK(mode IN ('accuracy','speed')),updated TEXT NOT NULL)";
const prepared=new WeakMap<object,Promise<void>>();
export async function ensureCourseRanking(){
 const db=database();let ready=prepared.get(db);
 if(!ready){ready=db.prepare(rankingSchema).run().then(()=>{}).catch(e=>{prepared.delete(db);throw e;});prepared.set(db,ready);}
 await ready;
}
export async function getRankingMode(course:string):Promise<RankingMode>{
 await ensureCourseRanking();const row=await database().prepare('SELECT mode FROM course_ranking_settings WHERE course=?').bind(course).first<{mode:'accuracy'|'speed'}>();
 return row?.mode??defaultRankingMode(course);
}
export async function saveRankingMode(course:string,choice:RankingChoice){
 await ensureCourseRanking();const db=database();
 if(choice==='default')await db.prepare('DELETE FROM course_ranking_settings WHERE course=?').bind(course).run();
 else await db.prepare('INSERT INTO course_ranking_settings(course,mode,updated) VALUES(?,?,?) ON CONFLICT(course) DO UPDATE SET mode=excluded.mode,updated=excluded.updated').bind(course,choice,new Date().toISOString()).run();
 return getRankingMode(course);
}
