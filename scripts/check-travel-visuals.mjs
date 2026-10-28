import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import ts from 'typescript';
const dir=mkdtempSync(join(tmpdir(),'travel-visuals-'));
try{
const src=readFileSync(new URL('../lib/travel-visual-content.ts',import.meta.url),'utf8');writeFileSync(join(dir,'content.mjs'),ts.transpileModule(src,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}}).outputText);
const {movementStories,highlightTravelWords,emailPictureSteps,simpleTravelCards}=await import(pathToFileURL(join(dir,'content.mjs')));
assert.deepEqual(movementStories.map(s=>s.word),['across','along','around','through','into','out of','away from','to','towards']);
for(const s of movementStories){assert(s.example.includes(s.word));assert.equal(s.points.length,3);assert.equal(s.steps.length,3);assert(new Set(s.steps).size===3);for(const [x,y] of s.points){assert(x>=20&&x<=455);assert(y>=75&&y<=280,'Walker must remain fully visible including the head');}const nums=s.path.match(/-?\d+(?:\.\d+)?/g).map(Number);assert.deepEqual(nums.slice(0,2),s.points[0]);assert.deepEqual(nums.slice(-2),s.points[2]);}
const by=Object.fromEntries(movementStories.map(s=>[s.word,s]));
assert(by.across.points[0][1]>195&&by.across.points[2][1]<120,'Across must cross both river banks');assert(by.along.points.every(p=>p[1]<155),'Along must stay on one bank');assert.deepEqual(by.around.points[0],by.around.points[2],'Around completes a loop');assert(by.through.points[0][0]<165&&by.through.points[1][0]>190&&by.through.points[1][0]<290&&by.through.points[2][0]>315,'Through enters and exits the tunnel');assert(by.into.points[0][0]<265&&by.into.points[2][0]>265&&by.into.points[2][0]<390,'Into ends inside');assert(by['out of'].points[0][0]>65&&by['out of'].points[0][0]<190&&by['out of'].points[2][0]>190,'Out of starts inside and ends outside');assert(by['away from'].points[2][0]>by['away from'].points[0][0],'Away from increases distance');assert(by.to.points[2][0]>330&&by.towards.points[2][0]<330,'To reaches the destination, towards does not promise arrival');
const text='Toronto: go to the hotel, not into it. Walk OUT OF it.';const pieces=highlightTravelWords(text,['to','out of']);assert.equal(pieces.map(p=>p.text).join(''),text);assert.deepEqual(pieces.filter(p=>p.highlight).map(p=>p.text),['to','OUT OF']);assert.equal(highlightTravelWords('when I arrive',['when'])[0].highlight,true);assert.deepEqual(highlightTravelWords('plain',[]),[{text:'plain',highlight:false}]);assert.deepEqual(highlightTravelWords('quite a large campus',['quite','quite a']).filter(p=>p.highlight).map(p=>p.text),['quite a']);assert.equal(highlightTravelWords('when I arrive',['when']).map(p=>p.text).join(''),'when I arrive');
assert.equal(emailPictureSteps.length,5);assert(emailPictureSteps.every(s=>s.icon&&s.en&&s.ar&&s.label));assert.equal(simpleTravelCards.length,6);assert(simpleTravelCards.every(cards=>cards.length===2&&cards.every(c=>c.length===3)));
console.log('PASS: nine semantically checked movement routes and visible walker bounds, start/end path integrity, destination vs direction, intact English word-boundary highlights, five concise email steps and six simplified stations.');
}finally{rmSync(dir,{recursive:true,force:true});}
