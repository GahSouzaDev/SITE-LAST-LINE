import * as THREE from 'three';
import { Creature } from './creatureRig.js';
// ADAPTADOR: faz um animal da fauna (Creature) se comportar como um Avatar para o resto do jogo (jogadores remotos, mortes, golpes).
// O animal olha para +Z e o jogo gira os corpos pelo yaw (frente = -Z): o grupo interno gira meia-volta.
export class FaunaAv {
  constructor(speciesId, scale = 1) {
    this.cr = new Creature(speciesId); this.scale = scale; this.group = new THREE.Group(); const h = new THREE.Group(); h.rotation.y = Math.PI; h.scale.setScalar(scale); h.add(this.cr.group); this.group.add(h);
    this.weapon = null; this.dead = false; this.isFauna = true;
  }
  update(dt, st = {}) { const spd = st.spd || 0; this.cr.setMotion(spd, spd > this.cr.sp.walk * 1.25 ? 'flee' : 'calm'); this.cr.update(dt); }
  setDead(d) { d = !!d; if (d && !this.dead) this.cr.die(); else if (!d && this.dead) this.cr.revive(); this.dead = d; }
  melee(k, big = false) { const a = this.cr.sp.atk; if (this.cr.sp.hp === undefined && !a.length) return; try { this.cr.attack(a.includes(k) ? k : a[0], big); } catch { /* sem animação */ } }
  hurt() { this.cr.hurt(); }
  setFP() {} hold() {} dispose() {} kick() {} rec() {} barrelDir() { return new THREE.Vector3(0, 0, -1); } eyeWorld() { return this.group.getWorldPosition(new THREE.Vector3()); }
}
