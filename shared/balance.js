// Configuração central de balanceamento. Todo número de jogabilidade fica aqui.
// (weapons/zombies/explosives/economy são preenchidos nas fases seguintes.)
import { ARSENAL } from './arsenalData.js';
import { MELEE } from './melee.js';
import { deriveWeapon } from './weaponStats.js';

export const BALANCE = {
  player: {
    // Escala real (metros): jogador 1,8 m, barril 0,9 m. Valores ajustados ao "feeling" do teste do criador.
    walkSpeed: 4.05,     // m/s (+15% sobre a versão anterior)
    runSpeed: 6.83,
    crouchSpeed: 1.7,   // agachado (X) anda mais devagar
    jumpSpeed: 8.6,     // pulo ≈ 1,15 m (v²/2g) — um pouco mais alto que o protótipo
    gravity: 29.04,
    slideDuration: 1.0,     // s — deslizada (tecla C): curta
    slideSpeedMul: 1.4,   // × velocidade de corrida (antes 2,0: deslizava longe demais)
    slideCooldown: 1.0,    // s para poder deslizar de novo (antes 3,0)
    mantle: false,         // ESCALAR EM PÉ (puxar o jogador para cima da borda) DESLIGADO: só sobe quem acerta a altura do pulo. Ligado, andar até um contêiner na cintura já te jogava em cima dele. As JANELAS continuam: pulo + X/C (agachar/deslizar) apertados
    mantleReach: 1.45,     // m acima dos pés (no ar): limite de alcance das mãos
    mantleGround: 1.4,     // m acima do CHÃO de onde pulou: o pulo já levanta os pés ~1 m, então medir só pelos pés no ar deixava subir em coisas de 2,5 m (e na altura do personagem). Cintura/joelho sobe; mais alto que isso não
    stepHeight: 0.5,    // degraus até esta altura são subidos automaticamente
    groundAccel: 75.9,    // m/s² ao acelerar no chão (resposta imediata)
    groundDecel: 66.0,    // m/s² ao soltar as teclas
    airAccel: 12.65,
    maxFallSpeed: 52.0,
    respawnDelayMs: 5000,
    slipMax: 2.2,          // m/s: velocidade MÁXIMA ao escorregar em rampas muito inclinadas (sem embalo infinito)
    spawnProtectMs: 1500,  // sem dano por 1,5 s depois do respawn (conta a partir da liberação do movimento)
    maxHp: 100,
    startArmor: 0,
    armorAbsorb: 0.5
  },
  // Armas: derivadas do Arsenal (shared/weaponStats.js) — dano em HP, distâncias em m, ângulos em rad, tempos em ms.
  weapons: {},
  zombies: {},
  explosives: {
    // quique BEM menor e rola pouco (antes 0,42 / 0,82)
    frag: { fuse: 2.4, radius: 6, maxDamage: 140, minDamage: 8, knockback: 11, throwSpeed: 17.5, bounce: 0.2, friction: 0.55, count: 2, swapMs: 400, throwDelayMs: 350, cooldownMs: 120 },
    impact: { fuse: 99, radius: 5, maxDamage: 120, minDamage: 8, knockback: 10, throwSpeed: 19, bounce: 0, friction: 0.4, count: 2, swapMs: 400, throwDelayMs: 350, cooldownMs: 120 },
    mine: { fuse: 120, radius: 5.5, maxDamage: 170, minDamage: 15, knockback: 14, throwSpeed: 0, bounce: 0, friction: 0.3, count: 1, swapMs: 400, throwDelayMs: 350, cooldownMs: 120 }
  },
  economy: { startGold: 1500 }
};

for (const w of ARSENAL) BALANCE.weapons[w.id] = deriveWeapon(w.id);
for (const m of Object.values(MELEE)) BALANCE.weapons[m.id] = { dmg: m.dmg, head: 1.0, rpm: 60 / m.cd, auto: false, range: m.range, swapMs: 200, mag: 0, reserve: 0, speedMul: m.speed };
BALANCE.weapons.grenade_impact = { rpm: 400, auto: false, swapMs: 400, mag: 0, reserve: 0 };
BALANCE.weapons.fists = { dmg: 22, head: 1.0, rpm: 140, auto: false, range: 1.9, swapMs: 100, mag: 0, reserve: 0 };
BALANCE.weapons.claws = { dmg: BALANCE.weapons.fists.dmg, head: 1.0, rpm: 140, auto: false, range: 2.2, swapMs: 100, mag: 0, reserve: 0, speedMul: 1.3 };   // garras do SUPER ZUMBI (Monstro): o DOBRO do dano da faca (acerto lento: 0,8 s)
BALANCE.weapons.butt = { dmg: 50, meleeK: 1.8, heavyK: 1.5, heavyCd: 2.0, heavyRange: 0.25, head: 1.0, rpm: 75, auto: false, range: 2.1, swapMs: 0, mag: 0, reserve: 0 };
BALANCE.weapons.bomb = { rpm: 60, auto: false, swapMs: 300, mag: 0, reserve: 0 };
BALANCE.weapons.grenade_frag = { rpm: 400, auto: false, swapMs: 400, mag: 0, reserve: 0 };   // sem isto o cliente NÃO lançava a granada
