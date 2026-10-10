import {audienceWords,type Gender} from './audience';
export type LessonCertificate={
  studentGender?:Gender;
  name:string;
  id:string;
  title:string;
  completed:string;
  score:number;
  total:number;
  chores:boolean;
  parts?:{label:string;score:number;total:number}[];
};

export function certificateDate(completed:string){
  return new Intl.DateTimeFormat('en-GB',{
    day:'2-digit',month:'2-digit',year:'numeric',
    timeZone:'Asia/Riyadh',calendar:'gregory',
  }).format(new Date(completed));
}

// The same renderer supplies downloads and shared images. Direction is explicit
// for every line; numeric values never share a bidi run with their Arabic label.
export function drawLessonCertificate(x:CanvasRenderingContext2D,data:LessonCertificate){
  const words=audienceWords({studentGender:data.studentGender});
  const center=900,ink='#102f2c',muted='#607671';
  x.fillStyle='#fcfdfc';x.fillRect(0,0,1800,1250);
  x.strokeStyle='#bf963e';x.lineWidth=6;x.strokeRect(35,35,1730,1180);
  x.lineWidth=1;x.strokeRect(55,55,1690,1140);
  x.fillStyle=ink;x.fillRect(55,55,1690,150);
  x.textAlign='center';
  const line=(text:string,y:number,size:number,options:{direction?:CanvasDirection;color?:string;bold?:boolean;at?:number;family?:string}={})=>{
    x.direction=options.direction??'rtl';
    x.fillStyle=options.color??ink;
    x.font=`${options.bold?'bold ':''}${size}px ${options.family??'Arial'}`;
    x.fillText(text,options.at??center,y);
  };
  const fitted=(text:string,y:number,size:number,width:number,bold=false)=>{
    x.direction='rtl';x.fillStyle=ink;
    while(size>24){x.font=`${bold?'bold ':''}${size}px Arial`;if(x.measureText(text).width<=width)break;size-=2;}
    x.font=`${bold?'bold ':''}${size}px Arial`;x.fillText(text,center,y,width);
  };
  line('TEACHCRAFT · TEACHING TOOLS',150,45,{direction:'ltr',color:'#f4cf82',bold:true,family:'Georgia'});
  line('شهادة إتمام',330,72,{bold:true});
  // Isolate the English site name inside the right-to-left Arabic sentence.
  line(`يشهد موقع \u2066TeachCraft\u2069 بأن ${words.student}`,440,32);
  fitted(data.name,565,76,1500,true);
  line(`${words.completed} ${data.chores?'المشاهد والتدريبات والإملاء ولعبة البالونات':'شرح وتدريبات الدرس'}`,665,32,{color:muted});
  fitted(data.title,725,32,1500);
  line('النتيجة',795,28,{color:muted});
  const percentage=data.total>0?Math.round(data.score/data.total*100):0;
  line(`${data.score} / ${data.total}   (${percentage}%)`,855,48,{direction:'ltr',bold:true});
  if(data.parts?.length){
    data.parts.forEach((part,index)=>{
      const at=center+((data.parts!.length-1)/2-index)*360;
      line(part.label,930,26,{at,color:muted});
      line(`${part.score} / ${part.total}`,970,30,{at,direction:'ltr',bold:true});
    });
  }
  line('تاريخ الإتمام',1030,25,{color:muted});
  line(certificateDate(data.completed),1070,28,{direction:'ltr'});
  line('رقم الشهادة',1110,20,{color:muted});
  line(data.id.slice(0,16),1140,22,{direction:'ltr'});
  line('شهادة إتمام تدريب إلكتروني · أفضل نتيجة مكتملة',1180,20,{color:muted});
}
