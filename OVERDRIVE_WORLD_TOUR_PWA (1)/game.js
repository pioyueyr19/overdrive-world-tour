import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const canvas=document.querySelector('#view');
const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.8)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.12;
const scene=new THREE.Scene(); scene.background=new THREE.Color(0x9bb9cf); scene.fog=new THREE.Fog(0x9bb9cf,100,440);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,900);
scene.add(new THREE.HemisphereLight(0xd9edff,0x34402b,2.0));
const sun=new THREE.DirectionalLight(0xffedcf,3.2);sun.position.set(-80,120,40);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-130;sun.shadow.camera.right=130;sun.shadow.camera.top=130;sun.shadow.camera.bottom=-130;scene.add(sun);
const mat=(c,r=.75,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
const roadMat=mat(0x242a31,.94),lineMat=mat(0xf4f1e7),grassMat=mat(0x3d6745),redMat=mat(0xe94b32,.35,.55),dark=mat(0x111923,.3,.6),glass= new THREE.MeshStandardMaterial({color:0x172c3b,metalness:.5,roughness:.16});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),grassMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);

// Closed flowing circuit built from a smooth spline.
const control=[[-5,0,75],[45,0,65],[82,0,28],[78,0,-28],[38,0,-72],[-30,0,-76],[-78,0,-42],[-82,0,18],[-48,0,62]];
const curve=new THREE.CatmullRomCurve3(control.map(p=>new THREE.Vector3(...p)),true,'catmullrom',.28);
const N=520, roadWidth=15, frames=curve.computeFrenetFrames(N,true);
const roadGeo=new THREE.BufferGeometry(),verts=[],uv=[],idx=[];
for(let i=0;i<=N;i++){let t=i/N,p=curve.getPointAt(t),n=frames.normals[i],b=frames.binormals[i];for(let s of [-1,1]){let v=p.clone().addScaledVector(n,s*roadWidth/2);v.y=.02;verts.push(v.x,v.y,v.z);uv.push(0,t*18)}}
for(let i=0;i<N;i++){let a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}
roadGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));roadGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));roadGeo.setIndex(idx);roadGeo.computeVertexNormals();
const road=new THREE.Mesh(roadGeo,roadMat);road.receiveShadow=true;scene.add(road);
function ribbon(offset,width,material,y=.045){let v=[],ind=[];for(let i=0;i<=N;i++){let p=curve.getPointAt(i/N),n=frames.normals[i];for(let s of [-1,1]){let q=p.clone().addScaledVector(n,offset+s*width/2);q.y=y;v.push(q.x,q.y,q.z)}}for(let i=0;i<N;i++){let a=i*2;ind.push(a,a+1,a+2,a+1,a+3,a+2)}let g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ind);g.computeVertexNormals();let mesh=new THREE.Mesh(g,material);scene.add(mesh)}
ribbon(-roadWidth/2+.3,.22,lineMat);ribbon(roadWidth/2-.3,.22,lineMat);
for(let i=0;i<80;i++){let t=i/80,p=curve.getPointAt(t),n=frames.normals[Math.round(t*N)];for(let s of [-1,1]){let q=p.clone().addScaledVector(n,s*(roadWidth/2+1.2));let curb=new THREE.Mesh(new THREE.BoxGeometry(2.8,.22,.7),mat(i%2?0xffffff:0xd63b2d));curb.position.set(q.x,.12,q.z);curb.rotation.y=Math.atan2(n.x,n.z);scene.add(curb)}}
// Dashed center markers
for(let i=0;i<120;i++){let p=curve.getPointAt(i/120);let dash=new THREE.Mesh(new THREE.BoxGeometry(.16,.025,1.8),lineMat);dash.position.set(p.x,.055,p.z);dash.rotation.y=Math.atan2(curve.getTangentAt(i/120).x,curve.getTangentAt(i/120).z);scene.add(dash)}
// Scenic low-poly hills and trees.
for(let i=0;i<90;i++){let a=i*2.399,r=125+(i%7)*17,x=Math.cos(a)*r,z=Math.sin(a)*r;let h=8+(i%9)*2.2;let hill=new THREE.Mesh(new THREE.ConeGeometry(12+(i%4)*4,h,6),mat(i%3?0x536e69:0x647b70));hill.position.set(x,h/2-1,z);hill.scale.y=1.3;scene.add(hill)}
for(let i=0;i<100;i++){let a=i*2.4,r=24+(i%8)*17,x=Math.cos(a)*r,z=Math.sin(a)*r;if(Math.abs(x)<90&&Math.abs(z)<85)continue;let trunk=new THREE.Mesh(new THREE.CylinderGeometry(.25,.4,2,6),mat(0x57412e));trunk.position.set(x,1,z);let crown=new THREE.Mesh(new THREE.ConeGeometry(2.3,6,7),mat(0x214d38));crown.position.set(x,4,z);scene.add(trunk,crown)}
// Trackside barriers, boards and lights
for(let i=0;i<64;i++){let t=i/64,p=curve.getPointAt(t),tan=curve.getTangentAt(t),n=new THREE.Vector3(tan.z,0,-tan.x).normalize();let q=p.clone().addScaledVector(n,roadWidth/2+2.4);let b=new THREE.Mesh(new THREE.BoxGeometry(3,.9,.35),mat(i%2?0xe7e8e4:0xc94431));b.position.set(q.x,.5,q.z);b.rotation.y=Math.atan2(tan.x,tan.z);scene.add(b)}

// Vehicle model: procedural body with separate wheels.
function buildCar(color=0xe94b32){let root=new THREE.Group();let body=new THREE.Mesh(new THREE.BoxGeometry(2.05,.58,4.25),mat(color,.28,.72));body.position.y=.82;body.castShadow=true;root.add(body);let hood=new THREE.Mesh(new THREE.BoxGeometry(1.9,.2,1.2),mat(color,.25,.6));hood.position.set(0,1.12,-1.25);root.add(hood);let cabin=new THREE.Mesh(new THREE.BoxGeometry(1.55,.72,1.85),glass);cabin.position.set(0,1.42,.15);root.add(cabin);let roof=new THREE.Mesh(new THREE.BoxGeometry(1.45,.12,1.35),dark);roof.position.set(0,1.82,.15);root.add(roof);for(let x of [-1,1])for(let z of [-1.35,1.35]){let w=new THREE.Mesh(new THREE.CylinderGeometry(.43,.43,.28,16),dark);w.rotation.z=Math.PI/2;w.position.set(x*1.03,.48,z);w.castShadow=true;root.add(w);let hub=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.3,12),mat(0xb8c2c9,.3,.8));hub.rotation.z=Math.PI/2;hub.position.copy(w.position);root.add(hub)}for(let x of [-.68,.68]){let lamp=new THREE.Mesh(new THREE.BoxGeometry(.42,.16,.06),mat(0xfff2cf,.2));lamp.position.set(x,.9,-2.14);root.add(lamp)}return root}
const car=buildCar();scene.add(car);
const traffic=[];for(let i=0;i<7;i++){let c=buildCar([0x2683b9,0xd8dce0,0xe2b53e,0x5e8a68][i%4]);scene.add(c);traffic.push({mesh:c,t:(.08+i*.115)%1,speed:.035+(i%3)*.006})}
const checkpoints=Array.from({length:8},(_,i)=>curve.getPointAt(i/8));let cp=0,lap=1,lapStart=performance.now(),best=null,finished=false;
const state={speed:0,yaw:0,slip:0,steer:0,cam:0,damage:0,offroad:false};let pos=curve.getPointAt(.015);pos.y=0;let heading=Math.atan2(curve.getTangentAt(.015).x,curve.getTangentAt(.015).z);car.position.copy(pos);car.rotation.y=heading;
const keys={};let touch={left:false,right:false,gas:false,brake:false,hand:false};
addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyC')toggleCamera();if(e.code==='KeyR')resetCar()});addEventListener('keyup',e=>keys[e.code]=false);
document.querySelectorAll('[data-key]').forEach(b=>{let k=b.dataset.key;const on=e=>{e.preventDefault();touch[k]=true},off=e=>{e.preventDefault();touch[k]=false};b.addEventListener('pointerdown',on);b.addEventListener('pointerup',off);b.addEventListener('pointercancel',off);b.addEventListener('pointerleave',off)});
function toggleCamera(){state.cam=1-state.cam;document.querySelector('#camera').textContent=state.cam?'CAM: COCKPIT':'CAM: CHASE'}document.querySelector('#camera').onclick=toggleCamera;
function resetCar(){let p=curve.getPointAt(cp/8);pos.copy(p);pos.y=0;heading=Math.atan2(curve.getTangentAt(cp/8).x,curve.getTangentAt(cp/8).z);state.speed=0;state.slip=0;car.position.copy(pos);car.rotation.y=heading}
function nearestTrack(){let bestD=1e9,bestT=0;for(let i=0;i<180;i++){let t=i/180,p=curve.getPointAt(t),d=p.distanceToSquared(pos);if(d<bestD){bestD=d;bestT=t}}return {d:Math.sqrt(bestD),t:bestT}}
function fmt(ms){let m=Math.floor(ms/60000),s=Math.floor(ms/1000)%60,mmm=Math.floor(ms%1000);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(mmm).padStart(3,'0')}`}
const clock=new THREE.Clock();let messageTimer=0;
function showMessage(a,b){let el=document.querySelector('#message');el.innerHTML=`${a}<small>${b}</small>`;el.classList.add('show');messageTimer=2}
function update(dt){if(finished)return;let gas=keys.ArrowUp||keys.KeyW||touch.gas,brake=keys.ArrowDown||keys.KeyS||touch.brake,left=keys.ArrowLeft||keys.KeyA||touch.left,right=keys.ArrowRight||keys.KeyD||touch.right,hand=keys.Space||touch.hand;
let steer=(right?1:0)-(left?1:0);state.steer=THREE.MathUtils.damp(state.steer,steer,8,dt);
let maxSpeed=58;let accel=gas?26:0;let braking=brake?40:0;state.speed+= (accel-braking-(gas?0:5)-state.speed*0.11)*dt;if(hand)state.speed-=10*dt;state.speed=THREE.MathUtils.clamp(state.speed,-8,maxSpeed);
let track=nearestTrack();state.offroad=track.d>roadWidth*.54;let grip=state.offroad?.45:1;let steerPower=(.55+Math.abs(state.speed)/maxSpeed*1.7);let slipFactor=hand?1.7:1;heading+=state.steer*steerPower*dt*(state.speed/13)*grip;state.slip=THREE.MathUtils.damp(state.slip,hand?state.steer*.48:0,3.2,dt);
let forward=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));let side=new THREE.Vector3(Math.cos(heading),0,-Math.sin(heading));let velocity=forward.clone().multiplyScalar(state.speed).addScaledVector(side,state.slip*Math.abs(state.speed)*slipFactor);pos.addScaledVector(velocity,dt);
if(state.offroad)state.speed*=Math.pow(.82,dt); // rough shoulder slowdown
// collision with barriers: push back toward road and lose speed
if(track.d>roadWidth*.5+1.0){let center=curve.getPointAt(track.t),inward=center.clone().sub(pos).normalize();pos.addScaledVector(inward,Math.min(.8,(track.d-roadWidth*.5)*.8));state.speed*=.78;heading+=THREE.MathUtils.clamp(state.steer,-1,1)*dt*.3}
car.position.copy(pos);car.position.y=.02+Math.abs(Math.sin(clock.elapsedTime*18))*Math.min(.04,Math.abs(state.speed)*.0008);car.rotation.y=heading;car.rotation.z=THREE.MathUtils.damp(car.rotation.z,-state.steer*.08*Math.min(1,Math.abs(state.speed)/20),5,dt);
// traffic follows spline
for(let o of traffic){o.t=(o.t+o.speed*dt)%1;let p=curve.getPointAt(o.t),t=curve.getTangentAt(o.t);o.mesh.position.set(p.x,.02,p.z);o.mesh.rotation.y=Math.atan2(t.x,t.z);let d=o.mesh.position.distanceTo(car.position);if(d<2.6){let away=car.position.clone().sub(o.mesh.position).normalize();pos.addScaledVector(away,.22);state.speed*=.88;showMessage('CONTACT','VEHICLE IMPACT');}}
let next=checkpoints[cp];if(pos.distanceTo(next)<9){cp++;if(cp>=8){cp=0;lap++;let elapsed=performance.now()-lapStart;if(best===null||elapsed<best)best=elapsed;lapStart=performance.now();if(lap>3){finished=true;showMessage('RACE COMPLETE',`BEST LAP ${fmt(best)}`)}else showMessage(`LAP ${lap}`,`SPLIT ${fmt(elapsed)}`)}}
document.querySelector('#speed').textContent=String(Math.round(Math.abs(state.speed)*3.6)).padStart(3,'0');document.querySelector('#lap').textContent=`LAP ${Math.min(lap,3)} / 3`;document.querySelector('#checkpoint').textContent=`CHECKPOINT ${cp+1} / 8`;document.querySelector('#best').textContent=best?fmt(best):'--:--.---';
if(messageTimer>0){messageTimer-=dt;if(messageTimer<=0)document.querySelector('#message').classList.remove('show')}
}
function renderCamera(dt){let forward=new THREE.Vector3(Math.sin(heading),0,Math.cos(heading));if(state.cam===0){let desired=car.position.clone().addScaledVector(forward,-9).add(new THREE.Vector3(0,4.2,0));camera.position.lerp(desired,1-Math.exp(-4*dt));let look=car.position.clone().addScaledVector(forward,5).add(new THREE.Vector3(0,1,0));camera.lookAt(look)}else{let eye=car.position.clone().add(new THREE.Vector3(0,1.58,0)).addScaledVector(forward,.65);camera.position.copy(eye);camera.lookAt(eye.clone().addScaledVector(forward,35));camera.fov=78;camera.updateProjectionMatrix()}}
function loop(){requestAnimationFrame(loop);let dt=Math.min(clock.getDelta(),.04);update(dt);renderCamera(dt);renderer.render(scene,camera)}showMessage('WORLD TOUR','3 LAPS · 8 CHECKPOINTS');loop();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))});
