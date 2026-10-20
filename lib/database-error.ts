type FailureCode='DATABASE_READ_LIMIT'|'DATABASE_WRITE_LIMIT'|'DATABASE_STORAGE_LIMIT'|'DATABASE_SCHEMA'|'DATABASE_BINDING'|'DATABASE_UNAVAILABLE';

function errorMessages(error:unknown){
 const messages:string[]=[],seen=new Set<unknown>();let current=error;
 for(let i=0;i<4&&current&&!seen.has(current);i++){
  seen.add(current);
  if(typeof current==='string'){messages.push(current);break;}
  if(typeof current!=='object')break;
  const entry=current as {message?:unknown;cause?:unknown};
  if(typeof entry.message==='string')messages.push(entry.message);
  current=entry.cause;
 }
 return messages;
}

export function databaseFailure(error:unknown):{code:FailureCode;error:string}{
 const messages=errorMessages(error),message=messages.join(' ');
 if(/free tier daily row read limit/i.test(message))return {code:'DATABASE_READ_LIMIT',error:'وصلت قاعدة بيانات الموقع إلى حد القراءة اليومي للاستضافة. تتاح الخدمة مجددًا بعد إعادة تعيين الحد أو تعديل خطة الاستضافة.'};
 if(/free tier daily row write limit/i.test(message))return {code:'DATABASE_WRITE_LIMIT',error:'وصلت قاعدة بيانات الموقع إلى حد الكتابة اليومي للاستضافة. تتاح الخدمة مجددًا بعد إعادة تعيين الحد أو تعديل خطة الاستضافة.'};
 if(/maximum account storage limit|Exceeded maximum DB size/i.test(message))return {code:'DATABASE_STORAGE_LIMIT',error:'بلغت قاعدة بيانات الموقع حد مساحة التخزين في الاستضافة. يلزم مراجعة إعدادات الاستضافة.'};
 if(/no such table|no such column|D1_COLUMN_NOTFOUND/i.test(message))return {code:'DATABASE_SCHEMA',error:'تعذّر تحميل البيانات لأن تحديث جداول قاعدة البيانات في الاستضافة غير مكتمل.'};
 if(messages.includes('Database unavailable'))return {code:'DATABASE_BINDING',error:'تعذّر الاتصال بقاعدة بيانات الموقع؛ يلزم مراجعة ربط القاعدة في الاستضافة.'};
 return {code:'DATABASE_UNAVAILABLE',error:'تعذّر الوصول إلى بيانات الموقع حاليًا. حاول مجددًا بعد قليل.'};
}

// Plain fields preserve the D1 message and nested cause in Workers Logs.
// Never log request bodies, passwords, setup keys, cookies or bound SQL values.
export function logDatabaseFailure(operation:string,error:unknown){
 const messages=errorMessages(error);
 console.error({event:'database_operation_failed',operation,code:databaseFailure(error).code,message:messages[0]?.slice(0,3000)||'Unknown database error',causes:messages.slice(1).map(message=>message.slice(0,3000))});
}
