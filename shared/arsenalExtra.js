// Armas novas (modelo reaproveitado de uma arma-base do Arsenal + aparência própria; trocar por modelos novos quando existirem).
export const EXTRA = [
  { id: 'scout', base: 'sniper', name: 'SENTINEL SR-3', sub: 'Rifle de ferrolho leve', cat: 'Precisão', cls: 'sniper', slot: 'primary', desc: 'Sniper leve e ágil para começar: ferrolho rápido, pente de 6 e luneta de longo alcance.', len: 1.05,
    st: { a: 82, b: 48, e: 650, m: 1700, r: 70, c: 6, rc: 0.7, mo: 0.45, ac: 0.95, nz: 380, rl: 2.6 }, fx: { cd: 0.75, semi: true, beam: false, flame: false, charge: false, rocket: false, big: true, supp: false, both: false } },
  { id: 'vector', base: 'pdw', name: 'VECTOR-X', sub: 'Submetralhadora compacta', cat: 'SMGs', cls: 'smg', slot: 'primary', desc: 'Cadência altíssima e mobilidade total: corta distâncias curtas em segundos.', len: 0.46,
    st: { a: 20, b: 10, e: 65, m: 260, r: 900, c: 30, rc: 0.45, mo: 0.95, ac: 0.65, nz: 160, rl: 1.5 }, fx: { cd: 0.055, semi: false, beam: false, flame: false, charge: false, rocket: false, big: false, supp: false, both: false, tr: 16724032, col: 16724032 } },
  { id: 'pump', base: 'shotgun', name: 'TROJAN-8', sub: 'Escopeta semiautomática', cat: 'Escopetas', cls: 'shotgun', slot: 'primary', desc: 'Escopeta calibre 12 semiautomática: menos dano por tiro, mas dispara muito mais rápido.', len: 0.95,
    st: { a: 12, b: 3, p: 9, e: 32, m: 110, r: 180, c: 8, rc: 0.7, mo: 0.7, ac: 0.5, nz: 220, rl: 3.0 }, fx: { cd: 0.35, semi: true, beam: false, flame: false, charge: false, rocket: false, big: true, supp: false, both: false, pel: 9 } }
];
