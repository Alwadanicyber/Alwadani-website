import type {TeacherCourse,Lesson,QuizQuestion,Definition} from './course-types';
import {HOME_CAN_COURSE_ID,homeChoreByWord} from './home-can-learning';
const lessons:Lesson[]=[
 {title:'أعمال المنزل بالصور',en:'Helping at Home',tag:'01',intro:'شاهد العمل، واسمع اسمه بالإنجليزية، ثم افتح معناه ومثاله. تعلّم الفرق بين تجهيز المائدة ورفع الأطباق وتنظيفها.',formula:'set → eat → clear → clean',rules:[
 ['قبل الأكل وبعده','set the table تجهيز المائدة قبل الأكل. clear the table رفع الأطباق بعدها. clean the table مسح سطح المائدة وتنظيفه.','I set the table before lunch. I clear it after lunch.'],
 ['احفظ العبارة كاملة','make the bed تعني ترتيب السرير، وtake out the trash تعني إخراج القمامة. الترجمة الحرفية لكلمة واحدة قد تربكك.','make the bed · take out the trash'],
 ['العادة مع المفرد','مع he / she / it أو اسم مفرد مثل Sahar نضيف s في إثبات المضارع البسيط: feeds، makes، cuts. مع I نستخدم الفعل الأساسي.','I feed the animals. Sahar feeds the animals.'],
 ['بعد to يعود الفعل إلى أصله','نقول doesn’t like to wash، دون s بعد to. وسؤال How often يسأل عن التكرار: دائمًا أم عادةً أم أحيانًا؟','How often do you sweep the floor? I sometimes sweep the floor.'],
 ],note:'كل أعمال المنزل ليست مناسبة لكل الأعمار؛ اختر المساعدة المناسبة مع أسرتك. في الصورة، الشخص الكبير هو الذي يقص العشب.',example:'I help my family. I make my bed and feed the animals.',translation:'أساعد أسرتي. أرتّب سريري وأُطعم الحيوانات.'},
 {title:'أستطيع، أعرض، وأطلب المساعدة',en:'Can · Offers & Requests',tag:'02',intro:'can تعني يستطيع أو يمكن. نستخدمها للقدرة، ونستخدم السؤال بها لعرض المساعدة أو طلبها حسب الموقف.',formula:'subject + can / can’t + base verb | Can + subject + base verb?',rules:[
 ['الإثبات: أستطيع','ضع can بعد الفاعل، ثم الفعل الأساسي. القاعدة نفسها مع I / you / he / she / it / we / they ومع الأسماء. لا نضيف s للفعل بعد can حتى مع he أو اسم مفرد.','I can help. She can help. Ali can help.'],
 ['النفي: لا أستطيع','can’t هي اختصار cannot، ونكتب cannot كلمة واحدة. لا نستخدم don’t أو doesn’t مع can. يبقى الفعل بعدها أساسيًا بلا s أو ing أو to.','He can’t sweep the floor. He cannot sweep the floor.'],
 ['السؤال والرد','قدّم Can على الفاعل، ثم الفعل الأساسي. لا نضيف Do أو Does. مع Can you نجيب عن أنفسنا: Yes, I can. أو No, I can’t. ومع Can she نقول Yes, she can.','Can you help? Yes, I can. Can she help? No, she can’t.'],
 ['عرض المساعدة: أنا سأساعدك','في مواقف هذا الدرس نبدأ عرض المساعدة بـ Can I، مثل: هل أجهّز المائدة لك؟ يمكن قبول العرض بـ Yes, please. ورفضه بأدب بـ No, thanks.','Can I set the table for you? Yes, please.'],
 ['طلب المساعدة: أطلب منك أن تساعدني','نستخدم Can you لطلب المساعدة من المخاطب. ويمكن السؤال عن شخص آخر مثل Can Grandma أو Can your mom. انتبه إلى الضمير في الجواب.','Can you wash the dishes, please? Yes, I can.'],
 ],note:'لا نحدد العرض من Can I وحدها في كل المواقف؛ فقد تسأل عن الإذن مثل Can I go out? في هذا الدرس، عرض المساعدة هو أن تتطوع للقيام بالعمل لشخص آخر.',example:'Can I help you with your homework? — Yes, please.',translation:'هل أساعدك في واجبك؟ — نعم، من فضلك.'},
 {title:'إملاء: اسمع ثم اكتب',en:'Listen & Write',tag:'03',intro:'اسمع العبارة بالإنجليزية واكتبها كاملة. الصورة والمعنى يظهران بعد إرسال إجابتك فقط، لتتعلم من السماع أولًا.',formula:'Listen → write → check → see the picture and meaning',rules:[
 ['استمع دون صورة','اضغط زر الاستماع، ويمكنك سماع العبارة أكثر من مرة. لا تظهر الصورة أو الترجمة قبل الإجابة.','Listen carefully, then write what you hear.'],
 ['اكتب العبارة كاملة','اترك مسافة بين الكلمات، ولا تنس the. نقبل الحروف الكبيرة والصغيرة والمسافات الزائدة، لكن الحروف الناقصة تغيّر الإملاء.','Write the complete phrase.'],
 ['شاهد وتعلم بعد التصحيح','بعد إرسال الإجابة تظهر صورتها ومعناها والإملاء الصحيح. خذ وقتك في مراجعتها، ثم انتقل إلى العبارة التالية.','Check → see → understand'],
 ],note:'٨ عبارات، ولكل عبارة نقطة من أول إجابة. أكمل الإملاء لفتح لعبة البالونات، وتُحفظ إجابتك عند العودة إلى الدرس.',example:'Listen, write, and discover the picture.',translation:'استمع، واكتب، ثم اكتشف الصورة.'},
 {title:'تحدي بالونات المساعدة',en:'Helping Balloon Challenge',tag:'04',intro:'اقرأ الموقف أو اسمعه، ثم أطلق السهم على البالونة المناسبة. تجمع اللعبة أعمال المنزل وقاعدة can والعرض والطلب.',formula:'Read / listen → choose → learn → next balloon',rules:[
 ['ماذا أختار؟','بعض الجولات تطلب فعل العمل المنزلي، وبعضها كلمة can أو الرد المناسب، وبعضها التمييز بين Offer وRequest.','Offer = عرض مساعدة · Request = طلب مساعدة'],
 ['الصحيح ينتقل تلقائيًا','تنفجر البالونة مع صوت وحركة، وتنتقل الجولة الصحيحة إلى السؤال التالي دون زر إضافي.','Can she ___? → help'],
 ['عند الخطأ نفهم السبب','تتوقف اللعبة، وتظهر الإجابة الصحيحة مع الترجمة والسبب. بعد فهم التصحيح اضغط «فهمت، أكمل اللعب».','can + base verb; not helps / helping / to help'],
 ],note:'اللعبة مطلوبة ودرجاتها ضمن النتيجة. يمكنك إعادة اللعبة بإجابات فارغة؛ نحفظ أفضل نتيجة مكتملة باسمك.',example:'Can you help me? — Yes, I can.',translation:'هل يمكنك مساعدتي؟ — نعم، أستطيع.'},
];
const questions:QuizQuestion[]=[];
function q(lesson:number,prompt:string,options:string[],correct:string,reason:string,extra:Partial<QuizQuestion>={}){
 const answer=options.indexOf(correct);if(answer<0)throw new Error('Missing home CAN answer');
 questions.push({id:questions.length+1,lesson,prompt,options,answer,reason,...extra});
}
const pictures=[
 ['set the table',['set the table','clear the table','clean the table'],'نجهّز المائدة قبل الطعام بوضع الأطباق والملاعق: set the table. أما clear the table فرفع الأطباق بعد الأكل، وclean the table فمسح السطح. المعنى: أجهّز المائدة.'],
 ['sweep the floor',['make the bed','sweep the floor','wash the dishes'],'المكنسة والأرض دليلان على sweep the floor = أكنس الأرض. make the bed ترتيب السرير، وwash the dishes غسل الأطباق؛ انظر إلى الأداة والعمل معًا.'],
 ['wash the dishes',['wash the dishes','feed the animals','clean the table'],'الماء والصابون والأطباق تدل على wash the dishes = أغسل الأطباق. clean the table تعني تنظيف سطح المائدة، وليس غسل الأطباق في المغسلة.'],
 ['clear the table',['set the table','clear the table','wash the dishes'],'clear the table = أرفع الأطباق عن المائدة بعد الطعام. في الصورة تحمل الأطباق بعيدًا عن المائدة؛ لا تجهزها للأكل مثل set، ولا تغسلها بالماء مثل wash.'],
 ['take out the trash',['take out the trash','make the bed','sweep the floor'],'كيس النفايات والحاوية يدلان على take out the trash = أُخرج القمامة. take out هنا عبارة واحدة معناها ينقل إلى الخارج؛ ليست ترتيب السرير أو كنس الأرض.'],
 ['make the bed',['set the table','make the bed','clear the table'],'الغطاء والوسادة دليلان على make the bed = أرتّب السرير. العبارة لا تعني صنع سرير جديد؛ إنها ترتيب الغطاء والوسائد بعد النهوض.'],
 ['cut the grass',['take out the trash','cut the grass','feed the animals'],'grass = العشب، وcut = يقص. الشخص الكبير في الصورة يقص العشب، لذلك نختار cut the grass. لا يحمل قمامة ولا يطعم حيوانات.'],
 ['feed the animals',['sweep the floor','wash the dishes','feed the animals'],'feed = يطعم، وanimals = الحيوانات. تقديم الطعام للحيوانات هو feed the animals. ويمكن تخصيص العبارة: feed the cat = يطعم القطة، وfeed the chickens = يطعم الدجاج.'],
] as const;
for(const [word,options,reason]of pictures)q(0,word,[...options],word,reason,{kind:'picture-choice',audio:word});
q(1,'She can ___ the dishes.',['wash','washes','washing','to wash'],'wash','بعد can نستخدم الفعل الأساسي wash، حتى مع She أو اسم مفرد مثل Nora. لا نضيف s أو ing أو to بعد can. الجملة: She can wash the dishes. = تستطيع غسل الأطباق. قارن: She washes the dishes. بدون can.');
q(1,'اختر النفي الصحيح: لا يستطيع علي كنس الأرض.',['Ali can’t sweep the floor.','Ali doesn’t can sweep the floor.','Ali can’t sweeps the floor.'],'Ali can’t sweep the floor.','النفي الصحيح can’t أو cannot ثم الفعل الأساسي sweep. لا نجمع doesn’t مع can، ولا نضيف s إلى sweep بعدها. Ali can’t sweep the floor. = لا يستطيع علي كنس الأرض.');
q(1,'اختر السؤال الصحيح: هل يمكنك إطعام الحيوانات؟',['Can you feed the animals?','Do you can feed the animals?','Can you feeds the animals?'],'Can you feed the animals?','للسؤال نكتب Can ثم you ثم الفعل الأساسي feed. لا نستخدم Do مع can، ولا نضيف s إلى feed. Can you feed the animals? = هل يمكنك إطعام الحيوانات؟');
q(1,'رتّب السؤال: هل يمكنك مساعدتي في غسل سيارتي؟',['Can you help me wash my car?','You can help me wash my car.','Can you helps me wash my car?'],'Can you help me wash my car?','السؤال يبدأ بـ Can ثم you ثم help دون s. help me wash = ساعدني في غسل. الجملة Can you help me wash my car? طلب مساعدة، لأنني أطلب منك أداء العمل معي.',{kind:'sentence-build'});
q(1,'رتّب عرض المساعدة: هل أجهّز المائدة لك؟',['Can I set the table for you?','I can set the table for you.','Can I sets the table for you?'],'Can I set the table for you?','أعرض أن أقوم أنا بالمساعدة، فأبدأ بـ Can I ثم الفعل الأساسي set. for you = من أجلك. Can I set the table for you? = هل أجهّز المائدة لك؟ يمكن قبول العرض بقول Yes, please.',{kind:'sentence-build'});
q(1,'Can I help you with your homework? — اقبل عرض المساعدة بأدب.',['Yes, please.','No, thanks.','Yes, she can.'],'Yes, please.','المتحدث يعرض مساعدتك: هل أساعدك في واجبك؟ عندما تقبل العرض تقول Yes, please. = نعم، من فضلك. No, thanks. رفض مهذب، وYes, she can. جواب عن قدرة شخص آخر وليس قبولًا لهذا العرض.');
q(1,'Can you wash the dishes? — وافق على طلب المساعدة.',['Yes, I can.','Yes, she can.','No, I can’t.'],'Yes, I can.','السؤال موجّه إليك بـ you، وعندما تجيب عن نفسك تستخدم I: Yes, I can. = نعم، أستطيع. لا نجيب she عن أنفسنا. No, I can’t. تعني لا أستطيع، وهي لا توافق المطلوب هنا.');
q(1,'Can Grandma make a cake for my graduation? — نعم، تستطيع.',['Yes, she can.','Yes, he can.','Yes, I can.'],'Yes, she can.','Grandma = الجدة، فنعود عليها بالضمير she: Yes, she can. = نعم، تستطيع. graduation = تخرج. لا نستخدم he للجدة، ولا I لأن السؤال عن الجدة وليس عن المتحدث.');
const dictationTips:Record<string,string>={
 'set the table':'ثلاث كلمات: set ثم the ثم table. كلمة table تنتهي بـ le.',
 'sweep the floor':'ثلاث كلمات. sweep فيها حرفا e، وfloor فيها حرفا o. لا تنس the بينهما.',
 'wash the dishes':'ثلاث كلمات. wash تنتهي بـ sh، وdishes تنتهي بـ es لأنها جمع dish.',
 'clear the table':'ثلاث كلمات. clear فيها ea وتنتهي بحرف r؛ لا تكتب clean التي تعني ينظف.',
 'take out the trash':'أربع كلمات منفصلة: take ثم out ثم the ثم trash. take تنتهي بحرف e، وtrash تنتهي بـ sh.',
 'make the bed':'ثلاث كلمات. make تنتهي بحرف e، ثم the ثم bed. العبارة تعني ترتيب السرير.',
 'cut the grass':'ثلاث كلمات. grass تنتهي بحرفي s. اكتب the بين cut وgrass.',
 'feed the animals':'ثلاث كلمات. feed فيها حرفا e، وanimals تنتهي بـ s لأنها جمع.',
};
for(const [word]of pictures){const item=homeChoreByWord(word)!;q(2,'استمع إلى العبارة، ثم اكتب ما سمعت بالإنجليزية.',[word,'إملاء مختلف'],word,`${word} = ${item.ar}. ${dictationTips[word]} راجع الحروف والمسافات، ثم اربط العبارة بالصورة.`,{kind:'audio-write',audio:word,picture:item.scene});}
q(3,'Before lunch, I ___ the table.',['set','clear','clean'],'set','before lunch = قبل الغداء؛ أضع الأطباق وأجهز المائدة، لذلك set the table. clear رفع الأطباق بعد الطعام، وclean تنظيف السطح. الجملة: قبل الغداء أجهّز المائدة.',{kind:'home-balloon',picture:'set-table'});
q(3,'After lunch, I ___ the plates from the table.',['clear','set','feed'],'clear','after lunch = بعد الغداء، وthe plates = الأطباق. أرفع الأطباق عن المائدة، لذلك clear. لا نقول feed the plates لأن feed تعني يطعم. المعنى: بعد الغداء أرفع الأطباق عن المائدة.',{kind:'home-balloon',picture:'clear-table'});
q(3,'He can ___ the floor.',['sweep','sweeps','sweeping'],'sweep','حتى مع He يبقى الفعل بعد can أساسيًا: sweep، دون s أو ing. He can sweep the floor. = يستطيع كنس الأرض. وجود can هو الدليل؛ He sweeps صحيحة فقط عندما لا توجد can في هذا التركيب.',{kind:'home-balloon',picture:'sweep-floor'});
q(3,'اختر صيغة النفي الصحيحة: She ___ help.',['can’t','doesn’t can','cans not'],'can’t','نفي can هو can’t أو cannot، وليس doesn’t can ولا cans not. can ثابتة مع جميع الفاعلين ولا تأخذ s. She can’t help. = لا تستطيع المساعدة.',{kind:'home-balloon'});
q(3,'Can I help you wash the dishes? — هل هذا عرض أم طلب؟',['Offer','Request'],'Offer','Offer = عرض مساعدة. أقول Can I help you…? لأنني أتطوع أنا لمساعدتك في غسل الأطباق. Request = طلب، مثل Can you help me…? عندما أطلب منك أن تساعدني.',{kind:'home-balloon',picture:'wash-dishes',audio:'Can I help you wash the dishes?'});
q(3,'Can you feed the chickens, please? — هل هذا عرض أم طلب؟',['Offer','Request'],'Request','Request = طلب مساعدة. السؤال موجّه إلى you: أطلب منك إطعام الدجاج. please = من فضلك، وfeed the chickens = يطعم الدجاج. لو عرضت المساعدة بنفسي لقلت Can I feed the chickens for you?',{kind:'home-balloon',picture:'feed-animals',audio:'Can you feed the chickens, please?'});
q(3,'Can I help you? — ارفض العرض بأدب.',['No, thanks.','Yes, please.','No, she can’t.'],'No, thanks.','عندما يعرض شخص المساعدة وتريد رفضها بأدب تقول No, thanks. = لا، شكرًا. Yes, please. قبول العرض. أما No, she can’t. فهو نفي قدرة شخص آخر، ولا يناسب هذا الموقف.',{kind:'home-balloon',audio:'Can I help you?'});
q(3,'Can you make your bed? — نعم، أستطيع.',['Yes, I can.','Yes, he can.','Yes, I do.'],'Yes, I can.','السؤال بـ Can you، فجوابي عن نفسي: Yes, I can. = نعم، أستطيع. نستخدم can في الجواب القصير لأن السؤال بها، وليس do. make your bed = ترتب سريرك، وyour = الخاص بك.',{kind:'home-balloon',picture:'make-bed',audio:'Can you make your bed?'});
export const homeCanCourse:TeacherCourse={id:HOME_CAN_COURSE_ID,grade:'grade-4',title:'أساعد في المنزل · CAN والعرض والطلب',description:'أعمال المنزل بالصور والنطق، شرح can وcan’t والإثبات والنفي والسؤال، الفرق بين عرض المساعدة وطلبها، تدريبات الكتاب المترجمة وإملاء صوتي يكشف الصورة بعد الإجابة، ثم لعبة بالونات تدخل ضمن النتيجة.',published:1,definition:{lessons,questions},updated:'2026-10-19'};

export function hasLegacyHomeCanDefinition(definition:Definition){
 return definition.lessons.length===3&&definition.questions.length===24&&definition.questions.every((q,i)=>q.id===i+1&&q.lesson===Math.floor(i/8))&&definition.questions.slice(16).every(q=>q.kind==='home-balloon');
}
export function addHomeCanDictation(definition:Definition):Definition{
 if(!hasLegacyHomeCanDefinition(definition))return definition;
 return {...definition,lessons:[...definition.lessons.slice(0,2),homeCanCourse.definition.lessons[2],{...definition.lessons[2],tag:'04'}],questions:[...definition.questions.slice(0,16),...homeCanCourse.definition.questions.slice(16,24),...definition.questions.slice(16).map(q=>({...q,id:q.id+8,lesson:3}))]};
}
