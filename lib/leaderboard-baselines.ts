import type {Rank} from './result-ranking';

// Owner-requested starting benchmarks for the two existing student entries.
// Keep estimates separate from measured answer times and completion certificates.
const publishedTiming='2026-10-10T09:33:51Z';
const legacyBenchmarks=new Map([
  ['يوسف سيف الدين يوسف محمد عثمان',170_000],
  ['فهد يحيى المرحبي',170_000],
]);

function joinedBeforeTiming(joined:string){
  const created=Date.parse(joined);
  return Number.isFinite(created)&&created<Date.parse(publishedTiming);
}

export function excludedTeacherEntry(course:string,row:Rank,joined:string){
  return course==='chores-grade-4'&&row.name==='المعلم'&&joinedBeforeTiming(joined);
}

export function withLeaderboardBaseline(course:string,row:Rank,joined:string):Rank{
  if(course!=='chores-grade-4'||!row.completed||typeof row.solveMs==='number')return row;
  if(!joinedBeforeTiming(joined))return row;
  const estimate=legacyBenchmarks.get(row.name);
  return estimate===undefined?row:{...row,estimatedSolveMs:estimate};
}
