// Public teaching content only. Assessed answers stay in past-simple-course.ts.
export const PAST_SIMPLE_COURSE_ID='simple-past-car-rally-grade-4';
export const pastRoutes=['ed','d','y → ied','double + ed'] as const;
export type PastRoute=typeof pastRoutes[number];
export const routeLabels:Record<PastRoute,string>={ed:'أضف الحرفين',d:'أضف حرفًا واحدًا','y → ied':'غيّر الحرف الأخير وأضف النهاية','double + ed':'ضاعف الحرف ثم أضف النهاية'};
export const pastWords=[
 {base:'wait',past:'waited',ar:'ينتظر',pastAr:'انتظر',scene:'wait',rule:'ed'},
 {base:'kick',past:'kicked',ar:'يركل',pastAr:'ركل',scene:'kick',rule:'ed'},
 {base:'score',past:'scored',ar:'يسجّل هدفًا',pastAr:'سجّل هدفًا',scene:'score',rule:'d'},
 {base:'jump',past:'jumped',ar:'يقفز',pastAr:'قفز',scene:'jump',rule:'ed'},
 {base:'shout',past:'shouted',ar:'يهتف / يصيح',pastAr:'هتف',scene:'shout',rule:'ed'},
 {base:'laugh',past:'laughed',ar:'يضحك',pastAr:'ضحك',scene:'laugh',rule:'ed'},
 {base:'carry',past:'carried',ar:'يحمل',pastAr:'حمل',scene:'carry',rule:'y → ied'},
 {base:'call',past:'called',ar:'يتصل / ينادي',pastAr:'اتصل',scene:'call',rule:'ed'},
 {base:'play',past:'played',ar:'يلعب',pastAr:'لعب',scene:'play',rule:'ed'},
 {base:'solve',past:'solved',ar:'يحلّ مسألة',pastAr:'حلّ مسألة',scene:'solve',rule:'d'},
 {base:'drop',past:'dropped',ar:'يُسقط',pastAr:'أسقط',scene:'drop',rule:'double + ed'},
 {base:'push',past:'pushed',ar:'يدفع',pastAr:'دفع',scene:'push',rule:'ed'},
 {base:'climb',past:'climbed',ar:'يتسلّق',pastAr:'تسلّق',scene:'climb',rule:'ed'},
 {base:'watch',past:'watched',ar:'يشاهد',pastAr:'شاهد',scene:'watch',rule:'ed'},
] as const;
export const pastWord=(base:string)=>pastWords.find(w=>w.base===base);
export const pastStory=[
 {scene:'score',en:'Hashim didn’t wait. He kicked the ball and scored a goal.',ar:'لم ينتظر هاشم. ركل الكرة وسجّل هدفًا.'},
 {scene:'celebrate-jump',en:'He jumped and shouted, but he didn’t laugh.',ar:'قفز وهتف، لكنه لم يضحك.'},
 {scene:'celebrate-carry',en:'His friends carried him. His dad called his mom.',ar:'حمله أصدقاؤه. واتصل والده بوالدته.'},
];
export const pastWorkbook=[
 {section:'في ساحة المدرسة',items:[
  ['Luna ___ rope during recess.','jumped','قفزت لونا بالحبل في الاستراحة.','jump'],
  ['Izzy ___ a problem in math class.','solved','حلّت إيزي مسألة في حصة الرياضيات.','solve'],
  ['Sally ___ soccer yesterday.','played','لعبت سالي كرة القدم أمس.','play'],
  ['Evelyn ___ her book.','dropped','أسقطت إيفلين كتابها.','drop'],
  ['Vicky ___ at the funny story.','laughed','ضحكت فيكي من القصة المضحكة.','laugh'],
  ['Emma ___ the teacher’s books.','carried','حملت إيما كتب المعلمة.','carry'],
  ['Ava ___ at her team.','shouted','هتفت آفا لفريقها.','shout'],
  ['Zoe ___ Chloe on the swing.','pushed','دفعت زوي كلوي على الأرجوحة.','push'],
 ]},
 {section:'حدث أم لم يحدث؟',items:[
  ['Hanan ___ soccer. She played basketball.','didn’t play','لم تلعب حنان كرة القدم؛ لعبت كرة السلة.','play'],
  ['My mom ___ my sister. She didn’t call my dad.','called','اتصلت أمي بأختي؛ لم تتصل بأبي.','call'],
  ['Badria dropped her pencils. She ___ her notebook.','didn’t drop','أسقطت بدرية أقلامها، ولم تُسقط دفترها.','drop'],
  ['Faris didn’t score two goals. He ___ only one goal.','scored','لم يسجل فارس هدفين؛ سجّل هدفًا واحدًا فقط.','score'],
  ['Nawal ___ rope with Amal. She jumped with Noura and Wafa.','didn’t jump','لم تقفز نوال بالحبل مع أمل؛ قفزت مع نورة ووفاء.','jump'],
 ]},
 {section:'أصف الصورة',items:[
  ['She ___ for the bus. ✓','waited','انتظرت الحافلة.','wait'],
  ['He ___ soccer. ✗','didn’t play','لم يلعب كرة القدم؛ الصورة في الكتاب لكرة السلة.','play'],
  ['She ___ the tree. ✗','didn’t climb','لم تتسلّق الشجرة.','climb'],
  ['They ___ TV. ✓','watched','شاهدوا التلفاز.','watch'],
 ]},
];
