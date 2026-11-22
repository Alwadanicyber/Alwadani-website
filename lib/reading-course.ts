export type ReadingSpelling = {letters:string; examples:string[]};
export type ReadingSoundGroup = {ipa:string; spellings:ReadingSpelling[]; atEnd?:boolean; audio?:string};
export type ReadingPattern = {pattern:string; groups:ReadingSoundGroup[]; tip?:string};
export type ReadingChapter = {
 id:number; title:string; en:string; page:number; goal:string; patterns:ReadingPattern[]; note:string;
 passages:{title:string; text:string; page:number}[]; sh:string;
 quiz:{word:string; prompt:string; options:string[]; answer:number; reason:string}[];
};

// Brackets mark only the letters students should focus on, including split spellings like a…e.
function spelling(letters:string, examples:string):ReadingSpelling {
 return {letters, examples:examples.split(' ')};
}

function sound(ipa:string, ...spellings:ReadingSpelling[]):ReadingSoundGroup {
 return {ipa, spellings};
}

export function readingExampleWord(example:string):string {
 return example.replace(/[\[\]]/g,'');
}
export const readingChapters:ReadingChapter[] = [
  {
    "id": 1,
    "title": "الحروف وأصواتها",
    "en": "Letters & sounds",
    "page": 2,
    "goal": "ميّز اسم الحرف عن صوته، واقرأ الحروف الكبيرة والصغيرة. استخدم صوت الحرف عند الدمج، دون إضافة حركة بعد كل ساكن.",
    "patterns": [
      {
        pattern: 'A–G',
        groups: [
          sound('æ', spelling('A','[a]nt')),
          sound('b', spelling('B','[b]at')),
          sound('k', spelling('C','[c]at')),
          sound('d', spelling('D','[d]og')),
          sound('ɛ', spelling('E','[e]gg')),
          sound('f', spelling('F','[f]an')),
          sound('ɡ', spelling('G','[g]ap')),
        ],
      },
      {
        pattern: 'H–M',
        groups: [
          sound('h', spelling('H','[h]at')),
          sound('ɪ', spelling('I','[i]n')),
          sound('dʒ', spelling('J','[j]am')),
          sound('k', spelling('K','[k]id')),
          sound('l', spelling('L','[l]eg')),
          sound('m', spelling('M','[m]ap')),
        ],
      },
      {
        pattern: 'N–T',
        groups: [
          sound('n', spelling('N','[n]et')),
          sound('ɑ', spelling('O','[o]x')),
          sound('p', spelling('P','[p]en')),
          sound('kw', spelling('qu','[qu]it')),
          sound('ɹ', spelling('R','[r]ed')),
          sound('s', spelling('S','[s]un')),
          sound('t', spelling('T','[t]op')),
        ],
      },
      {
        pattern: 'U–Z',
        groups: [
          sound('ʌ', spelling('U','[u]p')),
          sound('v', spelling('V','[v]an')),
          sound('w', spelling('W','[w]et')),
          sound('j', spelling('Y','[y]es')),
          sound('z', spelling('Z','[z]ip')),
          {...sound('ks', spelling('X','bo[x]')), atEnd:true},
        ],
      },
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
        pattern: 'sh · ch',
        groups: [
          sound('ʃ', spelling('sh','[sh]ip fi[sh]')),
          sound('tʃ', spelling('ch','[ch]ip [ch]in')),
        ],
      },
      {
        pattern: 'th',
        tip: 'ضع طرف لسانك بين الأسنان. اسمع /θ/ بلا اهتزاز، و/ð/ مع اهتزاز الصوت.',
        groups: [
          sound('θ', spelling('th','[th]in ba[th]')),
          sound('ð', spelling('th','[th]is [th]at')),
        ],
      },
      {
        pattern: 'ph · wh',
        groups: [
          sound('f', spelling('ph','[ph]one [ph]oto')),
          sound('w', spelling('wh','[wh]en [wh]ich')),
        ],
      },
      {
        pattern: 'ck · ng',
        tip: 'في sing وring تسمع /ŋ/، دون g منفصلة.',
        groups: [
          sound('k', spelling('ck','du[ck] so[ck]')),
          sound('ŋ', spelling('ng','si[ng] ri[ng]')),
        ],
      },
      {
        pattern: 'ff · ll · ss · zz',
        tip: 'اقرأ الحرفين المكررين بصوت واحد.',
        groups: [
          sound('f', spelling('ff','o[ff] pu[ff]')),
          {...sound('l', spelling('ll','be[ll] hi[ll]')), audio:'ll'},
          sound('s', spelling('ss','ki[ss] me[ss]')),
          sound('z', spelling('zz','bu[zz] fi[zz]')),
        ],
      },
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
        pattern: 'Long E',
        groups: [sound('iː',
          spelling('ee','f[ee]t gr[ee]n'),
          spelling('ea','s[ea]t l[ea]f'),
          spelling('ey','k[ey] monk[ey]'),
        )],
      },
      {
        pattern: 'Long A',
        groups: [sound('eɪ',
          spelling('ai','r[ai]n tr[ai]n'),
          spelling('ay','d[ay] pl[ay]'),
          spelling('ei','v[ei]n v[ei]l'),
          spelling('eigh','[eigh]t w[eigh]t'),
          spelling('ea','br[ea]k st[ea]k'),
        )],
      },
      {
        pattern: 'Long I',
        groups: [sound('aɪ',
          spelling('ie','p[ie] t[ie]'),
          spelling('igh','l[igh]t n[igh]t'),
          spelling('y','m[y] fl[y]'),
          spelling('y…e','t[y]p[e] st[y]l[e]'),
        )],
      },
      {
        pattern: 'Long O',
        groups: [sound('oʊ',
          spelling('oa','b[oa]t c[oa]t'),
          spelling('ow','sn[ow] gr[ow]'),
          spelling('oe','t[oe] h[oe]'),
        )],
      },
      {
        pattern: 'More long vowels',
        groups: [
          sound('uː',
            spelling('ue','bl[ue] gl[ue]'),
            spelling('ew','n[ew]'),
            spelling('u…e','fl[u]t[e] r[u]l[e]'),
          ),
          sound('juː', spelling('ew','f[ew]')),
          sound('iː',
            spelling('e…e','th[e]s[e] th[e]m[e]'),
            spelling('ie','f[ie]ld ch[ie]f'),
          ),
        ],
      },
      {
        pattern: 'oo · ea',
        groups: [
          sound('uː', spelling('oo','b[oo]t m[oo]n')),
          sound('ʊ', spelling('oo','b[oo]k f[oo]t')),
          sound('ɛ', spelling('ea','h[ea]d br[ea]d')),
        ],
      },
      {
        pattern: 'oi · oy · ou · ow · au · aw',
        tip: 'مع au وaw قد تسمع /ɔ/ أو /ɑ/ حسب اللهجة الأمريكية.',
        groups: [
          sound('ɔɪ', spelling('oi','c[oi]n [oi]l'), spelling('oy','b[oy] t[oy]')),
          sound('aʊ', spelling('ou','[ou]t cl[ou]d'), spelling('ow','c[ow] br[ow]n')),
          sound('ɔ ~ ɑ', spelling('au','s[au]ce [Au]gust'), spelling('aw','s[aw] l[aw]')),
        ],
      },
      {
        pattern: 'ou alternatives',
        groups: [
          sound('ʌ', spelling('ou','y[ou]ng t[ou]ch')),
          sound('uː', spelling('ou','s[ou]p gr[ou]p')),
          sound('ʊ', spelling('ou','c[ou]ld w[ou]ld')),
        ],
      },
    ],
    "note": "لا توجد قاعدة قصيرة تضمن نطق كل ou. في igh لا تُسمع gh، لكن ذلك لا يعمم على ghost أو enough. في الدليل المصوّر، الصفحات ٢١–٣١، تجد الجداول والتطبيقات.",
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
        pattern: 'a · e',
        groups: [
          sound('æ', spelling('a','c[a]t m[a]p h[a]t')),
          sound('ɛ', spelling('e','p[e]n b[e]d r[e]d')),
        ],
      },
      {
        pattern: 'i · o · u',
        groups: [
          sound('ɪ', spelling('i','s[i]t p[i]n p[i]g')),
          sound('ɑ', spelling('o','h[o]t p[o]t t[o]p')),
          sound('ʌ', spelling('u','c[u]p s[u]n r[u]n')),
        ],
      },
      {
        pattern: 'Blend',
        tip: 'ابدأ من اليسار وصِل الأصوات لتقرأ الكلمة.',
        groups: [
          sound('', spelling('m + a + p','map')),
          sound('', spelling('s + a + t','sat')),
          sound('', spelling('p + i + n','pin')),
          sound('', spelling('c + u + p','cup')),
        ],
      },
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
        pattern: 'st · bl · tr · pl',
        groups: [
          sound('st', spelling('st','[st]op [st]ar')),
          sound('bl', spelling('bl','[bl]ack [bl]ue')),
          sound('tr', spelling('tr','[tr]ee [tr]ain')),
          sound('pl', spelling('pl','[pl]ay [pl]ane [pl]an')),
        ],
      },
      {
        pattern: 'sl · sn · dr · gr',
        groups: [
          sound('sl', spelling('sl','[sl]ip [sl]ed')),
          sound('sn', spelling('sn','[sn]ap [sn]ack')),
          sound('dr', spelling('dr','[dr]ip [dr]op')),
          sound('ɡr', spelling('gr','[gr]in [gr]ab')),
        ],
      },
      {
        pattern: 'sm · sw · pr',
        groups: [
          sound('sm', spelling('sm','[sm]ell [sm]ile')),
          sound('sw', spelling('sw','[sw]im [sw]an')),
          sound('pr', spelling('pr','[pr]ess [pr]int')),
        ],
      },
      {
        pattern: 'qu · nk',
        groups: [
          sound('kw', spelling('qu','[qu]ick [qu]een')),
          sound('ŋk', spelling('nk','si[nk] ba[nk]')),
        ],
      },
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
        pattern: 'a…e · i…e',
        groups: [
          sound('æ', spelling('a','c[a]p')),
          sound('eɪ', spelling('a…e','c[a]p[e]')),
          sound('ɪ', spelling('i','k[i]t')),
          sound('aɪ', spelling('i…e','k[i]t[e]')),
        ],
      },
      {
        pattern: 'o…e · u…e',
        groups: [
          sound('ɑ', spelling('o','h[o]p n[o]t')),
          sound('oʊ', spelling('o…e','h[o]p[e] n[o]t[e]')),
          sound('ʌ', spelling('u','c[u]b c[u]t')),
          sound('juː', spelling('u…e','c[u]b[e] c[u]t[e]')),
        ],
      },
      {
        pattern: 'Exceptions',
        tip: 'في هذه الكلمات تبقى العلة قصيرة رغم وجود e الأخيرة.',
        groups: [
          sound('ʌ', spelling('o…e','l[o]v[e] s[o]m[e]')),
          sound('æ', spelling('a…e','h[a]v[e]')),
          sound('ɪ', spelling('i…e','g[i]v[e]')),
        ],
      },
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
        pattern: 'c + e / i / y',
        groups: [sound('s',
          spelling('ce','[c]ent [c]ell'),
          spelling('ci','[c]ity [c]ircle'),
          spelling('cy','[c]ycle'),
        )],
      },
      {
        pattern: 'g + e / i / y',
        groups: [sound('dʒ',
          spelling('ge','[g]em [g]entle'),
          spelling('gi','[g]iant [g]iraffe'),
          spelling('gy','[g]ym'),
        )],
      },
      {
        pattern: 'Hard g exceptions',
        groups: [sound('ɡ',
          spelling('ge','[g]et'),
          spelling('gi','[g]ive [g]irl'),
        )],
      },
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
        pattern: 'ar · or',
        groups: [
          sound('ɑr', spelling('ar','c[ar] st[ar]')),
          sound('ɔr', spelling('or','f[or]k c[or]n')),
        ],
      },
      {
        pattern: 'er · ir · ur',
        groups: [sound('ɝ',
          spelling('er','h[er] t[er]m'),
          spelling('ir','b[ir]d g[ir]l'),
          spelling('ur','t[ur]n n[ur]se'),
        )],
      },
      {
        pattern: 'air · ear · eer',
        groups: [
          sound('ɛr', spelling('air','h[air] ch[air]')),
          sound('ɪr', spelling('ear','n[ear] h[ear]'), spelling('eer','d[eer] p[eer]')),
        ],
      },
      {
        pattern: 'Compare ea and ear',
        groups: [
          sound('iː', spelling('ea','s[ea] t[ea]ch')),
          sound('ɛ', spelling('ea','h[ea]d br[ea]d')),
          sound('eɪ', spelling('ea','br[ea]k st[ea]k')),
          sound('ɪr', spelling('ear','h[ear] n[ear]')),
          sound('ɛr', spelling('ear','b[ear] w[ear]')),
        ],
      },
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
        pattern: 'kn',
        tip: 'في هاتين الكلمتين k صامتة.',
        groups: [sound('n', spelling('kn','[kn]ee [kn]ife'))],
      },
      {
        pattern: 'wr',
        tip: 'في هاتين الكلمتين w صامتة.',
        groups: [sound('ɹ', spelling('wr','[wr]ite [wr]ist'))],
      },
      {
        pattern: 'mb',
        tip: 'في هاتين الكلمتين b صامتة.',
        groups: [sound('m', spelling('mb','la[mb] thu[mb]'))],
      },
      {
        pattern: 'igh review',
        tip: 'في هاتين الكلمتين gh صامتة.',
        groups: [sound('aɪ', spelling('igh','n[igh]t l[igh]t'))],
      },
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
        pattern: 'tch',
        groups: [sound('tʃ', spelling('tch','ca[tch] wa[tch]'))],
      },
      {
        pattern: 'dge',
        groups: [sound('dʒ', spelling('dge','ba[dge] bri[dge]'))],
      },
      {
        pattern: 'age',
        groups: [
          sound('eɪdʒ', spelling('age','p[age] c[age]')),
          sound('ɪdʒ', spelling('age','vill[age] mess[age]')),
        ],
      },
      {
        pattern: 'ture',
        groups: [sound('tʃɚ', spelling('ture','pic[ture] fu[ture]'))],
      },
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
