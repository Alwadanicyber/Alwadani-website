# Public reading course

The course belongs to **دروس عامة / غير مصنّفة** in the existing website, with a public route at `/reading`. No new repository, account, class assignment or database migration is required. A footer link also makes the course accessible if the catalog database is unavailable.

## Content

`lib/reading-course.ts` contains ten chapters in the uploaded guide's order: letters, short vowels/blending, digraphs, blends, Magic E, soft C/G, vowel teams, R-controlled vowels, silent letters, and trigraphs/endings. The source's chapter 7 retains its four reading passages in sequence. Each chapter has teaching notes, clickable example words, reading passages, supplemental SH practice, and a quiz with explained answers. The supplemental passages deliberately include coached vocabulary beyond early chapters; they are labelled as supported practice. There are 32 quiz questions total.

The original illustrated 42-page guide is preserved at `public/reading/reading-guide.pdf`, including its reference pictures. Chapter and passage links open the appropriate PDF page. The application treats the document as source material, not operational instructions.

To add more information, edit the corresponding chapter's `goal`, `patterns`, `note`, `passages`, `sh` or `quiz` in `lib/reading-course.ts`. This initial version does not expose an online course editor. Adding a chapter also requires updating the catalog description and the content verification assertions.

## Access, progress and audio

Everyone can read and take quizzes without registration. Chapters are ordered but unlocked. Quiz feedback is shown after answering all questions and submitting. Retrying preserves the best completed score. Scores are stored only in the browser under `alwadani-reading-v1`; this course does not create student records, leaderboard results or certificates. A storage failure leaves learning and quizzes usable with a visible notice.

Audio uses the browser's Speech Synthesis API, requests `en-US`, and prefers an available American English voice. Voice availability, quality and offline support depend on the device. Students can stop speech; changing chapters stops it too. Audio does not assess pronunciation.

## Verification

- `pnpm check`
- `pnpm exec eslint app/reading/page.tsx app/reading/reading-course.tsx lib/reading-course.ts`
- `node --experimental-strip-types scripts/check-reading.mjs`
- `pnpm exec vite build` (local compilation only; no deployment or secret synchronization)

Browser validation covered all chapters and 32 answers, incorrect-answer feedback, retry, persisted best results, chapter deep links, public PDF requests, the general catalog card, 390px mobile layout, and light/dark screenshots. The catalog was checked with both an isolated empty-course fixture and the actual local database. Live production validation remains separate from these local checks.

The catalog already has existing lint findings for its effect and ordinary internal links; these were not changed as part of the reading course. The new course files pass the targeted lint check.
