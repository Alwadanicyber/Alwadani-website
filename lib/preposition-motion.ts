export const PREPOSITION_ARROW_MS=180;
export function prepositionAim(width:number,height:number,targetX:number,targetY:number){
 const dx=targetX-width/2,dy=targetY-(height-43),angle=Math.atan2(dy,dx)*180/Math.PI;
 return {dx,dy,angle,bowAngle:angle+90};
}
export const balloonBurstPieces=Array.from({length:14},(_,i)=>{
 const angle=i*Math.PI*2/14,distance=48+(i%3)*16;
 return {dx:Math.cos(angle)*distance,dy:Math.sin(angle)*distance,rotation:i*47+80,delay:(i%3)*12};
});
