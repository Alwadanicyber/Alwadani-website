import {Volume2} from 'lucide-react';
import {readingExampleWord, type ReadingPattern} from '@/lib/reading-course';
import {readingPhonemeId} from './reading-phonemes';

type Props = {
 pattern: ReadingPattern;
 playing: string;
 onPlay: (kind:'sound'|'word', value:string, id:string) => void;
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

export default function ReadingPatternCard({pattern,playing,onPlay}:Props){
 const compact=pattern.groups.length>1&&pattern.groups.every(group=>group.spellings.length===1);

 return <div className="reading-pattern">
  <h3 lang="en" dir="ltr">{pattern.pattern}</h3>
  <div className={`reading-sound-groups${compact?' reading-sound-groups--tiles':''}`} lang="en" dir="ltr">
   {pattern.groups.map((group,index)=>{
    const groupId=`${pattern.pattern}:${index}`;
    return <div key={groupId} className={`reading-sound-group${group.atEnd?' reading-sound-group--ending':''}`}>
     {group.ipa&&<div className="reading-sound-head">
      {group.ipa.split(' ~ ').map(symbol=>{
       const audio=group.audio??readingPhonemeId(symbol);
       const id=`${groupId}:sound:${symbol}`;
       const notation=`/${symbol}/`;
       return audio
        ? <button key={symbol} className="reading-sound-trigger" type="button" aria-label={`Listen to ${notation} in ${group.spellings.map(spelling=>spelling.letters).join(', ')}`} aria-pressed={playing===id} onClick={()=>onPlay('sound',audio,id)}>
           <Volume2 size={17} aria-hidden="true"/><span>{notation}</span>
          </button>
        : <span key={symbol} className="reading-sound-notation">{notation}</span>;
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
