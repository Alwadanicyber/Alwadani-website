import {completionTime} from '@/lib/completion-time';
export default function CompletionDate({value}:{value:string|null|undefined}){
 const label=completionTime(value);return label?<span className="result-completed-at">إتمام النتيجة المعروضة: <time dateTime={value!}>{label}</time><small>بتوقيت السعودية</small></span>:null;
}
