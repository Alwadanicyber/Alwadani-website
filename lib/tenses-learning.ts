export const TENSES_COURSE_ID='present-tenses-grade-4-02';
export type PresentTense='simple'|'continuous';
export const tenseNames={simple:'Simple Present',continuous:'Present Progressive'};
export const tenseArabic={simple:'المضارع البسيط',continuous:'المضارع المستمر'};
// A clue helps the reader understand time; it is not a grading key or a universal tense rule.
export function sentenceTimeClue(sentence:string){
 const clues:[RegExp,string,string][]=[
  [/\bright now\b/i,'الآن تمامًا','تعبير يساعدك على معرفة أن الحدث يحدث في هذه اللحظة.'],
  [/\bat the moment\b/i,'في هذه اللحظة','تعبير يساعدك على معرفة أن الحدث يحدث في هذه اللحظة.'],
  [/\bevery day\b/i,'كل يوم','شيء يتكرر؛ فكّر في العادة.'],
  [/\bevery morning\b/i,'كل صباح','شيء يتكرر؛ فكّر في العادة.'],
  [/\bevery week\b/i,'كل أسبوع','شيء يتكرر؛ فكّر في العادة.'],
  [/\bon weekends\b/i,'في عطلات نهاية الأسبوع','شيء يتكرر؛ فكّر في العادة.'],
  [/\busually\b/i,'عادةً','تخبرنا أن الفعل يتكرر في أغلب الأوقات.'],
  [/\balways\b/i,'دائمًا','تساعدنا هنا على فهم التكرار؛ اقرأ معنى الجملة وتركيبها أيضًا.'],
  [/\bsometimes\b/i,'أحيانًا','تخبرنا أن الفعل يتكرر من وقت إلى آخر.'],
  [/\bnow\b/i,'الآن','تعبير يساعدك على معرفة وقت الحدث. اقرأ معنى الفعل وتركيب الجملة أيضًا.'],
 ];
 for(const [pattern,arabic,explanation] of clues){const match=pattern.exec(sentence);if(match)return {text:match[0],index:match.index,arabic,explanation};}
 return null;
}
export const sentenceResponseSchema=`CREATE TABLE IF NOT EXISTS student_sentence_answers(student TEXT NOT NULL REFERENCES students(id),attempt INTEGER NOT NULL,question INTEGER NOT NULL,response TEXT NOT NULL,PRIMARY KEY(student,attempt,question))`;
export function normalizeSentence(value:string){
  return value.trim().toLowerCase().replace(/[’‘]/g,"'")
    .replace(/\bdon't\b/g,'do not').replace(/\bdoesn't\b/g,'does not')
    .replace(/\bisn't\b/g,'is not').replace(/\baren't\b/g,'are not')
    .replace(/\bi'm\b/g,'i am').replace(/\bwe're\b/g,'we are')
    .replace(/\bthey're\b/g,'they are').replace(/\byou're\b/g,'you are')
    .replace(/\bhe's\b/g,'he is').replace(/\bshe's\b/g,'she is')
    .replace(/\bit's\b/g,'it is').replace(/[.!?,]/g,'').replace(/\s+/g,' ');
}
export function sentenceTokens(sentence:string){return sentence.trim().replace(/[.!?,]/g,'').split(/\s+/).filter(Boolean);}
export function tokenPool(options:string[]){
  const max=new Map<string,number>();
  for(const option of options){const seen=new Map<string,number>();for(const token of sentenceTokens(option)){const key=token.toLowerCase(),n=(seen.get(key)||0)+1;seen.set(key,n);if(n>(max.get(key)||0))max.set(key,n);}}
  return [...max].flatMap(([word,count])=>Array.from({length:count},(_,i)=>({id:word+':'+i,word}))).sort((a,b)=>a.word.localeCompare(b.word)||a.id.localeCompare(b.id));
}
export const tenseVideos:{id:string;title:string;publisher:string;length:string;start:number;end:number;focus:string;watch?:string}[]=[
 {id:'6zJCviulfRk',title:'شرح إضافي للدرس · اختيار المعلم',publisher:'اختيار المعلم',length:'',start:0,end:0,watch:'https://youtu.be/6zJCviulfRk?si=iMuZerrmirsFP760',focus:'المقطع الذي اختاره المعلم لتوضيح هذا الدرس. شاهده هنا، أو افتحه مباشرة في يوتيوب.'},
 {id:'4_tLjSQtthw',title:'كل يوم أم الآن؟ وتركيب الزمنين',publisher:'Ellii',length:'مقطع مختار: دقيقتان و29 ثانية',start:206,end:355,focus:'قارن الإثبات والنفي والسؤال في الزمنين. الشرح بالإنجليزية، ويمكنك الرجوع إلى الشرح العربي المكتوب في الدرس.'},
 {id:'dcfxyH7CNQQ',title:'What are you doing? · ماذا تفعل الآن؟',publisher:'English Singsing',length:'3 دقائق و29 ثانية',start:0,end:0,focus:'أغنية ورسوم للحركات الآن. لاحظ I am وHe is وShe is، ثم الفعل مع ing.'},
 {id:'kl_EqtM7qSQ',title:'Do you like milk? · هل تحب الحليب؟',publisher:'English Singsing',length:'دقيقتان و45 ثانية',start:0,end:0,focus:'حوار وأغنية قصيرة: Do you like…? / Yes, I do. / No, I don’t. كلمة like نستخدمها هنا بالمضارع البسيط.'},
];
