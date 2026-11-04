import * as THREE from 'three';
// MIRA A LASER: emissor sob o cano + feixe fino aditivo + pontinho no que for atingido.
// Montado no modelo CRU do Arsenal (cano para +X). `laserUpdate` mede a distância com o BVH do mapa a cada quadro.
export const LASER_COL = { red: 0xff2a2a, green: 0x2dff62 };
const beamGeo = new THREE.BoxGeometry(1, 1, 1); beamGeo.translate(0.5, 0, 0);
const dotGeo = new THREE.SphereGeometry(1, 8, 6), shellGeo = new THREE.BoxGeometry(1, 1, 1);
export function addLaser(model, kind) {
  return null;   // MIRA LASER DESATIVADA (pedido do Gabriel: só volta quando estiver 100% certa)
  const col = LASER_COL[kind]; if (!col || !model.userData.mz?.[0]) return null;
  model.updateMatrixWorld(true);
  const mz = model.worldToLocal(model.userData.mz[0].getWorldPosition(new THREE.Vector3()));
  const g = new THREE.Group(); g.name = '__laser'; g.userData.kind = kind;
  const body = new THREE.Mesh(shellGeo, new THREE.MeshStandardMaterial({ color: 0x1b1f26, roughness: 0.5, metalness: 0.6 })); body.scale.set(0.2, 0.07, 0.08); body.position.set(-0.08, 0, 0); g.add(body);
  const lens = new THREE.Mesh(shellGeo, new THREE.MeshBasicMaterial({ color: col })); lens.scale.set(0.03, 0.045, 0.045); lens.position.set(0.03, 0, 0); g.add(lens);
  const mat = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false });
  const beam = new THREE.Mesh(beamGeo, mat); beam.name = '__beam'; beam.scale.set(40, 0.012, 0.012); beam.position.set(0.05, 0, 0); beam.renderOrder = 5; g.add(beam);
  const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.95, depthWrite: false, depthTest: true })); dot.name = '__dot'; dot.scale.setScalar(0.04); dot.renderOrder = 6; dot.visible = false; g.add(dot);
  g.position.set(mz.x - 0.05, mz.y - 0.11, mz.z); model.add(g);
  g.traverse((o) => { o.frustumCulled = false; });
  return g;
}
const _o = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3(), _ray = new THREE.Ray();
// Ajusta o comprimento do feixe ao primeiro obstáculo (até 60 m) e põe o ponto. `bvh` = collider.bvh do mapa.
export function laserUpdate(laser, bvh, maxM = 60) {
  const beam = laser.getObjectByName('__beam'), dot = laser.getObjectByName('__dot'); if (!beam) return;
  beam.updateWorldMatrix(true, false); beam.matrixWorld.decompose(_o, _q, _s);
  const ws = laser.parent ? laser.parent.getWorldScale(new THREE.Vector3()).x : 1;   // escala do modelo no mundo
  _d.set(1, 0, 0).applyQuaternion(_q).normalize();
  let dist = maxM;
  if (bvh) { _ray.origin.copy(_o); _ray.direction.copy(_d); const h = bvh.raycastFirst(_ray, THREE.DoubleSide, 0, maxM); if (h) dist = h.distance; }
  beam.scale.x = dist / ws; if (dot) { dot.visible = dist < maxM - 0.5; dot.position.set(beam.position.x + dist / ws, 0, 0); dot.scale.setScalar(0.018 / ws + dist * 0.0012 / ws); }
}

const _t = new THREE.Vector3(), _p = new THREE.Vector3(), _v = new THREE.Vector3(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _X = new THREE.Vector3(1, 0, 0);
/** MIRA A LASER na 1ª pessoa: FIXA no cano, ESTÁTICA (nunca se mexe sozinha). O ângulo de convergência é calculado UMA vez, quando a mira (ADS) assenta,
 *  para o ponto final bater onde a mira base acerta; depois fica congelado e só anda junto com a arma. `cal` = true quando é para (re)calibrar. O ponto fica onde o feixe bate. */
export function laserAim(laser, bvh, origin, dir, maxM = 60, cal = false) {
  const beam = laser.getObjectByName('__beam'), dot = laser.getObjectByName('__dot'); if (!beam || !laser.parent) return;
  laser.parent.updateWorldMatrix(true, false); laser.updateWorldMatrix(true, false); laser.getWorldPosition(_p);
  const u = laser.userData; if (!cal) u.locked = false;
  if (dir && (!u.cal || (cal && !u.locked))) {   // calibra: ponto a 30 m (ou onde a mira bate, se mais perto, mínimo 8 m)
    let D = Math.min(maxM, 30); if (bvh) { _ray.origin.copy(origin); _ray.direction.copy(dir); const h = bvh.raycastFirst(_ray, THREE.DoubleSide, 0, D); if (h) D = Math.max(h.distance, 8); }
    _t.copy(origin).addScaledVector(dir, D); _v.copy(_t).sub(_p);
    if (_v.length() > 0.2) { _v.normalize(); laser.parent.getWorldQuaternion(_q2).invert(); _q3.setFromUnitVectors(_X, _v); laser.quaternion.copy(_q2.multiply(_q3)); u.cal = 1; if (cal) u.locked = true; }
  }
  laser.updateMatrixWorld(true);
  beam.updateWorldMatrix(true, false); beam.matrixWorld.decompose(_o, _q, _s); _d.set(1, 0, 0).applyQuaternion(_q).normalize();
  let dist = maxM, hit = false; if (bvh) { _ray.origin.copy(_o); _ray.direction.copy(_d); const h = bvh.raycastFirst(_ray, THREE.DoubleSide, 0, maxM); if (h) { dist = h.distance; hit = true; } }
  const ws = laser.parent.getWorldScale(new THREE.Vector3()).x || 1; beam.scale.x = dist / ws;
  if (dot) { dot.visible = hit; dot.position.set(beam.position.x + dist / ws, 0, 0); dot.scale.setScalar(0.018 / ws + dist * 0.0012 / ws); }
}
