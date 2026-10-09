import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the real click handlers with a deliberately unresolved save promise.
// A small hook/element harness avoids browser, audio-device and network dependencies.
function compile(source,require){
 const js=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const module={exports:{}};
 new vm.Script('(function(require,module,exports,window,performance){'+js+'\n})').runInThisContext()(require,module,module.exports,{setTimeout,clearTimeout},{now:()=>performance.now()});
 return module.exports;
}
const bank=compile(readFileSync(new URL('../lib/chores-learning.ts',import.meta.url),'utf8'),name=>{throw new Error('Unexpected import '+name);});
const rounds=bank.makeBalloonRounds(Math.random,'easy');
const source=readFileSync(new URL('../app/balloon-game.tsx',import.meta.url),'utf8');
function gameAt(index=0){const round=rounds[index];return {id:'local-feedback-test',revision:index,difficulty:'easy',lives:3,score:index,solved:index,answered:index,roundIndex:index,total:12,feedback:null,status:'playing',popped:[],completed:null,word:{en:round.word.en},options:round.options};}
function harness(saved){
 const cells=[],requests=[],sounds=[];let cursor=0,resolveSave;
 const hooks={useState(initial){const i=cursor++;if(!(i in cells))cells[i]=initial;return [cells[i],value=>{cells[i]=typeof value==='function'?value(cells[i]):value;}];},useRef(initial){const i=cursor++;if(!(i in cells))cells[i]={current:initial};return cells[i];},useEffect(){}};
 const jsx=(type,props)=>({type,props}),audio={unlock(){},popSound(correct){sounds.push(correct);},pronounce(){},playEffect(){},toggleSound(){},sound:true,audioNotice:'',audioState:'running'};
 const Component=compile(source,name=>{
  if(name==='react')return hooks;
  if(name==='react/jsx-runtime')return {jsx,jsxs:jsx,Fragment:'fragment'};
  if(name==='lucide-react')return Object.fromEntries(['Heart','Play','RotateCcw','Trophy','Volume2','VolumeX'].map(x=>[x,x]));
  if(name==='@/lib/chores-learning')return bank;
  if(name==='./chores-picture')return {default:'picture'};
  if(name==='./learning-audio')return {useLearningAudio:()=>audio};
  throw new Error('Unexpected import '+name);
 }).default;
 const props={game:saved,gameBest:null,busy:false,quizTotal:12,dictationTotal:6,onFinish(){},onAction(body){requests.push(body);return new Promise(resolve=>{resolveSave=resolve;});}};
 return {props,requests,sounds,render(){cursor=0;return Component(props);},finish(game){if(game)props.game=game;resolveSave(game?{kind:'game-update',game}:null);}};
}
function find(node,test){if(Array.isArray(node)){for(const child of node){const found=find(child,test);if(found)return found;}}else if(node&&typeof node==='object'){if(test(node))return node;return find(node.props?.children,test);}}
const balloon=(tree,ar)=>find(tree,n=>n.type==='button'&&n.props['aria-label']==='بالونة: '+ar);
const has=(tree,name)=>!!find(tree,n=>n.props.className===name);

const saved=gameAt(),correct=saved.options.find(o=>o.en===saved.word.en),other=saved.options.find(o=>o.en!==saved.word.en);
const fast=harness(saved),tree=fast.render();
const click=balloon(tree,correct.ar).props.onClick();
assert.deepEqual(fast.sounds,[true],'Pop sound waits for the server');
const pending=fast.render();
assert(balloon(pending,correct.ar).props.className.includes('is-popped'),'Balloon waits for the server to explode');
assert.equal(balloon(pending,correct.ar).props['aria-pressed'],true);
assert.equal(balloon(pending,other.ar).props.disabled,true);
await balloon(tree,correct.ar).props.onClick();await balloon(tree,other.ar).props.onClick();
assert.equal(fast.requests.length,1,'Rapid clicks sent duplicate choices before React rendered');
assert(fast.requests[0].advance&&fast.requests[0].gameUpdate,'Correct click still requires a second network request');
fast.finish({...gameAt(1),revision:1});await click;
const advanced=fast.render();
assert(!balloon(advanced,rounds[1].options[0].ar).props.className.includes('is-popped'));
assert.equal(balloon(advanced,rounds[1].options[0].ar).props.disabled,false);
assert.equal(fast.requests.length,1,'Next question needs an additional request');

const wrong=harness(saved),wrongClick=balloon(wrong.render(),other.ar).props.onClick();
assert.deepEqual(wrong.sounds,[false],'Wrong-answer sound waits for the server');
assert(find(wrong.render(),n=>n.props.role==='alert'),'Correction waits for the server');
wrong.finish({...saved,revision:1,lives:2,popped:[other.en],feedback:'wrong',word:{en:correct.en,ar:correct.ar,tip:correct.tip}});await wrongClick;
assert(find(wrong.render(),n=>n.props.role==='alert'),'Saved wrong answer lost its correction');

const failed=harness(saved),failedClick=balloon(failed.render(),correct.ar).props.onClick();
failed.finish(null);await failedClick;
assert.equal(balloon(failed.render(),correct.ar).props['aria-pressed'],false,'Unconfirmed feedback was left as a saved answer');
assert.equal(balloon(failed.render(),correct.ar).props.disabled,false,'A failed request permanently locked the game');

const last=gameAt(11),lastWord=last.options.find(o=>o.en===last.word.en),finish=harness(last),lastClick=balloon(finish.render(),lastWord.ar).props.onClick();
assert(!has(finish.render(),'balloon-result'),'Certificate is offered before the final point is saved');
finish.finish({...last,revision:12,solved:12,score:12,popped:[last.word.en],feedback:'correct',status:'won',completed:'2026-10-10T00:00:00Z'});await lastClick;
assert(has(finish.render(),'balloon-result'),'Confirmed completion did not offer the certificate');
console.log('PASS: explosion, sound and correction before a delayed save; synchronous duplicate-click lock; one-request advance; failed-save rollback; certificate only after confirmed completion.');
