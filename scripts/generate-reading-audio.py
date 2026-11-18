"""Regenerate committed MP3s offline with the system CMU Flite SLT voice.
Requires libflite1 and ffmpeg only on the generating machine, never at runtime.
No service credentials or external audio hosts are used.
"""
import array
import ctypes as c
import json
from pathlib import Path
import subprocess
import tempfile
import wave

ROOT = Path(__file__).resolve().parent.parent
manifest = json.loads((ROOT / 'scripts/reading-audio-manifest.json').read_text())
out = ROOT / 'public/reading/audio'
out.mkdir(parents=True, exist_ok=True)
fl = c.CDLL('libflite.so.1', mode=c.RTLD_GLOBAL)
fl.flite_init()
voices = c.CDLL('libflite_cmu_us_slt.so.1')
voices.register_cmu_us_slt.argtypes = [c.c_char_p]
voices.register_cmu_us_slt.restype = c.c_void_p
voice = voices.register_cmu_us_slt(None)
if not voice:
    raise RuntimeError('CMU US SLT voice is unavailable')
class Voice(c.Structure):
    _fields_ = [('name', c.c_char_p), ('features', c.c_void_p)]
features = c.cast(voice, c.POINTER(Voice)).contents.features
fl.feat_set_float.argtypes = [c.c_void_p, c.c_char_p, c.c_float]
for function in ['flite_phones_to_speech', 'flite_text_to_speech']:
    fn = getattr(fl, function)
    fn.argtypes = [c.c_char_p, c.c_void_p, c.c_char_p]
    fn.restype = c.c_float
with tempfile.TemporaryDirectory() as tmp:
    raw, padded = Path(tmp) / 'raw.wav', Path(tmp) / 'padded.wav'
    jobs = [('sound', x['letter'], x['phones']) for x in manifest['sounds']]
    jobs += [('word', x, x) for x in manifest['words']]
    for kind, key, text in jobs:
        # Sound clips use actual phone sequences (not letter-name TTS).
        fl.feat_set_float(features, b'duration_stretch', 2.6 if kind == 'sound' else 1.15)
        synth = fl.flite_phones_to_speech if kind == 'sound' else fl.flite_text_to_speech
        if synth(text.encode(), voice, str(raw).encode()) <= 0:
            raise RuntimeError(f'Synthesis failed: {kind}-{key}')
        with wave.open(str(raw), 'rb') as w:
            params, frames = w.getparams(), w.readframes(w.getnframes())
        samples = array.array('h', frames)
        if not samples or max(abs(x) for x in samples) < 100:
            raise RuntimeError(f'Silent audio: {kind}-{key}')
        silence = b'\0\0' * int(params.framerate * .18)
        # Two separated examples of each isolated phone help beginner listeners.
        frames = silence + frames + (silence + frames if kind == 'sound' else b'') + silence
        with wave.open(str(padded), 'wb') as w:
            w.setparams(params)
            w.writeframes(frames)
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', str(padded), '-codec:a', 'libmp3lame',
                        '-q:a', '3', '-map_metadata', '-1', str(out / f'{kind}-{key}.mp3')], check=True)
print(f'Generated {len(jobs)} audio files: 26 letter sounds and {len(manifest["words"])} words.')
