// Definição central de itens. Armas vêm do Arsenal (shared/arsenalData.js); números de jogabilidade em BALANCE.
import { ARSENAL } from './arsenalData.js';
import { MELEE } from './melee.js';
export const SLOT = { PRIMARY: 'primary', SECONDARY: 'secondary', MELEE: 'melee', GRENADE: 'grenade' };

export const ITEMS = {};
for (const w of ARSENAL) ITEMS[w.id] = { id: w.id, name: w.name, sub: w.sub, slot: w.slot, cls: w.cls, cat: w.cat, desc: w.desc, kind: w.id, gun: true };
ITEMS.knife = { id: 'knife', name: 'LASTLINE Knife', slot: SLOT.MELEE, cls: 'melee', desc: 'Faca de combate.', gun: false };
ITEMS.fists = { id: 'fists', name: 'Punhos', slot: SLOT.MELEE, cls: 'melee', desc: 'Sem nada, no soco.', gun: false };
ITEMS.vehicle = { id: 'vehicle', name: 'Atropelamento', slot: SLOT.MELEE, cls: 'melee', desc: 'Atropelado ou explosão de carro.', gun: false };
ITEMS.train = { id: 'train', name: 'Trem', slot: SLOT.MELEE, cls: 'melee', desc: 'Atropelado pelo trem.', gun: false };
ITEMS.claws = { id: 'claws', name: 'Garras', slot: SLOT.MELEE, cls: 'melee', desc: 'Garras do monstro.', gun: false };
ITEMS.grenade_frag = { id: 'grenade_frag', name: 'Granada de fragmentação', slot: SLOT.GRENADE, cls: 'grenade', desc: 'Explode após 2,4 s.', gun: false };

ITEMS.grenade_smoke = { id: 'grenade_smoke', name: 'Granada de fumaça', slot: SLOT.GRENADE, cls: 'grenade', desc: 'Cria uma nuvem de fumaça por 12 s.', gun: false };
ITEMS.grenade_flash = { id: 'grenade_flash', name: 'Granada de luz', slot: SLOT.GRENADE, cls: 'grenade', desc: 'Cega quem estiver olhando.', gun: false };
ITEMS.grenade_impact = { id: 'grenade_impact', name: 'Granada de impacto', slot: SLOT.GRENADE, cls: 'grenade', desc: 'Explode no contato: bateu no chão, na parede ou em alguém.', gun: false };
ITEMS.grenade_mine = { id: 'grenade_mine', name: 'Mina (armadilha)', slot: SLOT.GRENADE, cls: 'grenade', desc: 'Colocada no chão: explode quando alguém passa perto (inclusive você).', gun: false };
for (const m of Object.values(MELEE)) if (!ITEMS[m.id]) ITEMS[m.id] = { id: m.id, name: m.name, slot: SLOT.MELEE, cls: 'melee', desc: m.desc, gun: false };
ITEMS.bomb = { id: 'bomb', name: 'Bomba C4', slot: 'bomb', cls: 'bomb', desc: 'Planta num ponto de bomba (segure o botão de atirar).', gun: false };   // modo Bomba (Tático)
export const GUN_IDS = ARSENAL.map((w) => w.id);
export const ITEM_IDS = Object.keys(ITEMS);
export const itemIndex = (id) => ITEM_IDS.indexOf(id);

const CLASS_FILTERS = Object.fromEntries(['sniper', 'smg', 'shotgun', 'energy', 'rifle', 'lmg', 'dual', 'pistol', 'special', 'launcher'].map((c) => [c, (i) => ITEMS[i].cls === c]));
// Regras de armamento da partida (cfg.weapons) -> armas que o jogador pode escolher.
// "Uma arma desbloqueada não significa que serve em todo modo": o modo decide (AllowedWeaponsByGameMode);
// o jogador só pode escolher o que está nas duas listas (desbloqueadas ∩ permitidas).
export function allowedLoadout(cfg, unlocked = null) {
  const prim = GUN_IDS.filter((i) => ITEMS[i].slot === SLOT.PRIMARY);
  const sec = GUN_IDS.filter((i) => ITEMS[i].slot === SLOT.SECONDARY);
  let out;
  switch (cfg.weapons) {
    case 'primary': out = { primary: prim, secondary: [] }; break;
    case 'secondary': out = { primary: [], secondary: sec }; break;
    case 'sniper': case 'smg': case 'shotgun': case 'energy': case 'rifle': case 'lmg': case 'dual': case 'pistol': case 'special': case 'launcher':
      out = { primary: prim.filter(CLASS_FILTERS[cfg.weapons]), secondary: sec.filter(CLASS_FILTERS[cfg.weapons]) }; break;
    case 'fists': case 'melee': out = { primary: [], secondary: [] }; break;
    default: out = { primary: prim, secondary: sec };
  }
  if (unlocked) { out.primary = out.primary.filter((i) => unlocked.includes(i)); out.secondary = out.secondary.filter((i) => unlocked.includes(i)); }
  return { ...out, knife: cfg.knife !== false && cfg.weapons !== 'fists', grenades: cfg.grenades !== false && cfg.weapons !== 'fists' && cfg.weapons !== 'melee', fists: cfg.weapons === 'fists' };
}

export function defaultLoadout(cfg, unlocked = null) {
  const a = allowedLoadout(cfg, unlocked);
  return { primary: a.primary.includes('ar') ? 'ar' : a.primary[0] ?? null, secondary: a.secondary.includes('pistol') ? 'pistol' : a.secondary[0] ?? null };
}
