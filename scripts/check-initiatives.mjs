import assert from 'node:assert/strict';
import {nationalShieldCells} from '../lib/national-shield.ts';
// Sample the actual SVG outline, then use an independent ray-casting check.
const boundary=[[100,5],[190,38],[190,118]];
for(let i=1;i<=100;i++){const t=i/100;boundary.push([190-90*t*t,118+156*t-37*t*t]);}
for(let i=1;i<=100;i++){const t=i/100;boundary.push([100-180*t+90*t*t,237-82*t-37*t*t]);}
boundary.push([10,38]);
function inOutline(x,y){let inside=false;for(let i=0,j=boundary.length-1;i<boundary.length;j=i++){const [a,b]=boundary[i],[c,d]=boundary[j];if(((b>y)!==(d>y))&&x<(c-a)*(y-b)/(d-b)+a)inside=!inside;}return inside;}
for(const goal of [1,2,3,25,100,250,1000]){const cells=nationalShieldCells(goal);assert.equal(cells.length,goal);assert.equal(new Set(cells.map(c=>c.points)).size,goal);for(const cell of cells)for(const point of cell.points.split(' ')){const [x,y]=point.split(',').map(Number);assert(inOutline(x,y),`A cell for goal ${goal} was clipped outside the visible shield`);}}


import {readFileSync,readdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url),wranglerRequire=createRequire(require.resolve('wrangler/package.json')),{Miniflare}=wranglerRequire('miniflare');
const project=fileURLToPath(new URL('../',import.meta.url)),root=project+'dist/server',paths=readdirSync(root,{recursive:true}).filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const modules=['index.js',...paths.filter(p=>p!=='index.js')].map(p=>({type:'ESModule',path:root+'/'+p}));
const mf=new Miniflare({name:'app',modules,modulesRoot:root,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],bindings:{TEACHER_SETUP_KEY:'national-isolated-test-secret-123456789'},d1Databases:{DB:'national-test'},cf:false});let cookie='';
async function call(path,body,status=200,headers={}){const r=await mf.dispatchFetch('https://school.test'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',origin:'https://school.test',cookie,...headers},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();assert.equal(r.status,status,JSON.stringify({path,data}));return {data,response:r};}
try{
 const db=await mf.getD1Database('DB');
 for(const file of readdirSync(project+'drizzle').filter(f=>f.endsWith('.sql')&&!f.startsWith('0005_')&&!f.startsWith('0018_')).sort())for(const sql of readFileSync(project+'drizzle/'+file,'utf8').split('--> statement-breakpoint'))if(sql.trim())await db.prepare(sql.trim()).run();
 const before=(await db.prepare('SELECT COUNT(*) n FROM students').first()).n;
 let publicData=(await call('/api/initiatives')).data;assert.equal(publicData.initiatives[0].approved,0);assert.equal(publicData.initiatives[0].id,'dir-alwatan');
 await call('/api/initiatives?id=missing',null,404);await call('/api/teacher/initiatives',null,403);
 const p={id:crypto.randomUUID(),initiativeId:'dir-alwatan',name:'الاسم الظاهر',className:'PRIVATE_CLASS_SENTINEL',kind:'message',text:'رسالة وطنية للاختبار'};
 await call('/api/initiatives',p,403,{origin:'https://other.test'});await call('/api/initiatives',{...p,name:''},400);await call('/api/initiatives',{...p,text:'x'.repeat(601)},400);
 const sent=await call('/api/initiatives',p,201);assert.equal(sent.data.initiative.participations,1,'A submission must immediately light the shield');const retried=await call('/api/initiatives',p);assert.equal(retried.data.initiative.participations,1,'Retry must not light another cell');assert.equal((await db.prepare('SELECT COUNT(*) n FROM national_initiative_posts').first()).n,1,'Retry duplicated a submission');
 publicData=(await call('/api/initiatives?id=dir-alwatan')).data;assert.equal(publicData.posts[0].id,p.id);assert.equal(publicData.shieldPosts[0].id,p.id,'New submissions must immediately open with their name and content');assert.equal(publicData.initiative.approved,1);assert.equal(publicData.initiative.participations,1);
 const owner=await call('/api/teacher/auth',{action:'setup',username:'national-owner',password:'National-Test-Password-123!',setupKey:'national-isolated-test-secret-123456789'});cookie=owner.response.headers.get('set-cookie').split(';')[0];
 const moderation={action:'moderate',id:p.id,status:'approved'};await call('/api/teacher/initiatives',moderation,403,{cookie:''});await call('/api/teacher/initiatives',moderation,403,{origin:'https://other.test'});
 const pending=(await call('/api/teacher/initiatives')).data;assert.equal(pending.posts[0].class_name,'','New submissions must ignore the removed class field');await call('/api/teacher/initiatives',moderation);
 publicData=(await call('/api/initiatives?id=dir-alwatan')).data;assert.equal(publicData.posts[0].name,p.name);assert.equal(publicData.shieldPosts[0].id,p.id,'Approved cell must open the corresponding contribution');assert.equal(publicData.initiative.approved,1);assert(!JSON.stringify(publicData).includes('PRIVATE_CLASS_SENTINEL'));
 await call('/api/teacher/initiatives',{...moderation,status:'hidden'});assert.equal((await call('/api/initiatives?id=dir-alwatan')).data.initiative.approved,0);assert.equal((await call('/api/initiatives?id=dir-alwatan')).data.initiative.participations,0);
 await call('/api/teacher/initiatives',moderation);assert.equal((await call('/api/initiatives?id=dir-alwatan')).data.initiative.approved,1);
 await db.prepare("UPDATE national_initiative_posts SET status='pending' WHERE id=?").bind(p.id).run();const legacy=(await call('/api/initiatives?id=dir-alwatan')).data;assert.equal(legacy.posts[0].id,p.id,'Legacy pending submissions must also appear without teacher approval');assert.equal(legacy.shieldPosts[0].name,p.name);await call('/api/teacher/initiatives',moderation);
 const settings={action:'save',id:'dir-alwatan',title:'درع الاختبار',description:'وصف',school:'مدرسة الاختبار',goal:2,open:false};await call('/api/teacher/initiatives',settings);await call('/api/initiatives',{...p,id:crypto.randomUUID()},409);
 await call('/api/teacher/initiatives',{...settings,goal:0},400);await call('/api/teacher/initiatives',{...settings,open:true});

 const identity={...settings,open:true,school:'مدرسة الهوية الاختبارية',coordinatorName:'المعلم التجريبي',coordinatorTitle:'منفذ المبادرة',principalName:'المدير التجريبي',principalTitle:'مدير المدرسة',slogan:'مبادرة تجمعنا على حب الوطن'};
 await call('/api/teacher/initiatives',identity,403,{cookie:''});await call('/api/teacher/initiatives',identity,403,{origin:'https://other.test'});await call('/api/teacher/initiatives',identity);
 const profile=(await call('/api/initiatives?id=dir-alwatan')).data;assert.equal(profile.initiative.school,identity.school);assert.equal(profile.initiative.coordinatorName,identity.coordinatorName);assert.equal(profile.initiative.principalName,identity.principalName);assert.equal(profile.initiative.slogan,identity.slogan);assert(Array.isArray(profile.initiatives));
 await call('/api/teacher/initiatives',{...settings,open:true},200);const retained=(await call('/api/initiatives?id=dir-alwatan')).data.initiative;assert.equal(retained.coordinatorName,identity.coordinatorName,'Legacy settings updates must preserve identity names');assert.equal(retained.principalName,identity.principalName);
 await call('/api/teacher/initiatives',{...identity,coordinatorName:'x'.repeat(101)},400);assert.equal((await call('/api/initiatives?id=dir-alwatan')).data.initiative.coordinatorName,identity.coordinatorName);
 const jpeg='data:image/jpeg;base64,/9j/2Q==';const drawing={...p,id:crypto.randomUUID(),kind:'drawing',text:'',image:jpeg};const drawn=await call('/api/initiatives',drawing,201);assert.equal(drawn.data.shieldPosts.length,2);assert.equal(drawn.data.shieldPosts[0].id,p.id);assert.equal(drawn.data.shieldPosts[1].id,drawing.id);assert.equal(drawn.data.initiative.participations,2,'A drawing lights and opens the next cell immediately');
 let media=await mf.dispatchFetch('https://school.test/api/initiatives/media?id='+drawing.id);assert.equal(media.status,200);media=await mf.dispatchFetch('https://school.test/api/initiatives/media?id='+drawing.id,{headers:{cookie}});assert.equal(media.status,200);assert.equal(media.headers.get('content-type'),'image/jpeg');
 await call('/api/teacher/initiatives',{action:'moderate',id:drawing.id,status:'approved'});assert.equal((await call('/api/initiatives?id=dir-alwatan')).data.shieldPosts[1].id,drawing.id,'Approval must reveal the same cell without repeating another post');media=await mf.dispatchFetch('https://school.test/api/initiatives/media?id='+drawing.id);assert.equal(media.status,200);
 await call('/api/initiatives',{...drawing,id:crypto.randomUUID(),image:'data:image/svg+xml;base64,AAAA'},400);
 await call('/api/teacher/initiatives',{action:'moderate',id:drawing.id,status:'hidden'});assert.equal((await mf.dispatchFetch('https://school.test/api/initiatives/media?id='+drawing.id)).status,404,'Hidden media must remain private');assert(!(await call('/api/initiatives?id=dir-alwatan')).data.shieldPosts.some(v=>v.id===drawing.id));await call('/api/teacher/initiatives',{action:'moderate',id:drawing.id,status:'approved'});
 const created=(await call('/api/teacher/initiatives',{...settings,action:'create',title:'مبادرة ثانية',open:true})).data;assert(created.id.startsWith('initiative-'));assert.equal((await call('/api/initiatives?id='+created.id)).data.initiative.title,'مبادرة ثانية');
 assert.equal((await db.prepare('SELECT COUNT(*) n FROM students').first()).n,before,'Initiatives changed classroom records');
 const privacy=(await call('/api/teacher/initiatives?id=dir-alwatan&status=approved')).data;assert(privacy.posts.every(v=>v.class_name===''));

 const prayer={action:'prayer',id:crypto.randomUUID(),initiativeId:'dir-alwatan'};await call('/api/initiatives',prayer);await call('/api/initiatives',prayer);assert.equal((await call('/api/initiatives?id=dir-alwatan')).data.initiative.dua,1);
 const survey={action:'survey',id:crypto.randomUUID(),initiativeId:'dir-alwatan',answers:[0,1,0],rating:5};await call('/api/initiatives',{...survey,answers:[-1,1,0]},400);assert.equal((await call('/api/initiatives',survey)).data.score,3);await call('/api/initiatives',survey);assert.equal((await call('/api/teacher/initiatives')).data.survey.count,1);
 const voice={...p,id:crypto.randomUUID(),kind:'voice',text:'دعاء',audio:'data:audio/webm;codecs=opus;base64,GkXfo0Ag'};await call('/api/initiatives',voice,201);await call('/api/teacher/initiatives',{action:'moderate',id:voice.id,status:'approved'});const sound=await mf.dispatchFetch('https://school.test/api/initiatives/media?id='+voice.id);assert.equal(sound.status,200);assert.equal(sound.headers.get('content-type'),'audio/webm');await sound.arrayBuffer();
 const card={...p,id:crypto.randomUUID(),kind:'card',text:'بطاقة شكر'};const beforeCard=(await call('/api/initiatives?id=dir-alwatan')).data.initiative.participations;const cardSent=await call('/api/initiatives',card,201);assert.equal(cardSent.data.initiative.participations,beforeCard+1,'Ready cards also immediately light one cell');
 // Separate network bucket; simultaneous submissions cannot exceed 120 reservations/hour.
 const attempts=await Promise.all(Array.from({length:123},(_,i)=>mf.dispatchFetch('https://school.test/api/initiatives',{method:'POST',headers:{origin:'https://school.test','content-type':'application/json','cf-connecting-ip':'192.0.2.10'},body:JSON.stringify({...p,id:crypto.randomUUID(),text:'Parallel '+i})})));
 assert.equal(attempts.filter(r=>r.status===201).length,120);assert.equal(attempts.filter(r=>r.status===429).length,3);
 assert.equal((await db.prepare("SELECT COUNT(*) n FROM national_initiative_posts WHERE text LIKE 'Parallel %'").first()).n,120);
 console.log('PASS: lazy setup, durable submissions, idempotent retries, owner/origin guards, moderation and reversible hiding, name-only submissions and immediate shield progress, immediate publishing including legacy pending submissions, protected hidden drawings, open/close controls, new initiatives, independent classroom records, editable school/staff identity with owner/origin guards and legacy preservation, atomic network limits.');
}finally{await mf.dispose();}
