// Public learning support only. Canonical choices and answer keys stay in exam-prep-courses.ts.
export const EXAM_PREP_SECTION='exam-prep';
export const examUnits=[
 {id:'exam-prep-unit-1-grade-9',unit:1,title:'الوحدة الأولى · العادات والإنترنت',english:'Lifestyles & Internet Habits',topics:'المفردات · المضارع البسيط · الإملاء · القراءة',objectiveTotal:20,writingPoints:0,icon:'01'},
 {id:'exam-prep-unit-2-grade-9',unit:2,title:'الوحدة الثانية · قصة حياة',english:'Life Stories',topics:'المفردات · الماضي البسيط · القراءة · التعبير',objectiveTotal:14,writingPoints:6,icon:'02'},
 {id:'exam-prep-unit-3-grade-9',unit:3,title:'الوحدة الثالثة · السفر والخطط',english:'Travel & Future Plans',topics:'المفردات · المستمر والمستقبل · القراءة · البريد',objectiveTotal:15,writingPoints:5,icon:'03'},
] as const;
export const examUnit=(id:string)=>examUnits.find(u=>u.id===id);
export const isExamPrep=(id:string)=>!!examUnit(id);
export const examHubHref='/?grade=grade-9&section=exam-prep';
export type ExamPassage={title:string;paragraphs:string[];translation:string[];words:[string,string][]};
export const examPassages:Record<number,ExamPassage>={
 1:{title:'Internet Addiction Disorder',paragraphs:[
 'Most people like to use the Internet. They use it to check email, chat with friends, shop, and find information. But some people use the Internet too much. They become addicted to it. They spend so much time online that they don\'t do their homework and chores, and they stop spending time with their friends and family.',
 'Are you addicted to the Internet? Answer these questions about your online habits.',
 '1. Do you have more friends in real life or online?\n2. How many hours a day do you spend online?\n3. How do you feel when you can\'t connect to the Internet?\n4. Do you spend so much time online that you don\'t do your work or school work?\n5. Do you lose sleep because you are on the Internet late at night?\n6. Do your friends and family complain about the amount of time you spend online?',
 'Think about your answers. Do you think you spend too much time online? If so, try turning the computer off and spending more time in the real world. It is important to balance the time you spend on the computer with the time you spend enjoying other things in your life.'
 ],translation:[
 'يحب معظم الناس استخدام الإنترنت لتفقد البريد الإلكتروني، ومحادثة الأصدقاء، والتسوق، والبحث عن المعلومات. لكن بعضهم يستخدمه كثيرًا فيصبح مدمنًا عليه، وينشغل عن واجباته وأعمال المنزل، ويتوقف عن قضاء الوقت مع أصدقائه وأسرته.',
 'هل أنت مدمن على الإنترنت؟ فكّر في عاداتك: هل أصدقاؤك في الواقع أكثر أم عبر الإنترنت؟ كم ساعة تقضي يوميًا؟ كيف تشعر عند انقطاع الاتصال؟ هل يؤثر الإنترنت في دراستك أو نومك؟ وهل تشتكي أسرتك من طول الوقت الذي تقضيه عليه؟ هذه أسئلة للتفكير، وليست أسئلة الاختيار الخمسة.',
 'فكّر في إجاباتك. إذا كنت تقضي وقتًا طويلًا جدًا، فحاول إغلاق الحاسوب وقضاء وقت أطول في العالم الحقيقي. من المهم تحقيق التوازن بين وقت الحاسوب والأنشطة الأخرى في حياتك.'
 ],words:[['check email','يتفقد البريد الإلكتروني'],['chat','يدردش'],['addicted','مدمن'],['chores','أعمال منزلية'],['balance','يوازن']]},
 2:{title:'How I Met My Best Friend',paragraphs:[
 'Let me tell you how I met my best friend, Yousef. Yousef and I went to the same elementary school. Yousef was a new 6th grade student, and the teacher asked me to show him around during his first week. I agreed to help out, and we spent every day together.',
 'Yousef grew up in Abha, and his family moved when his father got a new job in Jeddah. He didn\'t know anyone, so I introduced him to my friends and classmates. At first he was quite shy, but then he grew more confident and joined in discussions.',
 'He was very interested in sports and asked lots of questions about the school football team. After school, he came with me to football practice. At first, he just watched, but then he wanted to play. He didn\'t play well at first, but he tried very hard. And now Yousef is the best player on the team!'
 ],translation:[
 'سأخبركم كيف تعرفت على صديقي المفضل يوسف. كنا في المدرسة الابتدائية نفسها. كان يوسف طالبًا جديدًا في الصف السادس، وطلب مني المعلم تعريفه بالمدرسة في أسبوعه الأول. وافقت، وأصبحنا نقضي كل يوم معًا.',
 'نشأ يوسف في أبها، وانتقلت أسرته حين حصل والده على وظيفة جديدة في جدة. لم يكن يعرف أحدًا، فعرفته على أصدقائي وزملائي. كان خجولًا في البداية، ثم أصبح أكثر ثقة وشارك في المناقشات.',
 'كان مهتمًا بالرياضة وسأل عن فريق كرة القدم المدرسي. بعد المدرسة جاء معي إلى التدريب. شاهد أولًا ثم أراد اللعب. لم يلعب جيدًا في البداية، لكنه اجتهد كثيرًا. والآن أصبح أفضل لاعب في الفريق!'
 ],words:[['grew up','نشأ / ترعرع'],['was born','وُلد'],['shy','خجول'],['confident','واثق'],['best player','أفضل لاعب']]},
 3:{title:'Advice to Travelers',paragraphs:[
 'Keep your belongings with you at all times to ensure their safety.',
 'Put a name tag on your suitcase to identify it.',
 'Do not agree to pack any items from strangers.',
 'Do not carry containers with liquids. Place liquids in your checked baggage.',
 'Always arrive at the airport at least two hours before departure to have extra time in case of long lines.',
 'Check that you have your photo identification (passport is required for international travel), ticket, and boarding pass with you to avoid difficulties.',
 'Check with your travel agent about visas and vaccinations for the countries you are visiting.',
 'Carry a major credit card.'
 ],translation:[
 'حافظ على متعلقاتك معك لضمان سلامتها، وضع بطاقة اسم على حقيبتك للتعرف عليها.',
 'لا توافق على وضع أشياء من أشخاص غرباء في أمتعتك. تذكر القطعة عدم حمل عبوات السوائل معك، ووضعها في الأمتعة المشحونة.',
 'احضر إلى المطار قبل المغادرة بساعتين على الأقل، وتأكد من حمل هوية بصورة وجواز السفر للسفر الدولي، والتذكرة، وبطاقة الصعود.',
 'استفسر من وكيل السفر عن التأشيرات والتطعيمات للبلدان التي ستزورها، واحمل بطاقة ائتمانية معروفة. هنا نفهم تعليمات القطعة للإجابة عن أسئلتها.'
 ],words:[['belongings','متعلقات شخصية'],['name tag','بطاقة اسم'],['strangers','غرباء'],['checked baggage','أمتعة مشحونة'],['photo identification','هوية تحمل صورة']]},
};
export const examVocabulary:Record<number,[string,string,string][]>={
 1:[['vegetarian','نباتي','A vegetarian does not eat meat.'],['metropolis','مدينة كبرى','Riyadh is a metropolis.'],['majority','الأغلبية؛ أكثر من النصف','The majority means more than half.'],['computer','حاسوب','I use my computer to check email.'],['internet addict','مدمن إنترنت','An internet addict spends too much time online.']],
 2:[['infant','رضيع / رضيعة','She was a tiny infant.'],['twins','توأمان','The twins were born last night.'],['athlete','رياضي','He is a successful athlete.'],['donate','يتبرع','He will donate blood.'],['award','جائزة','She won an award.']],
 3:[['passport','جواز سفر','May I see your passport?'],['surf','يركب الأمواج','I want to surf on the waves.'],['suitcase','حقيبة سفر','Put a name tag on your suitcase.'],['unique','فريد / مميز','Unique means special.'],['rich / wealthy','غني / ثري','Rich and wealthy have similar meanings.']],
};
export const examSourceNotes:Record<number,string>={
 2:'ورد في النموذج سؤال عن مكان ميلاد يوسف، لكن القطعة تذكر أنه نشأ في أبها ولا تحدد مكان ميلاده. لذلك صيغ سؤال التدريب: «أين نشأ يوسف؟». grew up لا تعني was born.',
};
export type WritingGuide={prompt:string;arabic:string;steps:{title:string;hint:string;example:string}[];model:string;checklist:string[]};
export const examWritingGuides:Record<number,WritingGuide>={
 2:{prompt:'Write your life story. Say where you were born, raised, and educated. Include important events, accomplishments, and influences in your life.',arabic:'اكتب قصة حياتك: مكان الميلاد والنشأة والدراسة، ثم أحداثًا مهمة وإنجازات وأشخاصًا أثروا في حياتك. غيّر بيانات النموذج لتعبّر عن نفسك.',steps:[
 {title:'١. الميلاد والنشأة',hint:'I was born مع مكان أو سنة، ثم I grew up لوصف النشأة.',example:'I was born in Riyadh in 2011. I grew up in Jeddah.'},
 {title:'٢. التعليم',hint:'استخدم الماضي مثل started أو studied للمرحلة التي بدأت في الماضي.',example:'I started school when I was six.'},
 {title:'٣. حدث وإنجاز',hint:'اربط الأحداث باستخدام When أو Last year، واذكر إنجازًا حقيقيًا لك.',example:'Last year, I joined a reading club and won a school award.'},
 {title:'٤. شخص أثّر فيك',hint:'اذكر من ساعدك وكيف، ثم اقرأ الجمل وتحقق من النقاط والحروف الكبيرة.',example:'My English teacher encouraged me to read more.'}
 ],model:'I was born in Riyadh in 2011. I grew up in Jeddah and started school when I was six. Last year, I joined a reading club and won a school award. My English teacher encouraged me to read more. I am proud of my progress, and I want to keep learning.',checklist:['ذكرت الميلاد والنشأة.','ذكرت الدراسة.','كتبت حدثًا وإنجازًا.','ذكرت شخصًا أثّر في حياتي.','راجعت الماضي وترتيب الأحداث.','بدأت الجمل بحرف كبير وأنهيتها بنقطة.']},
 3:{prompt:'Write an email to your friend about studying abroad describing your impressions, how you feel, and what you plan to do while you are there.',arabic:'اكتب بريدًا إلى صديق عن الدراسة في الخارج. صف انطباعك وشعورك وخططك أثناء وجودك هناك، مع تحية وبداية وخاتمة مناسبتين.',steps:[
 {title:'١. التحية والمكان',hint:'ابدأ باسم صديقك، ثم عرّفه بالمكان الذي تدرس فيه.',example:'Hi Ali,\nI am studying English in London.'},
 {title:'٢. الانطباع والشعور',hint:'استخدم صفات مثل exciting أو friendly، واكتب كيف تشعر.',example:'The city is exciting, and the people are friendly. I feel happy.'},
 {title:'٣. الخطة',hint:'استخدم am / is / are + going to + الفعل الأساسي لخطة تنوي تنفيذها.',example:'I am going to visit a museum and practice English with my classmates.'},
 {title:'٤. الخاتمة',hint:'اختم برسالة قصيرة واسمك، وراجع الفواصل والحروف الكبيرة.',example:'Write back soon!\nBest wishes,\nFahad'}
 ],model:'Hi Ali,\nI am studying English in London. The city is exciting, and the people are friendly. I feel happy, but I miss my family. I am going to visit a museum and practice English with my classmates.\nWrite back soon!\nBest wishes,\nFahad',checklist:['كتبت التحية واسم المرسل إليه.','وصفت المكان وانطباعي عنه.','وضحت شعوري.','ذكرت خطتي باستخدام تركيب صحيح.','كتبت خاتمة واسمي وراجعت علامات الترقيم.']},
};
