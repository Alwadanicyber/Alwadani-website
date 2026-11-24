export const letterExamLevels = [
 {id:'sound', title:'تعرّف على الصوت'},
 {id:'position', title:'الصوت داخل الكلمة'},
 {id:'word', title:'ميّز الكلمات المتشابهة'},
] as const;

export type LetterExamLevel = (typeof letterExamLevels)[number]['id'];
export type LetterExamClip =
 | {kind:'sound'; value:string}
 | {kind:'word'; value:string; bank?:'chapter-1'|'aep-focus'};

type Question = {
 clip:LetterExamClip;
 options:readonly string[];
 answer:string;
 position?:'first'|'last';
};

export type LetterExamSection = {
 id:string;
 title:string;
 letters:string;
 passage:string;
 exams:Record<LetterExamLevel,Question[]>;
};

function section(id:string, title:string, passage:string, rows:readonly [letter:string, word:string, choices:string][], pairs:readonly [answer:string, options:string][]):
 LetterExamSection {
 return {
  id,title,passage,letters:rows.map(([letter])=>letter).join(''),
  exams:{
   sound:rows.map(([letter,,choices])=>(
    letter==='q'
     ? {clip:{kind:'word',value:'quit',bank:'chapter-1'},options:[...choices],answer:letter,position:'first'}
     : letter==='x'
      ? {clip:{kind:'word',value:'fox'},options:[...choices],answer:letter,position:'last'}
      : {clip:{kind:'sound',value:letter},options:[...choices],answer:letter}
   )),
   position:rows.map(([letter,word,choices])=>({
    clip:{kind:'word',value:word,bank:word==='sun'?'aep-focus':undefined},options:[...choices].reverse(),answer:letter,position:letter==='x'?'last':'first',
   })),
   word:pairs.map(([word,options])=>({clip:{kind:'word',value:word},options:options.split(' '),answer:word})),
  },
 };
}

export const letterExamSections = [
 section('a-g','A–G',
  'Ben sees an [a]nt on his [b]ag. His [c]at and [d]og look at a [f]ish in the pond. Then the dog finds an [e]gg in a [g]ap under the steps.',
  [['a','ant','bae'],['b','bat','bdg'],['c','cat','gfc'],['d','dog','bdg'],['e','egg','ace'],['f','fish','fcb'],['g','gap','cgd']],
  [['bat','pat bat bet'],['dog','dog dug dig'],['cat','cap cab cat'],['fish','dish fish fit']]),
 section('h-m','H–M',
  'A [k]id takes a [h]at and a [m]ap to the park. He puts some [j]am [i]n his bag. His [l]eg hurts, so he sits under a tree.',
  [['h','hat','hjm'],['i','in','lih'],['j','jam','mhj'],['k','kid','jkh'],['l','leg','lmi'],['m','map','ilm']],
  [['hat','hit hot hat'],['jam','jam ham yam'],['leg','led leg let'],['map','cap map tap']]),
 section('n-t','N–T',
  'In the [s]un, a girl takes out a [r]ed [p]en. She draws a [qu]een and an [o]ctopus. She puts her [n]et on [t]op of her bag.',
  [['n','net','snr'],['o','octopus','onp'],['p','pen','tpq'],['q','queen','ptq'],['r','red','rns'],['s','sun','ost'],['t','top','tpr']],
  [['pen','pin pen pan'],['net','net pet met'],['red','bed led red'],['top','tap top tip']]),
 section('u-z','U–Z',
  'The sun is [u]p. A [v]an stops by a [w]et bo[x]. “[Y]es, that’s my box!” says a boy. He puts it in his bag and starts to [z]ip it shut.',
  [['u','up','yuv'],['v','van','wzv'],['w','wet','wvy'],['x','box','zwx'],['y','yes','ywu'],['z','zip','vzx']],
  [['van','fan pan van'],['wet','set wet yet'],['zip','zip sip dip'],['box','fox box boss']]),
];

export const alphabetReviewLetter = `Hi Sam,

The sun is [u]p, and the [v]an is here. I put my [h]at and [m]ap [i]n my [b]ag.

A [k]id has a [r]ed [p]en. She draws a [qu]een, an [o]ctopus, and a [f]ish.

At the park, a [c]at and a [d]og sit in the [s]un. I see an [a]nt by a [g]ap in the path.

I put an [e]gg and a jar of [j]am in a bo[x]. A [w]et [n]et is on [t]op of the box. My [l]eg hurts, so I sit for a bit.

“[Y]es, I’m ready!” I say. I [z]ip my bag and go home.

See you,
Ben`;
