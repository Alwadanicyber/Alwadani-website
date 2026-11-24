import {BookOpen} from 'lucide-react';
import {readingChapters} from '@/lib/reading-course';
import {requireOwner} from '../owner';
import TeacherShell from '../shell';

export const dynamic='force-dynamic';
export const metadata={title:'مصادر دورة القراءة | TeachCraft'};

const guide='/reading/reading-guide.pdf';

export default async function TeacherReading(){
 const owner=await requireOwner();
 return <TeacherShell username={owner.username} current="reading">
  <main>
   <div className="page-heading">
    <div><h1>مصادر دورة القراءة</h1><p>الدليل الأصلي وصفحات الفصول والنصوص، ومراجع التسجيلات ومقاطع النطق.</p></div>
    <BookOpen size={40} aria-hidden="true"/>
   </div>
   <div className="grade-groups">
    <section aria-labelledby="reading-guide-heading">
     <h2 id="reading-guide-heading">الدليل الأصلي</h2>
     <a className="secondary" href={guide} target="_blank" rel="noreferrer">فتح الدليل كاملاً (PDF) ↗</a>
     <div className="grade-grid">
      {readingChapters.map(chapter=><article key={chapter.id} className="grade-card">
       <strong>{chapter.title}</strong>
       <div className="course-card-actions">
        <a className="secondary compact" href={`${guide}#page=${chapter.page}`} target="_blank" rel="noreferrer">صفحة الفصل {chapter.page} ↗</a>
        {chapter.passages.map(passage=><a key={passage.page} className="secondary compact" href={`${guide}#page=${passage.page}`} target="_blank" rel="noreferrer">
         <bdi lang="en">{passage.title}</bdi> · {passage.page} ↗
        </a>)}
       </div>
      </article>)}
     </div>
    </section>
    <section aria-labelledby="reading-recording-heading">
     <h2 id="reading-recording-heading">مصادر الصوت والفيديو</h2>
     <ul>
      <li><a href="https://aepronunciation.com/app/" lang="en">American English Pronunciation</a> · <a href="/reading/aep-2.4.0/SOURCES.txt">سجل ملفات الصوت والفيديو</a> · <a href="/reading/aep-2.4.0/LICENSE.txt" lang="en">GPLv3</a></li>
      <li><a href="/reading/voice-v3/recordings-credits.txt">تسجيلات الكلمات والمساهمون</a></li>
      <li><a href="/reading/voice-v3/audio-credits-v4.txt">التسجيلات الإضافية والمقاطع المولّدة</a></li>
     </ul>
    </section>
   </div>
  </main>
 </TeacherShell>;
}
