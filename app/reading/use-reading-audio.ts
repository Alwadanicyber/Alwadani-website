import {useEffect, useRef, useState} from 'react';

const audioDirectory = '/reading/voice-v3';
const bankVersion = '2';
const phonemeFile = `${audioDirectory}/sounds-american.mp3`;
type Bank = Record<string, string>;

function fetchAudio<T>(path: string, read: (response: Response) => Promise<T>) {
 const controller = new AbortController();
 const timeout = window.setTimeout(() => controller.abort(), 10000);
 return fetch(path, {signal: controller.signal}).then(response => {
  if (!response.ok) throw new Error('Reading audio unavailable');
  return read(response);
 }).finally(() => window.clearTimeout(timeout));
}

const banks = new Map<string, Promise<Bank>>();
function loadBank(name: string) {
 let bank = banks.get(name);
 if (!bank) {
  bank = fetchAudio<Bank>(`${audioDirectory}/${name}.json?v=${bankVersion}`, response => response.json())
   .catch(error => { banks.delete(name); throw error; });
  banks.set(name, bank);
 }
 return bank;
}

let phonemes: Promise<ArrayBuffer> | undefined;
function loadPhonemes() {
 return phonemes ??= fetchAudio(phonemeFile, response => response.arrayBuffer())
  .catch(error => { phonemes = undefined; throw error; });
}

type Slice = readonly [offset: number, length: number];

export function useReadingAudio(bank: string) {
 const [active, setActive] = useState('');
 const [notice, setNotice] = useState('');
 const audioContext = useRef<AudioContext|null>(null);
 const decoded = useRef(new Map<string, Promise<AudioBuffer>>());
 const source = useRef<AudioBufferSourceNode|null>(null);
 const request = useRef({version: 0});

 useEffect(() => {
  void loadBank(bank).catch(() => {});
  void loadPhonemes().catch(() => {});
 }, [bank]);

 useEffect(() => {
  const buffers = decoded.current;
  const playback = request.current;
  return () => {
   ++playback.version;
   source.current?.stop();
   source.current = null;
   if (audioContext.current) void audioContext.current.close().catch(() => {});
   audioContext.current = null;
   buffers.clear();
  };
 }, []);

 function stop() {
  ++request.current.version;
  const previous = source.current;
  source.current = null;
  previous?.stop();
  setActive('');
  setNotice('');
 }

 async function play(clip: string, options: {slice?: Slice; id?: string; quizQuestion?: number; bankName?: string; onStart?: () => void} = {}) {
  stop();
  const current = request.current.version;
  const quizClip = options.quizQuestion === undefined ? clip : `quiz-${options.quizQuestion}-${clip}`;
  const bankName = options.bankName ?? bank;
  const audioKey = options.slice ? 'phonemes' : `${bankName}/${quizClip}`;
  setActive(options.id ?? clip);
  try {
   const context = audioContext.current ??= new AudioContext();
   // Resume during the tap so the first sound works on mobile after the file finishes loading.
   const ready = context.state === 'running' ? Promise.resolve() : context.resume();
   let audio = decoded.current.get(audioKey);
   if (!audio) {
    const bytes = options.slice
     ? loadPhonemes().then(data => data.slice(0))
     : loadBank(bankName).then(data => {
        const value = data[quizClip] ?? data[clip];
        if (!value) throw new Error('Reading audio clip missing');
        return Uint8Array.from(atob(value), character => character.charCodeAt(0)).buffer;
       });
    audio = bytes.then(data => context.decodeAudioData(data))
     .catch(error => { decoded.current.delete(audioKey); throw error; });
    decoded.current.set(audioKey, audio);
   }
   const [buffer] = await Promise.all([audio, ready]);
   if (current !== request.current.version) return;
   const player = context.createBufferSource();
   player.buffer = buffer;
   player.connect(context.destination);
   player.onended = () => {
    player.disconnect();
    if (source.current === player) {
     source.current = null;
     setActive('');
    }
   };
   if (options.slice) player.start(0, ...options.slice);
   else player.start();
   source.current = player;
   options.onStart?.();
  } catch {
   if (current !== request.current.version) return;
   setActive('');
   setNotice('تعذّر تشغيل الصوت. اضغط زر الاستماع مرة أخرى.');
  }
 }

 return {active, notice, stop, play};
}
