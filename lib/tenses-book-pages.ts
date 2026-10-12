import type {WorkbookItem} from './tenses-workbook';
export type BookRect={x:number;y:number;width:number;height:number};
export type BookTarget={id:string;rect:BookRect;mask?:boolean;category?:boolean;focus?:BookRect};
export type BookPage={id:string;label:string;src:string;width:number;height:number};
export type BookExercise={page:string;region:BookRect;headingY:number;targets:BookTarget[]};
export const tensesBookPages:BookPage[]=[
 {id:'student-24',label:'كتاب الطالب · صفحة 24',src:'/lesson-pages/grade4-02/student-24.png',width:848,height:1076},
 {id:'student-25',label:'كتاب الطالب · صفحة 25',src:'/lesson-pages/grade4-02/student-25.png',width:846,height:1075},
 {id:'workbook-138',label:'كراسة النشاط · صفحة 138',src:'/lesson-pages/grade4-02/workbook-138.png',width:846,height:1074},
 {id:'workbook-139',label:'كراسة النشاط · صفحة 139',src:'/lesson-pages/grade4-02/workbook-139.png',width:847,height:1080},
];
const rect=(x:number,y:number,width:number,height:number):BookRect=>({x,y,width,height});
const target=(id:string,x:number,y:number,width:number,height:number,extra:Partial<BookTarget>={}):BookTarget=>({id,rect:rect(x,y,width,height),mask:true,...extra});
export const tensesBookExercises:Record<string,BookExercise>={
 dialogue:{page:'student-24',region:rect(55,388,745,383),headingY:386,targets:[
  target('d1',69,429,86,47,{mask:false,category:true,focus:rect(59,418,232,296)}),
  target('d2',178,468,94,34,{mask:false,category:true,focus:rect(59,418,232,296)}),
  target('d3',178,505,94,35,{mask:false,category:true,focus:rect(59,418,232,296)}),
  target('d4',351,424,87,64,{mask:false,category:true,focus:rect(294,414,237,300)}),
  target('d5',539,426,227,30,{mask:false,category:true,focus:rect(531,414,265,300)}),
  target('d6',539,458,227,28,{mask:false,category:true,focus:rect(531,414,265,300)}),
  target('d7',533,649,130,61,{mask:false,category:true,focus:rect(531,414,265,300)}),
 ]},
 rules:{page:'student-24',region:rect(78,785,699,166),headingY:791,targets:[target('r1',220,828,310,23),target('r2',220,876,310,23),target('r3',432,925,310,23)]},
 choose:{page:'student-25',region:rect(80,99,711,266),headingY:102,targets:[target('c1',185,138,130,31),target('c2',179,172,147,23),target('c3',282,200,130,23),target('c4',129,227,145,21),target('c5',175,255,220,23),target('c6',130,282,145,23),target('c7',217,310,289,24),target('c8',179,337,216,24)]},
 write:{page:'student-25',region:rect(77,377,715,324),headingY:374,targets:[
  target('s1',79,648,133,44,{focus:rect(77,406,140,295)}),target('s2',224,648,133,44,{focus:rect(216,406,145,295)}),target('s3',369,648,133,44,{focus:rect(360,406,147,295)}),target('s4',513,648,133,44,{focus:rect(504,406,147,295)}),target('s5',656,648,134,44,{focus:rect(648,406,144,295)}),
 ]},
 ask:{page:'student-25',region:rect(79,710,695,270),headingY:713,targets:[target('a1',113,797,307,23),target('a2',113,847,307,23),target('a3',113,897,307,23),target('a4',113,947,307,23)]},
 simple:{page:'workbook-138',region:rect(80,102,720,245),headingY:103,targets:[target('b1',141,146,99,23),target('b2',200,177,101,23),target('b3',159,210,104,23),target('b4',185,242,103,23),target('b5',220,275,104,23),target('b6',245,307,103,24),target('b7',556,307,102,24)]},
 order:{page:'workbook-138',region:rect(80,350,694,353),headingY:351,targets:[target('o1',131,412,635,24),target('o2',131,463,635,24),target('o3',131,515,635,24),target('o4',131,567,635,24),target('o5',131,619,635,24),target('o6',131,671,635,24)]},
 garden:{page:'workbook-138',region:rect(79,717,691,283),headingY:721,targets:[target('g1',589,800,140,28),target('g2',330,846,139,21),target('g3',393,868,148,22),target('g4',568,890,120,20),target('g5',567,912,108,19),target('g6',445,932,145,20),target('g7',525,954,127,20)]},
 help:{page:'workbook-139',region:rect(24,104,801,624),headingY:105,targets:[target('h1',366,153,110,25),target('h2',237,214,91,25),target('h3',222,266,91,23),target('h4',413,316,90,25),target('h5',232,427,92,23),target('h6',313,477,93,23),target('h7',528,477,94,23),target('h8',417,504,92,23),target('h9',452,613,93,23),target('h10',378,641,95,23)]},
 personal:{page:'workbook-139',region:rect(79,731,697,248),headingY:739,targets:[target('p1',132,796,635,24),target('p2',132,848,635,24),target('p3',132,900,635,24),target('p4',132,950,635,24)]},
};
// Choices for printed writing/gap exercises. The supplied model answer is kept
// in the existing workbook item, so correction and translations share one key.
const choices:Record<string,string[]>={
 s1:['Majid always gets up at six o’clock.','Majid always get up at six o’clock.','Majid is getting up at six o’clock.'],
 s2:['Mona isn’t getting on the bus now.','Mona doesn’t gets on the bus now.','Mona is getting on the bus now.'],
 s3:['Fahad drives to work every morning.','Fahad drive to work every morning.','Fahad is driving to work every morning.'],
 s4:['Mr. Badr isn’t driving the bus today.','Mr. Badr is driving the bus today.','Mr. Badr isn’t drive the bus today.'],
 s5:['My teacher is reading a book now.','My teacher reading a book now.','My teacher reads a book now.'],
 a1:['What do you do on weekends?','What are you doing on weekends?','What does you do on weekends?'],
 a2:['What are your parents doing right now?','What do your parents do right now?','What is your parents doing right now?'],
 a3:['What time do you get up for school?','What time does you get up for school?','What time are you get up for school?'],
 a4:['What are you reading now?','What do you read now?','What is you reading now?'],
 b1:['don’t wake up','doesn’t wake up','don’t wakes up'],b2:['goes','go','is going'],b3:['don’t visit','doesn’t visit','don’t visits'],b4:['doesn’t have','doesn’t has','don’t have'],b5:['catches','catch','is catch'],b6:['doesn’t walk','doesn’t walks','don’t walk'],b7:['drives','drive','driving'],
 h1:['are you doing','do you do','is you doing'],h2:['am finishing','finish','am finish'],h3:['Do you need','Does you need','Are you needing'],h4:['often helps','often help','often helping'],h5:['Does your mom walk','Do your mom walk','Does your mom walks'],h6:['doesn’t','don’t','isn’t'],h7:['usually catches','usually catch','usually catching'],h8:['is cleaning','is clean','clean'],h9:['are playing','is playing','are play'],h10:['Do you want','Does you want','Are you wanting'],
 p1:['Yes, I do.','No, I don’t.'],p2:['I get up at six o’clock.','I get up at seven o’clock.'],p3:['I usually do my homework after school.','I usually play football after school.'],p4:['I am studying English now.','I am reading a book now.'],
};
export function bookChoices(item:WorkbookItem){return item.words||item.options||choices[item.id]||item.answers;}
export function applyBookChoice(item:WorkbookItem,previous:string,choice:string){return (item.words?[previous.trim(),choice].filter(Boolean).join(' '):choice).slice(0,1200);}
export function shuffleBookChoices(values:string[],seedText:string){
 const order=values.map((value,index)=>({value,key:String(index)}));let seed=2166136261;
 for(const c of seedText)seed=Math.imul(seed^c.charCodeAt(0),16777619)>>>0;
 for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return order;
}
export function targetFocus(target:BookTarget,exercise:BookExercise){return target.focus||exercise.region;}
export function shortBookValue(value:string){return value==='Simple Present'?'بسيط':value==='Present Progressive'?'مستمر':value;}
