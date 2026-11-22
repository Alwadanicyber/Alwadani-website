// Offsets in the original Sounds American IPA chart recording.
export const phonemeSlices: Partial<Record<string, readonly [number, number]>> = {
 'a': [6, 0.7],
 'b': [18, 0.85],
 'c': [21, 0.85],
 'd': [20, 0.85],
 'e': [5, 0.6],
 'f': [25, 0.7],
 'g': [22, 0.85],
 'h': [33, 0.46],
 'i': [3, 0.6],
 'j': [35, 0.7],
 'k': [21, 0.85],
 'o': [9, 0.65],
 'p': [17, 0.85],
 'r': [40, 0.8],
 's': [29, 0.86],
 't': [19, 0.85],
 'u': [8, 0.65],
 'v': [26, 0.8],
 'w': [41, 0.9],
 'y': [42, 0.4],
 'z': [30, 0.94],
 'ay': [4, 0.7],
 'ch': [34, 0.7],
 'th-unvoiced': [27, 0.65],
 'th-voiced': [28, 0.8],
 ng: [38, 0.9],
 'long-e': [2, 0.9],
 'long-i': [14, 0.7],
 'long-o': [12, 0.7],
 'long-oo': [10, 0.65],
 'short-oo': [11, 0.65],
 'open-o': [13, 0.6],
 'ow': [15, 0.8],
 'oy': [16, 0.7],
 'er': [43, 0.8],
 'ear': [45, 0.74],
 'air': [46, 0.74],
 'ar': [47, 0.72],
 'or': [48, 0.76],
};

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
const correctedWords=new Set(['saw','hoe','cup','knee','give','ship','fish','shell']);

export function readingWordBank(word:string):string|undefined {
 return correctedWords.has(word.toLowerCase()) ? clearWordBank : undefined;
}

export function readingPhonemeBank(id:string):string|undefined {
 if(id==='sh'||id==='l'||id==='m'||id==='n') return clearWordBank;
 return id==='q'||id==='x' ? 'alphabet' : undefined;
}
