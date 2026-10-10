import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

// Transpile the production modules without a browser or additional packages.
function moduleUrl(path,imports={}){
 let code=ts.transpileModule(readFileSync(new URL('../'+path,import.meta.url),'utf8'),{
  fileName:path,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext,jsx:ts.JsxEmit.ReactJSX},
 }).outputText;
 for(const [name,url] of Object.entries(imports))code=code.split(JSON.stringify(name)).join(JSON.stringify(url)).split("'"+name+"'").join(JSON.stringify(url));
 return 'data:text/javascript;base64,'+Buffer.from(code).toString('base64');
}
const audienceUrl=moduleUrl('lib/audience.ts'),solveUrl=moduleUrl('lib/solve-time.ts');
const {participantNoun}=await import(audienceUrl);
const {drawLessonCertificate}=await import(moduleUrl('lib/lesson-certificate.ts',{'./audience':audienceUrl}));
const {default:Leaderboard}=await import(moduleUrl('app/classroom-leaderboard.tsx',{
 '@/lib/audience':audienceUrl,'@/lib/solve-time':solveUrl,
 react:import.meta.resolve('react'),'react/jsx-runtime':import.meta.resolve('react/jsx-runtime'),'lucide-react':import.meta.resolve('lucide-react'),
}));
const rows=Array.from({length:19},(_,i)=>({
 id:'student-'+i,name:'اسم '+i,position:i+1,score:30,total:30,percentage:100,answered:30,attempts:1,
 completed:'2026-10-10T09:00:00Z',gameTotal:12,gameCompleted:true,quizScore:12,quizTotal:12,dictationScore:6,dictationTotal:6,gameScore:12,estimatedSolveMs:170000,
}));
for(const gender of ['male','female']){
 const html=renderToStaticMarkup(createElement(Leaderboard,{rows,studentGender:gender}));
 assert(html.includes('19</b> '+(gender==='female'?'طالبةً':'طالبًا')+' في المنافسة'),'Count uses the wrong audience');
 assert(html.includes(gender==='female'?'أكملت الرحلة':'أكمل الرحلة'),'Completion wording uses the wrong audience');
 assert(html.includes(gender==='female'?'ابحث باسم الطالبة':'ابحث باسم الطالب'),'Search uses the wrong audience');
 assert(!html.includes('الميداليات بعد إكمال الرحلة')&&!html.includes('أضافها المعلم'),'Teacher explanation appears in the public board');
 assert(html.includes('وقت تقديري')&&html.includes('2:50.00'),'Removing guidance lost the estimated-time label');
 assert.equal((html.match(/<article[^>]*class="podium-/g)||[]).length,5,'The podium should show five completed leaders');
 for(let place=1;place<=5;place++)assert(html.includes('competition-medal medal-'+place),'A top-five result is missing its medal');
 assert(html.includes('المركز الرابع')&&html.includes('المركز الخامس')&&!html.includes('podium-6')&&!html.includes('medal-6'),'Medals should stop at fifth place');
 const lines=[],canvas={fillRect(){},strokeRect(){},measureText(text){return {width:text.length*20};},fillText(text,at,y){lines.push({text,at,y,direction:this.direction});}};
 drawLessonCertificate(canvas,{studentGender:gender,name:gender==='female'?'سارة أحمد':'فهد أحمد',id:'certificate-123456',title:'الأعمال المنزلية · Chores',completed:'2026-10-10T09:00:00Z',score:30,total:30,chores:true});
 assert(lines.some(l=>l.text.endsWith(gender==='female'?'بأن الطالبة':'بأن الطالب')&&l.direction==='rtl'),'Downloaded certificate has the wrong recipient');
 assert(lines.some(l=>l.text.startsWith(gender==='female'?'قد أتمّت':'قد أتمّ')),'Downloaded certificate has the wrong completion verb');
 assert(lines.some(l=>l.text==='30 / 30   (100%)'&&l.direction==='ltr'),'Audience changes broke score direction');
 assert.equal(participantNoun(5,gender),gender==='female'?'طالبات':'طلاب');
}
const fewerCompleted=rows.map((row,i)=>({...row,completed:i<2?row.completed:null}));
const fewerHtml=renderToStaticMarkup(createElement(Leaderboard,{rows:fewerCompleted}));
assert.equal((fewerHtml.match(/<article[^>]*class="podium-/g)||[]).length,2,'Unfinished students should not fill vacant medal positions');
assert(!fewerHtml.includes('medal-3')&&!fewerHtml.includes('medal-4')&&!fewerHtml.includes('medal-5'),'An unfinished student received a medal');
console.log('PASS: five numbered medals and top-five cards; sixth place and unfinished attempts do not receive medals.');
console.log('PASS: male/female leaderboard counts, search and status; private guidance removed; downloaded/shared certificate wording and score direction.');
