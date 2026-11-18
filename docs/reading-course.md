# Public reading course

The existing website's **دروس عامة / غير مصنّفة** category links to `/reading`.
Everyone can use the course without an account or class assignment. No new
repository or database migration is required.

## Opening page: all letters and their sounds

`/reading` opens a full-width A–Z sound board, with **26 letters and exactly two
playable example words for every letter** (52 examples). Pressing a large letter
plays its common sound twice, rather than its alphabet name. The examples have
separate playback buttons. Common short vowels are used first. Q models /kw/ in
queen/quilt; X models final /ks/ in box/fox. Hints explain these cases and that
some letters have other sounds. Data is in `lib/reading-alphabet.ts`.

## Requested chapter order

1. Letters and sounds
2. Consonant digraphs
3. Vowel digraphs and teams
4. Short vowels and blending
5. Consonant blends
6. Magic E
7. Soft C and G
8. R-controlled vowels
9. Silent letters
10. Trigraphs and endings

The content is adapted from the supplied 42-page guide. All 13 source reading
passages and the original illustrated PDF remain available, with PDF links still
pointing to their original page numbers. Each chapter also has SH reading practice.
Longer vowel spellings such as igh/eigh are distinguished from two-letter digraphs.
Chapter deep links use the new order: `/reading#chapter-2` opens consonant digraphs.
`/reading#alphabet` opens the letter board.

## Sound-based chapter exams

All **32 questions** now display a word and provide **three audio choices**. For
example, the word **she** has the sounds of see, she, and tea. The learner plays
an option, then explicitly selects it. Playing never selects an answer. A choice
must have played before it can be selected; questions cannot be submitted until
all are answered. Spelling behind choices is revealed only after submission,
with the correct choice and a pronunciation explanation. Audio stays replayable
after marking. Retry clears answers and listening state but retains the best score.

These are listening/word-pronunciation recognition tests. They do not record or
automatically assess the student's own spoken pronunciation. Results are stored
only on the current browser in `alwadani-reading-sounds-v2`. Historical text-quiz
scores remain untouched in `alwadani-reading-v1` and do not count as completed
sound exams. No leaderboard, certificate or student-record changes are made.

## Audio

The alphabet and exams use **156 bundled MP3s**: 26 explicit letter phone clips
and 130 word clips (shared between examples and exams). They use CMU Flite's
American English SLT synthetic voice. Letter clips are generated from explicit
phone sequences, never by asking text-to-speech to pronounce a single letter.
There is no runtime audio API, credential, external host or installed-voice
requirement. Attribution is in `public/reading/audio/NOTICE.txt`.

The reading passages and other teaching-word buttons continue using browser
speech synthesis. Its voice availability and quality depend on the device.
Stopping audio, switching chapters or returning to the board cancels current
playback. An audio load error is visible and retryable; an unplayed choice remains
disabled. The audio files are synthetic pronunciation models, not human recordings.

To regenerate MP3s on a Linux machine with libflite1 and ffmpeg installed, run:

```sh
python scripts/generate-reading-audio.py
```

The generator and manifest are build-time source tools only; deployment uses the
committed MP3 files. No Flite executable or voice library is bundled with the site.
Edit chapter teaching text or questions in `lib/reading-course.ts`, letters in
`lib/reading-alphabet.ts`, and the manifest when adding audio vocabulary. New
questions must reference a generated audio file for every option.

## Verification

```sh
pnpm check
pnpm exec eslint app/reading/page.tsx app/reading/reading-course.tsx lib/reading-course.ts lib/reading-alphabet.ts
node --experimental-strip-types scripts/check-reading.mjs
pnpm exec vite build
```

Browser checks (Python Playwright plus Chromium; run `pnpm dev` first):

```sh
python scripts/check-reading-browser.py
```

They cover A–Z and 52 examples, decoding all 156 real MP3s with nonzero audio,
all 32 answers, listen/select separation, marking/retry, best-score persistence,
legacy-score separation, audio failure/recovery, and mobile layouts. Screenshots
are written under ignored `outputs/reading-sounds/`. The catalog retains its
existing unrelated lint findings; the changed reading-course files pass lint.
