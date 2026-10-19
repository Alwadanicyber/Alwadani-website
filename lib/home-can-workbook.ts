import {normalizeSentence} from './tenses-learning';
export type HomeBookItem={id:string;en:string;ar:string;answer:string;reason:string;options?:string[];words?:string;open?:boolean};
export type HomeBookGroup={id:string;title:string;page:string;items:HomeBookItem[]};
export const normalizeHomeAnswer=(text:string)=>normalizeSentence(text).replace(/\bcan't\b/g,'cannot');
export const homeCanWorkbook:HomeBookGroup[]=[
 {id:'story',title:'أكمل قصة مساعدة الجد والجدة',page:'كتاب الطالب · 28',items:[
 {id:'story-1',en:'I usually ___ the floor.',ar:'عادةً أكنس الأرض.',answer:'sweep',reason:'مع I نستخدم sweep دون s. sweep the floor = يكنس الأرض.'},
 {id:'story-2',en:'I usually sweep the floor and ___ the beds.',ar:'عادةً أكنس الأرض وأرتّب الأسرّة.',answer:'make',reason:'make the beds = يرتّب الأسرّة. مع I يبقى الفعل الأساسي make.'},
 {id:'story-3',en:'Then I ___ the animals.',ar:'ثم أُطعم الحيوانات.',answer:'feed',reason:'feed the animals = يطعم الحيوانات. Then تعني ثم، والفاعل I لا يأخذ s.'},
 {id:'story-4',en:'My brother ___ the grass.',ar:'أخي يقصّ العشب.',answer:'cuts',reason:'My brother مفرد يعادل he؛ نضيف s في إثبات المضارع البسيط: cuts.'},
 {id:'story-5',en:'My brother cuts the grass and ___ the trash.',ar:'أخي يقصّ العشب ويخرج القمامة.',answer:'takes out',reason:'العبارة take out the trash. مع My brother تصبح takes out؛ نضيف s إلى الفعل take فقط.'},
 {id:'story-6',en:'I usually ___ the table for lunch.',ar:'عادةً أجهّز المائدة للغداء.',answer:'set',reason:'for lunch يعني استعدادًا للغداء، لذا نجهز المائدة: set the table. مع I نستخدم set دون s.'},
 {id:'story-7',en:'My brother always ___ the table after we eat.',ar:'أخي يرفع الأطباق عن المائدة دائمًا بعد أن نأكل.',answer:'clears',reason:'after we eat = بعد أن نأكل، إذن نرفع الأطباق: clear. مع My brother نضيف s: clears.'},
 {id:'story-8',en:'Then I ___ the dishes for my grandma.',ar:'ثم أغسل الأطباق لجدتي.',answer:'wash',reason:'wash the dishes = يغسل الأطباق. الفاعل I، لذلك wash دون s.'},
 ]},
 {id:'verbs',title:'اختر الفعل واكتب شكله الصحيح',page:'كتاب النشاط · 142',items:[
 {id:'verbs-1',en:'Sahar ___ the animals in the evening.',ar:'سحر تطعم الحيوانات في المساء.',answer:'feeds',reason:'Sahar اسم مفرد يعادل she. في إثبات المضارع البسيط نضيف s: feeds.'},
 {id:'verbs-2',en:'Grandma ___ the table when she finishes cooking.',ar:'تجهّز جدتي المائدة عندما تنتهي من الطبخ.',answer:'sets',reason:'بعد الطبخ تستعد للطعام، فالمناسب set the table. Grandma مفرد، لذلك sets.'},
 {id:'verbs-3',en:'Yousef always ___ his bed when he gets up.',ar:'يرتّب يوسف سريره دائمًا عندما ينهض.',answer:'makes',reason:'make the bed = يرتب السرير. Yousef مفرد يعادل he، لذلك makes.'},
 {id:'verbs-4',en:'Grandpa ___ the grass on Saturdays.',ar:'يقصّ جدي العشب أيام السبت.',answer:'cuts',reason:'الفعل cut يناسب grass. مع Grandpa في إثبات العادة نضيف s: cuts.'},
 {id:'verbs-5',en:'My cousin doesn’t like to ___ the dishes.',ar:'قريبي لا يحب غسل الأطباق.',answer:'wash',reason:'بعد to نستخدم الفعل الأساسي wash دون s. doesn’t ترتبط بـ like، ولا نكتب washes بعد to.'},
 {id:'verbs-6',en:'My uncle never ___ the floor.',ar:'عمي لا يكنس الأرض أبدًا.',answer:'sweeps',reason:'never كلمة تكرار تعني أن الفعل لا يحدث أبدًا. لكنها لا تحذف s؛ My uncle مفرد، فنقول never sweeps.'},
 ]},
 {id:'questions',title:'رتّب كلمات أسئلة CAN',page:'كتاب الطالب · 29',items:[
 {id:'order-1',en:'اكتب السؤال بالإنجليزية مستخدمًا الكلمات.',words:'you / car / help me / Can / wash / my / ?',ar:'هل يمكنك مساعدتي في غسل سيارتي؟',answer:'Can you help me wash my car?',reason:'طلب مساعدة يبدأ بـ Can you. يأتي help ثم me ثم wash my car. في الحوار ذي علامة الرفض يمكن الرد: No, I can’t.'},
 {id:'order-2',en:'اكتب السؤال بالإنجليزية مستخدمًا الكلمات.',words:'for / you / set / the / Can / I / table / ?',ar:'هل أجهّز المائدة لك؟',answer:'Can I set the table for you?',reason:'عرض مساعدة: Can I ثم set، وتأتي for you = من أجلك في النهاية. لقبول العرض: Yes, please.'},
 {id:'order-3',en:'اكتب السؤال بالإنجليزية مستخدمًا الكلمات.',words:'your book / you / the cat / Can / feed / after you read / ?',ar:'هل يمكنك إطعام القطة بعد قراءة كتابك؟',answer:'Can you feed the cat after you read your book?',reason:'Can you feed تبدأ الطلب. after you read your book = بعد قراءة كتابك. وللموافقة: Yes, I can.'},
 {id:'order-4',en:'اكتب السؤال بالإنجليزية مستخدمًا الكلمات.',words:'Grandma / Can / make / for my / a cake / graduation / ?',ar:'هل تستطيع الجدة صنع كعكة لتخرجي؟',answer:'Can Grandma make a cake for my graduation?',reason:'Can ثم Grandma ثم make دون s. الجواب عن الجدة: Yes, she can. graduation = تخرّج.'},
 {id:'order-5',en:'اكتب السؤال بالإنجليزية مستخدمًا الكلمات.',words:'give / your mom / Can / me / to school / a ride / ?',ar:'هل تستطيع أمك توصيلي إلى المدرسة؟',answer:'Can your mom give me a ride to school?',reason:'give me a ride = يوصلني بالسيارة. بعد Can your mom يأتي give دون s؛ الجواب عنها Yes, she can.'},
 {id:'order-6',en:'اكتب السؤال بالإنجليزية مستخدمًا الكلمات.',words:'I / homework / with / you / help / Can / your / ?',ar:'هل أساعدك في واجبك؟',answer:'Can I help you with your homework?',reason:'Can I help you عرض مساعدة، وwith your homework = في واجبك. للرفض بأدب: No, thanks.'},
 ]},
 {id:'purpose',title:'عرض مساعدة أم طلب مساعدة؟',page:'كتاب النشاط · 143',items:[
 {id:'purpose-1',en:'Can you help me set the table?',ar:'هل يمكنك مساعدتي في تجهيز المائدة؟',answer:'Request',options:['Offer','Request'],reason:'Request = طلب. أطلب من you أن تساعدني، ولست أنا الذي يعرض المساعدة.'},
 {id:'purpose-2',en:'Can I cut the grass for you?',ar:'هل أقصّ العشب لك؟',answer:'Offer',options:['Offer','Request'],reason:'Offer = عرض. المتحدث يتطوع للقيام بالعمل للآخر: Can I…for you?'},
 {id:'purpose-3',en:'Can you feed the chickens when you finish your homework?',ar:'هل يمكنك إطعام الدجاج عندما تنتهي من واجبك؟',answer:'Request',options:['Offer','Request'],reason:'Request = طلب موجه إلى you. when you finish your homework يحدد متى تقوم بالعمل.'},
 {id:'purpose-4',en:'Can you and your brother water the flowers in the yard?',ar:'هل يمكنك أنت وأخوك سقي الأزهار في الفناء؟',answer:'Request',options:['Offer','Request'],reason:'طلب من شخصين؛ you and your brother هو الفاعل، وwater فعل أساسي بمعنى يسقي. لا نضيف s بعد can.'},
 {id:'purpose-5',en:'Can I help you wash the dishes?',ar:'هل أساعدك في غسل الأطباق؟',answer:'Offer',options:['Offer','Request'],reason:'Offer = عرض مساعدة؛ أنا أعرض أن أساعدك في غسل الأطباق.'},
 {id:'purpose-6',en:'Can you make my bed for me?',ar:'هل يمكنك ترتيب سريري من أجلي؟',answer:'Request',options:['Offer','Request'],reason:'Request = طلب؛ أطلب منك ترتيب سريري. for me = من أجلي، وmake my bed = يرتب سريري.'},
 ]},
 {id:'own',title:'حوارك وإجاباتك الشخصية',page:'الطالب 29 · النشاط 142–143',items:[
 {id:'own-1',en:'Write an offer: wash the dishes.',ar:'اكتب عرض مساعدة لغسل الأطباق، ثم اقبله.',answer:'Can I wash the dishes for you? — Yes, please. Thanks.',reason:'هذا نموذج، ويمكن استخدام Can I help you wash the dishes? أيضًا. عرض المساعدة له أكثر من صياغة صحيحة.',open:true},
 {id:'own-2',en:'Write an offer: take out the trash.',ar:'اكتب عرض مساعدة لإخراج القمامة، ثم اقبله.',answer:'Can I take out the trash for you? — Yes, please.',reason:'ابدأ عرضك بـ Can I ثم الفعل الأساسي take. يمكن إضافة for you لتوضيح أنك تقدم المساعدة.',open:true},
 {id:'own-3',en:'Write a request: cut the grass.',ar:'اكتب طلب مساعدة لقص العشب، ثم اعتذر عن عدم القدرة.',answer:'Can you cut the grass, please? — No, I can’t.',reason:'هذا طلب من المخاطب Can you. نجيب عن أنفسنا بـ I، ويمكن إضافة I need to do my homework = أحتاج إلى أداء واجبي.',open:true},
 {id:'own-4',en:'Write a request: wash the car.',ar:'اكتب طلب مساعدة لغسل السيارة، ثم ارفض بسبب الواجب.',answer:'Can you wash my car, please? — No, I can’t. I need to do my homework.',reason:'please تجعل الطلب مهذبًا. نستخدم can’t لنفي القدرة، ويمكن إعطاء السبب بعد ذلك.',open:true},
 {id:'own-5',en:'What chores do you help your family with?',ar:'ما الأعمال المنزلية التي تساعد أسرتك فيها؟',answer:'I help my family wash the dishes and set the table.',reason:'غيّر الأعمال لتعبّر عن نفسك؛ هذا مثال وليس جوابًا إجباريًا.',open:true},
 {id:'own-6',en:'Which chores do you NOT like doing?',ar:'ما الأعمال المنزلية التي لا تحب القيام بها؟',answer:'I don’t like washing the dishes.',reason:'هذه إجابة شخصية. بعد like يمكن استخدام washing أو to wash، فالإجابات الصحيحة متعددة.',open:true},
 {id:'own-7',en:'Write your own offer.',ar:'اكتب عرض مساعدة من عندك.',answer:'Can I help you make your bed?',reason:'فكّر في عمل تقوم به أنت لمساعدة الآخر، ثم ابدأ Can I. توجد عروض صحيحة كثيرة.',open:true},
 {id:'own-8',en:'Write your own request.',ar:'اكتب طلب مساعدة من عندك.',answer:'Can you help me set the table, please?',reason:'اطلب المساعدة من الآخر بـ Can you، ثم الفعل الأساسي. يمكنك اختيار أي عمل منزلي مناسب.',open:true},
 ]},
];
