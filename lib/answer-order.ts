// Per-session option order. Stored answer choices remain in canonical order so
// older scores, snapshots and leaderboard comparisons stay compatible.
export async function answerOrder(studentId:string,courseId:string,questionId:number,count:number){
  const order=Array.from({length:count},(_,i)=>i);
  let block=0,cursor=8,bytes:DataView;
  async function randomIndex(max:number){
    const limit=Math.floor(0x100000000/max)*max;
    for(;;){
      if(cursor===8){bytes=new DataView(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(['alwadani-option-order-v1',studentId,courseId,questionId,block++]))));cursor=0;}
      const value=bytes!.getUint32(cursor++*4,true);
      if(value<limit)return value%max;
    }
  }
  for(let i=count-1;i>0;i--){const j=await randomIndex(i+1);[order[i],order[j]]=[order[j],order[i]];}
  return order;
}
