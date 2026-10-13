import type {Result} from './result-ranking';
export const TIME_PLACE_COURSE_ID='life-stories-time-place-grade-9';
export function completeTimePlacePrompt(prompt:string,choice:string){
 const answers=choice.split('/').map(part=>part.trim()),count=prompt.split('___').length-1;
 if(count===0)return choice;
 if(count!==answers.length)return prompt.replace('___',choice);
 let index=0;return prompt.replace(/___/g,()=>answers[index++]);
}
export const prepositionExamples={
 time:[
  {word:'in',icon:'🗓️',title:'فترة واسعة',rule:'سنة، شهر، قرن، فصل أو جزء من اليوم',example:'in 2001 · in May · in the 20th century · in winter · in the morning',arabic:'عام ٢٠٠١ · في مايو · في القرن العشرين · في الشتاء · صباحًا'},
  {word:'on',icon:'📅',title:'يوم أو تاريخ',rule:'يوم محدد أو تاريخ يحتوي على يوم',example:'on Monday · on June 3rd · on May 25th, 2000',arabic:'يوم الاثنين · في ٣ يونيو · في ٢٥ مايو ٢٠٠٠'},
  {word:'at',icon:'🕗',title:'وقت محدد',rule:'ساعة محددة؛ وتعبيرات مثل at noon وat night',example:'at 8:00 a.m. · at noon · at night',arabic:'الساعة الثامنة صباحًا · عند الظهر · ليلًا'},
 ],
 place:[
  {word:'in',icon:'🏙️',title:'داخل أو ضمن مكان',rule:'مدينة، دولة، منطقة أو داخل شيء',example:'in Riyadh · in Saudi Arabia · in the world · in a box',arabic:'في الرياض · في السعودية · في العالم · داخل صندوق'},
  {word:'on',icon:'🏝️',title:'على سطح أو في تعبير مكاني',rule:'على سطح؛ ومن تعبيرات الكتاب on Earth وon an island',example:'on the table · on Earth · on an island',arabic:'على الطاولة · على الأرض · على جزيرة'},
  {word:'at',icon:'📍',title:'عند نقطة أو موقع',rule:'نقطة محددة أو مكان نشاط مثل المدرسة',example:'at the school gate · at school · at home',arabic:'عند بوابة المدرسة · في المدرسة · في المنزل'},
 ],
};
export const pastExpressions=[
 {word:'last',title:'الفترة السابقة',example:'last night · last Tuesday · last week · last year',arabic:'الليلة الماضية · الثلاثاء الماضي · الأسبوع الماضي · السنة الماضية',rule:'تأتي last قبل الفترة: last week. لا نضيف in / on / at قبلها.'},
 {word:'yesterday',title:'أمس',example:'yesterday · yesterday morning · the day before yesterday',arabic:'أمس · صباح أمس · أول أمس',rule:'yesterday تعني أمس. لا نقول on yesterday.'},
 {word:'ago',title:'قبل مدة من الآن',example:'two days ago · six years ago · ten minutes ago',arabic:'قبل يومين · قبل ست سنوات · قبل عشر دقائق',rule:'تأتي ago بعد المدة: two years ago، وليس ago two years.'},
 {word:'when',title:'عندما',example:'When I was a child, I used to play with my toys.',arabic:'عندما كنت طفلًا، كنت ألعب بألعابي.',rule:'when تربط حدثًا بوقت أو حدث آخر. إذا بدأت الجملة بعبارة when، نضع فاصلة بعدها.'},
 {word:'since',title:'منذ نقطة بداية',example:'I have lived here since 2010.',arabic:'أعيش هنا منذ عام ٢٠١٠.',rule:'since تذكر نقطة البداية مثل 2010. في هذا المثال الحالة بدأت في الماضي وما زالت مستمرة؛ لذلك استعملنا have lived.'},
 {word:'before / after / then',title:'ترتيب الأحداث',example:'I learned to read before I went to school. Then I learned to write.',arabic:'تعلمت القراءة قبل أن أذهب إلى المدرسة. ثم تعلمت الكتابة.',rule:'before = قبل، after = بعد، then = ثم. before تربط حدثين؛ ago تحسب مدة إلى الوراء من الآن.'},
];
// Grade is the first sorting key in this lesson. No speed tie-breaker.
export function compareTimePlaceResults(a:Result,b:Result){
 const percent=(r:Result)=>r.total>0?r.score/r.total:0;
 return percent(b)-percent(a)||Number(!!b.completed)-Number(!!a.completed)||b.answered-a.answered;
}
