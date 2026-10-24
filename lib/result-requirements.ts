import type {Result} from './result-ranking';

export type ResultRequirements={enabled:boolean;minimumPercent:number};
export type ResultRequirementState=ResultRequirements&{bestCompletedPercent:number|null};
export const defaultResultRequirements:ResultRequirements={enabled:false,minimumPercent:80};
export function parseResultRequirements(value:Record<string,unknown>):ResultRequirements{
  if(typeof value.enabled!=='boolean'||typeof value.minimumPercent!=='number'||!Number.isInteger(value.minimumPercent)||value.minimumPercent<1||value.minimumPercent>100)throw new Error('اختر نسبة صحيحة من 1 إلى 100.');
  return {enabled:value.enabled,minimumPercent:value.minimumPercent};
}
export function qualifiesResult(result:Pick<Result,'score'|'total'|'completed'>|null|undefined,settings:ResultRequirements){
  if(!settings.enabled)return true;
  return !!result?.completed&&result.total>0&&Number.isFinite(result.score)&&Number.isFinite(result.total)&&result.score*100>=settings.minimumPercent*result.total;
}
// Do not round a result just below the cutoff up to the required percentage.
export const qualificationPercent=(percent:number)=>Math.floor(percent*100)/100;
