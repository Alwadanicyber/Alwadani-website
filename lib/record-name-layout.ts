// Browser text metrics keep Arabic names inside their cell when captured to PDF.
export function recordNameLines(name:string,width:number,measure:(text:string)=>number){
  const lines:string[]=[];let line='';
  for(const word of name.trim().split(/\s+/).filter(Boolean)){
    const candidate=line?line+' '+word:word;
    if(measure(candidate)<=width){line=candidate;continue;}
    if(line){lines.push(line);line='';}
    if(measure(word)<=width){line=word;continue;}
    for(const {segment} of new Intl.Segmenter('ar',{granularity:'grapheme'}).segment(word)){
      if(line&&measure(line+segment)>width){lines.push(line);line='';}line+=segment;
    }
  }
  if(line)lines.push(line);return lines;
}
