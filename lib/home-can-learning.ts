// Public explanation and illustrations; scored answer keys remain server-side.
export const HOME_CAN_COURSE_ID='helping-at-home-can-grade-4';
export type HomeChore={en:string;ar:string;scene:string;col:number;row:number;example:string;translation:string;tip:string};
export const homeChores:HomeChore[]=[
 {en:'set the table',ar:'أجهّز المائدة',scene:'set-table',col:0,row:0,example:'I set the table before lunch.',translation:'أجهّز المائدة قبل الغداء.',tip:'أضع الأطباق والملاعق قبل الأكل. set لا تعني تنظيف المائدة.'},
 {en:'clear the table',ar:'أرفع الأطباق عن المائدة',scene:'clear-table',col:1,row:0,example:'I clear the table after lunch.',translation:'أرفع الأطباق عن المائدة بعد الغداء.',tip:'أرفع الأطباق والأكواب بعد الأكل. clear تختلف عن clean التي تعني التنظيف.'},
 {en:'clean the table',ar:'أنظّف المائدة',scene:'clean-table',col:2,row:0,example:'I clean the table with a cloth.',translation:'أنظّف المائدة بقطعة قماش.',tip:'أمسح السطح وأزيل الفتات والأوساخ. هذه كلمة إضافية لتوضيح الفرق بين التجهيز والرفع والتنظيف.'},
 {en:'wash the dishes',ar:'أغسل الأطباق',scene:'wash-dishes',col:0,row:1,example:'I wash the dishes after dinner.',translation:'أغسل الأطباق بعد العشاء.',tip:'أستخدم الماء والصابون لغسل الأطباق. dishes هنا الأطباق والأواني.'},
 {en:'sweep the floor',ar:'أكنس الأرض',scene:'sweep-floor',col:1,row:1,example:'I sweep the floor with a broom.',translation:'أكنس الأرض بالمكنسة.',tip:'sweep = يكنس، وfloor = الأرض أو أرضية الغرفة. المكنسة دليل الصورة.'},
 {en:'take out the trash',ar:'أُخرج القمامة',scene:'take-trash',col:2,row:1,example:'I take out the trash.',translation:'أُخرج القمامة.',tip:'أنقل كيس النفايات إلى الحاوية. احفظ take out معًا؛ out تعني إلى الخارج هنا.'},
 {en:'make the bed',ar:'أرتّب السرير',scene:'make-bed',col:0,row:2,example:'I make my bed when I get up.',translation:'أرتّب سريري عندما أنهض.',tip:'لا نبني سريرًا جديدًا؛ make the bed عبارة تعني ترتيب الغطاء والوسادة.'},
 {en:'cut the grass',ar:'أقصّ العشب',scene:'cut-grass',col:1,row:2,example:'Grandpa cuts the grass.',translation:'يقصّ جدي العشب.',tip:'grass = العشب. لاحظ أن الشخص الكبير يستخدم آلة قص العشب في الصورة.'},
 {en:'feed the animals',ar:'أُطعم الحيوانات',scene:'feed-animals',col:2,row:2,example:'I feed the animals in the evening.',translation:'أُطعم الحيوانات في المساء.',tip:'feed = يطعم، وanimals = حيوانات. feed the cat = يطعم القطة، وfeed the chickens = يطعم الدجاج.'},
];
export const homeChoreByWord=(word:string)=>homeChores.find(w=>w.en===word);
export const homeChoreByScene=(scene:string)=>homeChores.find(w=>w.scene===scene);
export const homeCanSubjects=[
 {name:'I',ar:'أنا',question:'I',reply:'I'},
 {name:'You',ar:'أنت / أنتم',question:'you',reply:'you'},
 {name:'He',ar:'هو',question:'he',reply:'he'},
 {name:'She',ar:'هي',question:'she',reply:'she'},
 {name:'It',ar:'هو / هي لغير العاقل',question:'it',reply:'it'},
 {name:'We',ar:'نحن',question:'we',reply:'we'},
 {name:'They',ar:'هم / هنّ',question:'they',reply:'they'},
 {name:'Ali',ar:'علي',question:'Ali',reply:'he'},
 {name:'Nora',ar:'نورة',question:'Nora',reply:'she'},
];
export function makeCanExample(subject:string,form:'affirmative'|'negative'|'question'){
 const item=homeCanSubjects.find(s=>s.name===subject)||homeCanSubjects[0];
 return form==='question'?`Can ${item.question} help?`:form==='negative'?`${item.name} can’t help.`:`${item.name} can help.`;
}
export const homeCanDialogues=[
 {kind:'offer',label:'عرض مساعدة',speaker:'أنا سأقوم بالمساعدة',question:'Can I set the table for you?',translation:'هل أجهّز المائدة لك؟',yes:'Yes, please.',yesAr:'نعم، من فضلك.',no:'No, thanks.',noAr:'لا، شكرًا.',scene:'set-table'},
 {kind:'request',label:'طلب مساعدة',speaker:'أطلب منك أن تساعدني',question:'Can you sweep the floor for me, please?',translation:'هل يمكنك كنس الأرض من أجلي، من فضلك؟',yes:'Yes, I can.',yesAr:'نعم، أستطيع.',no:'No, I can’t.',noAr:'لا، لا أستطيع.',scene:'sweep-floor'},
] as const;
export const homeCanExtraWords=[['chores','الأعمال المنزلية'],['offer','عرض المساعدة'],['request','طلب'],['please','من فضلك'],['thanks','شكرًا'],['for me','من أجلي'],['for you','من أجلك'],['help me','ساعدني'],['shelf','رفّ'],['too high','مرتفع جدًا'],['give me a ride','يوصلني بالسيارة'],['graduation','تخرّج'],['after','بعد'],['before','قبل'],['usually','عادةً'],['always','دائمًا'],['sometimes','أحيانًا'],['never','أبدًا / لا يحدث إطلاقًا'],['How often…?','كم مرة…؟']];
export const homeCanBookConversation=[
 ['Can you sweep the floor for me?','هل يمكنك كنس الأرض من أجلي؟'],
 ['Yes, I can! Can I take out the trash, too?','نعم، أستطيع! هل أُخرج القمامة أيضًا؟'],
 ['Yes, please!','نعم، من فضلك!'],
 ['Can you put the books on the shelf, please?','هل يمكنك وضع الكتب على الرف، من فضلك؟'],
 ['No, I can’t, Miss Brown. It’s too high.','لا، لا أستطيع، يا آنسة براون. إنه مرتفع جدًا.'],
];
