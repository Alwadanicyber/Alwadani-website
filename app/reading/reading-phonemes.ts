// Letter audio also serves as the model for spellings with the same sound.
const phonemeIds: Partial<Record<string,string>> = {
 'æ':'a', 'b':'b', 'k':'k', 'd':'d', 'ɛ':'e', 'f':'f', 'ɡ':'g', 'h':'h', 'ɪ':'i',
 'dʒ':'j', 'l':'l', 'm':'m', 'n':'n', 'ɑ':'o', 'p':'p', 'kw':'q', 'ɹ':'r', 's':'s',
 't':'t', 'ʌ':'u', 'v':'v', 'w':'w', 'j':'y', 'z':'z', 'ks':'x', 'ʃ':'sh', 'tʃ':'ch',
 'θ':'th-unvoiced', 'ð':'th-voiced', 'ŋ':'ng', 'iː':'long-e', 'eɪ':'ay', 'aɪ':'long-i',
 'oʊ':'long-o', 'uː':'long-oo', 'ʊ':'short-oo', 'ɔ':'open-o', 'aʊ':'ow', 'ɔɪ':'oy',
 'ɝ':'er', 'ɪr':'ear', 'ɛr':'air', 'ɑr':'ar', 'ɔr':'or',
};

export function readingPhonemeId(ipa:string):string|undefined {
 return phonemeIds[ipa];
}


export const clearWordBank='clear-words-v4';
export const modelFocusBank='aep-focus';
const correctedWords=new Set(['hoe','cup','knee','give','ship','fish','shell']);
const referenceWords=new Set(['saw','sun','up','me','new','loud','shoot']);

export function readingWordBank(word:string):string|undefined {
 const name=word.toLowerCase();
 if(referenceWords.has(name)) return modelFocusBank;
 return correctedWords.has(name) ? clearWordBank : undefined;
}

export const mouthModelIds=['l','m','n','sh','u','long-e','long-o','open-o','i','th-voiced','th-unvoiced'] as const;
export type MouthModelId=(typeof mouthModelIds)[number];

const focusSounds=new Set<string>(mouthModelIds);
const vowelSounds=new Set(['a','e','o','ay','long-i','long-oo','short-oo','ow','oy','er','ear','air','ar','or']);
const referenceSounds=new Set(['c',...Object.values(phonemeIds)]);

export function readingPhonemeBank(id:string):string|undefined {
 if(id==='q'||id==='x') return 'alphabet';
 if(focusSounds.has(id)) return modelFocusBank;
 if(vowelSounds.has(id)) return 'aep-vowels';
 return referenceSounds.has(id) ? 'aep-consonants' : undefined;
}
