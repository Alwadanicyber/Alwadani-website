import Records from '../../teacher/records/records';
import ToolsShell from '../shell';
export default function PublicRecordsPage(){return <ToolsShell current="records"><Records initialGrade="all" publicMode/></ToolsShell>;}
