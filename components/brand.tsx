/** Shared header uses the owner's emblem with its name directly beneath it. */
export default function Brand({href='/'}:{href?:string}){
  return <a className="brand teachcraft-brand" href={href} aria-label="TeachCraft · الصفحة الرئيسية"><img src="/teachcraft-emblem.svg" alt="TeachCraft" width={310} height={415} fetchPriority="high" decoding="async"/><span className="teachcraft-name"><span>Teach</span><span>Craft</span></span></a>;
}
