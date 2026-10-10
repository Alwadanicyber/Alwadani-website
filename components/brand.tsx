/** Shared header lockup uses the owner's exact logo artwork. */
export default function Brand({href='/'}:{href?:string}){
  return <a className="brand teachcraft-brand" href={href} aria-label="TeachCraft · الصفحة الرئيسية"><img src="/teachcraft-logo.svg" alt="TeachCraft Teaching Tools" width={280} height={76} fetchPriority="high" decoding="async"/></a>;
}
