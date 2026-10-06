'use client';
import type {RecordTask} from '@/lib/records';
export default function ManualTaskSettings({task,onChange}:{task:Pick<RecordTask,'maxScore'|'manualCells'|'manualGroup'>;onChange:(patch:Partial<RecordTask>)=>void}){
  function numberInput(event:React.FocusEvent<HTMLInputElement>,field:'maxScore'|'manualCells'){
    const value=Number(event.target.value),valid=Number.isFinite(value)&&value>0&&value<=(field==='maxScore'?1000:20)&&(field==='maxScore'||Number.isInteger(value));
    if(valid)onChange({[field]:value});else event.target.value=String(field==='maxScore'?task.maxScore:task.manualCells??1);
  }
  return <div className="manual-task-settings"><label>الدرجة الكاملة<input type="number" min={0.01} max={1000} step="any" required key={'score:'+task.maxScore} defaultValue={task.maxScore} onBlur={e=>numberInput(e,'maxScore')}/></label><label>عدد المربعات لكل طالب<input type="number" min={1} max={20} step={1} required key={'cells:'+(task.manualCells??1)} defaultValue={task.manualCells??1} onBlur={e=>numberInput(e,'manualCells')}/></label><label>عنوان المجموعة العلوية<input maxLength={120} value={task.manualGroup??''} onChange={e=>onChange({manualGroup:e.target.value})} placeholder="اختياري — مثال: المشاركة والتفاعل"/></label></div>;
}
