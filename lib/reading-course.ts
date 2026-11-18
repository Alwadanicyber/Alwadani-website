export type ReadingChapter = {id:number;title:string;en:string;page:number;goal:string;patterns:{pattern:string;words:string;tip:string}[];note:string;passages:{title:string;text:string;page:number}[];sh:string;quiz:{prompt:string;options:string[];answer:number;reason:string}[]};
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
        "prompt": "أي كلمة تبدأ بصوت /m/؟",
        "options": [
          "map",
          "sun",
          "dog"
        ],
        "answer": 0,
        "reason": "map تبدأ بالحرف m وصوته /m/."
      },
      {
        "prompt": "أي حرف كبير يطابق b؟",
        "options": [
          "D",
          "B",
          "P"
        ],
        "answer": 1,
        "reason": "B وb شكلان للحرف نفسه."
      },
      {
        "prompt": "في النص، من يستطيع الجري؟",
        "options": [
          "Ben",
          "A fish",
          "Sam"
        ],
        "answer": 2,
        "reason": "النص يقول: Sam can run."
      }
    ]
  },
  {
    "id": 2,
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
        "prompt": "ما حرف العلة في cat؟",
        "options": [
          "a",
          "c",
          "t"
        ],
        "answer": 0,
        "reason": "الحرف الأوسط a يعطي الصوت القصير /æ/."
      },
      {
        "prompt": "صِل p + i + n.",
        "options": [
          "pen",
          "pin",
          "pan"
        ],
        "answer": 1,
        "reason": "دمج الأصوات /p/ + /ɪ/ + /n/ يعطي pin."
      },
      {
        "prompt": "أي كلمة فيها صوت u القصير مثل cup؟",
        "options": [
          "seat",
          "kite",
          "sun"
        ],
        "answer": 2,
        "reason": "sun وcup فيهما /ʌ/."
      }
    ]
  },
  {
    "id": 3,
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
        "prompt": "أي تركيب يعطي /ʃ/ في fish؟",
        "options": [
          "ch",
          "sh",
          "th"
        ],
        "answer": 1,
        "reason": "الحرفان sh يمثلان صوتًا واحدًا /ʃ/."
      },
      {
        "prompt": "أي كلمة تنتهي بصوت /ŋ/؟",
        "options": [
          "sock",
          "bell",
          "ring"
        ],
        "answer": 2,
        "reason": "ng في ring تعطي /ŋ/."
      },
      {
        "prompt": "في نص A Fish in a Shop، أين السمكة؟",
        "options": [
          "in a shop",
          "on a ship",
          "in a bath"
        ],
        "answer": 0,
        "reason": "الجملة الأولى: This fish is in a shop."
      }
    ]
  },
  {
    "id": 4,
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
        "prompt": "في pl في plan نسمع…",
        "options": [
          "صوتًا واحدًا مثل sh",
          "حرفًا صامتًا",
          "صوتي p وl"
        ],
        "answer": 2,
        "reason": "pl تجمع لصوتين، بخلاف sh التي تعطي صوتًا واحدًا."
      },
      {
        "prompt": "صِل s + t + o + p.",
        "options": [
          "shop",
          "stop",
          "top"
        ],
        "answer": 1,
        "reason": "نحافظ على صوتي s وt لنقرأ stop."
      },
      {
        "prompt": "أي كلمة تبدأ بـ gr؟",
        "options": [
          "grin",
          "drip",
          "swim"
        ],
        "answer": 0,
        "reason": "grin تبدأ بالصوتين /ɡ/ و/r/."
      }
    ]
  },
  {
    "id": 5,
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
        "prompt": "أضف e إلى cap. ما الكلمة الجديدة؟",
        "options": [
          "cape",
          "cup",
          "cat"
        ],
        "answer": 0,
        "reason": "cap → cape؛ تتغير العلة إلى /eɪ/."
      },
      {
        "prompt": "أي كلمة لا تتبع النمط المعتاد للحركة الطويلة؟",
        "options": [
          "hope",
          "kite",
          "give"
        ],
        "answer": 2,
        "reason": "give استثناء، وتبقى i قصيرة /ɪ/."
      },
      {
        "prompt": "أي زوج يوضح أثر e الصامتة؟",
        "options": [
          "cat / dog",
          "hop / hope",
          "sun / run"
        ],
        "answer": 1,
        "reason": "في hope نسمع /oʊ/ دون نطق e النهائية."
      }
    ]
  },
  {
    "id": 6,
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
        "prompt": "صوت c في city هو…",
        "options": [
          "/k/",
          "/s/",
          "/ʃ/"
        ],
        "answer": 1,
        "reason": "قبل i، c في city تعطي /s/."
      },
      {
        "prompt": "أي كلمة تبدأ بـ g الصلبة /ɡ/؟",
        "options": [
          "gem",
          "giant",
          "get"
        ],
        "answer": 2,
        "reason": "get استثناء مهم؛ g فيها /ɡ/."
      },
      {
        "prompt": "أي كلمة تبدأ بصوت /dʒ/؟",
        "options": [
          "giant",
          "girl",
          "give"
        ],
        "answer": 0,
        "reason": "g في giant تعطي /dʒ/."
      }
    ]
  },
  {
    "id": 7,
    "title": "حروف العلة المركبة",
    "en": "Vowel teams",
    "page": 21,
    "goal": "قد تعطي كتابات مختلفة الصوت نفسه، وقد تعطي الحروف نفسها أصواتًا مختلفة. اقرأ مجموعات الأمثلة ثم النصوص الأربعة بالترتيب.",
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
        "prompt": "أي كلمة فيها oo مثل book؟",
        "options": [
          "moon",
          "boot",
          "foot"
        ],
        "answer": 2,
        "reason": "book وfoot فيهما /ʊ/، بخلاف moon وboot /uː/."
      },
      {
        "prompt": "أي كلمة فيها ow مثل snow؟",
        "options": [
          "grow",
          "cow",
          "brown"
        ],
        "answer": 0,
        "reason": "grow وsnow فيهما /oʊ/؛ cow وbrown فيهما /aʊ/."
      },
      {
        "prompt": "أي كلمة فيها ea مثل head؟",
        "options": [
          "seat",
          "bread",
          "leaf"
        ],
        "answer": 1,
        "reason": "head وbread فيهما /e/."
      },
      {
        "prompt": "أي كلمة فيها ou مثل soup؟",
        "options": [
          "out",
          "young",
          "group"
        ],
        "answer": 2,
        "reason": "soup وgroup فيهما /uː/."
      },
      {
        "prompt": "أي تركيب يعطي /aɪ/ في night؟",
        "options": [
          "igh",
          "eigh",
          "ee"
        ],
        "answer": 0,
        "reason": "igh في night وlight تعطي /aɪ/."
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
        "prompt": "أي كلمة فيها ir مثل bird؟",
        "options": [
          "boat",
          "girl",
          "green"
        ],
        "answer": 1,
        "reason": "bird وgirl فيهما /ɝ/ أمريكيًا."
      },
      {
        "prompt": "أي كلمة تتفق مع near في صوت ear؟",
        "options": [
          "hear",
          "bear",
          "wear"
        ],
        "answer": 0,
        "reason": "near وhear فيهما /ɪr/؛ bear وwear فيهما /er/."
      },
      {
        "prompt": "أي كلمة فيها ar؟",
        "options": [
          "corn",
          "nurse",
          "star"
        ],
        "answer": 2,
        "reason": "star تحتوي ar مثل car."
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
        "prompt": "ما الحرف الصامت في knee؟",
        "options": [
          "e",
          "n",
          "k"
        ],
        "answer": 2,
        "reason": "kn في knee تبدأ بصوت /n/؛ لا نسمع k."
      },
      {
        "prompt": "أي كلمة فيها b صامتة؟",
        "options": [
          "lamb",
          "bat",
          "boat"
        ],
        "answer": 0,
        "reason": "lamb تُنطق دون صوت b الأخيرة."
      },
      {
        "prompt": "ما الحرف الصامت في write؟",
        "options": [
          "r",
          "w",
          "t"
        ],
        "answer": 1,
        "reason": "w لا تُنطق في write وwrist."
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
        "prompt": "أي تركيب في catch يعطي /tʃ/؟",
        "options": [
          "dge",
          "tch",
          "age"
        ],
        "answer": 1,
        "reason": "tch في catch تعطي صوتًا واحدًا /tʃ/."
      },
      {
        "prompt": "أي كلمة نهايتها مثل page؟",
        "options": [
          "village",
          "message",
          "cage"
        ],
        "answer": 2,
        "reason": "page وcage تنتهيان بـ /eɪdʒ/، بخلاف village وmessage."
      },
      {
        "prompt": "في نص A Picture of a Village، ماذا يصطاد الولد؟",
        "options": [
          "a fish",
          "a bird",
          "a shell"
        ],
        "answer": 0,
        "reason": "النص يقول: A boy can catch a fish."
      }
    ]
  }
];
