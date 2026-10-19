import {learningPromptParts} from '@/lib/learning-text';

export default function LearningPrompt({text}:{text:string}){
 return <span className="learning-prompt">{learningPromptParts(text).map((part,i)=>part.text.trim()&&<span key={i} className={part.english?'learning-prompt-english':'learning-prompt-instruction'} dir={part.english?'ltr':'rtl'} lang={part.english?'en':'ar'}>{part.text.trim()}</span>)}</span>;
}
