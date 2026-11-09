import {learningPromptParts} from '@/lib/learning-text';

// Keep whole English examples (including arrows, + signs and punctuation)
// isolated inside Arabic prose, rather than reversing their individual words.
export default function PastText({text}:{text:string}){
 return <>{learningPromptParts(text).map((part,i)=>part.english?<bdi dir="ltr" lang="en" className="past-ltr" key={i}>{part.text}</bdi>:part.text)}</>;
}
