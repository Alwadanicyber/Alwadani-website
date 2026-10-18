export function centeredPageImage(imageWidth:number,imageHeight:number,pageWidth:number,pageHeight:number,margin=0){
  const scale=Math.min((pageWidth-margin*2)/imageWidth,(pageHeight-margin*2)/imageHeight),width=imageWidth*scale,height=imageHeight*scale;
  return {x:(pageWidth-width)/2,y:(pageHeight-height)/2,width,height};
}
/** A certificate is its own page, so artwork reaches every edge without cropping. */
export function certificatePageSize(imageWidth:number,imageHeight:number){
  if(!Number.isFinite(imageWidth)||!Number.isFinite(imageHeight)||imageWidth<=0||imageHeight<=0)throw new Error('أبعاد الشهادة غير صالحة.');
  const orientation=imageWidth>=imageHeight?'landscape' as const:'portrait' as const;
  const width=orientation==='landscape'?297:210;
  return {width,height:width*imageHeight/imageWidth,orientation};
}
