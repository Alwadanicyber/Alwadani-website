export type MovementStory={word:string;ar:string;short:string;example:string;translation:string;place:'river'|'park'|'tunnel'|'hotel';path:string;points:[number,number][];steps:string[]};
export const movementStories:MovementStory[]=[
 {word:'across',ar:'يعبر إلى الجهة الأخرى',short:'من جانب ← إلى الجانب الآخر',example:'Walk across the bridge.',translation:'اعبر الجسر إلى الجانب الآخر.',place:'river',path:'M240 265 L240 75',points:[[240,265],[240,170],[240,75]],steps:['هنا البداية: هذه ضفة النهر.','يعبر الجسر فوق النهر.','وصل إلى الضفة الأخرى.']},
 {word:'along',ar:'يسير على امتداد',short:'بمحاذاة النهر، دون عبوره',example:'Walk along the river.',translation:'امش على امتداد النهر.',place:'river',path:'M55 112 L425 112',points:[[55,112],[240,112],[425,112]],steps:['يبدأ على ضفة النهر.','يمشي بجانب النهر وعلى امتداده.','ما زال على الضفة نفسها؛ لم يعبر النهر.']},
 {word:'around',ar:'يدور حول',short:'حول المكان',example:'Walk around the park.',translation:'امش حول الحديقة.',place:'park',path:'M140 160 C140 45 340 45 340 160 S140 275 140 160',points:[[140,160],[340,160],[140,160]],steps:['يبدأ بجانب الحديقة.','يدور حول الحديقة.','أكمل دورة حولها.']},
 {word:'through',ar:'يمر داخل شيء',short:'دخول ← داخل ← خروج',example:'Walk through the tunnel.',translation:'مرّ عبر النفق من داخله.',place:'tunnel',path:'M55 210 L425 210',points:[[55,210],[240,210],[425,210]],steps:['قبل مدخل النفق.','في داخل النفق الآن.','خرج من الطرف الآخر.']},
 {word:'into',ar:'يدخل',short:'خارج ← داخل',example:'Walk into the hotel.',translation:'ادخل إلى الفندق.',place:'hotel',path:'M65 235 L330 188',points:[[65,235],[225,207],[330,188]],steps:['كان خارج الفندق.','يتحرك نحو الداخل.','أصبح داخل الفندق.']},
 {word:'out of',ar:'يخرج',short:'داخل ← خارج',example:'Walk out of the hotel.',translation:'اخرج من الفندق.',place:'hotel',path:'M140 188 L425 235',points:[[140,188],[275,211],[425,235]],steps:['كان داخل الفندق.','يعبر الباب إلى الخارج.','أصبح خارج الفندق.']},
 {word:'away from',ar:'يبتعد عن',short:'قريب ← أبعد',example:'Walk away from the hotel.',translation:'ابتعد عن الفندق.',place:'hotel',path:'M215 235 L430 235',points:[[215,235],[325,235],[430,235]],steps:['يقف قريبًا من الفندق.','تزداد المسافة بينه وبين الفندق.','أصبح أبعد عن الفندق.']},
 {word:'to',ar:'يذهب إلى',short:'الوجهة هي الفندق',example:'Go to the hotel.',translation:'اذهب إلى الفندق.',place:'hotel',path:'M55 235 L395 220',points:[[55,235],[225,227.5],[395,220]],steps:['الفندق هو الوجهة.','يسير إلى الفندق.','وصل إلى وجهته عند باب الفندق.']},
 {word:'towards',ar:'يتجه نحو',short:'الاتجاه فقط؛ قد لا يصل',example:'Walk towards the hotel.',translation:'امش باتجاه الفندق.',place:'hotel',path:'M55 235 L245 225',points:[[55,235],[150,230],[245,225]],steps:['الفندق أمامه.','يتحرك في اتجاه الفندق.','اتجه إليه، لكن المثال لا يؤكد وصوله.']}
];
export const emailPictureSteps=[
 {icon:'💌',en:'Dear Mom and Dad, I’m doing fine.',ar:'أبدأ بالتحية وأطمئن أسرتي.',label:'أطمئن'},
 {icon:'🌦️',en:'The weather is quite cold. The meals are pretty good.',ar:'أصف الجو والطعام: الجو بارد إلى حد ما، والوجبات جيدة إلى حد ما.',label:'أصف'},
 {icon:'🎓',en:'My teachers are extremely helpful. I’ve made new friends.',ar:'أتحدث عن الدراسة والأصدقاء: المعلمون متعاونون للغاية، وكوّنت أصدقاء.',label:'دراستي'},
 {icon:'🗺️',en:'Next week, we’re going to visit Niagara Falls.',ar:'أذكر خطتي: سنزور شلالات نياغارا الأسبوع المقبل.',label:'خططي'},
 {icon:'👋',en:'I miss you! Love, Adnan',ar:'أختم بمشاعري ثم أكتب اسمي.',label:'أختم'}
];
export const simpleTravelCards=[
 [['من يكتب؟','عدنان يكتب لأمه وأبيه من تورونتو.','Dear Mom and Dad,'],['ما فكرته؟','حياة جديدة، ودراسة، وأصدقاء، وخطة لرحلة.','I’m doing fine.']],
 [['الفكرة ببساطة','ضع كلمة التقوية قبل الكلمة التي تصفها.','very + cold → very cold'],['انتبه إلى quite','مع اسم مفرد: quite ثم a ثم الصفة والاسم.','quite a large campus | a very large campus']],
 [['حدث + وقت حدوثه','الجزء الأزرق يقول متى، والأخضر يقول ماذا سأفعل.','When I arrive, I’ll call you.'],['المعنى مستقبل، لكن بعد when مضارع','نكتب arrive، ولا نكتب will arrive في هذا الجزء.','when I arrive ✓ | when I will arrive ✗']],
 [['اقرأ المعنى أولًا','هل يحدث قبل؟ أم بعد؟ أم في الوقت نفسه؟','before = قبل | after = بعد | while = أثناء'],['كوّن جملة كاملة','صل البداية بنهاية تحقق المعنى المطلوب.','Wait here until they call for boarding.']],
 [['انظر إلى الحركة','هل أعبر، أم أمشي بجانب شيء، أم أدخل؟ شاهد المشهد ثم اختر.','across ≠ along | into ≠ out of'],['في الفندق','into لتسجيل الوصول، وout of لتسجيل المغادرة.','check into the hotel | check out of the hotel']],
 [['كل خطوة فقرة واحدة','تحية ← وصف ← دراسة ← خطط ← خاتمة.','Dear Ali, ... Best wishes, Fahad'],['اكتب فكرة قصيرة ثم طوّرها','يمكنك استخدام المثال، لكن غيّر المعلومات لتناسب تجربتك.','The weather is quite cold.']]
];
export function highlightTravelWords(text:string,terms:string[]){const escaped=terms.filter(Boolean).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'));if(!escaped.length)return [{text,highlight:false}];const re=new RegExp('\\b('+escaped.join('|')+')\\b','gi'),parts:{text:string;highlight:boolean}[]=[];let start=0;for(const m of text.matchAll(re)){if(m.index!>start)parts.push({text:text.slice(start,m.index),highlight:false});parts.push({text:m[0],highlight:true});start=m.index!+m[0].length;}if(start<text.length)parts.push({text:text.slice(start),highlight:false});return parts;}
