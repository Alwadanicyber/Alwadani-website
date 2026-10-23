export type InitiativeIdentity={coordinatorName:string;coordinatorTitle:string;principalName:string;principalTitle:string;slogan:string};
export type Initiative=InitiativeIdentity&{id:string;title:string;description:string;school:string;goal:number;open:number;approved:number;participations:number;dua:number};
export type InitiativePost={id:string;initiative_id:string;name:string;class_name:string;kind:'message'|'card'|'drawing'|'voice';text:string;status:'pending'|'approved'|'hidden';created:number};
export const initiativeId=(v:unknown):v is string=>typeof v==='string'&&/^[a-z0-9-]{1,64}$/.test(v);
export function submission(v:Record<string,unknown>){
 const name=typeof v.name==='string'?v.name.trim():'',className='',text=typeof v.text==='string'?v.text.trim():'',kind=v.kind;
 if(!initiativeId(v.initiativeId)||typeof v.id!=='string'||!/^[a-f0-9-]{36}$/.test(v.id))throw new Error('حدّث الصفحة ثم حاول مجددًا.');
 if(!name||name.length>60)throw new Error('اكتب اسم المشاركة (حتى ٦٠ حرفًا).');
 if(!['message','card','drawing','voice'].includes(String(kind))||text.length>600||(!['drawing','voice'].includes(String(kind))&&!text))throw new Error('اكتب رسالة من حرف واحد إلى ٦٠٠ حرف.');
 const audio=typeof v.audio==='string'?v.audio:'';
 if(kind==='voice'){if(audio.length>350000||!/^data:audio\/(webm|ogg|mp4|mpeg|wav)(;codecs=[a-zA-Z0-9.-]+)?;base64,[A-Za-z0-9+/=]+$/.test(audio))throw new Error('سجل صوتًا قصيرًا حتى ٣٠ ثانية.');}else if(audio)throw new Error('نوع التسجيل غير صالح.');
 const image=typeof v.image==='string'?v.image:'';
 if(kind==='drawing'){
  if(image.length>180000||!/^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/=]+$/.test(image))throw new Error('أضف رسمة أو صورة أصغر حجمًا.');
 }else if(image)throw new Error('نوع المشاركة غير صالح.');
 return {id:v.id,initiativeId:v.initiativeId,name,className,text,kind:kind as InitiativePost['kind'],image,audio};
}
export function initiativeSettings(v:Record<string,unknown>){
 const title=typeof v.title==='string'?v.title.trim():'',description=typeof v.description==='string'?v.description.trim():'',school=typeof v.school==='string'?v.school.trim():'',goal=Number(v.goal);
 if(!title||title.length>100||description.length>600||school.length>120||!Number.isInteger(goal)||goal<1||goal>1000||typeof v.open!=='boolean')throw new Error('راجع البيانات: العنوان مطلوب والهدف من ١ إلى ١٠٠٠ مشاركة.');
 const profile:InitiativeIdentity={coordinatorName:'',coordinatorTitle:'منفذ المبادرة',principalName:'',principalTitle:'مدير المدرسة',slogan:''};
 for(const key of Object.keys(profile) as (keyof InitiativeIdentity)[]){if(v[key]===undefined)continue;if(typeof v[key]!=='string'||String(v[key]).trim().length>(key==='slogan'?200:key.endsWith('Title')?50:100))throw new Error('راجع الأسماء والعناوين: الاسم حتى ١٠٠ حرف والصفة حتى ٥٠ حرفًا.');profile[key]=String(v[key]).trim();}
 return {title,description,school,goal,open:v.open?1:0,...profile};
}
export async function initiativeBody(req:Request){
 if(Number(req.headers.get('content-length'))>420000)throw new Error('حجم المشاركة كبير.');
 const reader=req.body?.getReader();if(!reader)throw new Error('طلب فارغ.');let size=0;const chunks:Uint8Array[]=[];
 while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>420000){await reader.cancel();throw new Error('حجم المشاركة كبير.');}chunks.push(value);}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
 let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error('طلب غير صالح.');}if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('طلب غير صالح.');return body as Record<string,unknown>;
}

export function newParticipationId(){
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}
