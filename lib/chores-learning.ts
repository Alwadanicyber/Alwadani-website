// Public study material. Graded exercise answers stay in the server course definition.
export const CHORES_COURSE_ID='chores-grade-4';
export type ChoresWord={en:string;ar:string;icon:string;group:'morning'|'bus'|'home';example:string;translation:string;tip:string};
export const choresWords:ChoresWord[]=[
 {en:'wake up',ar:'أستيقظ',icon:'☀️',group:'morning',example:'I wake up at five o’clock.',translation:'أستيقظ الساعة الخامسة.',tip:'أفتح عيني بعد النوم. يمكن أن أبقى في السرير.'},
 {en:'get up',ar:'أنهض من السرير',icon:'🛏️',group:'morning',example:'I get up at 5:15.',translation:'أنهض من السرير الساعة الخامسة والربع.',tip:'أترك السرير. الاستيقاظ wake up قد يحدث قبل النهوض get up.'},
 {en:'get dressed',ar:'أرتدي ملابسي',icon:'👕',group:'morning',example:'I get dressed in my favorite clothes.',translation:'أرتدي ملابسي المفضلة.',tip:'dressed تعني أنني أصبحت مرتديًا ملابسي، وليس أنني أخلعها.'},
 {en:'get undressed',ar:'أخلع ملابسي',icon:'🧺',group:'morning',example:'I get undressed before bed.',translation:'أخلع ملابسي قبل النوم.',tip:'undressed عكس dressed. في القصة نخلع الملابس لتغييرها إلى ملابس العمل في الحديقة.'},
 {en:'catch the bus',ar:'ألحق بالحافلة',icon:'🏃',group:'bus',example:'Hurry up! Catch the bus at nine.',translation:'أسرع! الحق بالحافلة الساعة التاسعة.',tip:'catch the bus تعني الوصول إلى الحافلة في موعدها؛ لا تعني إمساكها باليد.'},
 {en:'get on the bus',ar:'أصعد إلى الحافلة',icon:'🚌',group:'bus',example:'I get on the bus at the bus stop.',translation:'أصعد إلى الحافلة عند موقف الحافلات.',tip:'on للصعود إلى الحافلة، وoff للنزول منها. نحفظ العبارة كاملة.'},
 {en:'ride on the bus',ar:'أستقل الحافلة',icon:'🎫',group:'bus',example:'It’s a short ride on the bus.',translation:'إنها رحلة قصيرة بالحافلة.',tip:'ride تعني الركوب أو رحلة الركوب. get on هو لحظة الصعود، وride هو التنقل بالحافلة.'},
 {en:'get off the bus',ar:'أنزل من الحافلة',icon:'🚏',group:'bus',example:'I get off the bus at school.',translation:'أنزل من الحافلة عند المدرسة.',tip:'off تعني النزول من وسيلة النقل هنا. لا تخلطها مع on.'},
 {en:'comic book',ar:'كتاب قصص مصوّرة',icon:'📖',group:'bus',example:'I read my comic book on the bus.',translation:'أقرأ كتاب القصص المصوّرة في الحافلة.',tip:'قصة تُروى بالرسوم والحوار. comic book كلمتان.'},
 {en:'grandparents',ar:'الجد والجدة',icon:'👵',group:'home',example:'I visit my grandparents.',translation:'أزور جدي وجدتي.',tip:'grandpa = جدي، grandma = جدتي، grandparents = الجد والجدة معًا.'},
 {en:'leaves',ar:'أوراق الشجر',icon:'🍃',group:'home',example:'We collect the leaves.',translation:'نجمع أوراق الشجر.',tip:'leaf ورقة شجر واحدة، وجمعها leaves. ليست أوراق الكتاب.'},
 {en:'trash can',ar:'سلة المهملات',icon:'🗑️',group:'home',example:'Put the leaves in the trash can.',translation:'ضع أوراق الشجر في سلة المهملات.',tip:'trash = نفايات. trash can هنا اسم لسلة المهملات، وليس جملة عن القدرة.'},
 {en:'flowers',ar:'الأزهار',icon:'🌷',group:'home',example:'I water the flowers.',translation:'أسقي الأزهار.',tip:'water اسم يعني الماء، وفعل يعني يسقي؛ water the flowers = يسقي الأزهار.'},
 {en:'chores',ar:'الأعمال المنزلية',icon:'🏡',group:'home',example:'I help with the chores.',translation:'أساعد في الأعمال المنزلية.',tip:'أعمال نقوم بها للمساعدة، مثل جمع الأوراق وترتيب المكان وسقي الأزهار.'}
];
export const extraChoresWords=[
 ['Mom','أمي'],['kid','طفل'],['come on','هيا'],['time to get out of bed','حان وقت ترك السرير'],['eat','يتناول / يأكل'],['big','كبير'],['need','يحتاج'],['running','يركض / أركض في سياق I am running'],['feel','يشعر'],['a great day','يوم رائع'],['park','حديقة / منتزه'],['in front of','أمام'],['number','رقم'],['makes me breakfast','يعدّ لي الإفطار'],['on the bus','في الحافلة'],['at five o’clock','في الساعة الخامسة'],['I’m','أنا — اختصار I am'],['their','خاص بهم / بهما'],['sorry','آسف'],
 ['grandpa','الجد / جدي'],['grandma','الجدة / جدتي'],['superhero','بطل خارق'],['superheroes','أبطال خارقون'],['fun','ممتع'],['hurry up','أسرع'],['tomorrow','غدًا'],['the next morning','صباح اليوم التالي'],['a short ride','رحلة قصيرة'],['put on','يرتدي / يلبس'],['gardening clothes','ملابس العمل في الحديقة'],['collect','يجمع'],['put','يضع'],['help at home','يساعد في المنزل'],['bus stop','موقف الحافلات'],['bus driver','سائق الحافلة'],['breakfast','وجبة الإفطار'],['take a shower','يستحم'],['brush my teeth','أنظّف أسناني'],['go to bed','أذهب إلى النوم'],['in the morning','في الصباح'],['in the afternoon','بعد الظهر'],['in the evening','في المساء'],['favorite clothes','الملابس المفضلة'],['classes','حصص دراسية'],['yard','فناء المنزل'],['clean the yard','ينظّف الفناء'],['usually','عادةً'],['sometimes','أحيانًا'],['before','قبل'],['finally','أخيرًا'],['wait','ينتظر'],['late','متأخر'],['perfect school day','يوم مدرسي مثالي']
];
export const choresDialogue=[
 ['This superhero comic book is fun!','كتاب القصص المصوّرة عن البطل الخارق ممتع!'],
 ['Grandpa and grandma are my superheroes!','جدي وجدتي هما بطلاي الخارقان!'],
 ['Get on the 54 bus to go to your grandparents’ tomorrow.','اصعد إلى الحافلة رقم 54 لتذهب إلى منزل جدك وجدتك غدًا.'],
 ['Where do we get off? — At the park. It’s a short ride.','أين ننزل؟ — عند الحديقة. إنها رحلة قصيرة.'],
 ['Hurry up! You need to catch the bus at nine!','أسرع! عليك أن تلحق بالحافلة الساعة التاسعة!'],
 ['I’m waking up, Mom! — What? Get up now!','أنا أستيقظ يا أمي! — ماذا؟ انهض من السرير الآن!'],
 ['Get undressed. Put your gardening clothes on.','اخلع ملابسك. ارتدِ ملابس العمل في الحديقة.'],
 ['Sorry, I’m getting dressed now!','آسف، أنا أرتدي ملابسي الآن!'],
 ['Can we collect leaves? — We can put them in the trash can.','هل يمكننا جمع أوراق الشجر؟ — يمكننا وضعها في سلة المهملات.'],
 ['How do you help at home?','كيف تساعد في المنزل؟']
];
export const perfectSchoolDay=[
 ['I wake up at five o’clock and read in bed.','أستيقظ الساعة الخامسة وأقرأ في السرير.'],
 ['I get up at 5:30 and get dressed in my favorite clothes.','أنهض من السرير الساعة الخامسة والنصف وأرتدي ملابسي المفضلة.'],
 ['At six o’clock, my mom makes me breakfast, then I go to school.','في الساعة السادسة، تعدّ أمي لي الإفطار، ثم أذهب إلى المدرسة.'],
 ['I get on the bus in front of my house and get off the bus in front of my school.','أصعد إلى الحافلة أمام منزلي وأنزل منها أمام مدرستي.'],
 ['I have three classes at school, then I catch the number 54 bus to the park.','لدي ثلاث حصص في المدرسة، ثم ألحق بالحافلة رقم 54 إلى الحديقة.'],
 ['On the bus, I read my favorite comic book.','في الحافلة، أقرأ كتاب القصص المصوّرة المفضل لديّ.'],
 ['In the afternoon, I play with my friends or visit my grandparents and water the flowers and clean their yard.','بعد الظهر، ألعب مع أصدقائي أو أزور جدي وجدتي وأسقي الأزهار وأنظّف فناء منزلهما.'],
 ['In the evening, I get undressed and go to bed at eight o’clock.','في المساء، أخلع ملابسي وأذهب إلى النوم الساعة الثامنة.']
];
export const balloonWords=choresWords.slice(0,12);
export type BalloonRound={word:ChoresWord;options:ChoresWord[]};
export type BalloonRun={lives:number;score:number;popped:string[];feedback:'correct'|'wrong'|null;status:'playing'|'lost'|'won'};
export const initialBalloonRun:BalloonRun={lives:3,score:0,popped:[],feedback:null,status:'playing'};
export function shuffleItems<T>(items:readonly T[],random= Math.random):T[]{const result=[...items];for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;}
export function makeBalloonRounds(random=Math.random):BalloonRound[]{return shuffleItems(balloonWords,random).map(word=>({word,options:shuffleItems([word,...shuffleItems(balloonWords.filter(w=>w.en!==word.en),random).slice(0,3)],random)}));}
export function popBalloon(state:BalloonRun,round:BalloonRound,selected:string,total:number):BalloonRun{
 if(state.status!=='playing'||state.feedback==='correct'||state.popped.includes(selected)||!round.options.some(w=>w.en===selected))return state;
 const popped=[...state.popped,selected];
 if(selected===round.word.en){const score=state.score+1;return {...state,popped,score,feedback:'correct',status:score===total?'won':'playing'};}
 const lives=state.lives-1;return {...state,popped,lives,feedback:'wrong',status:lives===0?'lost':'playing'};
}
