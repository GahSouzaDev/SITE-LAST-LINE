import { api, session } from './api.js';
import { controls } from './controls.js';
import { gfx, setGfx, onGfx } from './graphics.js';
const EXTRA = { gfx: 'lastline.gfx', chatcfg: 'lastline.chatcfg', chatpos: 'lastline.chatpos', pad: 'lastline.pad', padmap: 'lastline.padmap', touch: 'lastline.touch', forceTouch: 'lastline.forceTouch', story: 'lastline.story', status: 'lastline.status' };
const readExtra = () => { const o = {}; for (const [k, lk] of Object.entries(EXTRA)) { try { const v = localStorage.getItem(lk); if (v != null) o[k] = v; } catch { /* ignora */ } } return o; };
let lastExtra = '';

// Configurações do jogador: local (instantâneo) + conta (sincroniza entre PCs).
const KEY = 'lastline.settings';
export const DEFAULTS = { cursorSet: 'lastline', cursorSize: 32, sens: 1, fov: 78, shadows: true, camera: 'fp', side: 'right', tpDistance: 2.9, volMaster: 0.9, volMusic: 0.3, volSfx: 0.9, volVoice: 1, musicOn: true, musicInGame: false, showFps: false, uiClick: true, uiClickWeapon: 'rifle', casings: true, magDrop: true, tutorialDone: false };
export const settings = (() => { try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return { ...DEFAULTS }; } })();
// migração FINAL 11: clique com som de FUZIL e música mais baixa por padrão (uma vez)
function migrate() { if ((settings.setv | 0) < 11) { settings.uiClickWeapon = 'rifle'; settings.volMusic = Math.min(Number(settings.volMusic) || 0.3, 0.3); settings.setv = 11; } }
migrate();
const listeners = new Set();
export const onSettings = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

let timer = null;
function persistLocal() { try { localStorage.setItem(KEY, JSON.stringify(settings)); } catch { /* ignora */ } }
export function setSetting(k, v) {
  settings[k] = v; persistLocal();
  for (const fn of listeners) fn(k, v);
  clearTimeout(timer); timer = setTimeout(syncUp, 800);
}
export async function syncUp() {
  try { const extra = readExtra(); lastExtra = JSON.stringify(extra); await api.putSettings({ ...settings, keys: controls.exportMap(), extra }); } catch { /* offline: fica salvo localmente */ }
}
export async function syncDown() {
  try {
    const { settings: remote } = await api.getSettings();
    if (!remote || !Object.keys(remote).length) { await syncUp(); return; }
    const { keys, extra, ...rest } = remote;
    if (extra) { for (const [k, v] of Object.entries(extra)) { if (EXTRA[k]) { try { localStorage.setItem(EXTRA[k], v); } catch { /* ignora */ } } } lastExtra = JSON.stringify(readExtra()); if (extra.gfx) { try { setGfx(JSON.parse(extra.gfx)); } catch { /* ignora */ } } }
    Object.assign(settings, rest); migrate(); persistLocal();
    if (keys) controls.load(keys);
    for (const k of Object.keys(rest)) for (const fn of listeners) fn(k, settings[k]);
  } catch { /* sem conexão: usa o local */ }
}
controls.addEventListener('change', () => { clearTimeout(timer); timer = setTimeout(syncUp, 800); });

onGfx(() => { clearTimeout(timer); timer = setTimeout(syncUp, 800); });
setInterval(() => { if (!session.token) return; if (JSON.stringify(readExtra()) !== lastExtra) syncUp(); }, 15000);   // chat, controle, toque etc. mudam fora daqui: confere a cada 15 s
