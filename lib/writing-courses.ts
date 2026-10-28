import {examUnit} from './exam-prep-content';
import {TRAVEL_COURSE_ID} from './travel-learning';
export const supportsWriting=(course:string)=>course===TRAVEL_COURSE_ID||!!examUnit(course)?.writingPoints;
