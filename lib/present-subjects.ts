export const presentSubjects=[
 {name:'I',label:'I · أنا',third:false,arabic:'أنا',arabicRead:'أقرأ',be:'am',reply:'you',replyBe:'are'},
 {name:'You',label:'you · أنت / أنتم',third:false,arabic:'أنت',arabicRead:'تقرأ',be:'are',reply:'I',replyBe:'am'},
 {name:'We',label:'we · نحن',third:false,arabic:'نحن',arabicRead:'نقرأ',be:'are',reply:'we',replyBe:'are'},
 {name:'They',label:'they · هم',third:false,arabic:'هم',arabicRead:'يقرؤون',be:'are',reply:'they',replyBe:'are'},
 {name:'He',label:'he · هو',third:true,arabic:'هو',arabicRead:'يقرأ',be:'is',reply:'he',replyBe:'is'},
 {name:'She',label:'she · هي',third:true,arabic:'هي',arabicRead:'تقرأ',be:'is',reply:'she',replyBe:'is'},
 {name:'It',label:'it · هو / هي لغير الإنسان (روبوت مثلًا)',third:true,arabic:'الروبوت',arabicRead:'يقرأ',be:'is',reply:'it',replyBe:'is'},
 {name:'Ali',label:'Ali · علي: شخص واحد',third:true,arabic:'علي',arabicRead:'يقرأ',be:'is',reply:'he',replyBe:'is'},
 {name:'Fahad',label:'Fahad · فهد: شخص واحد',third:true,arabic:'فهد',arabicRead:'يقرأ',be:'is',reply:'he',replyBe:'is'},
 {name:'Ali and Fahad',label:'Ali and Fahad · علي وفهد: شخصان',third:false,arabic:'علي وفهد',arabicRead:'يقرآن',be:'are',reply:'they',replyBe:'are'},
];
export function presentSubject(name:string){
 const profile=presentSubjects.find(p=>p.name===name);
 if(!profile)throw new Error('Unknown example subject');
 return {...profile,questionName:['Ali','Fahad','Ali and Fahad','I'].includes(name)?name:name.toLowerCase(),auxiliary:profile.third?'does':'do'};
}
export function presentReadingPieces(name:string,tense:'simple'|'continuous',form:'affirmative'|'negative'|'question',wh=false){
 const p=presentSubject(name),now=tense==='continuous';
 if(form==='question')return [{word:wh?'What':'',role:'ماذا؟'},{word:(now?p.be:p.auxiliary).replace(/^./,c=>wh?c:c.toUpperCase()),role:'أداة السؤال'},{word:p.questionName,role:'الفاعل'},{word:now?'reading':'read',role:'الفعل'},{word:wh?'':now?'a comic book':'comic books',role:'ماذا؟'},{word:now?'now?':'every day?',role:'الوقت'}].filter(p=>p.word);
 return [{word:p.name,role:'الفاعل'},{word:now?p.be:form==='negative'?p.auxiliary:'',role:'الأداة'},{word:form==='negative'?'not':'',role:'النفي'},{word:now?'reading':form==='affirmative'&&p.third?'reads':'read',role:'الفعل'},{word:now?'a comic book':'comic books',role:'ماذا؟'},{word:now?'now.':'every day.',role:'الوقت'}].filter(p=>p.word);
}
