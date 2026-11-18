export type ReadingChapter = {id:number;title:string;en:string;page:number;goal:string;patterns:{pattern:string;words:string;tip:string}[];note:string;passages:{title:string;text:string;page:number}[];sh:string;quiz:{word:string;prompt:string;options:string[];answer:number;reason:string}[]};
export const readingChapters:ReadingChapter[] = [
  {
    "id": 1,
    "title": "الحروف وأصواتها",
    "en": "Letters & sounds",
    "page": 2,
    "goal": "ميّز اسم الحرف عن صوته، واقرأ الحروف الكبيرة والصغيرة. استخدم صوت الحرف عند الدمج، دون إضافة حركة بعد كل ساكن.",
    "patterns": [
      {
        "pattern": "A–G",
        "words": "ant bat cat dog egg fan gap",
        "tip": "A /æ/ · B /b/ · C /k/ · D /d/ · E /e/ · F /f/ · G /ɡ/"
      },
      {
        "pattern": "H–M",
        "words": "hat in jam kid leg map",
        "tip": "H /h/ · I /ɪ/ · J /dʒ/ · K /k/ · L /l/ · M /m/"
      },
      {
        "pattern": "N–T",
        "words": "net ox pen quit red sun top",
        "tip": "N /n/ · O /ɑ/ · P /p/ · qu /kw/ · R /r/ · S /s/ · T /t/"
      },
      {
        "pattern": "U–Z",
        "words": "up van wet box yes zip",
        "tip": "U /ʌ/ · V /v/ · W /w/ · X /ks/ في box · Y /j/ · Z /z/"
      }
    ],
    "note": "الحروف قد يكون لها أكثر من صوت. هذه أمثلة أولية، والرموز الصوتية للمعلم. النطق هنا أمريكي؛ لا نعتمد على الكتابة العربية وحدها.",
    "passages": [
      {
        "title": "Sam Can Read",
        "text": "Sam sat. Sam can sit. Sam can run.",
        "page": 4
      }
    ],
    "sh": "Sh! A fish! A fish is in a dish. Sh! Sh!",
    "quiz": [
      {
        "word": "map",
        "prompt": "كيف ننطق كلمة map؟",
        "options": [
          "map",
          "cap",
          "tap"
        ],
        "answer": 0,
        "reason": "map تبدأ بصوت /m/؛ cap تبدأ بـ /k/ وtap بـ /t/."
      },
      {
        "word": "bat",
        "prompt": "كيف ننطق كلمة bat؟",
        "options": [
          "pat",
          "bat",
          "bad"
        ],
        "answer": 1,
        "reason": "bat /bæt/ تبدأ بـ /b/ وتنتهي بـ /t/. اسمع الفرق بين b وp وبين t وd."
      },
      {
        "word": "sun",
        "prompt": "كيف ننطق كلمة sun؟",
        "options": [
          "sand",
          "sin",
          "sun"
        ],
        "answer": 2,
        "reason": "sun /sʌn/ فيها u قصيرة /ʌ/، وليست i القصيرة في sin."
      }
    ]
  },
  {
    "id": 2,
    "title": "حرفان وصوت واحد",
    "en": "Digraphs",
    "page": 8,
    "goal": "اقرأ الحرفين معًا كوحدة صوتية. قارن sh في ship مع ch في chip، ثم استمع إلى صوتي th.",
    "patterns": [
      {
        "pattern": "sh · ch",
        "words": "ship fish chip chin",
        "tip": "sh /ʃ/ مثل ش؛ ch /tʃ/."
      },
      {
        "pattern": "th",
        "words": "thin bath this that",
        "tip": "th /θ/ في thin و/ð/ في this."
      },
      {
        "pattern": "ph · wh",
        "words": "phone photo when which",
        "tip": "ph /f/؛ wh /w/ في هذا النموذج."
      },
      {
        "pattern": "ck · ng",
        "words": "duck sock sing ring",
        "tip": "ck /k/؛ ng /ŋ/ دون g منفصلة في sing."
      },
      {
        "pattern": "ff · ll · ss · zz",
        "words": "off puff bell hill kiss mess buzz fizz",
        "tip": "الحرف المكرر هنا لا يعني نطق الصوت مرتين."
      }
    ],
    "note": "قل sh بهواء مستمر دون إضافة حركة. تدريب she sells الأصعب أدناه للترديد بمساعدة المعلم، وليس اختبار سرعة.",
    "passages": [
      {
        "title": "A Fish in a Shop",
        "text": "This fish is in a shop. A duck is on a rock. A thin chick can sing.",
        "page": 10
      }
    ],
    "sh": "She sells seashells by the seashore. She has a shell in a dish. A fish swims by the shore.",
    "quiz": [
      {
        "word": "she",
        "prompt": "كيف ننطق كلمة she؟",
        "options": [
          "see",
          "she",
          "tea"
        ],
        "answer": 1,
        "reason": "she /ʃiː/ تبدأ بـ sh /ʃ/؛ see /siː/ تبدأ بـ /s/؛ tea /tiː/ تبدأ بـ /t/."
      },
      {
        "word": "chip",
        "prompt": "كيف ننطق كلمة chip؟",
        "options": [
          "ship",
          "tip",
          "chip"
        ],
        "answer": 2,
        "reason": "chip /tʃɪp/ تبدأ بـ ch /tʃ/؛ ship تبدأ بـ sh /ʃ/."
      },
      {
        "word": "thin",
        "prompt": "كيف ننطق كلمة thin؟",
        "options": [
          "thin",
          "sin",
          "tin"
        ],
        "answer": 0,
        "reason": "thin /θɪn/ تبدأ بـ th /θ/؛ يمر الهواء بين طرف اللسان والأسنان."
      }
    ]
  },
  {
    "id": 3,
    "title": "حروف العلة الثنائية والمركّبة",
    "en": "Vowel digraphs & teams",
    "page": 21,
    "goal": "ابدأ بحروف العلة الثنائية مثل ee وea وai وoa. قد تعطي كتابات مختلفة الصوت نفسه، وقد تعطي الحروف نفسها أصواتًا مختلفة. ثم قارن التركيبات الأطول مثل igh وeigh.",
    "patterns": [
      {
        "pattern": "Long E",
        "words": "feet green seat leaf key monkey",
        "tip": "ee وea وey تعطي /iː/ في هذه الأمثلة."
      },
      {
        "pattern": "Long A",
        "words": "rain train day play vein veil eight weight break steak",
        "tip": "ai وay وei وeigh وea في هذه الكلمات تعطي /eɪ/."
      },
      {
        "pattern": "Long I",
        "words": "pie tie light night my fly type style",
        "tip": "ie وigh وy وy_e في هذه الكلمات تعطي /aɪ/."
      },
      {
        "pattern": "Long O",
        "words": "boat coat snow grow toe hoe",
        "tip": "oa وow وoe تعطي /oʊ/ هنا."
      },
      {
        "pattern": "More long vowels",
        "words": "blue glue new few these theme field chief flute rule",
        "tip": "ue وew وe_e وie وu_e لها أمثلة مختلفة. blue /uː/، few /juː/."
      },
      {
        "pattern": "oo · ea",
        "words": "boot moon book foot head bread",
        "tip": "oo /uː/ في moon و/ʊ/ في book؛ ea /e/ في head."
      },
      {
        "pattern": "oi · oy · ou · ow · au · aw",
        "words": "coin oil boy toy out cloud cow brown sauce August saw law",
        "tip": "oi وoy /ɔɪ/؛ ou وow /aʊ/ هنا؛ au وaw تختلف قليلًا باختلاف اللهجة."
      },
      {
        "pattern": "ou alternatives",
        "words": "young touch soup group could would",
        "tip": "ou /ʌ/ في young؛ /uː/ في soup؛ /ʊ/ في could. تعلّم الكلمة بنطقها."
      }
    ],
    "note": "لا توجد قاعدة قصيرة تضمن نطق كل ou. في igh لا تُسمع gh، لكن ذلك لا يعمم على ghost أو enough. في /reading/reading-guide.pdf الصفحات ٢١–٣١ تجد الجداول والتطبيقات المصورة.",
    "passages": [
      {
        "title": "A Leaf and a Seat",
        "text": "A monkey can see a green leaf. A train is on the way. A veil is on a seat.",
        "page": 22
      },
      {
        "title": "At Night",
        "text": "At night, I can see snow on the road. I sit at home with a pie. I tap my toe and wait. I can eat at eight.",
        "page": 25
      },
      {
        "title": "A Blue Book",
        "text": "I have a blue book. I read it in my room. I eat bread and chew fruit. I look at the moon.",
        "page": 28
      },
      {
        "title": "A Boy and a Toy",
        "text": "A boy has a toy cow and a coin. He is out with Dad. He can draw a cloud. Dad has sauce in a pot.",
        "page": 31
      }
    ],
    "sh": "She sells seashells by the seashore. The sheep sleeps near a green tree. She sees a boat on the blue sea.",
    "quiz": [
      {
        "word": "book",
        "prompt": "كيف ننطق كلمة book؟",
        "options": [
          "boot",
          "back",
          "book"
        ],
        "answer": 2,
        "reason": "book /bʊk/ فيها oo القصيرة /ʊ/؛ boot فيها /uː/."
      },
      {
        "word": "snow",
        "prompt": "كيف ننطق كلمة snow؟",
        "options": [
          "snow",
          "now",
          "saw"
        ],
        "answer": 0,
        "reason": "snow /snoʊ/ تبدأ بـ sn وفيها ow /oʊ/؛ now فيها /aʊ/."
      },
      {
        "word": "bread",
        "prompt": "كيف ننطق كلمة bread؟",
        "options": [
          "breed",
          "bread",
          "broad"
        ],
        "answer": 1,
        "reason": "bread /brɛd/ فيها ea /ɛ/ مثل e في pen، وليست /iː/ في breed."
      },
      {
        "word": "soup",
        "prompt": "كيف ننطق كلمة soup؟",
        "options": [
          "soap",
          "sip",
          "soup"
        ],
        "answer": 2,
        "reason": "soup /suːp/ فيها ou /uː/؛ soap فيها /oʊ/."
      },
      {
        "word": "night",
        "prompt": "كيف ننطق كلمة night؟",
        "options": [
          "night",
          "net",
          "neat"
        ],
        "answer": 0,
        "reason": "night /naɪt/ فيها igh /aɪ/، وgh صامتة."
      }
    ]
  },
  {
    "id": 4,
    "title": "العلة القصيرة والدمج",
    "en": "Short vowels & blending",
    "page": 5,
    "goal": "انظر إلى حرف العلة في الوسط. انطق الأصوات من اليسار إلى اليمين، ثم صِلها لتقرأ الكلمة.",
    "patterns": [
      {
        "pattern": "a · e",
        "words": "cat map hat pen bed red",
        "tip": "a /æ/ كما في cat؛ e /e/ كما في pen."
      },
      {
        "pattern": "i · o · u",
        "words": "sit pin pig hot pot top cup sun run",
        "tip": "i /ɪ/ · o /ɑ/ في النموذج الأمريكي · u /ʌ/."
      },
      {
        "pattern": "Blend",
        "words": "map sat pin cup",
        "tip": "m + a + p → map. قل الأصوات، وليس أسماء الحروف."
      }
    ],
    "note": "تدرّب على pan ثم pen ثم pin: تغيير حرف العلة يغيّر الصوت والكلمة.",
    "passages": [
      {
        "title": "Three Little Actions",
        "text": "Sam can sit. Ben can hop. Mum can run.",
        "page": 7
      }
    ],
    "sh": "A fish can sit in a dish. A fish can swish. Sh! Sh!",
    "quiz": [
      {
        "word": "cat",
        "prompt": "كيف ننطق كلمة cat؟",
        "options": [
          "cut",
          "cat",
          "cot"
        ],
        "answer": 1,
        "reason": "cat /kæt/ فيها /æ/؛ cut /kʌt/ فيها /ʌ/؛ cot /kɑt/ فيها /ɑ/ بالنطق الأمريكي."
      },
      {
        "word": "pen",
        "prompt": "كيف ننطق كلمة pen؟",
        "options": [
          "pan",
          "pin",
          "pen"
        ],
        "answer": 2,
        "reason": "pen /pɛn/ فيها e قصيرة؛ pan /pæn/ وpin /pɪn/ مختلفتان."
      },
      {
        "word": "cup",
        "prompt": "كيف ننطق كلمة cup؟",
        "options": [
          "cup",
          "cap",
          "cop"
        ],
        "answer": 0,
        "reason": "cup /kʌp/ فيها /ʌ/؛ ركز على صوت العلة في الوسط."
      }
    ]
  },
  {
    "id": 5,
    "title": "الأصوات المتجاورة",
    "en": "Consonant blends",
    "page": 11,
    "goal": "في التجمعات الساكنة نسمع الأصوات المتجاورة ونصلها دون حركة زائدة. بخلاف sh، نحتفظ بصوت كل حرف في pl.",
    "patterns": [
      {
        "pattern": "st · bl · tr · pl",
        "words": "stop star black blue tree train play plane plan",
        "tip": "p + l + a + n → plan."
      },
      {
        "pattern": "sl · sn · dr · gr",
        "words": "slip sled snap snack drip drop grin grab",
        "tip": "انطق كل ساكن ثم صِله بحرف العلة."
      },
      {
        "pattern": "sm · sw · pr",
        "words": "smell smile swim swan press print",
        "tip": "s + w + i + m → swim."
      },
      {
        "pattern": "qu · nk",
        "words": "quick queen sink bank",
        "tip": "qu /kw/؛ nk /ŋk/ في هذه الكلمات."
      }
    ],
    "note": "بعض الأمثلة مثل plane وblue تحوي حركات ستتعلمها لاحقًا؛ استمع لها أولًا. ابدأ بالتدريب على plan وstop وslip.",
    "passages": [
      {
        "title": "Sam Has a Plan",
        "text": "Sam has a plan. He can go in a black truck. He is quick, but he can stop. He can stop at the bank.",
        "page": 14
      }
    ],
    "sh": "A ship stops by the shore. A small fish swims. She spots a shell on the sand.",
    "quiz": [
      {
        "word": "plan",
        "prompt": "كيف ننطق كلمة plan؟",
        "options": [
          "pan",
          "play",
          "plan"
        ],
        "answer": 2,
        "reason": "plan /plæn/ تحتفظ بصوتي p وl. لا نحذف l فنقول pan."
      },
      {
        "word": "stop",
        "prompt": "كيف ننطق كلمة stop؟",
        "options": [
          "stop",
          "top",
          "shop"
        ],
        "answer": 0,
        "reason": "stop /stɑp/ تبدأ بصوتي s وt. top تحذف s، وshop تبدأ بـ sh."
      },
      {
        "word": "grin",
        "prompt": "كيف ننطق كلمة grin؟",
        "options": [
          "green",
          "grin",
          "grain"
        ],
        "answer": 1,
        "reason": "grin /ɡrɪn/ تبدأ بصوتي g وr، وفيها i قصيرة."
      }
    ]
  },
  {
    "id": 6,
    "title": "الحرف e الصامت",
    "en": "Magic E",
    "page": 15,
    "goal": "قارن الكلمة القصيرة بالكلمة التي أضيفت إليها e. غالبًا يتغير صوت العلة إلى اسمه، ولا ننطق e الأخيرة.",
    "patterns": [
      {
        "pattern": "a_e · i_e",
        "words": "cap cape kit kite",
        "tip": "cap → cape؛ kit → kite."
      },
      {
        "pattern": "o_e · u_e",
        "words": "hop hope cub cube not note cut cute",
        "tip": "o تعمل أيضًا مع e الصامتة: hop → hope."
      },
      {
        "pattern": "Exceptions",
        "words": "love some have give",
        "tip": "كلمات خاصة: love /lʌv/؛ some /sʌm/؛ have /hæv/؛ give /ɡɪv/."
      }
    ],
    "note": "هذه قاعدة شائعة وليست مطلقة. u_e قد تعطي /juː/ في cube أو /uː/ في flute.",
    "passages": [
      {
        "title": "Mike and a Cape",
        "text": "Mike has a red cape. He has a cube in a bag. He can ride a bike home. I love his cape.",
        "page": 17
      }
    ],
    "sh": "She has a shell and a red cape. She can make a shape in the sand. A fish swims by.",
    "quiz": [
      {
        "word": "cape",
        "prompt": "كيف ننطق كلمة cape؟",
        "options": [
          "cape",
          "cap",
          "cup"
        ],
        "answer": 0,
        "reason": "cape /keɪp/ فيها a طويلة بسبب e الصامتة؛ cap فيها a قصيرة."
      },
      {
        "word": "kite",
        "prompt": "كيف ننطق كلمة kite؟",
        "options": [
          "kit",
          "cut",
          "kite"
        ],
        "answer": 2,
        "reason": "kite /kaɪt/ فيها /aɪ/؛ لا تُنطق e الأخيرة."
      },
      {
        "word": "hope",
        "prompt": "كيف ننطق كلمة hope؟",
        "options": [
          "hop",
          "hope",
          "hoop"
        ],
        "answer": 1,
        "reason": "hope /hoʊp/ فيها /oʊ/؛ hop فيها o قصيرة، وhoop فيها /uː/."
      }
    ]
  },
  {
    "id": 7,
    "title": "أصوات C وG",
    "en": "Soft C & G",
    "page": 18,
    "goal": "انظر إلى الحرف الذي يأتي بعد c أو g. قبل e وi وy تُنطق c غالبًا /s/، وقد تُنطق g /dʒ/.",
    "patterns": [
      {
        "pattern": "c + e / i / y",
        "words": "cent cell city circle cycle",
        "tip": "c /s/ غالبًا في هذه الأمثلة."
      },
      {
        "pattern": "g + e / i / y",
        "words": "gem gentle giant giraffe gym",
        "tip": "g قد تعطي /dʒ/."
      },
      {
        "pattern": "Hard g exceptions",
        "words": "get give girl",
        "tip": "g تبقى /ɡ/ في هذه الكلمات؛ لا نعمم القاعدة."
      }
    ],
    "note": "لاحظ أن كلمة girl تجمع g الصلبة مع ir. استمع إلى الكلمة كاملة قبل القياس على نمط واحد.",
    "passages": [
      {
        "title": "A Giant in a City",
        "text": "A giant is in a city. He has a cent and a gem. He can cycle to a gym.",
        "page": 20
      }
    ],
    "sh": "She sees a shell in the city shop. A gentle giant has a shiny dish. The shell is in the dish.",
    "quiz": [
      {
        "word": "city",
        "prompt": "كيف ننطق كلمة city؟",
        "options": [
          "kitty",
          "city",
          "sit"
        ],
        "answer": 1,
        "reason": "city /ˈsɪti/ تبدأ بـ c اللينة /s/ وتنتهي بمقطع /ti/."
      },
      {
        "word": "gem",
        "prompt": "كيف ننطق كلمة gem؟",
        "options": [
          "gem",
          "gum",
          "game"
        ],
        "answer": 0,
        "reason": "gem /dʒɛm/ تبدأ بـ g اللينة /dʒ/، وفيها e قصيرة."
      },
      {
        "word": "give",
        "prompt": "كيف ننطق كلمة give؟",
        "options": [
          "guy",
          "jive",
          "give"
        ],
        "answer": 2,
        "reason": "give /ɡɪv/ استثناء: g صلبة /ɡ/، وi قصيرة رغم e الأخيرة."
      }
    ]
  },
  {
    "id": 8,
    "title": "حروف العلة مع R",
    "en": "R-controlled vowels",
    "page": 32,
    "goal": "استمع إلى تأثير r في صوت العلة. الأمثلة هنا بنطق أمريكي، ولا يوجد مقابل عربي دقيق لكل صوت.",
    "patterns": [
      {
        "pattern": "ar · or",
        "words": "car star fork corn",
        "tip": "ar /ɑr/؛ or /ɔr/."
      },
      {
        "pattern": "er · ir · ur",
        "words": "her term bird girl turn nurse",
        "tip": "تتقارب هذه المجموعات في /ɝ/ في الأمثلة المعروضة."
      },
      {
        "pattern": "air · ear · eer",
        "words": "hair chair near hear deer peer",
        "tip": "chair /er/؛ near وdeer /ɪr/."
      },
      {
        "pattern": "Compare ea and ear",
        "words": "sea teach head bread break steak hear near bear wear",
        "tip": "ea /iː/ أو /e/ أو /eɪ/ هنا؛ ear /ɪr/ في near و/er/ في bear."
      }
    ],
    "note": "لا تضع bear وwear مع break وsteak تحت صوت واحد. tear يتغير نطقها بحسب المعنى، لذلك نبدأ بأمثلة واضحة مثل near وbear.",
    "passages": [
      {
        "title": "Near a Farm",
        "text": "A girl is on a chair near a farm. Her nurse is near the car. A deer is near the car. The girl can hear a bird. The nurse has corn on a fork.",
        "page": 33
      }
    ],
    "sh": "She finds a shell near a chair. A shark swims far from the shore. She can hear the sea.",
    "quiz": [
      {
        "word": "bird",
        "prompt": "كيف ننطق كلمة bird؟",
        "options": [
          "board",
          "bird",
          "beard"
        ],
        "answer": 1,
        "reason": "bird /bɝd/ فيها ir الأمريكية /ɝ/؛ قارِنها بـ board وbeard."
      },
      {
        "word": "near",
        "prompt": "كيف ننطق كلمة near؟",
        "options": [
          "near",
          "bear",
          "nor"
        ],
        "answer": 0,
        "reason": "near /nɪr/ فيها ear /ɪr/؛ bear /bɛr/ لها صوت مختلف."
      },
      {
        "word": "star",
        "prompt": "كيف ننطق كلمة star؟",
        "options": [
          "store",
          "stir",
          "star"
        ],
        "answer": 2,
        "reason": "star /stɑr/ فيها ar /ɑr/؛ store فيها or وstir فيها ir."
      }
    ]
  },
  {
    "id": 9,
    "title": "الحروف الصامتة",
    "en": "Silent letters",
    "page": 35,
    "goal": "قد نكتب حرفًا دون أن نسمع صوته. تعلّم هذه الأنماط داخل كلماتها، ولا تحذف الحرف في كل الكلمات الإنجليزية.",
    "patterns": [
      {
        "pattern": "kn",
        "words": "knee knife",
        "tip": "k لا تُسمع في هذين المثالين؛ نبدأ بصوت /n/."
      },
      {
        "pattern": "wr",
        "words": "write wrist",
        "tip": "w لا تُسمع؛ نبدأ بصوت /r/."
      },
      {
        "pattern": "mb",
        "words": "lamb thumb",
        "tip": "b لا تُسمع في نهاية هاتين الكلمتين."
      },
      {
        "pattern": "igh review",
        "words": "night light",
        "tip": "gh صامتة هنا، والمجموعة igh تعطي /aɪ/."
      }
    ],
    "note": "قارن night وghost وenough: gh صامتة في الأولى، و/ɡ/ في الثانية، و/f/ في الثالثة. استمع إلى كل كلمة.",
    "passages": [
      {
        "title": "A Lamb and a Note",
        "text": "I see a lamb near my knee. I put my hand on my wrist. I can write a note.",
        "page": 36
      }
    ],
    "sh": "She writes a short note. She draws a shell and a lamb. The lamb sits near her knee.",
    "quiz": [
      {
        "word": "knee",
        "prompt": "كيف ننطق كلمة knee؟",
        "options": [
          "key",
          "knee",
          "kin"
        ],
        "answer": 1,
        "reason": "knee /niː/ تبدأ بـ /n/ لأن k صامتة."
      },
      {
        "word": "write",
        "prompt": "كيف ننطق كلمة write؟",
        "options": [
          "write",
          "wit",
          "wet"
        ],
        "answer": 0,
        "reason": "write /raɪt/ تبدأ بـ /r/؛ w صامتة وi طويلة."
      },
      {
        "word": "lamb",
        "prompt": "كيف ننطق كلمة lamb؟",
        "options": [
          "lamp",
          "lime",
          "lamb"
        ],
        "answer": 2,
        "reason": "lamb /læm/ تنتهي بـ /m/؛ b الأخيرة صامتة."
      }
    ]
  },
  {
    "id": 10,
    "title": "تركيبات ونهايات الكلمات",
    "en": "Trigraphs & endings",
    "page": 37,
    "goal": "اقرأ tch وdge معًا، ثم قارن نهايات الكلمات كاملة. لا نعامل كل نهاية من ثلاثة حروف على أنها صوت واحد.",
    "patterns": [
      {
        "pattern": "tch",
        "words": "catch watch",
        "tip": "tch /tʃ/؛ صوت واحد."
      },
      {
        "pattern": "dge",
        "words": "badge bridge",
        "tip": "dge /dʒ/؛ صوت واحد."
      },
      {
        "pattern": "age",
        "words": "page cage village message",
        "tip": "/eɪdʒ/ في page وcage؛ /ɪdʒ/ في village وmessage."
      },
      {
        "pattern": "ture",
        "words": "picture future",
        "tip": "غالبًا /tʃɚ/ في هذين المثالين بالنطق الأمريكي."
      }
    ],
    "note": "age لا تُنطق دائمًا مثل page. mature ليست مثالًا مناسبًا لتعميم نهاية picture، لأن حركتها ونبرها مختلفان.",
    "passages": [
      {
        "title": "A Picture of a Village",
        "text": "This page has a picture of a village. I can see a bridge. A boy can catch a fish.",
        "page": 38
      }
    ],
    "sh": "She shows a picture of a village. A fish swims under the bridge. She can watch it from the shore.",
    "quiz": [
      {
        "word": "catch",
        "prompt": "كيف ننطق كلمة catch؟",
        "options": [
          "cash",
          "catch",
          "cat"
        ],
        "answer": 1,
        "reason": "catch /kætʃ/ تنتهي بـ tch /tʃ/، وليست sh في cash."
      },
      {
        "word": "cage",
        "prompt": "كيف ننطق كلمة cage؟",
        "options": [
          "cage",
          "cadge",
          "cog"
        ],
        "answer": 0,
        "reason": "cage /keɪdʒ/ فيها /eɪ/ ونهاية /dʒ/؛ cadge فيها /æ/."
      },
      {
        "word": "picture",
        "prompt": "كيف ننطق كلمة picture؟",
        "options": [
          "picnic",
          "future",
          "picture"
        ],
        "answer": 2,
        "reason": "picture /ˈpɪktʃɚ/ تنتهي بصوت /tʃɚ/ في النطق الأمريكي."
      }
    ]
  }
];
