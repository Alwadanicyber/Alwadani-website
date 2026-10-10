import type {Rank} from './result-ranking';

// Owner-requested starting benchmarks for the three existing Chores entries.
// Keep estimates separate from measured answer times and completion certificates.
const publishedTiming='2026-10-10T09:33:51Z';
const legacyBenchmarks=new Map([
  ['المعلم',120_000],
  ['يوسف سيف الدين يوسف محمد عثمان',240_000],
  ['فهد يحيى المرحبي',240_000],
]);

export function withLeaderboardBaseline(course:string,row:Rank,joined:string):Rank{
  if(course!=='chores-grade-4'||!row.completed||typeof row.solveMs==='number')return row;
  const created=Date.parse(joined);
  if(!Number.isFinite(created)||created>=Date.parse(publishedTiming))return row;
  const estimate=legacyBenchmarks.get(row.name);
  return estimate===undefined?row:{...row,estimatedSolveMs:estimate};
}
