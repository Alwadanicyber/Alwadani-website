/** Keep each paragraph's native direction, including sentences and punctuation.
 * Isolating individual English phrases would reorder sentences inside Arabic replies.
 * Only bold emphasis is rendered; all other model content remains escaped text.
 */
export default function AssistantText({text}:{text:string}){
 return <div className="assistant-message-content">{text.split(/\r\n|\n|\r/).map((line,lineIndex)=><p dir="auto" key={lineIndex}>{line?line.split(/(\*\*[^*\n]+\*\*)/g).map((part,index)=>part.startsWith('**')&&part.endsWith('**')?<strong key={index}>{part.slice(2,-2)}</strong>:part):<br/>}</p>)}</div>;
}
