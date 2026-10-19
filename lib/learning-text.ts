// Isolate English phrases without joining separate sentences such as "on. in".
export function learningTextParts(text:string){
 const pattern=/[A-Za-z0-9]+(?:[’'.,:/–-][A-Za-z0-9]+)*(?:(?:[ \t]+|,[ \t]+)[A-Za-z0-9]+(?:[’'.,:/–-][A-Za-z0-9]+)*)*/g;
 const parts:{text:string;english:boolean}[]=[];let start=0;
 for(const match of text.matchAll(pattern)){
  if(match.index!>start)parts.push({text:text.slice(start,match.index),english:false});
  parts.push({text:match[0],english:true});start=match.index!+match[0].length;
 }
 if(start<text.length)parts.push({text:text.slice(start),english:false});
 return parts;
}

// Prompts need a whole English sentence, including blanks and punctuation,
// isolated from the Arabic instruction. Splitting "She ___ help." into two
// English islands reverses the two halves in an RTL paragraph.
export function learningPromptParts(text:string){
 const pattern=/[A-Za-z_][A-Za-z0-9_’‘'".,!?;:()\/=+–—\- \t…→]*/g;
 const parts:{text:string;english:boolean}[]=[];let start=0;
 for(const match of text.matchAll(pattern)){
  if(match.index!>start)parts.push({text:text.slice(start,match.index),english:false});
  parts.push({text:match[0],english:true});start=match.index!+match[0].length;
 }
 if(start<text.length)parts.push({text:text.slice(start),english:false});
 return parts;
}
