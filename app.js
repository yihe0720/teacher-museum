import * as T from './vendor/three.module.js';
import {museum,asset} from './content.js';
import {createRoom,createObject,makeEnvironment,EYE} from './architecture.js';
import {findPath} from './navigation.js';
const $=id=>document.getElementById(id),images=new Map(),spaces=new Map();
const V=(x,y,z)=>new T.Vector3(x,y,z),exhibit=id=>museum.exhibits.find(e=>e.id===id);
const route=[{room:0,id:'prologue'},...museum.rooms.slice(1,5).flatMap(r=>[{room:r.id,id:'entry'},...museum.exhibits.filter(e=>e.room===r.id).map(e=>({room:r.id,id:e.id}))]),{room:5,id:'epilogue'}];
let renderer,camera,environment,current,room=0,targetId='entry',yaw=0,pitch=0,aimYaw=0,aimPitch=0,motion=null,switching=false;
let guided=false,routeIndex=0,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,enteredAt=0,focusedAt=0,last=0;
let markers=[],detailId=null,detailTimer=null,drawerTimer=null,endingReady=false,viewer=null,drag=null;
const ray=new T.Raycaster(),ndc=new T.Vector2();
const roman=['00','I','II','III','IV','V'];
function status(text){$('status').textContent=text;}
function orientation(position,look){const d=look.clone().sub(position);return {yaw:Math.atan2(-d.x,-d.z),pitch:Math.atan2(d.y,Math.hypot(d.x,d.z))};}
function shortest(a,b){return a+Math.atan2(Math.sin(b-a),Math.cos(b-a));}
function getRoom(i){if(!spaces.has(i))spaces.set(i,createRoom(i,images,environment));return spaces.get(i);}
function sync(){const r=museum.rooms[room],e=exhibit(targetId);$('room-kicker').textContent=roman[room]+' / '+r.english;$('room-title').textContent=r.title;
 $('room-desc').textContent=e?e.title:room===0?museum.prologue.text.split('\n\n')[1]:room===5?'教师节快乐，何老师。':r.entry?'在入口，留了几句话。':'可以从任何一幅照片开始。';
 $('read-item').hidden=targetId==='exit'||targetId==='back'||(!e&&room===1);
 $('read-item').innerHTML=(e?.kind==='drawer'&&!current.targets.get('drawer').opened?'拉开抽屉':e?'读展签':room===0?'读序言':room===5?'给您的话':'读入口题记')+' <span>↗</span>';
 $('mode-label').textContent=guided?'路线导览':'自由漫游';$('tour-toggle').textContent=guided?'切换自由漫游 ↗':'按路线参观 →';
 $('station-count').textContent=guided?String(routeIndex+1).padStart(2,'0')+' / '+route.length:String(room+1).padStart(2,'0')+' / 06';
 $('station-label').textContent=e?e.title:r.title+(targetId==='entry'?' · 中央':'');
 $('previous').disabled=guided?routeIndex===0:room===0;$('next').disabled=guided?routeIndex===route.length-1:room===5;
 document.querySelectorAll('.room-dot').forEach((b,i)=>b.setAttribute('aria-current',String(room===i)));document.querySelectorAll('.plan-room').forEach((b,i)=>b.classList.toggle('selected',room===i));
 rebuildMarkers();status(r.title+(e?'，'+e.title:''));
}
async function setRoom(i,id='entry',animate=true){
 if(switching)return;switching=true;motion=null;clearTimeout(drawerTimer);const delay=reduced||!animate?0:300;
 if(delay){$('transition').classList.add('active');await new Promise(r=>setTimeout(r,delay));}
 try{current=getRoom(i);room=i;targetId=current.targets.has(id)?id:'entry';const target=current.targets.get(targetId);camera.position.copy(target.position);const o=orientation(target.position,target.look);yaw=aimYaw=o.yaw;pitch=aimPitch=o.pitch;enteredAt=focusedAt=performance.now();endingReady=false;sync();}
 finally{$('transition').classList.remove('active');switching=false;}
}
function moveTo(id){
 if(switching||motion)return;
 if(id==='exit'){guided=false;setRoom(room+1);return;}if(id==='back'){guided=false;setRoom(room-1);return;}
 const t=current.targets.get(id);if(!t)return;
 targetId=id;focusedAt=performance.now();const from=camera.position.clone();const path=findPath([from.x,from.z],[t.position.x,t.position.z],room);const o=orientation(t.position,t.look);
 if(reduced||!path){camera.position.copy(t.position);yaw=aimYaw=o.yaw;pitch=aimPitch=o.pitch;motion=null;}
 else{const points=path.map(([x,z])=>V(x,EYE,z));let total=0;const lengths=[];for(let i=1;i<points.length;i++){const d=points[i].distanceTo(points[i-1]);lengths.push(d);total+=d;}motion={points,lengths,total,fromYaw:yaw,toYaw:shortest(yaw,o.yaw),fromPitch:pitch,toPitch:o.pitch,start:performance.now(),duration:Math.max(700,Math.min(4200,total*300))};}
 $('hint').classList.add('dismissed');sync();
}
function activateTarget(id){if(motion||switching)return;if(id==='entry'){guided=false;moveTo('entry');return;}if(targetId===id&&id!=='exit'&&id!=='back'){readCurrent();return;}guided=false;moveTo(id);}
function follow(){const s=route[routeIndex];if(s.room===room)moveTo(s.id);else setRoom(s.room,s.id);}
function step(direction){if(motion||switching)return;if(guided){routeIndex=Math.max(0,Math.min(route.length-1,routeIndex+direction));follow();}else setRoom(Math.max(0,Math.min(5,room+direction)));}
function rebuildMarkers(){
 $('markers').replaceChildren();markers=[];for(const t of current.targets.values()){
  if(t.id==='back'&&room===0||t.id===targetId||t.id==='entry')continue;
  const b=document.createElement('button');b.className='waypoint'+(['exit','back'].includes(t.id)?' portal':'');b.setAttribute('aria-label',t.label);const text=document.createElement('span');text.textContent=t.label;b.append(text);b.onclick=()=>activateTarget(t.id);$('markers').append(b);markers.push({el:b,t,position:V(t.position.x,.06,t.position.z)});
 }
}
function paragraphs(node,text){node.replaceChildren();for(const block of text.split(/\n\n+/)){const p=document.createElement('p');p.textContent=block.replace(/\n/g,'');node.append(p);}}
function showDialog(id){if(!$(id).open)$(id).showModal();}
function disposeViewer(){if(!viewer)return;viewer.environment.dispose();viewer.renderer.dispose();viewer.renderer.forceContextLoss();$('object-stage').replaceChildren();viewer=null;}
function makeViewer(kind){
 if(!$('detail-dialog').open)return;disposeViewer();$('object-stage').hidden=false;const host=$('object-stage'),vr=new T.WebGLRenderer({alpha:true,antialias:true});vr.setPixelRatio(Math.min(devicePixelRatio,1.8));vr.outputColorSpace=T.SRGBColorSpace;vr.toneMapping=T.ACESFilmicToneMapping;vr.toneMappingExposure=1.3;host.append(vr.domElement);const s=new T.Scene();const viewerEnvironment=makeEnvironment(vr);s.environment=viewerEnvironment;s.add(new T.HemisphereLight('#fff0d4','#645b4b',2.7));const light=new T.DirectionalLight('#fff0cb',3);light.position.set(2,4,3);s.add(light);const fill=new T.DirectionalLight('#d0e4f3',1.4);fill.position.set(-3,2,-1);s.add(fill);
 const model=createObject(kind,images),bounds=new T.Box3().setFromObject(model),centre=bounds.getCenter(new T.Vector3());model.position.sub(centre);const pivot=new T.Group();pivot.add(model);s.add(pivot);pivot.rotation.y=kind==='pen'?.18:-.26;
 const cam=new T.PerspectiveCamera(39,1,.02,20);const size=bounds.getSize(new T.Vector3()).length();cam.position.set(0,kind==='pen'?size*.8:size*.10,size*1.85);cam.lookAt(0,0,0);const updateSize=()=>{const w=host.clientWidth||400,h=host.clientHeight||330;vr.setSize(w,h);cam.aspect=w/h;cam.updateProjectionMatrix();};updateSize();
 let d=null;vr.domElement.addEventListener('pointerdown',e=>{e.preventDefault();d={x:e.clientX,y:e.clientY};vr.domElement.setPointerCapture(e.pointerId);});vr.domElement.addEventListener('pointermove',e=>{if(!d)return;pivot.rotation.y+=(e.clientX-d.x)*.009;pivot.rotation.x=T.MathUtils.clamp(pivot.rotation.x+(e.clientY-d.y)*.006,-.9,.9);d={x:e.clientX,y:e.clientY};});const release=()=>d=null;vr.domElement.addEventListener('pointerup',release);vr.domElement.addEventListener('pointercancel',release);viewer={renderer:vr,scene:s,camera:cam,environment:viewerEnvironment,updateSize};
}
function addPhoto(name,title){const img=document.createElement('img');img.src=asset(name);img.alt=title;img.onload=()=>{};img.onerror=()=>{status('照片暂时无法载入：'+title);};img.onclick=()=>img.classList.toggle('expanded');$('detail-media').append(img);}
function openDetail(id){
 clearTimeout(detailTimer);disposeViewer();detailId=id;$('detail-media').replaceChildren();$('object-stage').hidden=true;$('source-toggle').hidden=true;$('object-hint').hidden=true;$('detail-after').classList.remove('visible');$('detail-after').textContent='';
 const e=exhibit(id),r=museum.rooms[room];let title='',text='',date='',noVisual=false;
 if(e){title=e.title;text=e.text;date=e.date||'';if(e.kind==='object'||e.kind==='trophy'){$('object-hint').hidden=false;$('source-toggle').hidden=!e.src;$('source-toggle').textContent='查看原始照片';}else if(e.src){addPhoto(e.src,e.title);if(e.extra)addPhoto(e.extra,e.title);}else noVisual=true;}
 else{noVisual=true;if(room===0){title=museum.prologue.title;text=museum.prologue.text;}else if(room===5){title=museum.epilogue.title;text=museum.epilogue.text;$('detail-after').textContent=museum.epilogue.after;detailTimer=setTimeout(()=>{$('detail-after').classList.add('visible');},4500);}else{title=r.title;text=r.entry;}}
 $('detail-dialog').classList.toggle('text-only',noVisual);$('detail-kicker').textContent=r.english+' / '+r.title;$('detail-title').textContent=title;$('detail-date').textContent=date;paragraphs($('detail-text'),text);$('detail-location').textContent=r.name+' · '+r.title;$('detail-next').hidden=room===5;showDialog('detail-dialog');
 if(e&&(e.kind==='object'||e.kind==='trophy'))requestAnimationFrame(()=>makeViewer(e.id));
}
function readCurrent(){
 if(motion||switching)return;
 const e=exhibit(targetId);
 if(e?.kind==='drawer'){
  const t=current.targets.get('drawer');if(!t.opened){t.opened=true;t.animStart=performance.now();sync();drawerTimer=setTimeout(()=>{if(room===1&&targetId==='drawer')openDetail('drawer');},reduced?0:1150);return;}
 }
 openDetail(targetId);
}
function keyboard(e){
 if(document.querySelector('dialog[open]'))return;
 if(e.key==='Escape'){$('exit-quiet').click();return;}
 if(e.target.tagName==='BUTTON'||e.target.tagName==='INPUT'||e.target.tagName==='A')return;
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Enter'].includes(e.key))return;e.preventDefault();if(e.key==='Enter'){step(1);return;}if(motion||switching)return;
 aimYaw+=e.key==='ArrowLeft'?.15:e.key==='ArrowRight'?-.15:0;aimPitch=T.MathUtils.clamp(aimPitch+(e.key==='ArrowUp'?.10:e.key==='ArrowDown'?-.10:0),-.8,1.0);
}
function setupUI(){
 $('reduce-motion').checked=reduced;$('reduce-motion').onchange=e=>reduced=e.target.checked;
 museum.rooms.forEach((r,i)=>{const b=document.createElement('button');b.className='room-dot';b.setAttribute('aria-label','前往'+r.title);const span=document.createElement('span');span.textContent=r.title;b.append(span);b.onclick=()=>{guided=false;setRoom(i);};$('room-index').append(b);
  const p=document.createElement('button');p.className='plan-room';p.style.background=r.color+'45';const a=document.createElement('small');a.textContent=roman[i]+' / '+r.english;const c=document.createElement('b');c.textContent=r.title;p.append(a,c);p.onclick=()=>{$('map-dialog').close();guided=false;setRoom(i);};$('floorplan').append(p);
 });
 $('home').onclick=e=>{e.preventDefault();guided=false;setRoom(0);};$('map-open').onclick=$('map-open-bottom').onclick=()=>showDialog('map-dialog');$('help').onclick=()=>showDialog('help-dialog');$('read-item').onclick=readCurrent;
 $('previous').onclick=()=>step(-1);$('next').onclick=()=>step(1);$('tour-toggle').onclick=()=>{if(motion||switching)return;guided=!guided;if(guided){routeIndex=route.findIndex(s=>s.room===room&&s.id===targetId);if(routeIndex<0)routeIndex=route.findIndex(s=>s.room===room);follow();}else sync();};
 $('reset-view').onclick=()=>moveTo(targetId);$('quiet').onclick=()=>{document.body.classList.add('quiet');$('exit-quiet').hidden=false;};$('exit-quiet').onclick=()=>{document.body.classList.remove('quiet');$('exit-quiet').hidden=true;};
 $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else $('quiet').click();}catch{$('quiet').click();}};
 $('source-toggle').onclick=()=>{const e=exhibit(detailId);if($('detail-media').childElementCount){$('detail-media').replaceChildren();$('source-toggle').textContent='查看原始照片';}else{addPhoto(e.src,e.title+' · 原始照片');$('source-toggle').textContent='收起原始照片';}};
 $('detail-next').onclick=()=>{const index=route.findIndex(s=>s.room===room&&s.id===(exhibit(detailId)?detailId:room===0?'prologue':room===5?'epilogue':'entry'));$('detail-dialog').close();guided=true;routeIndex=Math.min(route.length-1,Math.max(0,index+1));follow();};
 document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').onclick=()=>d.close();d.addEventListener('click',e=>{if(e.target!==d)return;const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();});});
 $('detail-dialog').addEventListener('close',()=>{clearTimeout(detailTimer);disposeViewer();});window.addEventListener('keydown',keyboard);$('retry').onclick=()=>location.reload();
}
function setupInput(){const c=renderer.domElement;c.style.cursor='grab';
 c.addEventListener('pointerdown',e=>{if(e.button!==0||motion||switching)return;drag={x:e.clientX,y:e.clientY,sx:e.clientX,sy:e.clientY,moved:false};c.setPointerCapture(e.pointerId);c.style.cursor='grabbing';});
 c.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;aimYaw-=dx*.004;aimPitch=T.MathUtils.clamp(aimPitch-dy*.003,-.8,1);drag.x=e.clientX;drag.y=e.clientY;if(Math.hypot(e.clientX-drag.sx,e.clientY-drag.sy)>5)drag.moved=true;$('hint').classList.add('dismissed');});
 c.addEventListener('pointerup',e=>{c.style.cursor='grab';if(!drag)return;const isClick=!drag.moved;drag=null;if(!isClick)return;ndc.set(e.clientX/innerWidth*2-1,1-e.clientY/innerHeight*2);ray.setFromCamera(ndc,camera);const hits=ray.intersectObjects(current.picks,true);if(!hits.length)return;let o=hits[0].object;while(o&&!o.userData.target)o=o.parent;if(o)activateTarget(o.userData.target);});
 c.addEventListener('pointercancel',()=>{drag=null;c.style.cursor='grab';});
}
function resize(){if(!renderer)return;renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<680?69:61;camera.updateProjectionMatrix();viewer?.updateSize();}
function updateAnimations(time){
 for(const anim of current.animations){if(anim.kind==='ending'){const elapsed=time-enteredAt-anim.delay;anim.object.material.opacity=T.MathUtils.clamp(elapsed/1700,0,1);if(elapsed>0&&!endingReady){endingReady=true;status(museum.epilogue.after);}}else if(anim.kind==='reveal'){const t=current.targets.get(anim.target);const near=camera.position.distanceTo(t.position)<1.2||targetId===anim.target;const elapsed=near?time-focusedAt-anim.delay:-1;anim.object.material.opacity=T.MathUtils.clamp(elapsed/1600,0,1);}}
 const d=current.targets.get('drawer');if(d?.opened){const t=reduced?1:T.MathUtils.clamp((time-d.animStart)/850,0,1);d.drawer.position.z=.14+.63*(t*t*(3-2*t));}
}
function animate(time){requestAnimationFrame(animate);if(document.hidden||!current)return;const dt=Math.min(.05,(time-last)/1000||.016);last=time;
 if(motion){const m=motion,t=Math.min(1,(time-m.start)/m.duration),k=t*t*(3-2*t);let dist=m.total*k,i=0;while(i<m.lengths.length-1&&dist>m.lengths[i]){dist-=m.lengths[i];i++;}camera.position.lerpVectors(m.points[i],m.points[i+1],m.lengths[i]>0?Math.min(1,dist/m.lengths[i]):1);yaw=aimYaw=m.fromYaw+(m.toYaw-m.fromYaw)*k;pitch=aimPitch=m.fromPitch+(m.toPitch-m.fromPitch)*k;if(t>=1){camera.position.copy(m.points.at(-1));motion=null;focusedAt=time;}}
 else{const d=reduced?1:1-Math.exp(-14*dt);yaw+=(aimYaw-yaw)*d;pitch+=(aimPitch-pitch)*d;}
 camera.rotation.set(pitch,yaw,0,'YXZ');camera.updateMatrixWorld();updateAnimations(time);
 const forward=new T.Vector3();camera.getWorldDirection(forward);
 for(const m of markers){const delta=m.position.clone().sub(camera.position),p=m.position.clone().project(camera);const hidden=!!motion||switching||delta.dot(forward)<=0||p.z>1||Math.abs(p.x)>1||Math.abs(p.y)>1||delta.length()<1.1;m.el.hidden=hidden;if(!hidden){m.el.style.left=(p.x*.5+.5)*innerWidth+'px';m.el.style.top=(-p.y*.5+.5)*innerHeight+'px';}}
 if(viewer){viewer.renderer.render(viewer.scene,viewer.camera);}else renderer.render(current.scene,camera);
}
async function init(){
 try{
  renderer=new T.WebGLRenderer({antialias:devicePixelRatio<2,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.04;renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;$('museum').append(renderer.domElement);
  camera=new T.PerspectiveCamera(61,innerWidth/innerHeight,.045,60);environment=makeEnvironment(renderer);resize();setupUI();setupInput();
  const names=[...new Set(museum.exhibits.flatMap(e=>[e.src,e.extra].filter(Boolean)))];let loaded=0;const failures=[];
  await Promise.all(names.map(name=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images.set(name,img);$('loading-progress').textContent=++loaded+' / '+names.length;resolve();};img.onerror=()=>{failures.push(name);resolve();};img.src=asset(name);})));if(failures.length)throw new Error('缺少素材：'+failures.join('、'));
  await document.fonts.ready;await setRoom(0,'entry',false);requestAnimationFrame(animate);$('loading').classList.add('ready');window.addEventListener('resize',resize);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();$('loading').classList.remove('ready');$('loading-note').textContent='画面暂时中断，请重新载入。';$('retry').hidden=false;});
 }catch(error){console.error(error);$('loading-note').textContent=error.message?.startsWith('缺少素材')?'部分照片没有载入，请重新载入。':'三维展馆暂时无法打开，请使用支持 WebGL 的浏览器。';$('loading-progress').textContent='';$('retry').hidden=false;}
}
init();
