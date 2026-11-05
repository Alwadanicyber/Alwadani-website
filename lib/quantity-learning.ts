export const QUANTITY_COURSE_ID='what-do-i-need-to-buy-grade-9';
export type FoodItem={id:string;en:string;ar:string;countable:boolean;example:string;question:string;reply:string;hint:string};
export const foodItems:FoodItem[]=[
 {id:'eggs',en:'eggs',ar:'بيض / بيضات',countable:true,example:'one egg → two eggs',question:'How many eggs are there?',reply:'There are a few.',hint:'نستطيع عدّ البيضات: واحدة، اثنتان، ثلاث. لذلك eggs معدود جمع.'},
 {id:'milk',en:'milk',ar:'حليب',countable:false,example:'some milk · a cup of milk',question:'How much milk is there?',reply:'There is a little.',hint:'milk مادة غير معدودة هنا. يمكننا عدّ الأكواب، لكن كلمة milk نفسها لا تجمع بإضافة s.'},
 {id:'carrots',en:'carrots',ar:'جزر / جزرات',countable:true,example:'one carrot → three carrots',question:'How many carrots are there?',reply:'There are a few.',hint:'نعد الجزرات واحدة واحدة؛ نستخدم How many ثم carrots بالجمع.'},
 {id:'strawberries',en:'strawberries',ar:'فراولة / حبات فراولة',countable:true,example:'one strawberry → many strawberries',question:'How many strawberries are there?',reply:'There are many.',hint:'نعد حبات الفراولة. تتحول y إلى ies في جمع strawberry: strawberries.'},
 {id:'oil',en:'oil',ar:'زيت',countable:false,example:'some oil · a bottle of oil',question:'How much oil is there?',reply:'There is a little.',hint:'الزيت مادة نقيس كميتها. bottle عبوة يمكن عدها، لكن oil غير معدود.'},
 {id:'salt',en:'salt',ar:'ملح',countable:false,example:'some salt · a teaspoon of salt',question:'How much salt is there?',reply:'There is a lot.',hint:'لا نعد الملح عادةً بكلمة salt؛ نقيسه مثل a teaspoon of salt. لذلك How much.'},
 {id:'tomatoes',en:'tomatoes',ar:'طماطم / حبات طماطم',countable:true,example:'one tomato → a few tomatoes',question:'How many tomatoes are there?',reply:'There are a few.',hint:'نعد حبات الطماطم. جمع tomato هو tomatoes. السؤال عن عددها يبدأ بـ How many.'},
 {id:'mushrooms',en:'mushrooms',ar:'فطر / حبات فطر',countable:true,example:'one mushroom → many mushrooms',question:'How many mushrooms are there?',reply:'There are a lot.',hint:'في هذا السياق نعد حبات الفطر؛ mushrooms جمع معدود ويأخذ How many.'},
 {id:'onions',en:'onions',ar:'بصل / بصلات',countable:true,example:'one onion → a few onions',question:'How many onions are there?',reply:'There are a few.',hint:'نستطيع عد البصلات، لذلك onions معدود جمع ونستخدم معه How many.'},
 {id:'cheese',en:'cheese',ar:'جبن',countable:false,example:'some cheese · a piece of cheese',question:'How much cheese is there?',reply:'There is a little.',hint:'cheese اسم مادة غير معدود هنا. نعد القطع: a piece of cheese، وليس الكلمة نفسها.'}
];
export const quantityGlossary=[['vegetables','خضراوات'],['bread','خبز — غير معدود هنا'],['seafood','مأكولات بحرية — غير معدود'],['fruit','فاكهة كطعام — غير معدود هنا'],['flour','دقيق'],['butter','زبدة'],['margarine','سمن نباتي / مارغرين'],['ingredients','مكونات'],['refrigerator','ثلاجة'],['empty','فارغ'],['supper','عشاء'],['on an empty stomach','على معدة فارغة'],['package','عبوة / علبة'],['dozen','اثنا عشر'],['cup','كوب'],['tablespoon','ملعقة طعام كبيرة'],['teaspoon','ملعقة شاي صغيرة'],['baking powder','مسحوق الخَبز / بيكنج باودر'],['dough','عجين'],['rise','يرتفع / ينتفخ'],['spread','يفرد / يوزّع'],['oven','فرن']];
export const cakeDialogue=[
 {speaker:'Noura',en:'Do you need help?',ar:'هل تحتاجين إلى مساعدة؟'},
 {speaker:'Mona',en:'Yes. I’m going to make a cake. Please check the refrigerator. Are there (1) ___ eggs?',ar:'نعم. سأعد كعكة. تحققي من الثلاجة من فضلك. هل يوجد بيض؟'},
 {speaker:'Noura',en:'Yes, there are.',ar:'نعم، يوجد.'},
 {speaker:'Mona',en:'How (2) ___?',ar:'كم عددها؟'},
 {speaker:'Noura',en:'There are only (3) ___ left.',ar:'لم يتبقَّ سوى بضع بيضات.'},
 {speaker:'Mona',en:'How (4) ___ butter is there?',ar:'ما كمية الزبدة الموجودة؟'},
 {speaker:'Noura',en:'There is only (5) ___ left. There isn’t (6) ___ for a cake.',ar:'لم يتبقَّ إلا قليل من الزبدة. لا توجد كمية كافية لإعداد كعكة.'},
 {speaker:'Mona',en:'Can you please go to the store and get a (7) ___ of butter, and a (8) ___ eggs?',ar:'هل يمكنك الذهاب إلى المتجر وشراء عبوة زبدة واثنتي عشرة بيضة؟'}
];
export const cakeScenes=[
 {icon:'🥚',title:'أتحقق: هل يوجد بيض؟',en:'Are there any eggs? Yes, there are.',ar:'نستخدم any في هذا السؤال عن وجود البيض.'},
 {icon:'🔢',title:'أسأل عن العدد',en:'How many? There are only a few left.',ar:'eggs معدود جمع: many في السؤال، وa few لكمية قليلة.'},
 {icon:'🧈',title:'أسأل عن كمية الزبدة',en:'How much butter is there? There is only a little left.',ar:'butter غير معدود: much في السؤال، وa little لكمية قليلة.'},
 {icon:'🛒',title:'أكتب قائمة الشراء',en:'There isn’t enough. Get a package of butter and a dozen eggs.',ar:'enough = كافٍ. package = عبوة. a dozen eggs = 12 بيضة.'}
];
export const pronounTasks=[
 {ref:'A1',prompt:'You’re a good cook. You always have ___ delicious for dinner.',ar:'أنت طباخ ماهر. لديك دائمًا شيء لذيذ للعشاء.'},
 {ref:'A2',prompt:'The refrigerator is empty. There is ___ to eat in here.',ar:'الثلاجة فارغة. لا يوجد شيء يؤكل هنا.'},
 {ref:'A3',prompt:'I haven’t made ___ special for supper. Make yourself a sandwich.',ar:'لم أعدّ شيئًا مميزًا للعشاء. أعدّ لنفسك شطيرة.'},
 {ref:'A4',prompt:'There’s ___ better than a nice cup of coffee after a meal.',ar:'لا شيء أفضل من فنجان قهوة لطيف بعد وجبة.'},
 {ref:'A5a',prompt:'Aren’t you having ___ for breakfast?',ar:'ألا تتناول أي شيء على الإفطار؟'},
 {ref:'A5b',prompt:'You should eat ___ in the morning. It isn’t good to go out on an empty stomach.',ar:'ينبغي أن تتناول شيئًا صباحًا. ليس جيدًا أن تخرج على معدة فارغة.'}
];
export const pizzaSteps=[
 {id:1,scene:'check',title:'أتحقق من المكونات',word:'Before',text:'Before you start, check that you have all the ingredients.',blank:'___ you start, check that you have all the ingredients.',ar:'قبل أن تبدأ، تحقق من وجود جميع المكونات.'},
 {id:2,scene:'dry',title:'أضع المكونات الجافة',word:'First',text:'First, put three cups of flour, one teaspoon of salt, and three teaspoons of baking powder into a bowl.',blank:'___, put three cups of flour, one teaspoon of salt, and three teaspoons of baking powder into a bowl.',ar:'أولًا، ضع ثلاثة أكواب من الدقيق وملعقة شاي من الملح وثلاث ملاعق شاي من مسحوق الخَبز في وعاء.'},
 {id:3,scene:'mix',title:'أضيف وأخلط',word:'Then',text:'Then add half a cup of milk, one tablespoon of margarine, and one egg, and mix them well to make the dough.',blank:'___ add half a cup of milk, one tablespoon of margarine, and one egg, and mix them well to make the dough.',ar:'ثم أضف نصف كوب حليب وملعقة طعام من السمن النباتي وبيضة، واخلط جيدًا لتكوين العجين.'},
 {id:4,scene:'rest',title:'أترك العجين 30 دقيقة',word:'After',text:'After you make the dough, let it stand for about 30 minutes.',blank:'___ you make the dough, let it stand for about 30 minutes.',ar:'بعد إعداد العجين، اتركه نحو 30 دقيقة.'},
 {id:5,scene:'check-dough',title:'أتحقق قبل الفرد',word:'Before',text:'Before you spread the dough, make sure it has risen enough.',blank:'___ you spread the dough, make sure it has risen enough.',ar:'قبل فرد العجين، تأكد أنه ارتفع بما يكفي.'},
 {id:6,scene:'spread',title:'أفرد العجين',word:'Then',text:'Then spread it evenly on the pan using your fingers.',blank:'___ spread it evenly on the pan using your fingers.',ar:'ثم افرده بالتساوي على صينية الخَبز باستخدام أصابعك.'},
 {id:7,scene:'oven',title:'أضيف التغطية وأخبز',word:'Finally',text:'Finally, cover it with cheese and tomato sauce and let it bake in a very hot oven for about 30 minutes.',blank:'___, cover it with cheese and tomato sauce and let it bake in a very hot oven for about 30 minutes.',ar:'أخيرًا، غطِّ العجين بالجبن وصلصة الطماطم واخبزه في فرن ساخن جدًا نحو 30 دقيقة.'}
];
export const quantityOverview=[['🥛','أعدّه أم أقيسه؟','Count & Noncount'],['🔢','كم يوجد؟','Quantity Words'],['🍽️','شيء أم لا شيء؟','Something / Anything / Nothing'],['🛒','نساعد منى ونورة','The Cake Conversation'],['🍕','نرتّب الوصفة','Sequence Words']];
