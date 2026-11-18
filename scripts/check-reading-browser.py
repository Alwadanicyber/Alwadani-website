"""Run against pnpm dev (default http://localhost:5173).
Requires Python Playwright and Chromium on the test machine only.
"""
import json
import os
from pathlib import Path
import subprocess
from playwright.sync_api import sync_playwright, expect
ROOT=Path(__file__).resolve().parent.parent
BASE=os.environ.get('READING_TEST_URL','http://localhost:5173')
data=json.loads(subprocess.check_output(['node','--experimental-strip-types','--input-type=module','-e',"import {readingChapters} from './lib/reading-course.ts';console.log(JSON.stringify(readingChapters));"],cwd=ROOT,text=True))
manifest=json.loads((ROOT/'scripts/reading-audio-manifest.json').read_text())
paths=[f'/reading/audio/sound-{x["letter"]}.mp3' for x in manifest['sounds']]+[f'/reading/audio/word-{w}.mp3' for w in manifest['words']]
outputs=ROOT/'outputs/reading-sounds'
outputs.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH','/usr/bin/chromium'),headless=True,args=['--no-sandbox'])
 page=browser.new_page(viewport={'width':1365,'height':900})
 errors=[]
 page.on('pageerror',lambda e:errors.append(str(e)))
 assert page.goto(BASE+'/reading',wait_until='networkidle').status==200
 expect(page.locator('#alphabet-title')).to_have_text('الحروف وأصواتها')
 expect(page.locator('.reading-letter-card')).to_have_count(26)
 expect(page.locator('.reading-letter-examples button')).to_have_count(52)
 for card in page.locator('.reading-letter-card').all():expect(card.locator('.reading-letter-examples button')).to_have_count(2)
 page.get_by_role('button',name='صوت الحرف A',exact=True).click()
 expect(page.get_by_role('button',name='صوت الحرف A',exact=True)).to_have_attribute('aria-pressed','true')
 page.get_by_role('button',name='استمع إلى apple',exact=True).click()
 expect(page.get_by_role('button',name='استمع إلى apple',exact=True)).to_have_attribute('aria-pressed','true')
 # Decode every real MP3, including quiet stop consonants and vowels.
 decoded=page.evaluate('''async paths=>{
 const ctx=new AudioContext(),result=[];
 for(let i=0;i<paths.length;i+=8){
  result.push(...await Promise.all(paths.slice(i,i+8).map(async path=>{
   const response=await fetch(path);if(!response.ok)throw Error(path);
   const buffer=await ctx.decodeAudioData(await response.arrayBuffer());
   const values=buffer.getChannelData(0);let energy=0;for(const x of values)energy+=x*x;
   return {path,duration:buffer.duration,rms:Math.sqrt(energy/values.length)};
  })));
 }
 await ctx.close();return result;
 }''',paths)
 assert len(decoded)==156
 for clip in decoded:assert clip['duration']>.25 and clip['rms']>.0005,clip
 page.get_by_role('button',name='إيقاف الصوت',exact=True).click()
 page.screenshot(path=str(outputs/'alphabet-desktop.png'),full_page=True)
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(outputs/'alphabet-mobile.png'),full_page=True)
 page.set_viewport_size({'width':1365,'height':900})
 # Old text-exam scores never masquerade as new listening results.
 page.evaluate("localStorage.setItem('alwadani-reading-v1',JSON.stringify({'1':3}))")
 page.get_by_role('button',name='تدريب الحروف واختبارها').click()
 expect(page.locator('.reading-best')).to_have_count(0)
 # Hearing a choice must not automatically select it or reveal its spelling.
 first=page.locator('.reading-sound-option').first
 expect(first.locator('input')).to_be_disabled()
 first.locator('button').click()
 expect(first.locator('input')).to_be_enabled()
 expect(first.locator('input')).not_to_be_checked()
 expect(page.locator('.reading-choice-reveal')).to_have_count(0)
 # Complete every sound test correctly with real audio playback.
 for ci,c in enumerate(data):
  page.locator('.reading-chapters button').nth(ci).click()
  expect(page.locator('#chapter-title')).to_have_text(c['title'])
  for qi,q in enumerate(c['quiz']):
   field=page.locator('fieldset').nth(qi)
   expect(field.locator('.reading-target-word')).to_have_text(q['word'])
   choice=field.locator('.reading-sound-option').nth(q['answer'])
   choice.locator('button').click()
   choice.locator('input').check()
  page.get_by_role('button',name='اعرض نتيجة الاستماع').click()
  expect(page.locator('.reading-result')).to_contain_text(f"{len(c['quiz'])} / {len(c['quiz'])}")
  expect(page.locator('.is-correct')).to_have_count(len(c['quiz']))
  assert page.locator('.reading-choice-play:not(:disabled)').count()==len(c['quiz'])*3
 page.reload(wait_until='networkidle')
 expect(page.locator('.reading-best')).to_have_count(10)
 # Test she exactly as requested, including a wrong answer and retained best.
 page.locator('.reading-chapters button').nth(1).click()
 expect(page.locator('.reading-target-word').first).to_have_text('she')
 for qi,q in enumerate(data[1]['quiz']):
  wrong=page.locator('fieldset').nth(qi).locator('.reading-sound-option').nth((q['answer']+1)%3)
  wrong.locator('button').click();wrong.locator('input').check()
 page.get_by_role('button',name='اعرض نتيجة الاستماع').click()
 expect(page.locator('.reading-result')).to_contain_text('نتيجتك: 0 / 3')
 expect(page.locator('.reading-result')).to_contain_text('أفضل نتيجة: 3 / 3')
 expect(page.locator('.reading-choice-reveal').first).to_have_text('see')
 expect(page.locator('.reading-feedback').first).to_contain_text('she /ʃiː/')
 page.set_viewport_size({'width':390,'height':844})
 assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
 page.screenshot(path=str(outputs/'exam-mobile.png'),full_page=True)
 page.get_by_role('button',name='إعادة الاختبار الصوتي').click()
 expect(page.locator('.reading-choice-reveal')).to_have_count(0)
 expect(page.locator('.reading-sound-option input:enabled')).to_have_count(0)
 # Unavailable audio must not enable a silent, unplayed choice.
 page.route('**/reading/audio/word-see.mp3',lambda r:r.abort())
 page.locator('fieldset').first.locator('.reading-sound-option').first.locator('button').click()
 expect(page.get_by_role('status')).to_contain_text('تعذّر تحميل الصوت')
 expect(page.locator('fieldset').first.locator('input').first).to_be_disabled()
 page.unroute('**/reading/audio/word-see.mp3')
 page.locator('fieldset').first.locator('.reading-sound-option').first.locator('button').click()
 expect(page.locator('fieldset').first.locator('input').first).to_be_enabled()
 page.evaluate("document.documentElement.dataset.theme='dark'")
 page.screenshot(path=str(outputs/'exam-dark.png'),full_page=True)
 assert not errors,errors
 print('PASS: A–Z/52 examples; 156 MP3s decode with nonzero audio; 32 audio answers; listen/select separation; feedback/retry; v2 best-score persistence; legacy-score separation; media failure/recovery; mobile layout.')
 browser.close()
