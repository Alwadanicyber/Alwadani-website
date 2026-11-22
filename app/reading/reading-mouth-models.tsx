import {useId,type RefObject} from 'react';
import {Play,Volume2,X} from 'lucide-react';
import {mouthModels,mouthModelIds,type MouthModelId} from './reading-mouth-data';
import {readingWordBank} from './reading-phonemes';

type PreviewProps={
 id:MouthModelId;
 context?:string;
 showSound?:boolean;
 onShow:(id:MouthModelId)=>void;
};

export function ReadingMouthPreview({id,context,showSound,onShow}:PreviewProps){
 const {ipa,example}=mouthModels[id];
 const tile=mouthModelIds.indexOf(id);
 const label=showSound ? `/${ipa}/ ${example} · شاهد النطق` : `شاهد النطق /${ipa}/`;
 return <button type="button" className="reading-mouth-preview" dir="rtl" lang="ar" aria-haspopup="dialog"
   aria-label={context?`${label} · ${context}`:label} onClick={()=>onShow(id)}>
  <span className="reading-mouth-picture" aria-hidden="true"
    style={{backgroundPosition:`${tile%8*100/7}% ${Math.floor(tile/8)*20}%`}}><Play size={13}/></span>
  <span>{showSound?<><bdi dir="ltr">/{ipa}/</bdi> <bdi lang="en" dir="ltr">{example}</bdi></>:'شاهد النطق'}</span>
 </button>;
}

type DialogProps={
 id:MouthModelId|null;
 dialog:RefObject<HTMLDialogElement|null>;
 video:RefObject<HTMLVideoElement|null>;
 playing:string;
 notice:string;
 onClose:()=>void;
 onVideoPlay:()=>void;
 onSound:(kind:'sound'|'word',value:string)=>void;
};

export function ReadingMouthDialog({id,dialog,video,playing,notice,onClose,onVideoPlay,onSound}:DialogProps){
 const title=useId();
 const model=id===null?null:mouthModels[id];
 return <dialog className="reading-mouth-dialog" ref={dialog} aria-labelledby={title} onClose={onClose}>
  {id&&model&&<>
   <header className="reading-mouth-dialog-header">
    <h2 id={title}>حركة الفم <bdi dir="ltr">/{model.ipa}/</bdi></h2>
    <button type="button" className="reading-audio" aria-label="إغلاق فيديو النطق" onClick={()=>dialog.current?.close()}><X size={20} aria-hidden="true"/></button>
   </header>
   <video key={id} ref={video} controls playsInline preload="none" width={320} height={180}
    aria-label={`حركة الفم للصوت /${model.ipa}/`} src={`/reading/aep-2.4.0/${id}.mp4`} onPlay={onVideoPlay}/>
   <p>{model.tip}</p>
   <div className="reading-mouth-options">
    <button type="button" className="reading-audio" aria-pressed={playing===`sound-${id}`} onClick={()=>onSound('sound',id)}>
     <Volume2 size={16} aria-hidden="true"/> اسمع الصوت <bdi dir="ltr">/{model.ipa}/</bdi>
    </button>
    {readingWordBank(model.example)
     ? <button type="button" className="reading-audio" aria-pressed={playing===`word-${model.example}`} onClick={()=>onSound('word',model.example)}>
         <Volume2 size={16} aria-hidden="true"/> <bdi lang="en" dir="ltr">{model.example}</bdi>
       </button>
     : <span>مثال <bdi lang="en" dir="ltr">{model.example}</bdi></span>}
   </div>
   {notice&&<p role="status">{notice}</p>}
  </>}
 </dialog>;
}
