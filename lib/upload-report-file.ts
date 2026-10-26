// Upload bounded pieces so large files never need to be loaded into server memory at once.
export async function uploadReportFile(reportId:string,file:File,onProgress:(value:number)=>void){
 async function json(action:Record<string,unknown>){const r=await fetch('/api/teacher/reports/upload',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(action)}),d=await r.json() as {error?:string;uploadId:string;chunkSize:number};if(!r.ok)throw Error(d.error||'تعذّر رفع الملف.');return d;}
 const pending=await json({action:'begin',reportId,fileName:file.name,size:file.size});
 try{for(let offset=0,part=0;offset<file.size;offset+=pending.chunkSize,part++){
 const bytes=file.slice(offset,Math.min(offset+pending.chunkSize,file.size));let success=false,message='تعذّر رفع الجزء.';
 for(let attempt=0;attempt<2;attempt++){try{const r=await fetch('/api/teacher/reports/upload?id='+pending.uploadId+'&part='+part,{method:'PUT',headers:{'Content-Type':'application/octet-stream'},body:bytes});if(r.ok){success=true;break;}const d=await r.json() as {error?:string};message=d.error||message;if(r.status<500)break;}catch{message='انقطع الاتصال أثناء الرفع. أعد المحاولة.';}}
 if(!success)throw Error(message);onProgress(Math.min(99,Math.floor((offset+bytes.size)/file.size*100)));
 }await json({action:'finish',uploadId:pending.uploadId});onProgress(100);
 }catch(e){try{await json({action:'cancel',uploadId:pending.uploadId});}catch{}throw e;}
}
