export type Support={summary:string;steps:{title:string;text:string}[];examples:{sentence:string;arabic:string}[];mistake:{wrong:string;right:string;reason:string};video:{id:string;title:string;focus:string}};
export const lessonSupport:Record<string,Support>={
'Simple Past':{
summary:'تخيّل أنك تحكي ما فعلته أمس. الحدث انتهى، لذلك تحتاج صيغة الماضي. لكن شكل الفعل يتغيّر بحسب كون الجملة إثباتًا أو نفيًا أو سؤالًا.',
steps:[{title:'أولًا: حدّد زمن الحدث',text:'كلمات مثل yesterday وlast week وago تساعدك على معرفة أن الحدث وقع في الماضي.'},{title:'في الإثبات: غيّر الفعل',text:'الفعل المنتظم يأخذ غالبًا ‎-ed، مثل visit → visited. بعض الأفعال غير منتظمة، مثل go → went وwear → wore.'},{title:'في السؤال والنفي: did تحمل معنى الماضي',text:'بعد did أو didn’t يعود الفعل الأساسي: go وليس went. لا نضع علامة الماضي على الفعل مرة ثانية. أما be فنستخدم معه was أو were مباشرة.'}],
examples:[{sentence:'She visited her friend yesterday.',arabic:'زارت صديقتها أمس. جملة مثبتة: visited في الماضي.'},{sentence:'Did she visit her friend yesterday?',arabic:'هل زارت صديقتها أمس؟ استخدمنا did، فعاد الفعل إلى visit.'},{sentence:'She didn’t visit her friend yesterday.',arabic:'لم تزر صديقتها أمس. بعد didn’t نستخدم visit.'}],
mistake:{wrong:'Did you went to school?',right:'Did you go to school?',reason:'did تدل على الماضي، لذلك يأتي بعدها الفعل الأساسي go.'},
video:{id:'lHzZVybA5Ao',title:'شرح الماضي البسيط بالعربية · Sbeata Academy',focus:'راجع طريقة استخدام الماضي البسيط، ثم قارن جملة الإثبات بالسؤال والنفي.'}},
'Be + Born':{
summary:'عندما تقول «وُلدت»، فالإنجليزية تحتاج فعلين معًا: was / were ثم born. اختر was أو were بحسب الفاعل، ثم اذكر المكان أو التاريخ.',
steps:[{title:'اختر الفعل المناسب للفاعل',text:'I / he / she / it مع was، وyou / we / they مع were. كلمة you تستخدم were حتى عند الحديث إلى شخص واحد.'},{title:'أضف born كما هي',text:'نقول I was born، وThey were born. لا نستخدم did born، ولا نضيف ‎-ed إلى born.'},{title:'ضع السؤال بالطريقة الصحيحة',text:'للسؤال، قدّم was أو were على الفاعل: Where were you born? وللمكان نستخدم in، وللسنة in، ولتاريخ محدد on.'}],
examples:[{sentence:'I was born in Riyadh in 2010.',arabic:'وُلدت في الرياض عام ٢٠١٠. استخدمنا in للمكان وللسنة.'},{sentence:'The twins were born on June 21st.',arabic:'وُلد التوأمان في ٢١ يونيو. الجمع يأخذ were، والتاريخ المحدد يأخذ on.'},{sentence:'Where was she born?',arabic:'أين وُلدت؟ قدّمنا was قبل she.'}],
mistake:{wrong:'I born in Jeddah.',right:'I was born in Jeddah.',reason:'born تحتاج هنا was أو were قبلها؛ ومع I نستخدم was.'},
video:{id:'3gEqv3yhHsg',title:'تمهيد بالعربية: was وwere في الإثبات والنفي والسؤال',focus:'هذا المقطع يشرح was وwere. طبّق المطابقة نفسها عند إضافة born، ثم راجع أمثلة الميلاد أعلاه.'}},
'Past Passive':{
summary:'في الجملة العادية نهتم بمن قام بالفعل. في المبني للمجهول نبدأ بالشخص أو الشيء الذي وقع عليه الفعل؛ مثل مدرسة بُنيت أو رسالة كُتبت.',
steps:[{title:'غيّر مركز الاهتمام',text:'في People built the school نتحدث عمن بنى المدرسة. في The school was built يصبح التركيز على المدرسة.'},{title:'اختر was أو were',text:'المدرسة مفرد، فنستخدم was. المدارس جمع، فنستخدم were: The schools were built.'},{title:'استخدم التصريف الثالث',text:'بعد was / were نحتاج التصريف الثالث: write → wrote → written. لذلك نقول was written، لا was wrote. ويمكن ذكر من قام بالفعل باستخدام by.'}],
examples:[{sentence:'People built the school in 2007.',arabic:'بنى الناس المدرسة في عام ٢٠٠٧. الجملة تبدأ بمن قام بالفعل.'},{sentence:'The school was built in 2007.',arabic:'بُنيت المدرسة في عام ٢٠٠٧. الجملة تبدأ بما وقع عليه الفعل.'},{sentence:'The letters were written yesterday.',arabic:'كُتبت الرسائل أمس. letters جمع، لذلك استخدمنا were ثم written.'}],
mistake:{wrong:'The letter was wrote yesterday.',right:'The letter was written yesterday.',reason:'المبني للمجهول يحتاج was / were + التصريف الثالث. written هو التصريف الثالث، وwrote هو الماضي البسيط.'},
video:{id:'F4wdW3fsOgc',title:'شرح المبني للمجهول في الماضي البسيط · EGL4Arab',focus:'لاحظ تركيب was / were + التصريف الثالث، وكيف ينتقل التركيز إلى الشيء الذي وقع عليه الفعل.'}},
'Used to':{
summary:'تخيّل صورة من طفولتك: عادة كنت تفعلها، أو حالة كانت صحيحة في الماضي ولم تعد كذلك الآن. هذا هو استخدام used to.',
steps:[{title:'عادة قديمة أو حالة سابقة',text:'I used to play with toys تعني أن اللعب بالألعاب كان عادة في الماضي. أما I played yesterday فتحكي عن حدث وقع أمس.'},{title:'في الإثبات نكتب used to',text:'نستخدم used to ثم الفعل الأساسي: used to play، وليس used to played.'},{title:'بعد did أو didn’t نكتب use to',text:'في السؤال والنفي نحذف d من used: Did you use to…? / I didn’t use to… . وانتبه: I am used to playing تعني أنني معتاد على اللعب، وهو تركيب مختلف.'}],
examples:[{sentence:'I used to walk to school, but now I take the bus.',arabic:'كنت أذهب إلى المدرسة مشيًا، لكنني الآن أركب الحافلة.'},{sentence:'I didn’t use to like coffee.',arabic:'لم أكن أحب القهوة في الماضي.'},{sentence:'Did you use to live in Abha?',arabic:'هل كنت تعيش في أبها في الماضي؟'}],
mistake:{wrong:'Did you used to play football?',right:'Did you use to play football?',reason:'بعد did نستخدم use to دون d. ويأتي play في صورته الأساسية.'},
video:{id:'oWADfQKNUew',title:'شرح used to: العادات السابقة بالعربية',focus:'ركّز على معنى العادة السابقة، ثم على الفرق بين used to في الإثبات وuse to بعد did.'}},
'Life Stories Practice':{
summary:'اقرأ القصة كأنك تروي يوم تعرّفك إلى صديق. الأحداث انتهت، فتحتاج الماضي البسيط. ابدأ بالمعنى، ثم اختر شكل الفعل المناسب.',
steps:[{title:'صنّف الفعل قبل الإجابة',text:'أفعال منتظمة: ask → asked، move → moved، watch → watched. أفعال غير منتظمة: meet → met، spend → spent، come → came.'},{title:'انتبه لتغيّر نهاية الكلمة',text:'agree ينتهي بـ e، فنضيف d فقط: agreed. وفي try نحول y إلى i بعد الحرف الساكن، ثم نضيف ‎-ed: tried.'},{title:'افحص النفي أولًا',text:'عندما تجد not في الفعل المطلوب، فكّر في didn’t + الفعل الأساسي: didn’t know وdidn’t play.'}],
examples:[{sentence:'I met my friend at school.',arabic:'تعرّفت إلى صديقي في المدرسة. الماضي من meet هو met.'},{sentence:'We spent every day together.',arabic:'كنا نقضي كل يوم معًا. الماضي من spend هو spent.'},{sentence:'He didn’t know anyone, so I introduced him to my friends.',arabic:'لم يكن يعرف أحدًا، لذلك عرّفته إلى أصدقائي. know بعد didn’t، وintroduced في الإثبات.'}],
mistake:{wrong:'He didn’t knew anyone.',right:'He didn’t know anyone.',reason:'بعد didn’t نحتاج الفعل الأساسي know؛ لا نستخدم knew معه.'},
video:{id:'lHzZVybA5Ao',title:'مراجعة الماضي البسيط بالعربية · Sbeata Academy',focus:'راجع الماضي البسيط إذا توقفت عند تصريف فعل أو صيغة نفي في القصة.'}}
};
