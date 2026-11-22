import {Volume2} from 'lucide-react';
import {readingExampleWord, type ReadingPattern} from '@/lib/reading-course';
import {readingPhonemeId} from './reading-phonemes';
import {readingMouthSelection,type MouthSelection} from './reading-mouth-data';
import {ReadingMouthPreview} from './reading-mouth-models';

type Props = {
 pattern: ReadingPattern;
 playing: string;
 onPlay: (kind:'sound'|'word', value:string, id:string) => void;
 onShowMouth: (selection:MouthSelection) => void;
};

function ReadingTip({text}:{text:string}){
 const segments=text.split(/((?:\/[^/\r\n]+\/|[A-Za-z][A-Za-z’'_-]*)(?:[ \t]+(?:\/[^/\r\n]+\/|[A-Za-z][A-Za-z’'_-]*))*)/gu);
 return <p className="reading-pattern-note">{segments.map((segment,i)=>
  i%2 ? <bdi key={i} lang="en" dir="ltr">{segment}</bdi> : segment
 )}</p>;
}

function ExampleLetters({example}:{example:string}){
 return <>{example.split(/\[([a-z]+)\]/gi).map((part,i)=>
  i%2 ? <mark key={i}>{part}</mark> : part
 )}</>;
}

export default function ReadingPatternCard({pattern,playing,onPlay,onShowMouth}:Props){
 const compact=pattern.groups.length>1&&pattern.groups.every(group=>group.spellings.length===1);

 return <div className="reading-pattern">
  <h3 lang="en" dir="ltr">{pattern.pattern}</h3>
  <div className={`reading-sound-groups${compact?' reading-sound-groups--tiles':''}`} lang="en" dir="ltr">
   {pattern.groups.map((group,index)=>{
    const letters=group.spellings.map(spelling=>spelling.letters).join(', ');
    const examples=group.spellings.flatMap(spelling=>spelling.examples.map(readingExampleWord));
    const groupId=`${pattern.pattern}:${index}`;
    return <div key={groupId} className={`reading-sound-group${group.atEnd?' reading-sound-group--ending':''}`}>
     {group.ipa&&<div className="reading-sound-head">
      {group.ipa.split(' ~ ').map(symbol=>{
       const audio=group.audio??readingPhonemeId(symbol);
       const selection=readingMouthSelection(symbol,audio,examples);
       const contextualWord=!audio&&selection?.kind==='sequence' ? selection.example : undefined;
       const id=`${groupId}:sound:${symbol}`;
       const notation=`/${symbol}/`;
       return <div className="reading-sound-model" key={symbol}>
        {audio||contextualWord
         ? <button className="reading-sound-trigger" type="button"
            aria-label={contextualWord?`Listen to ${notation} in ${contextualWord}`:`Listen to ${notation} in ${letters}`}
            aria-pressed={playing===id}
            onClick={()=>contextualWord ? onPlay('word',contextualWord,id) : audio&&onPlay('sound',audio,id)}>
            <Volume2 size={17} aria-hidden="true"/><span>{notation}</span>
            {contextualWord&&<span className="reading-sound-in-word" lang="ar" dir="rtl">في <bdi lang="en">{contextualWord}</bdi></span>}
           </button>
         : <span className="reading-sound-notation">{notation}</span>}
        {selection&&<ReadingMouthPreview selection={selection} context={letters} onShow={onShowMouth}/>}
       </div>;
      })}
      {group.atEnd&&<span className="reading-sound-position" lang="ar" dir="rtl">في آخر الكلمة</span>}
     </div>}
     <div className="reading-spellings">
      {group.spellings.map(({letters,examples})=>
       <div className="reading-spelling" key={letters}>
        <h4>{letters}</h4>
        <div className="reading-word-bank">{examples.map(example=>{
         const word=readingExampleWord(example);
         const id=`${groupId}:${letters}:word:${word}`;
         return <button type="button" key={word} aria-pressed={playing===id} onClick={()=>onPlay('word',word,id)} aria-label={`Listen: ${word}`}>
          <Volume2 size={14} aria-hidden="true"/><span><ExampleLetters example={example}/></span>
         </button>;
        })}</div>
       </div>
      )}
     </div>
    </div>;
   })}
  </div>
  {pattern.tip&&<ReadingTip text={pattern.tip}/>}
 </div>;
}
