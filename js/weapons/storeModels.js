// ARMAS DA LOJA (edição lendária do Gabriel): 6 armas EXCLUSIVAS, só compra no Mercado. Modelos portados do arsenal-lendario.html (eixo do cano = +X; gunModels.js normaliza).
// A animação viva (cobra serpenteando, fitas, bolhas) é desenhada uma vez numa pose fixa: o jogo usa o modelo estático.
import * as THREE from 'three';
const T = THREE, R = Math.random, V = (x = 0, y = 0, z = 0) => new T.Vector3(x, y, z), rv = () => V(R() - .5, R() - .5, R() - .5);
const C = { g: 0x13a04a, y: 0xffd21a, b: 0x1c4fd8 };
const M=(c,o={})=>new T.MeshStandardMaterial({color:c,roughness:o.r??.5,metalness:o.m??.1,emissive:o.e??0,emissiveIntensity:o.ei??1,side:o.s??0});
const G=(g,geo,m,p=[0,0,0],r=[0,0,0],s=[1,1,1])=>{const k=new T.Mesh(geo,m);k.position.set(...p);k.rotation.set(...r);k.scale.set(...s);g.add(k);return k};
const bx=(g,w,h,d,p,m,r)=>G(g,new T.BoxGeometry(w,h,d),m,p,r);
const cy=(g,r1,r2,h,p,m,ax='x',sg=16)=>G(g,new T.CylinderGeometry(r1,r2,h,sg),m,p,ax=='x'?[0,0,-Math.PI/2]:ax=='z'?[Math.PI/2,0,0]:[0,0,0]);
const sp=(g,r,p,m,s)=>G(g,new T.SphereGeometry(r,18,12),m,p,[0,0,0],s);
const mz=(g,x,y=0,z=0)=>{const o=new T.Object3D();o.position.set(x,y,z);g.add(o);return o};
const hc=(h,l=.55,s=1)=>new T.Color().setHSL(((h%1)+1)%1,s,l);
const pal=[C.g,C.y,C.b,0xffffff];
const em = () => {};
function surdo(){const g=new T.Group(),d=new T.Group();g.add(d);const wood=M(0x6b3414,{r:.6}),skin=M(0xf1e7cc,{r:.85}),st=M(0x9aa4ae,{m:.9,r:.3}),dk=M(0x17181c),rm=[];
cy(d,.42,.42,.5,[0,0,0],wood,'z',36);
[[C.g,-.15],[C.y,0],[C.b,.15]].forEach(([c,z])=>cy(d,.43,.43,.09,[0,0,z],M(c,{m:.2,e:c,ei:.3}),'z',36));
for(const s of[-1,1]){cy(d,.4,.4,.02,[0,0,s*.26],skin,'z',36);cy(d,.46,.46,.04,[0,0,s*.24],st,'z',36)}
for(let i=0;i<10;i++){const a=i/10*6.283;cy(d,.012,.012,.52,[Math.cos(a)*.47,Math.sin(a)*.47,0],st,'z',6)}
cy(g,.09,.09,1.1,[.95,0,0],st);cy(g,.27,.09,.42,[1.7,0,0],dk);
for(const x of[1.52,1.64,1.76,1.88]){const m=M(0xffffff,{e:0xff0000,ei:2});rm.push(m);G(g,new T.TorusGeometry(.1+(x-1.49)/.42*.18,.022,8,28),m,[x,0,0],[0,Math.PI/2,0])}
bx(g,.13,.42,.15,[-.1,-.62,0],wood,[0,0,.15]);bx(g,.7,.14,.16,[-.85,-.05,0],wood);
const o={g,mz:[mz(g,1.97)],pulse:0,upd(t){rm.forEach((m,i)=>{m.color.setHSL((t*.4+i*.15)%1,1,.5);m.emissive.setHSL((t*.4+i*.15)%1,1,.5)});o.pulse*=.9;d.scale.set(1+o.pulse*.05,1+o.pulse*.05,1+o.pulse*.12)}};return o}
function rojao(){const g=new T.Group(),st=M(0xd4a017,{m:.8,r:.3}),mzs=[],fl=[];const cl=[C.g,C.y,C.b,0xd8321f,0xffffff,C.g,C.y];
[[0,0],...[0,1,2,3,4,5].map(i=>[Math.cos(i*1.047)*.17,Math.sin(i*1.047)*.17])].forEach(([y,z],i)=>{cy(g,.075,.075,1.5,[.2,y,z],M(cl[i],{r:.8,e:cl[i],ei:.12}));cy(g,.06,.06,.03,[.96,y,z],M(0x111111,{e:0xff7a00,ei:.8}));mzs.push(mz(g,.99,y,z))});
for(const x of[-.3,.2,.7])cy(g,.27,.27,.07,[x,0,0],st);
bx(g,.13,.45,.15,[-.1,-.6,0],M(0x6b3414),[0,0,.15]);
const N=14,fm=[];for(let i=0;i<N;i++){const u=i/(N-1),f=G(g,new T.ConeGeometry(.07,.17,3),M(pal[i%4],{s:2,e:pal[i%4],ei:.3}),[-.5+u*1.55,.33-Math.sin(u*3.14)*.1-.09,0],[0,0,3.14]);fm.push(f)}
cy(g,.004,.004,1.6,[.28,.36,0],M(0x222222));cy(g,.012,.012,.2,[-.62,0,0],M(0xffcc66,{e:0xff9900,ei:1}));
const o={g,mz:mzs,n:0,upd(t,dt){fm.forEach((f,i)=>f.rotation.x=Math.sin(t*3+i*.6)*.35);if(R()<dt*30)em(g.localToWorld(V(-.72,0,0)),rv().multiplyScalar(2).add(V(-1,1,0)),R()*.15+.08,.12,.4,1)}};return o}
function chain(g,N,rad,mat){const s=[];for(let i=0;i<N;i++)s.push(sp(g,rad(i/(N-1)),[0,0,0],mat(i)));return s}
function sucuri(){const g=new T.Group(),N=34,gm=M(0x1f9d3a,{r:.4,e:0x0a4a18,ei:.5}),ym=M(C.y,{r:.4,e:C.y,ei:.35});
const seg=chain(g,N,u=>.05+.075*Math.sin(Math.PI*Math.min(1,u*1.05)),i=>i%4==2?ym:gm);
const head=new T.Group();g.add(head);sp(head,.13,[.04,0,0],gm,[1.7,1,1.15]);for(const s of[-1,1]){sp(head,.03,[.12,.07,s*.08],M(C.y,{e:C.y,ei:2}));bx(head,.2,.012,.02,[.3,0,s*.02],M(0xd8321f,{e:0xd8321f,ei:.8}),[0,s*.25,0])}
bx(g,.12,.3,.1,[-.15,-.25,0],M(0x6b3414),[0,0,.1]);
const o={g,mz:[mz(head,.24)],lunge:0,upd(t,dt){const P=[];seg.forEach((m,i)=>{const u=i/(N-1);m.position.set(-1.1+u*2.3,Math.sin(u*6.5-t*2.6)*.14*(.3+u)+.05,Math.cos(u*4.5-t*2)*.1*u);P.push(m.position)});
head.position.copy(P[N-1]);head.quaternion.setFromUnitVectors(V(1,0,0),P[N-1].clone().sub(P[N-3]).normalize());o.lunge*=.9;head.scale.setScalar(1+o.lunge*.35);head.position.x+=o.lunge*.15}};return o}
function boto(){const g=new T.Group(),N=18,pk=M(0xff6fae,{r:.35,e:0xff2a8a,ei:.25}),lt=M(0xffb3d2,{r:.35,e:0xff6fae,ei:.2});
const seg=chain(g,N,u=>u<.82?.035+.2*Math.sin(Math.PI*Math.pow(u/.82,.8)):.06,i=>i>5&&i<14?lt:pk);seg.forEach(s=>s.scale.x=1.3);
const fk=new T.Group();g.add(fk);bx(fk,.14,.02,.22,[-.05,0,.12],pk,[0,-.5,0]);bx(fk,.14,.02,.22,[-.05,0,-.12],pk,[0,.5,0]);
const fin=G(g,new T.ConeGeometry(.07,.22,4),pk),tip=new T.Group();g.add(tip);const ey=[-1,1].map(s=>sp(g,.03,[0,0,0],M(0x080808,{r:.2})));
bx(g,.12,.3,.1,[-.15,-.4,0],M(0x6b3414),[0,0,.1]);
const o={g,mz:[mz(tip,.07)],upd(t,dt){const P=[];seg.forEach((m,i)=>{const u=i/(N-1);m.position.set(-1.05+u*2.2,Math.sin(u*5-t*3.6)*.13*(1.15-u)+.1,0);P.push(m.position)});
fk.position.copy(P[0]);fk.rotation.z=Math.atan2(P[1].y-P[0].y,P[1].x-P[0].x);fin.position.copy(P[8]).add(V(0,.2,0));fin.rotation.z=.5;
tip.position.copy(P[N-1]);tip.quaternion.setFromUnitVectors(V(1,0,0),P[N-1].clone().sub(P[N-3]).normalize());ey[0].position.copy(P[14]).add(V(.02,.07,.13));ey[1].position.copy(P[14]).add(V(.02,.07,-.13));
if(R()<dt*20)em(g.localToWorld(P[13].clone().add(V(0,.2,0))),V(0,1.2,0).add(rv().multiplyScalar(.5)),R()<.5?.9:.5,.12,1.2,-.3)}};return o}
function berim(){const g=new T.Group(),wd=M(0x8a4a1e,{r:.55}),cvv=new T.QuadraticBezierCurve3(V(-1.2,-.05,0),V(0,.75,0),V(1.2,-.05,0));
G(g,new T.TubeGeometry(cvv,48,.04,8),wd);
[.1,.2,.3,.7,.8,.9].forEach((u,i)=>{const p=cvv.getPoint(u),c=[0xd8321f,C.y,C.g][i%3],k=G(g,new T.CylinderGeometry(.056,.056,.06,10),M(c,{e:c,ei:.25}),[p.x,p.y,p.z]);k.quaternion.setFromUnitVectors(V(0,1,0),cvv.getTangent(u))});
const str=cy(g,.007,.007,2.4,[0,-.05,0],M(0xdde6ee,{m:1,r:.2,e:0x88aaff,ei:.6}));
sp(g,.3,[-.55,-.4,0],M(0xe0922b,{r:.5,e:0xff7a00,ei:.2}),[1,1.1,1]);cy(g,.1,.1,.02,[-.55,-.4,.28],M(0x1a0b02,{e:0xffb347,ei:.9}),'z');
bx(g,.12,.45,.12,[.2,-.35,0],wd);
const rb=[C.g,C.y,C.b,0xd8321f].map((c,i)=>{const p=new T.Group();p.position.set(1.2,-.05,(i-1.5)*.04);g.add(p);bx(p,.04,.5,.01,[0,-.25,0],M(c,{e:c,ei:.4}));return p});
const o={g,mz:[mz(g,1.3,-.05)],vib:0,upd(t,dt){rb.forEach((p,i)=>{p.rotation.z=Math.sin(t*3+i)*.25;p.rotation.x=Math.cos(t*2+i)*.2});o.vib*=.93;str.scale.x=str.scale.z=1+o.vib*5;str.position.y=-.05+Math.sin(t*90)*.03*o.vib}};return o}
function arraia(){const g=new T.Group(),k=new T.Group();g.add(k);const c0=[.2,0],P=[[1.1,0],[.2,.5],[-.6,0],[.2,-.5]];
for(let i=0;i<4;i++){const a=P[i],b=P[(i+1)%4],geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(new Float32Array([c0[0],c0[1],0,a[0],a[1],0,b[0],b[1],0]),3));geo.computeVertexNormals();const c=pal[i];G(k,geo,M(c,{s:2,e:c,ei:.45}))}
const wd=M(0x4a2a12);cy(k,.012,.012,1.7,[.25,0,0],wd);cy(k,.012,.012,1,[.2,0,0],wd,'y');
const tl=[];for(let i=0;i<12;i++)tl.push(bx(k,.12,.05,.01,[0,0,0],M(pal[i%4],{e:pal[i%4],ei:.5,s:2})));
const lp=V(-.3,-.55,0),lc=V(.2,0,0),dir=lc.clone().sub(lp),ln=G(g,new T.CylinderGeometry(.006,.006,dir.length(),5),M(0xffffff,{e:0xaaccff,ei:1}),[(lp.x+lc.x)/2,(lp.y+lc.y)/2,0]);ln.quaternion.setFromUnitVectors(V(0,1,0),dir.normalize());
cy(g,.1,.1,.2,[-.3,-.6,0],M(0xd8321f),'z');bx(g,.12,.32,.12,[-.3,-.85,0],M(0x6b3414));
const o={g,mz:[mz(k,1.15)],upd(t){k.position.y=Math.sin(t*1.7)*.05+.15;k.rotation.z=Math.sin(t*1.2)*.04;tl.forEach((b,i)=>b.position.set(-.7-i*.12,Math.sin(i*.7-t*5)*.07*(i/4),0))}};return o}

// ===== LENDÁRIA II–V (portadas dos arsenal-lendario-2..5.html) =====
const grip=(g,x,y=-.42)=>bx(g,.13,.42,.13,[x,y,0],M(0x6b3414),[0,0,.15]);
function saci(){const g=new T.Group(),pv=[];
for(let i=0;i<9;i++){const p=new T.Group();p.position.x=-.4+i*.17;g.add(p);G(p,new T.TorusGeometry(.07+i*.045,.025,8,24),M(0x9fd8ff,{r:.3,e:0x5aa8ff,ei:.6}),[0,0,0],[0,Math.PI/2,0],[1,.6,1]);pv.push(p)}
cy(g,.2,.01,.5,[-.8,0,0],M(0xd8321f,{e:0xd8321f,ei:.4}));cy(g,.03,.03,1.5,[.35,0,0],M(0xffffff,{e:0x88ddff,ei:1}));cy(g,.05,.06,.12,[-.3,.3,.12],M(0x3a2410),'y');grip(g,-.05);
return{g,mz:[mz(g,1.2)],upd(t){pv.forEach((p,i)=>{p.rotation.x=t*4+i*.6;p.position.y=Math.sin(t*3+i)*.03})}}}
function iara(){const g=new T.Group(),sh=M(0xffd0e0,{r:.3,e:0xff8ab0,ei:.25}),hr=[];
for(let i=0;i<20;i++){const a=i*.9,rr=.32*(1-i/24);sp(g,.06+.2*(1-i/22),[.85-i*.075,Math.cos(a)*rr,Math.sin(a)*rr],sh)}
const wt=cy(g,.27,.27,.03,[.98,0,0],M(0x2ac8ff,{e:0x2ac8ff,ei:1}));
for(let i=0;i<10;i++)hr.push(sp(g,.045,[0,0,0],M(0x0e7a4a,{e:0x13a04a,ei:.6})));grip(g,.1,-.5);
return{g,mz:[mz(g,1.05)],upd(t){hr.forEach((h,i)=>h.position.set(-.65-i*.1,Math.sin(t*3+i*.7)*.1*(i/4+.3)-.05,Math.cos(t*2+i*.5)*.08));wt.material.emissiveIntensity=.8+Math.sin(t*4)*.3}}}
function boitata(){const g=new T.Group(),N=30,o1=M(0xff5a10,{e:0xff5a10,ei:1.4}),o2=M(0xffd21a,{e:0xffd21a,ei:1.6});
const seg=chain(g,N,u=>.06+.07*Math.sin(Math.PI*Math.min(1,u)),i=>i%3?o1:o2),head=new T.Group();g.add(head);sp(head,.15,[.03,0,0],o2,[1.5,1,1]);
for(const s of[-1,1])sp(head,.035,[.1,.08,s*.09],M(0xaaf0ff,{e:0x44ccff,ei:3}));grip(g,-.15,-.3);
const o={g,mz:[mz(head,.25)],lunge:0,upd(t,dt){const P=[];seg.forEach((m,i)=>{const u=i/(N-1);m.position.set(-1.1+u*2.3,Math.sin(u*7-t*3.2)*.2*(.3+u)+.05,Math.cos(u*5-t*2.4)*.14*u);P.push(m.position)});
head.position.copy(P[N-1]);head.quaternion.setFromUnitVectors(V(1,0,0),P[N-1].clone().sub(P[N-3]).normalize());o.lunge*=.9;head.scale.setScalar(1+o.lunge*.3);
for(let k=0;k<2;k++)em(g.localToWorld(P[(R()*N)|0].clone()),V(0,1.3,0).add(rv()),.04+R()*.1,.28,.55,-1.5)}};return o}
function cuca(){const g=new T.Group(),gn=M(0x3a7a2a,{r:.6,e:0x0a2a05,ei:.5}),wh=M(0xffffff,{r:.4}),pu=M(0x6a1fc2,{r:.5,e:0x6a1fc2,ei:.4}),up=new T.Group(),lo=new T.Group();g.add(up,lo);up.position.x=lo.position.x=-.15;
bx(up,1.1,.14,.36,[.55,.07,0],gn);bx(lo,1,.1,.32,[.5,-.05,0],gn);
for(let i=0;i<8;i++)for(const z of[-.16,.16]){G(up,new T.ConeGeometry(.025,.07,5),wh,[.15+i*.12,-.01,z],[Math.PI,0,0]);G(lo,new T.ConeGeometry(.025,.07,5),wh,[.15+i*.12,.035,z])}
for(const s of[-1,1]){sp(up,.07,[.2,.2,s*.14],gn);sp(up,.03,[.25,.21,s*.17],M(0xffe14a,{e:0xffe14a,ei:2}))}
const gl=sp(g,.12,[.4,0,0],M(0xb45cff,{e:0xb45cff,ei:2}));cy(g,.02,.2,.45,[-.05,.58,0],pu,'y');cy(g,.3,.3,.03,[-.05,.36,0],pu,'y');grip(g,.05);
const o={g,mz:[mz(g,.95,.02)],open:0,upd(t){o.open*=.9;up.rotation.z=.08+.3*o.open+Math.sin(t*2)*.02;lo.rotation.z=-.05-.18*o.open;gl.scale.setScalar(1+o.open*.8+Math.sin(t*5)*.1)}};return o}
function tucano(){const g=new T.Group(),bk=M(0x0f0f12,{r:.5}),or=M(0xff8a00,{r:.4,e:0xff6a00,ei:.35}),up=new T.Group(),lo=new T.Group();g.add(up,lo);up.position.x=lo.position.x=.1;
sp(up,.35,[.65,.07,0],or,[2.5,.55,.6]);sp(up,.22,[.9,.07,0],M(C.y,{e:C.y,ei:.3}),[1.8,.4,.45]);sp(up,.16,[1.5,.04,0],M(0xe02020,{e:0xe02020,ei:.4}),[1,.8,.8]);sp(lo,.3,[.6,-.12,0],or,[2.2,.35,.5]);
sp(g,.4,[-.35,.05,0],bk);sp(g,.28,[-.05,-.12,0],M(0xfff2b0,{e:C.y,ei:.2}));
for(const s of[-1,1]){sp(g,.1,[-.1,.15,s*.3],M(0x2aa8ff,{e:0x2aa8ff,ei:.8}));sp(g,.045,[-.06,.16,s*.37],bk)}
bx(g,.5,.12,.3,[-.8,-.05,0],bk,[0,0,.3]);grip(g,-.2,-.5);
const o={g,mz:[mz(g,1.72,.04)],open:0,upd(t){o.open*=.9;up.rotation.z=.04+o.open*.25;lo.rotation.z=-.03-o.open*.18}};return o}
function trio(){const g=new T.Group(),dk=M(0x15161a,{r:.6}),lt=[],nn=[];bx(g,.9,.95,.95,[0,0,0],dk);
const wf=cy(g,.32,.14,.2,[.52,.12,0],M(0x222428,{m:.5}));const wr=G(g,new T.TorusGeometry(.33,.03,8,24),M(0xffffff,{e:0xff00ff,ei:1.5}),[.5,.12,0],[0,Math.PI/2,0]);
for(const z of[-.25,.25])cy(g,.12,.05,.14,[.5,-.3,z],M(0x222428));
for(let i=0;i<5;i++)lt.push(sp(g,.07,[-.3+i*.15,.55,0],M(0xffffff,{e:0xffffff,ei:2})));
for(const z of[-.48,.48])for(const x of[.46,-.46])nn.push(bx(g,.02,.95,.02,[x,0,z],M(0xffffff,{e:0xffffff,ei:2})));
cy(g,.01,.01,.5,[-.4,.8,0],dk,'y');grip(g,-.1,-.7);
const o={g,mz:[mz(g,.68,.12)],pulse:0,upd(t){[...lt,...nn].forEach((m,i)=>{const c=hc(t*.8+i*.12);m.material.emissive.copy(c);m.material.color.copy(c)});o.pulse*=.9;wf.scale.set(1+o.pulse*.15,1,1+o.pulse*.15);wr.scale.setScalar(1+o.pulse*.1)}};return o}
// tiros
function diabo(){const g=new T.Group(),bk=M(0x14090a,{m:.7,r:.35}),rd=M(0xc01010,{e:0xff1a00,ei:.8,m:.4}),bn=M(0xe8dcc0,{r:.6}),gl=[],mzs=[];
bx(g,1.3,.3,.22,[0,0,0],bk);bx(g,.9,.1,.26,[0,.2,0],rd);bx(g,.5,.18,.16,[-.9,-.05,0],bk);grip(g,-.2);
[[.07,0],[-.05,-.1],[-.05,.1]].forEach(([y,z])=>{cy(g,.05,.05,1.2,[1.15,y,z],bk);const m=M(0xffffff,{e:0xff2200,ei:2});gl.push(m);G(g,new T.TorusGeometry(.065,.015,6,14),m,[1.7,y,z],[0,Math.PI/2,0]);mzs.push(mz(g,1.78,y,z))});
cy(g,.25,.25,.3,[-.1,-.32,0],bk,'z');cy(g,.12,.12,.32,[-.1,-.32,0],M(0xff2200,{e:0xff2200,ei:1.2}),'z');
for(const s of[-1,1]){G(g,new T.ConeGeometry(.07,.42,6),bn,[.12,.45,s*.12],[s*.35,0,0]);sp(g,.04,[.38,.37,s*.08],M(0xff2200,{e:0xff2200,ei:3}))}
sp(g,.17,[.25,.34,0],bn,[1.1,1,.9]);
return{g,mz:mzs,n:0,upd(t,dt){gl.forEach(m=>m.emissiveIntensity=1.5+Math.sin(t*30)*.5);if(R()<dt*40)for(const s of[-1,1])em(g.localToWorld(V(.4,.4,s*.08)),V(0,1.5,0).add(rv().multiplyScalar(.5)),R()*.05,.2,.6,-1)}}}
function dragao(){const g=new T.Group(),gr=M(0x0d5a3a,{m:.5,r:.35,e:0x00c070,ei:.3}),gd=M(0xd4a017,{m:.9,r:.3,e:0x553300,ei:.2}),bn=M(0xf0e6c8,{r:.5}),dk=M(0x15161a,{m:.9,r:.3}),ey=M(0xffe14a,{e:0xff3300,ei:3}),jw=new T.Group();
bx(g,1.1,.2,.15,[0,0,0],gr);bx(g,.6,.16,.14,[-.85,-.04,0],gr);grip(g,-.1);cy(g,.04,.04,1.8,[1.4,0,0],dk);
for(let i=0;i<6;i++)G(g,new T.TorusGeometry(.06,.016,6,12),gd,[.7+i*.28,0,0],[0,Math.PI/2,0]);
cy(g,.06,.06,.7,[.3,.22,0],dk);sp(g,.05,[.67,.22,0],ey);for(const s of[-1,1])bx(g,.55,.02,.4,[.1,.1,s*.2],gr,[s*.6,0,.15]);
const h=new T.Group();h.position.set(2.2,0,0);g.add(h);bx(h,.45,.2,.24,[.1,.02,0],gr);bx(h,.3,.1,.17,[.4,0,0],gr);jw.position.set(0,-.07,0);h.add(jw);bx(jw,.5,.06,.18,[.2,0,0],gr);
for(const s of[-1,1]){G(h,new T.ConeGeometry(.04,.3,5),bn,[-.1,.15,s*.1],[0,0,.9]);sp(h,.035,[.15,.1,s*.1],ey)}
for(let i=0;i<4;i++)G(h,new T.ConeGeometry(.012,.05,4),bn,[.25+i*.07,-.04,.07],[Math.PI,0,0]);
const o={g,mz:[mz(h,.62)],open:0,upd(t,dt){o.open*=.92;jw.rotation.z=-(.05+o.open*.5);if(R()<dt*10)em(mp(o.mz[0]),V(0,.6,0),.05,.15,.8,-.3)}};return o}
function onca(){const g=new T.Group(),or=M(0xf08a1a,{r:.5,e:0x802a00,ei:.3}),bk=M(0x0b0b0b,{r:.5}),dk=M(0x2a2a2e,{m:.8,r:.35}),cl=M(0xfff3d6,{r:.3,e:0xffddaa,ei:.3}),ey=[];
bx(g,1.2,.24,.2,[0,0,0],or);bx(g,.6,.2,.18,[-.85,-.04,0],or,[0,0,.08]);bx(g,.5,.16,.2,[.9,.02,0],or);cy(g,.04,.04,.9,[1.45,0,0],dk);grip(g,-.1);bx(g,.16,.4,.12,[.35,-.3,0],dk,[0,0,-.1]);
for(let i=0;i<22;i++)G(g,new T.SphereGeometry(.03,6,4),bk,[-1+R()*1.9,(R()-.5)*.2,(R()<.5?-1:1)*.105],[0,0,0],[1,1,.35]);
for(const z of[-.07,0,.07])G(g,new T.ConeGeometry(.03,.3,5),cl,[2.05,0,z],[z*6,0,-Math.PI/2]);
for(const s of[-1,1])ey.push(sp(g,.035,[.55,.08,s*.09],M(0xffe14a,{e:0xffcc00,ei:3})));
return{g,mz:[mz(g,2.25)],upd(t){ey.forEach(e=>e.material.emissiveIntensity=2+Math.sin(t*6))}}}
function lampiao(){const g=new T.Group(),wd=M(0x5b3418,{r:.6}),st=M(0x9aa4ae,{m:.9,r:.3}),gd=M(C.y,{m:.8,r:.3,e:0xff9900,ei:.6});
bx(g,1.1,.22,.18,[0,0,0],st);bx(g,.9,.14,.2,[.9,-.05,0],wd);cy(g,.035,.035,1.4,[1.25,.02,0],st);bx(g,.9,.2,.16,[-.9,-.08,0],wd,[0,0,.1]);grip(g,-.15);
for(let k=0;k<4;k++)bx(g,.36,.05,.02,[0,0,.1],gd,[0,0,k*.785]);
for(let i=0;i<9;i++)cy(g,.025,.025,.12,[-1.15+i*.06,-.03-i*.012,.11],gd,'y');
const lv=G(g,new T.TorusGeometry(.12,.015,6,16),st,[.1,-.2,0]);
const o={g,mz:[mz(g,1.98,.02)],k:0,upd(){lv.rotation.z=-o.k*1.2;o.k*=.88}};return o}
function facao(){const g=new T.Group(),bl=M(0xffb060,{m:.8,r:.25,e:0xff4a00,ei:1.2}),wd=M(0x4a2a12,{r:.7}),gd=M(0xd4a017,{m:.9,r:.3});
bx(g,1,.2,.03,[.55,0,0],bl);bx(g,.35,.26,.03,[1.12,.03,0],bl);bx(g,.06,.4,.14,[0,0,0],gd);cy(g,.045,.045,.45,[-.28,0,0],wd);sp(g,.08,[-.52,0,0],M(0xff3300,{e:0xff3300,ei:2}));
const o={g,mz:[mz(g,1.32,.03)],sw:0,upd(t,dt){o.sw=Math.max(0,o.sw-dt*3);g.rotation.z=-Math.sin(o.sw*Math.PI)*.9;for(let i=0;i<2;i++)em(g.localToWorld(V(.1+R()*1.2,(R()-.5)*.2,0)),V(0,1.5,0).add(rv()),.02+R()*.1,.3,.5,-1.5);em(g.localToWorld(V(-.52,0,0)),V(-.5,1.6,0).add(rv()),.05,.35,.6,-1.5)}};return o}
function tridente(){const g=new T.Group(),wd=M(0x2a4a5a,{m:.5,r:.4}),gd=M(0xd4a017,{m:.9,r:.3}),aq=M(0x2ac8ff,{m:.3,r:.2,e:0x2ac8ff,ei:1.3});
cy(g,.035,.035,2.4,[.1,0,0],wd);for(const x of[-.7,-.2,.4])cy(g,.05,.05,.08,[x,0,0],gd);bx(g,.07,.62,.07,[1.3,0,0],gd);
for(const y of[-.28,0,.28]){cy(g,.03,.03,.5,[1.55,y,0],aq);G(g,new T.ConeGeometry(.05,.18,6),aq,[1.89,y,0],[0,0,-Math.PI/2])}
const gem=sp(g,.1,[1.15,0,0],M(0xaaf0ff,{e:0x44ccff,ei:2}));
const o={g,mz:[mz(g,1.98)],th:0,upd(t,dt){o.th*=.85;g.position.x=o.th*.45;gem.scale.setScalar(1+Math.sin(t*5)*.12);if(R()<dt*15)em(g.localToWorld(V(1.4+R()*.5,(R()-.5)*.6,0)),V(0,.8,0),.5+R()*.1,.12,1,-.3)}};return o}
// tiros
const pis=(g,m,L=.9)=>{bx(g,L,.2,.17,[0,.05,0],m);bx(g,L*.85,.1,.15,[-.03,-.08,0],m);bx(g,.15,.42,.13,[-L/2+.1,-.33,0],M(0x4a2a12),[0,0,.2]);cy(g,.045,.045,.3,[L/2+.12,.07,0],M(0x15161a,{m:.8}))};
function mula(){const g=new T.Group(),bk=M(0x1b0f0a,{m:.6,r:.4}),wd=M(0x5b3418,{r:.6}),gd=M(0xd4a017,{m:.9,r:.3,e:0x553300,ei:.3}),fb=M(0xff5a10,{e:0xff5a10,ei:1.6}),fm=[];
bx(g,.9,.26,.22,[0,0,0],bk);bx(g,.8,.2,.18,[-.8,-.08,0],wd,[0,0,.12]);grip(g,-.2);for(const z of[-.065,.065])cy(g,.05,.05,1.3,[1,0,z],bk);bx(g,.6,.1,.2,[.75,-.1,0],wd);cy(g,.1,.12,.12,[.1,.2,0],bk,'y');
for(const s of[-1,1])G(g,new T.TorusGeometry(.09,.02,6,12,Math.PI),gd,[-.8,-.08,s*.1],[0,0,Math.PI]);
for(let i=0;i<5;i++)fm.push(sp(g,.1,[0,.4,0],fb));
return{g,mz:[mz(g,1.67,0,-.065),mz(g,1.67,0,.065)],upd(t,dt){fm.forEach((f,i)=>{f.position.set(.1+Math.sin(t*3+i)*.07,.38+i*.07,Math.cos(t*4+i*2)*.05);f.scale.setScalar(1-i*.14)});for(let k=0;k<3;k++)em(g.localToWorld(V(.1,.45,0)),V(0,1.6,0).add(rv().multiplyScalar(.6)),.02+R()*.1,.35,.7,-1.5)}}}
function piranha(){const g=new T.Group(),sl=M(0x8aa0b0,{m:.7,r:.3,e:0x203040,ei:.3}),rd=M(0xd81e1e,{r:.4,e:0x800000,ei:.5}),wh=M(0xffffff,{r:.3}),jw=new T.Group();
sp(g,.5,[0,0,0],sl,[1.5,1,.45]);sp(g,.4,[.05,-.2,0],rd,[1.4,.7,.5]);bx(g,.4,.14,.04,[-.9,.2,0],rd,[0,0,.5]);bx(g,.4,.14,.04,[-.9,-.2,0],rd,[0,0,-.5]);G(g,new T.ConeGeometry(.12,.3,4),sl,[-.1,.5,0],[0,0,.3]);
for(const s of[-1,1]){sp(g,.09,[.4,.18,s*.2],wh);sp(g,.05,[.45,.18,s*.24],M(0x111111))}
bx(g,.3,.1,.34,[.82,0,0],rd);jw.position.set(.6,-.12,0);g.add(jw);bx(jw,.45,.1,.3,[.2,0,0],rd);
for(let i=0;i<5;i++)for(const z of[-.12,.12]){G(g,new T.ConeGeometry(.03,.08,4),wh,[.7+i*.08,-.08,z],[Math.PI,0,0]);G(jw,new T.ConeGeometry(.03,.08,4),wh,[.1+i*.08,.08,z])}
bx(g,.13,.4,.13,[-.2,-.6,0],M(0x6b3414),[0,0,.15]);
const o={g,mz:[mz(g,1.15,-.04)],open:0,upd(){o.open*=.9;jw.rotation.z=-(.12+o.open*.45)}};return o}
function vitoria(){const g=new T.Group(),sv=M(0xcfd8e0,{m:.9,r:.25}),pk=M(0xff6fb5,{r:.4,e:0xff4aa0,ei:.5}),gn=M(0x1f8a3a,{r:.5,e:0x0a3a14,ei:.4}),pe=[];pis(g,sv);
G(g,new T.TorusGeometry(.5,.035,6,28),gn,[-.05,-.62,0],[Math.PI/2,0,0]);cy(g,.5,.5,.02,[-.05,-.63,0],gn,'y',28);
for(let i=0;i<10;i++){const pv=new T.Group();pv.position.set(0,.28,0);pv.rotation.y=i*.628;g.add(pv);pe.push(G(pv,new T.SphereGeometry(.1,10,6),pk,[.13,0,0],[0,0,.9],[1.7,.35,.8]))}
sp(g,.05,[0,.3,0],M(0xffe14a,{e:0xffcc00,ei:2}));
const o={g,mz:[mz(g,.76,.07)],open:0,upd(t){o.open*=.9;pe.forEach((p,i)=>p.rotation.z=.9-o.open*.7+Math.sin(t*2+i)*.04)}};g.scale.setScalar(1.5);return o}
function malandro(){const g=new T.Group(),ch=M(0xd8dee4,{m:1,r:.15}),hat=new T.Group(),pa=M(0xf5ecd0,{r:.8});pis(g,ch);hat.position.set(-.05,.3,0);g.add(hat);
cy(hat,.26,.26,.03,[0,0,0],pa,'y',24);cy(hat,.14,.13,.18,[0,.1,0],pa,'y',20);cy(hat,.145,.145,.04,[0,.05,0],M(0xd8321f,{e:0xd8321f,ei:.3}),'y',20);
cy(g,.022,.022,.22,[-.62,.12,0],M(0x5b3418));sp(g,.025,[-.74,.12,0],M(0xff6a00,{e:0xff6a00,ei:3}));
const o={g,mz:[mz(g,.76,.07)],k:0,upd(t,dt){o.k*=.9;hat.position.y=.3+o.k*.25+Math.sin(t*2)*.01;hat.rotation.z=Math.sin(t*1.5)*.05+o.k*.3;if(R()<dt*12)em(g.localToWorld(V(-.78,.12,0)),V(0,.8,0).add(rv().multiplyScalar(.3)),0,.2,1.2,-.3,0,.35)}};g.scale.setScalar(1.5);return o}
function boi(){const g=new T.Group(),st=M(0x9aa4ae,{m:.9,r:.3}),bk=M(0x14110f,{r:.6}),wh=M(0xf5f0e0,{r:.5}),dr=new T.Group();
bx(g,.9,.22,.2,[0,0,0],st);cy(g,.045,.045,.9,[.85,.05,0],st);bx(g,.15,.42,.13,[-.4,-.3,0],M(0x4a2a12),[0,0,.2]);bx(g,.08,.1,.06,[-.5,.15,0],st);
dr.position.set(.3,0,0);g.add(dr);cy(dr,.17,.17,.3,[0,0,0],st);for(let i=0;i<6;i++){const c=i%2?0x1c4fd8:0xd81e1e;cy(dr,.04,.04,.31,[0,Math.cos(i*1.047)*.1,Math.sin(i*1.047)*.1],M(c,{e:c,ei:1.5}))}
sp(g,.2,[.1,.4,0],bk,[1.2,1,.9]);sp(g,.1,[.3,.34,0],wh,[1,.8,.8]);
for(const s of[-1,1]){G(g,new T.ConeGeometry(.035,.3,6),wh,[.05,.55,s*.2],[s*1,0,0]);sp(g,.03,[.25,.45,s*.1],M(0xffffff,{e:0xffffff,ei:1}))}
sp(g,.05,[.17,.52,0],M(0x2a6aff,{e:0x2a6aff,ei:3}));sp(g,.04,[0,.35,.17],M(0xff1a1a,{e:0xff1a1a,ei:3}));
const o={g,mz:[mz(g,1.32,.05)],n:0,rot:0,upd(t,dt){dr.rotation.x+=(o.rot-dr.rotation.x)*Math.min(1,dt*18)}};g.scale.setScalar(1.4);return o}
function arara(){const g=new T.Group(),rd=M(0xd81e1e,{r:.5,e:0x600000,ei:.3}),bl=M(0x1c4fd8,{r:.5,e:0x0a2a80,ei:.4}),ye=M(C.y,{r:.5,e:0xcc9900,ei:.4}),dk=M(0x1a1a1e,{m:.6,r:.4}),wg=[];
cy(g,.2,.2,1.6,[.2,0,0],dk);cy(g,.3,.2,.25,[1.1,0,0],rd);cy(g,.23,.23,.08,[-.6,0,0],ye);grip(g,0,-.45);
sp(g,.17,[.7,.4,0],rd);for(const s of[-1,1])sp(g,.06,[.8,.43,s*.12],M(0xffffff));G(g,new T.ConeGeometry(.06,.25,6),M(0x222222),[.92,.37,0],[0,0,-Math.PI/2]);
for(const s of[-1,1]){const pv=new T.Group();pv.position.set(.3,.2,s*.2);g.add(pv);sp(pv,.3,[0,0,s*.3],bl,[1.4,.12,1]);sp(pv,.2,[-.1,.01,s*.3],ye,[1.2,.13,.8]);wg.push([pv,s])}
[rd,bl,ye,bl].forEach((c,i)=>bx(g,1,.04,.12,[-1.1,.2-i*.06,(i-1.5)*.06],c,[0,(i-1.5)*.08,.1]));
const o={g,mz:[mz(g,1.3)],fl:0,upd(){o.fl*=.92;wg.forEach(([p,s])=>p.rotation.x=-s*(.1+o.fl*1))}};return o}
// tiros
function tamandua(){const g=new T.Group(),gy=M(0x8a7a68,{r:.8}),bk=M(0x14110f,{r:.7}),fu=M(0x5b4a3a,{r:.9}),tail=[];
bx(g,1,.24,.2,[0,0,0],gy);bx(g,.8,.07,.21,[0,0,0],bk,[0,0,.55]);grip(g,-.1);cy(g,.04,.13,1.6,[1.2,0,0],gy);sp(g,.05,[2.02,0,0],bk);
const tg=cy(g,.012,.012,.5,[1.7,-.03,0],M(0xff6a8a,{e:0xff3a6a,ei:.6}));
for(const z of[-.1,0,.1])G(g,new T.ConeGeometry(.025,.2,5),M(0xfff3d6),[.5,-.3,z],[0,0,.6]);
for(let i=0;i<7;i++)tail.push(sp(g,.2-.015*i,[-.6-i*.17,i*.04,0],i%2?bk:fu,[1.6,1,1]));
const o={g,mz:[mz(g,2.08)],tg:0,upd(t){o.tg*=.9;const k=.2+o.tg*3;tg.scale.y=k;tg.position.x=1.65+.25*k;tail.forEach((m,i)=>m.position.z=Math.sin(t*2+i*.5)*.03*i)}};return o}
function cristal(){const g=new T.Group(),st=M(0x2a2236,{r:.7,m:.2}),cs=[],cl=[0xb45cff,0x2aff9a,0x2ac8ff,0xff6fb5];
bx(g,1,.2,.16,[0,0,0],st);bx(g,.7,.18,.15,[-.85,-.05,0],st,[0,0,.1]);grip(g,-.1);
const add=(x,y,z,h,r,rx,rz)=>{const c=cl[cs.length%4];cs.push(G(g,new T.ConeGeometry(r,h,5),M(c,{r:.15,m:.2,e:c,ei:.9}),[x,y,z],[rx,0,rz]))};
G(g,new T.CylinderGeometry(.07,.04,1.5,6),M(0xb45cff,{r:.1,e:0xb45cff,ei:1.2}),[1.3,0,0],[0,0,-Math.PI/2]);
for(let i=0;i<14;i++)add(-1+R()*1.9,.12+R()*.08,(R()-.5)*.12,.2+R()*.25,.04+R()*.03,(R()-.5)*.8,(R()-.5)*.8);
for(let i=0;i<5;i++)add(-.9+i*.15,-.1+R()*.1,(i%2?1:-1)*.1,.18+R()*.1,.04,(i%2?1:-1)*1.2,0);add(.1,.3,0,.45,.07,0,0);
return{g,mz:[mz(g,2.08)],upd(t){cs.forEach((k,i)=>k.material.emissiveIntensity=.6+Math.sin(t*2+i)*.4)}}}
function lobo(){const g=new T.Group(),fu=M(0x4a3a30,{r:.9}),dk=M(0x15161a,{m:.8,r:.3}),wh=M(0xffffff,{r:.3}),ye=M(0xffe14a,{e:0xffcc00,ei:3});
bx(g,1,.22,.18,[0,0,0],dk);bx(g,.8,.2,.17,[-.85,-.05,0],fu,[0,0,.1]);grip(g,-.1);cy(g,.045,.045,1.2,[1.3,0,0],dk);
const h=new T.Group();h.position.set(.1,.3,0);h.rotation.z=.6;g.add(h);sp(h,.17,[0,0,0],fu,[1.1,.9,.85]);bx(h,.3,.1,.12,[.25,0,0],fu);bx(h,.3,.05,.11,[.25,-.08,0],fu,[0,0,-.3]);
for(const s of[-1,1]){G(h,new T.ConeGeometry(.05,.16,4),fu,[-.05,.17,s*.1],[0,0,.1]);sp(h,.03,[.08,.06,s*.08],ye)}
for(let i=0;i<3;i++)G(h,new T.ConeGeometry(.012,.04,4),wh,[.3+i*.04,-.04,.05],[Math.PI,0,0]);
const mg=new T.Group();mg.position.set(.6,.75,0);g.add(mg);sp(mg,.2,[0,0,0],M(0xfff4c8,{e:0xffe9a0,ei:1.2}));for(const[x,y]of[[.08,.05],[-.06,-.07],[.05,-.1]])sp(mg,.04,[x,y,.17],M(0xd8c88a));
return{g,mz:[mz(g,1.95)],upd(t,dt){mg.position.y=.75+Math.sin(t*1.5)*.04;if(R()<dt*20)em(mg.localToWorld(V((R()-.5)*.5,(R()-.5)*.5,.1)),V(0,.3,0),.6,.12,1,-.2,.5,.8)}}}
function caipora(){const g=new T.Group(),gn=M(0x2ac84a,{r:.3,e:0x0a8a2a,ei:.9}),wd=M(0x5b3418,{r:.7}),vn=M(0x1f8a3a,{r:.6});
sp(g,1,[.65,0,0],gn,[.6,.11,.012]);bx(g,1,.015,.03,[.65,0,0],M(0xaaffbb,{e:0x66ff88,ei:1.5}));cy(g,.045,.045,.5,[-.25,0,0],wd);
for(let i=0;i<8;i++){const a=i*1.2;sp(g,.03,[-.45+i*.06,Math.cos(a)*.055,Math.sin(a)*.055],vn)}
for(const s of[-1,1])sp(g,.12,[.02,s*.14,0],gn,[.6,1,.2]);sp(g,.07,[-.52,0,0],M(0xff3a3a,{e:0xff3a3a,ei:2}));
const o={g,mz:[mz(g,1.27)],sw:0,upd(t,dt){o.sw=Math.max(0,o.sw-dt*3);g.rotation.z=-Math.sin(o.sw*Math.PI)*.9;if(R()<dt*10)em(g.localToWorld(V(R()*1.2,(R()-.5)*.4,(R()-.5)*.3)),rv().multiplyScalar(.3),.25,.15,1.5,-.2)}};g.scale.setScalar(1.5);return o}
function navalha(){const g=new T.Group(),ch=M(0xd8dee4,{m:1,r:.12,e:0x223344,ei:.2}),bn=M(0xf0e6c8,{r:.5}),gd=M(0xd4a017,{m:.9,r:.3}),pv=new T.Group();
bx(g,.9,.12,.08,[0,0,0],bn);for(let i=0;i<4;i++)sp(g,.025,[-.3+i*.2,0,.045],gd);sp(g,.05,[-.4,0,.05],M(0xff1a3a,{e:0xff1a3a,ei:2}));
pv.position.set(.45,0,0);g.add(pv);bx(pv,.9,.1,.02,[.45,0,0],ch);bx(pv,.9,.012,.025,[.45,-.05,0],M(0xff3a3a,{e:0xff3a3a,ei:1.5}));cy(g,.035,.035,.1,[.45,0,0],gd,'z');
const o={g,mz:[mz(pv,.95)],sw:0,upd(t,dt){o.sw=Math.max(0,o.sw-dt*3);pv.rotation.z=-(1-o.sw)*6.283;if(R()<dt*8)em(pv.localToWorld(V(R()*.9,0,0)),rv().multiplyScalar(.2),0,.1,.5,0,0,.9)}};g.scale.setScalar(1.5);return o}
function paje(){const g=new T.Group(),bn=M(0xf0e6c8,{r:.5,e:0x88ddff,ei:.25}),fe=[];
G(g,new T.ConeGeometry(.09,1,6),bn,[.65,0,0],[0,0,-Math.PI/2],[1,1,.4]);for(let i=0;i<3;i++)bx(g,.05,.04,.025,[.4+i*.22,0,.03],M(0x44ddff,{e:0x44ddff,ei:2.5}));
cy(g,.045,.045,.5,[-.25,0,0],M(0x3a2410));[C.g,C.y,C.b,0xd8321f].forEach((c,i)=>cy(g,.055,.055,.03,[-.4+i*.1,0,0],M(c,{e:c,ei:.4})));
[0xd8321f,C.y,C.b,C.g,0xd8321f].forEach((c,i)=>fe.push(sp(g,.12,[-.55,-.15,(i-2)*.07],M(c,{e:c,ei:.5}),[.15,1,.25])));
const o={g,mz:[mz(g,1.18)],sw:0,upd(t,dt){o.sw=Math.max(0,o.sw-dt*3);g.rotation.z=-Math.sin(o.sw*Math.PI)*.9;fe.forEach((f,i)=>f.rotation.z=Math.sin(t*3+i)*.3);if(R()<dt*12)em(g.localToWorld(V(.3+R()*.8,0,0)),V(0,.6,0),.55,.12,1.2,-.3)}};g.scale.setScalar(1.5);return o}
// tiros

const eyeAt = (g, x, y) => { const o = new T.Object3D(); o.position.set(x, y, 0); g.add(o); g.userData.eye = o; g.userData.sight = { k: 'irons', fov: [75], n: ['Mira de ferro'] }; };
function adapt(fn, eye) {
  const o = fn(); try { o.upd?.(1.3, 0.016); o.upd?.(1.3, 0.016); } catch { /* pose padrão */ }
  const g = o.g; g.traverse((m) => { if (m.isMesh) { m.castShadow = m.receiveShadow = true; } });
  g.userData.mz = o.mz.map((m) => { m.userData.g = g; return m; });
  const bb = new T.Box3().setFromObject(g); eye = eye || [bb.min.x + (bb.max.x - bb.min.x) * .35, bb.max.y * .9];
  eyeAt(g, eye[0], eye[1]); g.userData.mz.forEach((m) => { m.userData.eye = g.userData.eye; });
  const b = new T.Box3().setFromObject(g); g.userData.ej = V(b.min.x + (b.max.x - b.min.x) * .42, .05, .1);
  return g;
}
export const STORE_BUILD = { trovao: () => adapt(surdo, [-.5, .3]), rojaosp: () => adapt(rojao, [-.2, .22]), sucuri: () => adapt(sucuri, [-.7, .3]), boto: () => adapt(boto, [-.7, .3]), berimbau: () => adapt(berim, [-.3, .5]), arraia: () => adapt(arraia, [-.25, .3]), saci: () => adapt(saci), iara: () => adapt(iara), boitata: () => adapt(boitata), cuca: () => adapt(cuca), tucano: () => adapt(tucano), trioel: () => adapt(trio), diabo: () => adapt(diabo), dragao: () => adapt(dragao), onca: () => adapt(onca), cangaco: () => adapt(lampiao), mula: () => adapt(mula), piranha: () => adapt(piranha), vitoria: () => adapt(vitoria), malandro: () => adapt(malandro), boibumba: () => adapt(boi), arara: () => adapt(arara), tamandua: () => adapt(tamandua), cristal: () => adapt(cristal), lobisomem: () => adapt(lobo) };

// armas brancas da loja (modelo de vitrine/ícone; na mão usa weaponBuilder)
export const STORE_MELEE_SHOW = { facacurupira: facao, tridente, caipora, navalha, paje };
