// Format the same server timestamp in both calendars, always in Saudi time.
export function reportDates(timestamp:string){
 const date=new Date(timestamp);if(!Number.isFinite(date.getTime()))return null;
 const options:Intl.DateTimeFormatOptions={timeZone:'Asia/Riyadh',year:'numeric',month:'long',day:'numeric'};
 return {gregorian:new Intl.DateTimeFormat('ar-SA-u-ca-gregory',options).format(date),hijri:new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura',options).format(date),time:new Intl.DateTimeFormat('ar-SA',{timeZone:'Asia/Riyadh',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:true}).format(date)};
}
