import {learningTextParts} from '@/lib/learning-text';
export default function LearningText({text}:{text:string}){
 return <>{learningTextParts(text).map((part,i)=>part.english?<bdi dir="ltr" key={i}>{part.text}</bdi>:part.text)}</>;
}
