export const lessons = [
 {title:'الماضي البسيط',en:'Simple Past',tag:'01',intro:'نستخدم الماضي البسيط للحديث عن حدث انتهى في وقت سابق.',formula:'Subject + past verb',rules:[['الإثبات','نضيف ‎-ed للأفعال المنتظمة، ونستخدم صيغة الماضي الخاصة بالأفعال غير المنتظمة.','She lived in Riyadh. / He wore formal clothing.'],['السؤال والنفي','بعد did أو didn’t نستخدم الفعل في صورته الأساسية.','Did you live in Riyadh? / She didn’t work in an office.'],['السؤال عن المعلومات','نضع أداة الاستفهام قبل did، ثم الفاعل والفعل الأساسي.','Where did he live? / What did she wear?']],note:'مع be نستخدم was / were مباشرة: Was he happy? He wasn’t happy. لا نستخدم did مع be.',example:'I visited my friend yesterday.',translation:'زرت صديقي أمس.'},
 {title:'الحديث عن الميلاد',en:'Be + Born',tag:'02',intro:'لذكر مكان الميلاد أو تاريخه نستخدم was born أو were born.',formula:'Subject + was / were + born',rules:[['المفرد','نستخدم was مع I / he / she / it.','I was born in Syria.'],['الجمع','نستخدم were مع you / we / they.','The twins were born on June 21st.'],['المكان والزمان','نستخدم in مع المدن والدول والسنوات، وon مع تاريخ محدد.','She was born in Tabuk in 2010. / He was born on May 5th.']],note:'نقول I was born، ولا نقول I born أو I did born.',example:'My brother was born in Jeddah.',translation:'وُلد أخي في جدة.'},
 {title:'المبني للمجهول في الماضي',en:'Past Passive',tag:'03',intro:'نستخدمه عندما يكون التركيز على الشخص أو الشيء الذي وقع عليه الفعل.',formula:'Subject + was / were + past participle',rules:[['التركيب','was أو were ثم التصريف الثالث للفعل.','Michael was raised in Montreal.'],['تعبيرات شائعة','was raised: نشأ وتربّى؛ was educated: تلقّى تعليمه؛ was called: كان يُسمّى.','The team was called The Lions.'],['المطابقة','نختار was للمفرد وwere للجمع، ونحافظ على التصريف الثالث.','His parents were married in Tabuk. / He was educated in private schools.']],note:'التصريف الثالث قد يختلف عن الماضي: write → wrote → written.',example:'The letter was written yesterday.',translation:'كُتبت الرسالة أمس.'},
 {title:'عادات الماضي',en:'Used to',tag:'04',intro:'نستخدم used to لعادات أو حالات كانت موجودة في الماضي، وغالبًا لم تعد كذلك الآن.',formula:'Subject + used to + base verb',rules:[['الإثبات','used to ثم الفعل الأساسي.','When I was little, I used to play with toys.'],['النفي','بعد didn’t نكتب use to، دون d.','I didn’t use to play video games.'],['السؤال','Did ثم الفاعل ثم use to ثم الفعل الأساسي.','Did you use to play with dolls? / What did you use to play with?']],note:'لا تخلط used to + verb مع be used to + noun / -ing، فالأخيرة تعني معتاد على شيء.',example:'I used to ride a bike to school.',translation:'كنت أذهب إلى المدرسة بالدراجة.'},
 {title:'قصة صداقة',en:'Life Stories Practice',tag:'05',intro:'طبّق ما تعلمته: أكمل أحداث قصة يوسف بصيغة الماضي الصحيحة.',formula:'Read → choose → understand',rules:[['اقرأ السياق','القصة تتحدث عن أحداث انتهت، لذلك نستخدم الماضي البسيط.','Yousef and I went to the same school.'],['الأفعال غير المنتظمة','بعض الأفعال لا تأخذ ‎-ed: meet → met، go → went، spend → spent.','We spent every day together.'],['النفي','didn’t ثم الفعل الأساسي، حتى لو كان غير منتظمًا.','He didn’t know anyone.']],note:'بعد كل اختيار سيظهر التصحيح وسبب الإجابة. الدرجة تُحتسب من أول إجابة لكل سؤال.',example:'At first, he watched. Later, he wanted to play.',translation:'في البداية كان يشاهد، ثم أراد اللعب.'}
];
export type Question={id:number;lesson:number;prompt:string;options:string[]};
export const questions:Question[] = [
{id:1,lesson:0,prompt:'Where ___ you live when you were young?',options:['did','do','were']},
{id:2,lesson:0,prompt:'She didn’t ___ in an office.',options:['worked','work','works']},
{id:3,lesson:0,prompt:'He ___ formal clothing yesterday.',options:['wear','worn','wore']},
{id:4,lesson:1,prompt:'I ___ born in Syria.',options:['were','was','did']},
{id:5,lesson:1,prompt:'The twins ___ born on June 21st.',options:['was','are','were']},
{id:6,lesson:1,prompt:'She was born ___ 2010.',options:['on','in','at']},
{id:7,lesson:2,prompt:'Michael ___ raised in Montreal.',options:['did','was','were']},
{id:8,lesson:2,prompt:'His parents ___ married in Tabuk.',options:['was','did','were']},
{id:9,lesson:2,prompt:'The letter was ___ yesterday.',options:['wrote','written','write']},
{id:10,lesson:3,prompt:'When I was little, I ___ play with toys.',options:['used to','use to','used']},
{id:11,lesson:3,prompt:'I didn’t ___ play video games.',options:['used to','use to','using to']},
{id:12,lesson:3,prompt:'Did you use to ___ a bike to school?',options:['rode','riding','ride']},
...[
['Let me tell you how I ___ (meet) my best friend.',['meet','met','meeting']],
['Yousef and I ___ (go) to the same elementary school.',['went','go','gone']],
['Yousef ___ (be) a new student.',['were','is','was']],
['The teacher ___ (ask) me to show him around.',['ask','asked','asking']],
['I ___ (agree) to help out.',['agreed','agree','agreeing']],
['We ___ (spend) every day together.',['spended','spend','spent']],
['Yousef ___ (grow up) in Abha.',['grew up','grow up','grown up']],
['His family ___ (move) when his father got a new job.',['move','moved','moving']],
['His father ___ (get) a new job in Jeddah.',['get','got','gotten']],
['He ___ (not know) anyone.',['didn’t knew','doesn’t know','didn’t know']],
['I ___ (introduce) him to my friends.',['introduced','introduce','introducing']],
['After school, he ___ (come) with me to football practice.',['come','came','comed']],
['At first, he just ___ (watch).',['watch','watching','watched']],
['Then he ___ (want) to play.',['wanted','want','wanting']],
['He ___ (not play) well at first.',['didn’t played','didn’t play','not played']],
['But he ___ (try) very hard.',['try','tryed','tried']]
].map((x,i)=>({id:i+13,lesson:4,prompt:x[0] as string,options:x[1] as string[]}))
];
