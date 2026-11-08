export function completionTime(value:string|null|undefined):string|null{
 if(!value)return null;
 const date=new Date(value);if(!Number.isFinite(date.getTime()))return null;
 return new Intl.DateTimeFormat('ar-SA',{calendar:'gregory',timeZone:'Asia/Riyadh',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(date);
}
