import {useId,useState,type ReactNode,type RefObject} from 'react';
import {flushSync} from 'react-dom';
import {Play,Volume2,X} from 'lucide-react';
import {mouthModels,mouthModelIds,type MouthModelId,type MouthSelection} from './reading-mouth-data';
import {readingWordBank} from './reading-phonemes';

const finalLImage='/reading/final-l.webp';

function MouthPicture({id}:{id:MouthModelId}){
 const tile=mouthModelIds.indexOf(id);
 return <span className="reading-mouth-picture" aria-hidden="true"
  style={{backgroundPosition:`${tile%8*100/7}% ${Math.floor(tile/8)*20}%`}}><Play size={13}/></span>;
}

type PreviewProps={
 selection:MouthSelection;
 context?:string;
 showSound?:boolean;
 onShow:(selection:MouthSelection)=>void;
};

export function ReadingMouthPreview({selection,context,showSound,onShow}:PreviewProps){
 const model=selection.kind==='video'?mouthModels[selection.id]:null;
 const ipa=selection.kind==='sequence'?selection.ipa:model?.ipa??'l';
 const label=showSound&&model ? `/${ipa}/ ${model.example} · شاهد النطق` : `شاهد النطق /${ipa}/`;
 return <button type="button" className="reading-mouth-preview" dir="rtl" lang="ar" aria-haspopup="dialog"
   aria-label={context?`${label} · ${context}`:label} onClick={()=>onShow(selection)}>
  {selection.kind==='final-l'
   ? <span className="reading-mouth-picture reading-mouth-picture--final-l" aria-hidden="true" style={{backgroundImage:`url(${finalLImage})`}}/>
   : <MouthPicture id={selection.kind==='video'?selection.id:selection.ids[0]}/>}
  <span>{showSound&&model?<><bdi dir="ltr">/{ipa}/</bdi> <bdi lang="en" dir="ltr">{model.example}</bdi></>:'شاهد النطق'}</span>
 </button>;
}

type DialogProps={
 selection:MouthSelection|null;
 dialog:RefObject<HTMLDialogElement|null>;
 video:RefObject<HTMLVideoElement|null>;
 playing:string;
 notice:string;
 onClose:()=>void;
 onVideoPlay:()=>void;
 onSound:(kind:'sound'|'word',value:string)=>void;
};

function MouthVideo({id,video,onPlay}:{id:MouthModelId;video:DialogProps['video'];onPlay:()=>void}){
 return <video key={id} ref={video} controls playsInline preload="none" width={320} height={180}
  aria-label={`حركة الفم للصوت /${mouthModels[id].ipa}/`} src={`/reading/aep-2.4.0/${id}.mp4`} onPlay={onPlay}/>;
}

function ClipButton({kind,value,playing,onSound,children}:{
 kind:'sound'|'word';value:string;playing:string;onSound:DialogProps['onSound'];children:ReactNode;
}){
 return <button type="button" className="reading-audio" aria-pressed={playing===`${kind}-${value}`} onClick={()=>onSound(kind,value)}>
  <Volume2 size={16} aria-hidden="true"/> {children}
 </button>;
}

export function ReadingMouthDialog({selection,dialog,video,playing,notice,onClose,onVideoPlay,onSound}:DialogProps){
 const title=useId();
 const [component,setComponent]=useState<MouthModelId|null>(null);
 const model=selection?.kind==='video'?mouthModels[selection.id]:null;
 const ipa=selection?.kind==='sequence'?selection.ipa:model?.ipa??'l';
 const finalL=selection?.kind==='final-l';
 const clipProps={playing,onSound};
 function playComponent(id:MouthModelId){
  video.current?.pause();
  // Start playback inside the tap for mobile browsers.
  flushSync(()=>setComponent(id));
  void video.current?.play().catch(()=>{});
 }
 function close(){
  setComponent(null);
  onClose();
 }
 return <dialog className="reading-mouth-dialog" ref={dialog} aria-labelledby={title} onClose={close}>
  {selection&&<>
   <header className="reading-mouth-dialog-header">
    <h2 id={title}>
     {finalL?'صوت اللام في آخر الكلمة':selection.kind==='sequence'?'الأصوات بالترتيب':'حركة الفم'} <bdi dir="ltr">/{ipa}/</bdi>
    </h2>
    <button type="button" className="reading-audio" aria-label="إغلاق فيديو النطق" onClick={()=>dialog.current?.close()}><X size={20} aria-hidden="true"/></button>
   </header>
   {selection.kind==='video'&&model&&<>
    <MouthVideo id={selection.id} video={video} onPlay={onVideoPlay}/>
    <p>{model.tip}</p>
    <div className="reading-mouth-options">
     <ClipButton kind="sound" value={selection.id} {...clipProps}>اسمع الصوت <bdi dir="ltr">/{ipa}/</bdi></ClipButton>
     {readingWordBank(model.example)
      ? <ClipButton kind="word" value={model.example} {...clipProps}><bdi lang="en">{model.example}</bdi></ClipButton>
      : <span>مثال <bdi lang="en" dir="ltr">{model.example}</bdi></span>}
    </div>
   </>}
   {finalL&&<>
    <div className="reading-final-l-visuals">
     <MouthVideo id="l" video={video} onPlay={onVideoPlay}/>
     {/* The diagram shows tongue placement inside the mouth. */}
     {/* eslint-disable-next-line @next/next/no-img-element */}
     <img src={finalLImage} width="400" height="246" alt="طرف اللسان عند اللثة، ومؤخرته مرفوعة نحو سقف الفم اللين"/>
    </div>
    <p>في آخر الكلمة نسمع <bdi dir="ltr">[ɫ]</bdi>. المس اللثة خلف الأسنان العليا بطرف اللسان (١)، وارفع مؤخرته قليلًا (٢). قل اللام مرة واحدة.</p>
    <div className="reading-mouth-options">
     <ClipButton kind="sound" value="ll" {...clipProps}>اسمع <bdi dir="ltr">[ɫ]</bdi></ClipButton>
     <ClipButton kind="word" value="bell" {...clipProps}><bdi lang="en">bell</bdi></ClipButton>
     <ClipButton kind="word" value="hill" {...clipProps}><bdi lang="en">hill</bdi></ClipButton>
    </div>
   </>}
   {selection.kind==='sequence'&&<>
    <div className="reading-mouth-options" dir="ltr">
     {selection.ids.map(id=><button className="reading-mouth-preview" key={id} type="button"
      aria-label={`شاهد النطق /${mouthModels[id].ipa}/`} aria-pressed={component===id} onClick={()=>playComponent(id)}>
      <MouthPicture id={id}/><bdi>/{mouthModels[id].ipa}/</bdi>
     </button>)}
    </div>
    {component&&<div className="reading-sequence-video"><MouthVideo id={component} video={video} onPlay={onVideoPlay}/></div>}
    <p>شاهد كل صوت، ثم استمع إلى الصوتين متصلين داخل الكلمة.</p>
    <ClipButton kind="word" value={selection.example} {...clipProps}>اسمع المثال <bdi lang="en">{selection.example}</bdi></ClipButton>
   </>}
   {notice&&<p role="status">{notice}</p>}
  </>}
 </dialog>;
}
