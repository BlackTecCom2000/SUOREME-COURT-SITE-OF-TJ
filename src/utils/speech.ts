// Free, ultra-natural TTS — Web Speech API (no keys, no billing)
// Picks the most human-like neural voices available in Chrome/Edge.
// Tajik (tg/tj) has no native voice → falls back to ru-RU which is the
// closest and widely used for Tajik documents.

export function getBestVoice(lang: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  const target = lang === 'tj' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'ru-RU';
  const base = target.split('-')[0].toLowerCase();
  const PREF = [
    'Google русский', 'Google Russian', 'Yandex',
    'Microsoft Dmitri', 'Microsoft Svetlana', 'Microsoft Pavel', 'Microsoft Irina', 'Microsoft Natasha',
    'Google US English', 'Google UK English', 'Microsoft Zira', 'Microsoft Aria',
    'Natural', 'Neural', 'Premium'
  ];
  let candidates = voices.filter(v => v.lang.toLowerCase() === target.toLowerCase());
  if (!candidates.length) candidates = voices.filter(v => v.lang.toLowerCase().startsWith(base));
  if (!candidates.length) candidates = voices;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -1;
  for (const v of candidates) {
    let score = 0;
    for (let i = 0; i < PREF.length; i++) if (v.name.includes(PREF[i])) score = PREF.length - i + 10;
    if (/natural|neural|premium/i.test(v.name)) score += 6;
    if (/Google|Microsoft/i.test(v.name)) score += 2;
    if (v.localService === false) score += 1; // online neural beats offline
    if (score > bestScore) { bestScore = score; best = v; }
  }
  return best || candidates[0] || null;
}

export function splitIntoChunks(text: string, maxLen = 240): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+|[^\n]+/g) || [text];
  const out: string[] = []; let buf = '';
  for (const s of sentences) {
    const t = s.trim(); if (!t) continue;
    if ((buf + ' ' + t).length > maxLen && buf) { out.push(buf); buf = t; }
    else buf = buf ? buf + ' ' + t : t;
  }
  if (buf) out.push(buf);
  const flat: string[] = [];
  for (const c of out) {
    if (c.length <= maxLen * 1.6) flat.push(c);
    else for (let i = 0; i < c.length; i += maxLen) flat.push(c.slice(i, i + maxLen));
  }
  return flat.map(s => s.trim()).filter(Boolean);
}

export function stripHtml(html: string): string {
  try {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  } catch { return html.replace(/<[^>]*>/g, ' '); }
}

// Shared charisma tuning — makes even default ru-RU sound much more human
export function configureUtterance(u: SpeechSynthesisUtterance, lang: string, voice: SpeechSynthesisVoice | null) {
  if (voice) u.voice = voice;
  u.lang = lang === 'tj' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'ru-RU';
  u.rate = 0.95; // slightly slower than 1.0 → more natural, less robotic
  u.pitch = 1.02;
  u.volume = 1;
}
