import {useId,useState,type RefObject} from 'react';
import {ChevronDown,Volume2} from 'lucide-react';
import {type MouthModelId} from './reading-phonemes';

const models:Record<MouthModelId,{ipa:string;tip:string;example?:string}>={
 l:{ipa:'/l/',tip:'المس اللثة خلف الأسنان العليا بطرف لسانك. يمرّ الهواء من جانبي اللسان.',example:'loud'},
 m:{ipa:'/m/',tip:'أغلق شفتيك معًا ودَع الصوت يخرج من الأنف.',example:'me'},
 n:{ipa:'/n/',tip:'أبقِ شفتيك مفتوحتين والمس اللثة خلف أسنانك العليا بطرف لسانك. يخرج الصوت من الأنف.',example:'new'},
 sh:{ipa:'/ʃ/',tip:'دوّر الشفتين قليلًا وادفع الهواء بهدوء. تجنّب إضافة حركة بعد الصوت.',example:'shoot'},
 u:{ipa:'/ʌ/',tip:'افتح فمك قليلًا وأبقِ الشفتين مرتاحتين. اسمع الحركة القصيرة في الكلمة.',example:'sun'},
 'long-e':{ipa:'/iː/',tip:'ارفع مقدّمة لسانك وابتسم قليلًا. في knee يبدأ النطق بصوت النون.',example:'knee'},
 'long-o':{ipa:'/oʊ/',tip:'ابدأ بفم مفتوح قليلًا، ثم ضمّ الشفتين تدريجيًا.',example:'hoe'},
 'open-o':{ipa:'/ɔ/',tip:'دوّر شفتيك قليلًا واستمع إلى النموذج في saw. قد تسمع حركة أخرى في بعض اللهجات الأمريكية.',example:'saw'},
 i:{ipa:'/ɪ/',tip:'أرخِ شفتيك وارفع مقدّمة لسانك قليلًا. استمع إلى الحركة في give.',example:'give'},
 'th-voiced':{ipa:'/ð/',tip:'ضع طرف لسانك بين الأسنان ودَع الهواء يمرّ مع اهتزاز الصوت.'},
 'th-unvoiced':{ipa:'/θ/',tip:'ضع طرف لسانك بين الأسنان ودَع الهواء يمرّ دون اهتزاز الصوت.'},
};

export const alphabetModels=['l','m','n'] as const;
export const chapterMouthModels:Partial<Record<number,readonly [MouthModelId,...MouthModelId[]]>>={
 1:alphabetModels,
 2:['sh','th-unvoiced','th-voiced'],
 3:['open-o','long-o'],
 4:['u','i'],
 7:['i'],
 9:['long-e'],
};

type Props={
 ids:readonly [MouthModelId,...MouthModelId[]];
 video:RefObject<HTMLVideoElement|null>;
 onVideoPlay:()=>void;
 onSound:(kind:'sound'|'word',value:string)=>void;
};

export default function ReadingMouthModels({ids,video,onVideoPlay,onSound}:Props){
 const bodyId=useId();
 const [open,setOpen]=useState(false);
 const [active,setActive]=useState(ids[0]);
 const {ipa,tip,example}=models[active];
 return <div className="reading-mouth-models">
  <button className="reading-mouth-toggle" type="button" aria-expanded={open} aria-controls={bodyId} onClick={()=>setOpen(value=>!value)}>
   <span>شاهد حركة الفم</span><ChevronDown size={19} aria-hidden="true"/>
  </button>
  <div id={bodyId} hidden={!open}>{open&&<div className="reading-mouth-body">
   {ids.length>1&&<div role="group" aria-label="اختر الصوت" className="reading-mouth-options" dir="ltr">
    {ids.map(id=><button key={id} type="button" className="reading-audio" aria-pressed={id===active} onClick={()=>setActive(id)}>{models[id].ipa}</button>)}
   </div>}
   <div className="reading-mouth-layout">
    <video key={active} ref={video} controls playsInline preload="none" width={320} height={180}
     aria-label={`حركة الفم لصوت ${ipa}`} src={`/reading/aep-2.4.0/${active}.mp4`} onPlay={onVideoPlay}/>
    <div className="reading-mouth-guide">
     <p>{tip}</p>
     <div className="reading-mouth-options">
      <button type="button" className="reading-audio" onClick={()=>onSound('sound',active)}>
       <Volume2 size={16} aria-hidden="true"/> اسمع <bdi dir="ltr">{ipa}</bdi>
      </button>
      {example&&<button type="button" className="reading-audio" onClick={()=>onSound('word',example)}>
       <Volume2 size={16} aria-hidden="true"/> <bdi lang="en" dir="ltr">{example}</bdi>
      </button>}
     </div>
    </div>
   </div>
  </div>}</div>
 </div>;
}
