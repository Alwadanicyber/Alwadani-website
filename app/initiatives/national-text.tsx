/** Image flags render consistently even on systems that show regional letters. */
export default function NationalText({text}:{text:string}){return <>{text.split(/(🇸🇦|\bSA\b)/u).map((part,i)=>part==='🇸🇦'||part==='SA'?<img key={i} className="ni-saudi-flag" src="/national/saudi-flag.svg" width={36} height={26} alt="علم المملكة العربية السعودية"/>:part)}</>;}
