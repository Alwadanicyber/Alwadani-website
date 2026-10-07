export function centeredPageImage(imageWidth:number,imageHeight:number,pageWidth:number,pageHeight:number,margin=0){
  const scale=Math.min((pageWidth-margin*2)/imageWidth,(pageHeight-margin*2)/imageHeight),width=imageWidth*scale,height=imageHeight*scale;
  return {x:(pageWidth-width)/2,y:(pageHeight-height)/2,width,height};
}
