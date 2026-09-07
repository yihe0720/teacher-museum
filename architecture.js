import * as T from './vendor/three.module.js';
import {mergeGeometries} from './vendor/BufferGeometryUtils.js';
import {museum,asset} from './content.js';
export const EYE=1.68;
const V=(x,y,z)=>new T.Vector3(x,y,z);
const materials=new Map();
export function material(color,roughness=.75,metalness=0){const key=[color,roughness,metalness].join('|');if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness,metalness}));return materials.get(key);}
const ivory=material('#e6d8c1'),trim=material('#eadfc9'),stone=material('#c4b294'),gold=material('#b89450',.3,.8),wood=material('#483325'),woodLight=material('#6c4d32'),leather=material('#273f35',.55),paper=material('#e3d9bf');
const glass=new T.MeshPhysicalMaterial({color:'#d9efeb',roughness:.12,metalness:.08,transparent:true,opacity:.14,depthWrite:false,side:T.DoubleSide});
export function mesh(geometry,mat,parent,x=0,y=0,z=0){const m=new T.Mesh(geometry,mat);m.position.set(x,y,z);m.castShadow=!mat.transparent;m.receiveShadow=true;parent.add(m);return m;}
function box(p,w,h,d,x,y,z,m=wood){return mesh(new T.BoxGeometry(w,h,d),m,p,x,y,z);}
function cylinder(p,rt,rb,h,x,y,z,m=gold,n=32){return mesh(new T.CylinderGeometry(rt,rb,h,n),m,p,x,y,z);}
function sphere(p,r,x,y,z,m){return mesh(new T.SphereGeometry(r,32,24),m,p,x,y,z);}
function group(p,x=0,y=0,z=0,angle=0){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=angle;p.add(g);return g;}
export function texture(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
function wrap(c,s,x,y,w,lh,limit=99){let line='',n=0;for(const ch of s){if(ch==='\n'||c.measureText(line+ch).width>w){c.fillText(line,x,y);line=ch==='\n'?'':ch;y+=lh;if(++n>=limit)return;}else line+=ch;}c.fillText(line,x,y);}
function words(text,width=1024,height=512,{color='#716249',background=null,size=36,align='center',leading=1.7,padding=60}={}){return texture(width,height,(c,w,h)=>{if(background){c.fillStyle=background;c.fillRect(0,0,w,h);}c.fillStyle=color;c.font=size+'px "Songti SC", "SimSun", serif';c.textAlign=align;wrap(c,text,align==='center'?w/2:padding,padding+size,w-2*padding,size*leading);});}
function surface(p,w,h,x,y,z,map,basic=false){return mesh(new T.PlaneGeometry(w,h),basic?new T.MeshBasicMaterial({map,transparent:true,side:T.DoubleSide,depthWrite:false}):new T.MeshStandardMaterial({map,roughness:.9,side:T.DoubleSide}),p,x,y,z);}
function inscription(p,text,w,h,x,y,z,options={}){return surface(p,w,h,x,y,z,words(text,1024,Math.round(1024*h/w),options),true);}
let floorTex=null;
function floorMap(){if(floorTex)return floorTex;floorTex=texture(1024,1024,(c,w,h)=>{c.fillStyle='#ab8a60';c.fillRect(0,0,w,h);let seed=312;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let y=0;y<16;y++)for(let x=-1;x<5;x++){let xx=x*256+(y%2)*128,yy=y*64;const s=Math.floor(rnd()*22);c.fillStyle=`rgb(${158+s},${124+s},${83+s})`;c.fillRect(xx+1,yy+1,254,62);for(let a=0;a<13;a++){c.strokeStyle='#48321b'+Math.floor(8+rnd()*14).toString(16).padStart(2,'0');c.beginPath();const py=yy+rnd()*64;c.moveTo(xx,py);c.bezierCurveTo(xx+80,py+4,xx+180,py-3,xx+256,py);c.stroke();}}});floorTex.wrapS=floorTex.wrapT=T.RepeatWrapping;floorTex.repeat.set(3.5,3.5);return floorTex;}
function column(p,x,z,h){cylinder(p,.19,.23,h-.6,x,h/2,z,trim);box(p,.63,.15,.63,x,.08,z,stone);box(p,.51,.13,.51,x,.22,z,trim);box(p,.60,.12,.60,x,h-.2,z,trim);box(p,.69,.12,.67,x,h-.08,z,stone);for(let i=0;i<12;i++){const a=i*Math.PI*2/12;cylinder(p,.012,.012,h-.9,x+Math.cos(a)*.21,h/2,z+Math.sin(a)*.21,stone,5);}}
function portal(p,z,h,w,label,back=false){
 const angle=back?Math.PI:0,g=group(p,0,0,z,angle),radius=1.22,spring=2.55;
 const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(-radius,0);shape.lineTo(-radius,spring);shape.absarc(0,spring,radius,Math.PI,0,true);shape.lineTo(radius,0);shape.lineTo(w/2,0);shape.lineTo(w/2,h);shape.lineTo(-w/2,h);shape.closePath();
 mesh(new T.ExtrudeGeometry(shape,{depth:.25,bevelEnabled:false,curveSegments:32}),ivory,g,0,0,-.2);
 const curve=mesh(new T.TorusGeometry(radius+.10,.07,8,48,Math.PI),trim,g,0,spring,.08);
 for(const x of [-radius-.10,radius+.10])box(g,.14,spring,.15,x,spring/2,.08,trim);
 for(const x of [-1.61,1.61])column(g,x,.14,4.08);
 box(g,2.42,.04,2.9,0,.02,-1.50,stone);
 box(g,2.45,4.4,.09,0,2.2,-2.8,material('#af9b79'));
 box(g,.2,4.4,2.9,-1.32,2.2,-1.5,ivory);box(g,.2,4.4,2.9,1.32,2.2,-1.5,ivory);
 inscription(g,label,2.1,.36,0,4.45,.04,{size:52,color:'#766344',padding:16});
}
function sconce(p,x,y,z,angle=0){const g=group(p,x,y,z,angle);box(g,.13,.46,.07,0,0,0,gold);box(g,.04,.06,.35,0,-.08,.17,gold);const shade=cylinder(g,.13,.26,.33,0,.15,.34,material('#eee0b9'));const bulb=sphere(g,.06,0,.05,.34,new T.MeshBasicMaterial({color:'#ffe1a0'}));}
function roomShell(index,environment){
 const r=museum.rooms[index],s=new T.Scene();s.background=new T.Color('#c4b498');s.environment=environment;const {width:w,depth:d,height:h}=r;
 const floor=new T.MeshStandardMaterial({map:floorMap(),roughness:.56,color:index===2||index===4?'#b6a28a':'#e1cba7'});
 box(s,w,.12,d,0,-.07,0,floor);box(s,w,.16,d,0,h+.04,0,material(index===4?'#8d806a':'#ddd0b8'));
 const wall=material(r.color),dado=index===2||index===4?wood:material('#c8b599');
 for(const side of [-1,1]){
  const x=side*w/2;box(s,.24,h,d,x,h/2,0,wall);box(s,.16,1.07,d,x-side*.14,.535,0,dado);
  for(const yy of [.12,1.10,h-.35,h-.13])box(s,.18,.10,d,x-side*.23,yy,0,trim);
  for(let z=-d/2+.75;z<d/2;z+=1.7){box(s,.03,.73,.025,x-side*.24,.57,z-.63,trim);box(s,.03,.73,.025,x-side*.24,.57,z+.63,trim);box(s,.03,.025,1.26,x-side*.24,.2,z,trim);box(s,.03,.025,1.26,x-side*.24,.93,z,trim);}
  for(const z of [-d*.32,d*.32])sconce(s,x-side*.26,3.1,z,-side*Math.PI/2);
 }
 for(const z of [-d/2+.35,d/2-.35])box(s,w-.3,.015,.54,0,.012,z,stone);
 for(const x of [-w/2+.35,w/2-.35])box(s,.54,.015,d,x,.012,0,stone);
 for(const z of [-d/2+.69,d/2-.69])box(s,w-1,.02,.018,0,.023,z,gold);
 for(const x of [-w/2+.69,w/2-.69])box(s,.018,.02,d-1,x,.023,0,gold);
 if(index<5)portal(s,-d/2+.1,h,w,museum.rooms[index+1].title);
 else box(s,w,h,.24,0,h/2,-d/2,wall);
 if(index>0)portal(s,d/2-.1,h,w,museum.rooms[index-1].title,true);
 else box(s,w,h,.24,0,h/2,d/2,wall);
 // The ceiling proportions vary with each room, keeping the salon and treasury intimate.
 const skylight=index<2;const sw=skylight?4.2:2.7,sd=skylight?d*.48:d*.31;
 box(s,sw+.3,.16,sd+.3,0,h-.12,0,stone);box(s,sw,.02,sd,0,h-.22,0,new T.MeshBasicMaterial({color:index===4?'#e2c292':'#fff0ce'}));
 for(let z=-sd/2;z<=sd/2;z+=sd/3)box(s,sw,.05,.045,0,h-.25,z,trim);
 box(s,.055,.05,sd,0,h-.25,0,trim);
 for(const x of [-w*.31,w*.31])for(let z=-d*.3;z<=d*.31;z+=d*.3){box(s,w*.22,.12,.10,x,h-.22,z,trim);}
 const ambient=new T.HemisphereLight('#ffeccc','#74695b',index===4?1.25:1.8);s.add(ambient);
 const sun=new T.DirectionalLight('#ffe5b5',index===4?2.1:3.0);sun.position.set(-w*.28,h-1,d*.28);sun.target.position.set(1,0,-2);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-w;sun.shadow.camera.right=w;sun.shadow.camera.top=d;sun.shadow.camera.bottom=-d;sun.shadow.camera.near=.5;sun.shadow.camera.far=35;sun.shadow.bias=-.0004;sun.shadow.normalBias=.025;s.add(sun,sun.target);
 const fill=new T.DirectionalLight('#d5deea',.5);fill.position.set(w/2,h,-d/2);s.add(fill);
 return s;
}
function picture(p,images,name,w,h,x,y,z,angle=0,{frame=true,dark=false}={}){
 const g=group(p,x,y,z,angle);let bg=material('#b8aa8e');
 if(frame){box(g,w+.20,h+.20,.12,0,0,0,wood);for(const xx of [-w/2-.025,w/2+.025])box(g,.04,h+.07,.024,xx,0,.08,gold);for(const yy of [-h/2-.025,h/2+.025])box(g,w+.09,.04,.024,0,yy,.08,gold);}
 let photo;
 if(name&&images.get(name)){
  const image=images.get(name);const ratio=image.width/image.height;const pw=Math.min(w,h*ratio),ph=pw/ratio;
  box(g,w,h,.022,0,0,.07,paper);const tex=new T.Texture(image);tex.colorSpace=T.SRGBColorSpace;tex.needsUpdate=true;tex.anisotropy=4;
  photo=surface(g,pw,ph,0,0,.091,tex);photo.material.color.set(dark?'#8d947c':'#ffffff');
 }else photo=box(g,w,h,.025,0,0,.08,material('#394c3d'));
 return {group:g,photo};
}
function label(p,title,sub,x,y,z,angle=0,w=1.2){const g=group(p,x,y,z,angle);box(g,w,.31,.014,0,0,0,material('#c1a371',.5,.4));inscription(g,title+(sub?'\n'+sub:''),w-.06,.27,0,0,.013,{color:'#3b3326',size:sub?60:82,padding:28,leading:1.8});return g;}
function spotlight(p,x,y,z,tx,ty,tz,intensity=24){const l=new T.SpotLight('#ffdf9f',intensity,12,Math.PI/6,.8,1.5);l.position.set(x,y,z);l.target.position.set(tx,ty,tz);p.add(l,l.target);return l;}
function table(p,x,z,w=2.8,d=1.1,h=.9){const g=group(p,x,0,z);box(g,w,.12,d,0,h,0,woodLight);box(g,w+.08,.035,d+.06,0,h+.073,0,wood);for(const xx of [-w/2+.12,w/2-.12])for(const zz of [-d/2+.12,d/2-.12]){box(g,.09,h-.06,.09,xx,h/2-.04,zz,wood);box(g,.10,.08,.1,xx,.06,zz,gold);}return g;}
function lamp(p,x,y,z){const g=group(p,x,y,z);cylinder(g,.14,.16,.04,0,.02,0,gold);cylinder(g,.025,.025,.40,0,.23,0,gold);const shade=cylinder(g,.14,.25,.29,0,.55,0,material('#d2ba80'));sphere(g,.042,0,.42,0,new T.MeshBasicMaterial({color:'#ffe8b0'}));return g;}
function book(p,x,y,z,w=.3,h=.055,d=.44,angle=0){const g=group(p,x,y,z,angle);box(g,w,h,d,0,0,0,paper);box(g,w+.02,.014,d+.02,0,h/2+.007,0,wood);box(g,w+.02,.014,d+.02,0,-h/2-.007,0,wood);return g;}
function shelves(p,x,z,w,h,angle){const g=group(p,x,0,z,angle);box(g,w,h,.16,0,h/2,-.18,wood);for(const xx of [-w/2,w/2])box(g,.12,h,.53,xx,h/2,0,wood);box(g,w+.25,.14,.64,0,h+.06,0,woodLight);const colors=['#705343','#72674d','#404e47','#8a795a','#514c3d'];for(let row=0;row<5;row++){const y=.20+row*(h-.3)/5;box(g,w,.07,.5,0,y,0,woodLight);let xx=-w/2+.13;let n=0;while(xx<w/2-.18){const bw=.13+(n%4)*.035,bh=.43+(n%3)*.09;const b=box(g,bw,bh,.30,xx+bw/2,y+bh/2+.04,.04,material(colors[(n+row)%5]));if(n%9===0)b.rotation.z=.09;box(g,bw*.8,.015,.007,xx+bw/2,y+bh*.82,.196,gold);xx+=bw+.023;n++;}}}
function bench(p,x,z,w=2.5,angle=0){const g=group(p,x,0,z,angle);box(g,w,.14,.78,0,.48,0,wood);box(g,w-.06,.13,.74,0,.59,0,leather);for(const xx of [-w/2+.14,w/2-.14])for(const zz of [-.27,.27])box(g,.085,.45,.085,xx,.23,zz,wood);return g;}
function sofa(p,x,z,angle=0){const g=group(p,x,0,z,angle);bench(g,0,0,2.7);box(g,2.7,.7,.22,0,.98,-.36,leather);for(const xx of [-1.38,1.38])box(g,.20,.45,.91,xx,.79,0,wood);for(let i=0;i<6;i++)sphere(g,.024,-1.0+i*.4,1.0,-.238,gold);}
function casework(p,x,z,w,d,base,glassHeight,angle=0){const g=group(p,x,0,z,angle);box(g,w+.07,.14,d+.07,0,.09,0,wood);box(g,w,base,d,0,base/2+.15,0,wood);box(g,w+.08,.065,d+.08,0,base+.18,0,gold);box(g,w-.05,.055,d-.05,0,base+.23,0,material('#344d3f'));const y=base+.26+glassHeight/2;
 for(const xx of [-w/2,w/2])box(g,.012,glassHeight,d,xx,y,0,glass);for(const zz of [-d/2,d/2])box(g,w,glassHeight,.012,0,y,zz,glass);box(g,w,.012,d,0,base+.26+glassHeight,0,glass);
 for(const xx of [-w/2,w/2])for(const zz of [-d/2,d/2])box(g,.018,glassHeight,.018,xx,y,zz,gold);return {group:g,deck:base+.26};}
// Object geometry follows the supplied photographs. The award is an interpretive 3D exhibit.
export function createObject(kind,images){const g=new T.Group();
 if(kind==='coffee'){
  cylinder(g,.205,.151,.51,0,.255,0,material('#e5ddc7'));cylinder(g,.207,.180,.25,0,.29,0,material('#9d7449'));cylinder(g,.214,.212,.055,0,.54,0,material('#171b19',.5));cylinder(g,.18,.214,.04,0,.584,0,material('#202623',.5));box(g,.09,.025,.055,0,.618,.102,material('#0b0e0d'));cylinder(g,.153,.15,.028,0,.015,0,material('#212725'));
 }else if(kind==='water'){
  const profile=[[0,0],[.16,0],[.194,.035],[.196,.68],[.19,.87],[.176,.94],[.106,1.09],[.097,1.14],[.095,1.22],[0,1.22]].map(([x,y])=>new T.Vector2(x,y));
  const plastic=new T.MeshPhysicalMaterial({color:'#ebf4ee',roughness:.12,metalness:0,transparent:true,opacity:.34,depthWrite:false,side:T.DoubleSide});mesh(new T.LatheGeometry(profile,48),plastic,g);
  cylinder(g,.111,.111,.145,0,1.245,0,material('#e2e4d5',.56));for(let i=0;i<48;i++){const a=i*Math.PI/24;box(g,.008,.13,.008,Math.cos(a)*.111,1.245,Math.sin(a)*.111,ivory);}
  cylinder(g,.196,.196,.39,0,.245,0,material('#f0e7d9'));
  if(images.get('water-bottle.jpg')){const image=images.get('water-bottle.jpg');const t=texture(640,760,(c,w,h)=>c.drawImage(image,470,1050,415,560,0,0,w,h));const label=new T.Mesh(new T.CylinderGeometry(.197,.197,.40,48,1,true,-Math.PI/2,Math.PI),new T.MeshStandardMaterial({map:t,roughness:.85,side:T.DoubleSide}));label.position.y=.245;g.add(label);}
  cylinder(g,.18,.18,.025,0,.045,0,material('#bbbfb4',.4));
 }else if(kind==='pen'){
  const body=group(g,0,.055,0);body.rotation.z=Math.PI/2;cylinder(body,.035,.035,1.16,0,0,0,material('#6797a8',.38,.38));cylinder(body,.038,.038,.018,0,.14,0,gold);cylinder(body,.04,.04,.025,0,-.56,0,gold);cylinder(body,.042,.042,.39,0,-.37,0,material('#7799a6',.34,.4));box(body,.014,.32,.022,.034,-.38,.025,gold);sphere(body,.021,.034,-.225,.025,gold);
  const inscriptionTexture=words('中央财经大学',1024,160,{size:95,padding:15,color:'#263331'});const writing=surface(g,.46,.069,.18,.093,.009,inscriptionTexture,true);writing.rotation.x=-Math.PI/2;
 }else if(kind==='ballon'){
  const base=mesh(new T.DodecahedronGeometry(.38,0),material('#514d41',.93),g,0,.16,0);base.scale.set(1.3,.62,1.08);mesh(new T.DodecahedronGeometry(.23,0),stone,g,-.24,.11,.05);
  const ball=sphere(g,.44,0,.68,0,material('#d2a64e',.22,.91));
  const ico=new T.IcosahedronGeometry(1,0),pos=ico.attributes.position,verts=[],faces=[];const find=v=>{let i=verts.findIndex(a=>a.distanceTo(v)<.001);if(i<0){i=verts.length;verts.push(v);}return i;};for(let i=0;i<pos.count;i+=3)faces.push([0,1,2].map(k=>find(new T.Vector3().fromBufferAttribute(pos,i+k))));
  const neighbors=verts.map(()=>new Set());faces.forEach(f=>{for(let i=0;i<3;i++){neighbors[f[i]].add(f[(i+1)%3]);neighbors[f[(i+1)%3]].add(f[i]);}});
  const cut=(a,b)=>verts[a].clone().multiplyScalar(2).add(verts[b]).normalize().multiplyScalar(.443).add(V(0,.68,0));
  const lineMat=new T.LineBasicMaterial({color:'#7e5d24'});
  const loop=pts=>{const points=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];for(let t=0;t<6;t++){const v=a.clone().sub(V(0,.68,0)).lerp(b.clone().sub(V(0,.68,0)),t/6).normalize().multiplyScalar(.444).add(V(0,.68,0));points.push(v);}}g.add(new T.LineLoop(new T.BufferGeometry().setFromPoints(points),lineMat));};
  faces.forEach(([a,b,c])=>loop([cut(a,b),cut(b,a),cut(b,c),cut(c,b),cut(c,a),cut(a,c)]));
  neighbors.forEach((ns,a)=>{const normal=verts[a].clone().normalize(),u=new T.Vector3().crossVectors(normal,V(0,1,0)).normalize(),v=new T.Vector3().crossVectors(normal,u);const sorted=[...ns].sort((b,c)=>Math.atan2(verts[b].dot(v),verts[b].dot(u))-Math.atan2(verts[c].dot(v),verts[c].dot(u)));loop(sorted.map(b=>cut(a,b)));});
 }
 return g;}
function microphone(p,x,y,z){const g=group(p,x,y,z);cylinder(g,.14,.18,.035,0,.02,0,gold);cylinder(g,.018,.018,.46,0,.27,0,gold);const head=box(g,.15,.23,.12,0,.62,0,material('#908b76',.3,.7));for(let i=0;i<7;i++)box(g,.14,.006,.007,0,.535+i*.024,.064,wood);return g;}
function entranceText(s,r){if(!r.entry||r.id===0)return;const g=group(s,-r.width/2+.17,2.65,r.depth/2-2.05,Math.PI/2);inscription(g,r.entry,2.6,2.0,0,0,.02,{size:39,color:r.id===4?'#e1d5b9':'#ddd2b7',align:'left',padding:45,leading:1.6});}
export function createRoom(index,images,environment){
 const r=museum.rooms[index],scene=roomShell(index,environment),targets=new Map(),picks=[],animations=[],dynamic=new Set();
 const addTarget=(id,position,look,objects=[],labelText=null)=>{const t={id,position:V(...position),look:V(...look),label:labelText||museum.exhibits.find(e=>e.id===id)?.title||id};targets.set(id,t);for(const o of objects){o.userData.target=id;picks.push(o);}return t;};
 const wallArt=(id,x,y,z,w,h,angle=0,options={})=>{const e=museum.exhibits.find(e=>e.id===id);const p=picture(scene,images,e.src,w,h,x,y,z,angle,options);const n=V(Math.sin(angle),0,Math.cos(angle));const point=V(x,EYE,z).addScaledVector(n,Math.max(2.2,w*.80));addTarget(id,point.toArray(),[x,y-.20,z],[p.photo]);label(scene,e.title,e.date,x,y-h/2-.37,z+.04,angle,w>3?1.6:1.25);return p;};
 entranceText(scene,r);
 addTarget('entry',[0,EYE,r.depth/2-2.25],[0,2.25,-r.depth/2],[],'中央');
 if(index<5)addTarget('exit',[0,EYE,-r.depth/2+1.7],[0,EYE,-r.depth/2-1],[],'前往'+museum.rooms[index+1].title);
 if(index>0)addTarget('back',[0,EYE,r.depth/2-1.7],[0,EYE,r.depth/2+1],[],'返回'+museum.rooms[index-1].title);
 if(index===0){
  const g=group(scene,-5.28,2.7,-.1,Math.PI/2);box(g,5.0,3.25,.08,0,0,0,trim);const wall=inscription(g,[museum.prologue.title,museum.prologue.text,museum.prologue.signature].filter(Boolean).join('\n\n'),4.7,2.95,0,0,.06,{size:44,color:'#796245',padding:55,leading:1.65});
  addTarget('prologue',[-1.6,EYE,-.1],[-5.28,2.5,-.1],[wall],'序言');bench(scene,3,-1.4,2.5,Math.PI/2);
  for(const x of [-3.5,3.5])column(scene,x,-4.2,5.2);
  inscription(scene,'P O U R   V O U S',3,.45,0,3.6,5.82,{size:46,color:'#8c7959',padding:12});
 }else if(index===1){
  wallArt('lectern',-6.76,3.25,-.6,5.1,3.83,Math.PI/2);
  wallArt('journey',6.76,2.7,3.6,2.25,1.69,-Math.PI/2);
  wallArt('hosting',4.05,3.0,-8.19,4.8,3.6,0);
  for(const z of [-6.8,6.7])for(const x of [-6.1,6.1])column(scene,x,z,6.25);
  bench(scene,-3.0,4.6,2.9,Math.PI/2);
  const cabinet=group(scene,5.85,0,-2.5,-Math.PI/2);box(cabinet,1.22,.76,.78,0,.41,0,wood);box(cabinet,1.34,.07,.86,0,.84,0,woodLight);for(const x of [-.47,.47])for(const z of [-.24,.24])box(cabinet,.075,.24,.075,x,.13,z,wood);
  const drawer=group(cabinet,0,.67,.14);drawer.userData.dynamic=true;box(drawer,1.10,.055,.67,0,-.05,0,paper);const front=box(drawer,1.19,.18,.065,0,0,.39,woodLight);box(drawer,.23,.035,.055,0,0,.444,gold);
  const pic=picture(drawer,images,'unofficial-record.jpg',.92,.49,0,-.012,-.01,0,{frame:false});pic.group.rotation.x=-Math.PI/2;
  label(cabinet,'私人档案','',0,.37,.413,0,.79);const t=addTarget('drawer',[3.6,EYE,-2.5],[5.85,.70,-2.5],[front],'档案抽屉');t.drawer=drawer;t.opened=false;
  spotlight(scene,4.5,5.3,-2.3,5.85,.8,-2.5,14);
 }else if(index===2){
  shelves(scene,-5.72,2.8,3.0,4.4,Math.PI/2);shelves(scene,-5.72,-.8,3.0,4.4,Math.PI/2);
  const board=group(scene,-3.72,3.05,-7.17);box(board,4.3,3.20,.12,0,0,0,wood);box(board,4.12,3.02,.03,0,0,.09,material('#283c32'));const p=picture(board,images,'classroom.jpg',3.75,2.80,0,0,.13,0,{frame:false,dark:true});
  const desk=table(scene,-3.6,-5.35,3.0,1.25,1.0);lamp(desk,.94,1.1,-.27);book(desk,-.68,1.12,0,.49,.10,.59,-.12);
  for(let i=0;i<3;i++){const sheet=box(desk,.47,.004,.61,-.05+i*.16,1.09+i*.005,.06+i*.07,paper);sheet.rotation.y=.09-i*.10;}
  addTarget('lesson',[-3.65,EYE,-1.9],[-3.65,2.5,-7.1],[p.photo,desk.children[0]]);label(scene,'政经课','2022 · 10',-3.72,1.16,-7.10,0,1.65);
  const read=table(scene,3.45,.2,2.3,4.5,.92);lamp(read,.65,1.02,-1.50);lamp(read,.65,1.02,1.50);book(read,.4,1.07,.2,.35,.11,.51,.10);
  const archive=picture(read,images,'conference-notes.jpg',.78,.85,-.56,1.014,.22,0,{frame:false});archive.group.rotation.x=-Math.PI/2;
  addTarget('listen',[1.1,EYE,.5],[3.1,1.12,.2],[archive.photo,read.children[0]]);
  const g=group(scene,5.82,3.22,-2.25,-Math.PI/2);const e=museum.exhibits.find(e=>e.id==='listen');inscription(g,e.quotes.join('\n\n'),4.3,1.8,0,0,0,{color:'#d7d8bf',size:42,align:'left',padding:45,leading:1.75});
  label(read,'该听什么','',-1.16,.87,.30,Math.PI/2,.90);
  bench(scene,-2,3.55,2.1,0);
 }else if(index===3){
  // A narrow niche, a tall vitrine and a low horizontal case give each object its own scale.
  const niche=group(scene,-4.68,0,2.5,Math.PI/2);box(niche,1.7,2.8,.13,0,1.85,0,wood);box(niche,1.50,2.57,.035,0,1.85,.085,material('#79604a'));box(niche,1.56,.12,.69,0,1.10,.30,woodLight);
  const cup=createObject('coffee',images);cup.position.set(0,1.17,.32);niche.add(cup);label(niche,'一杯咖啡','2026 · 01',0,.86,.38,0,1.13);addTarget('coffee',[-2.35,EYE,2.5],[-4.20,1.48,2.5],cup.children);spotlight(scene,-3.8,3.5,2.6,-4.25,1.4,2.5,13);
  const watercase=casework(scene,-2.65,-1.60,1.04,1.04,.56,1.73);const water=createObject('water',images);water.position.y=watercase.deck;watercase.group.add(water);label(watercase.group,'一瓶水','2026 · 07 · 12',0,.45,.54,0,.82);addTarget('water',[-.60,EYE,-.9],[-2.65,1.37,-1.6],water.children);spotlight(scene,-2.6,4.2,-1.5,-2.65,1.3,-1.6,18);
  const pencase=casework(scene,3.10,2.55,1.92,.76,.61,.36,-Math.PI/2);const pen=createObject('pen',images);pen.position.y=pencase.deck+.01;pencase.group.add(pen);label(pencase.group,'一支笔','2026 · 07 · 12',0,.49,.40,0,1.07);addTarget('pen',[.60,EYE,2.55],[3.10,.92,2.55],pen.children);spotlight(scene,2.8,3.2,2.6,3.1,.95,2.55,13);
  const calm=group(scene,-4.80,2.7,-4.35,Math.PI/2);const first=inscription(calm,'我第一次在外面听会，\n其实很紧张！',2.8,1.03,0,.37,0,{size:50,color:'#f0dfbb',padding:35});const last=inscription(calm,'但是您的提醒\n让我从不安变得平静。',2.8,1.03,0,-.72,0,{size:50,color:'#f0dfbb',padding:35});last.material.opacity=0;last.userData.dynamic=true;animations.push({kind:'reveal',object:last,target:'calm',delay:900});addTarget('calm',[-2.15,EYE,-4.2],[-4.7,2.25,-4.35],[first]);
  const a=picture(scene,images,'graduation-2025.jpg',.74,.97,4.81,2.05,-3.72,-Math.PI/2);const b=picture(scene,images,'graduation-2026.jpg',1.02,.77,4.81,2.18,-4.8,-Math.PI/2);addTarget('happy',[2.45,EYE,-4.1],[4.81,2.03,-4.15],[a.photo,b.photo]);const note=group(scene,4.78,1.21,-4.24,-Math.PI/2);inscription(note,'2025。2026。\n大家怎么这么开心呀。',1.85,.46,0,0,0,{size:50,padding:20,color:'#eee0c3'});
 }else if(index===4){
  wallArt('spring',-6.78,2.78,3.45,2.65,1.35,Math.PI/2);
  wallArt('sunny',-6.78,2.85,-2.40,3.65,1.89,Math.PI/2);
  const side=table(scene,-5.32,.02,1.3,.84,.85);microphone(side,-.34,.94,-.16);const post=picture(side,images,'gulangyu.jpg',.61,.46,.22,1.18,.10,0,{frame:false});post.group.rotation.y=Math.PI/2;post.group.rotation.z=-.11;addTarget('postcard',[-3.1,EYE,.02],[-5.3,1.18,.02],[post.photo]);
  sofa(scene,-3.9,6.2,0);const low=table(scene,-3.9,4.7,1.5,.65,.43);book(low,.24,.54,0,.31,.06,.42,-.12);
  const empty=picture(scene,images,null,2.25,2.75,6.79,2.76,3.4,-Math.PI/2);addTarget('empty',[3.7,EYE,3.4],[6.76,2.4,3.4],[empty.photo]);label(scene,'这里没有照片','',6.74,1.05,3.4,-Math.PI/2,1.5);box(scene,1.30,.025,2.5,5.57,.045,3.4,material('#324b35'));spotlight(scene,4.9,4.8,3.4,6.6,2.5,3.4,18);
  const c=casework(scene,4.50,-2.5,1.65,1.55,.74,1.65);const trophy=createObject('ballon',images);trophy.position.y=c.deck+.04;c.group.add(trophy);label(c.group,'金球奖','',0,.64,.805,0,1.10);addTarget('ballon',[1.72,EYE,-1.40],[4.5,1.65,-2.5],trophy.children);spotlight(scene,4.4,4.85,-2.1,4.5,1.7,-2.5,35);
  const note=picture(scene,images,'xian-night.jpg',1.17,.53,3.2,1.91,-8.18,0,{frame:false});addTarget('night',[3.2,EYE,-5.92],[3.2,1.85,-8.18],[note.photo]);inscription(scene,'不期而遇的一首《晴天》',1.75,.22,3.2,1.46,-8.10,{color:'#b9ac90',size:53,padding:12});
 }else if(index===5){
  bench(scene,0,1.95,2.65,0);
  const text=museum.epilogue.text;
  const main=inscription(scene,text,5.35,2.86,0,2.75,-4.83,{size:34,padding:48,color:'#6e5a3e',leading:1.8});const last=inscription(scene,museum.epilogue.after,4.9,.40,0,.95,-4.82,{size:34,padding:13,color:'#8a7759'});last.material.opacity=0;last.userData.dynamic=true;animations.push({kind:'ending',object:last,delay:4500});addTarget('epilogue',[0,EYE,-.75],[0,2.5,-4.83],[main],'给您的话');spotlight(scene,1.5,4.3,-1.2,0,2,-4.8,11);
 }
 // Group static solids to keep the number of draw calls manageable on phones.
 scene.updateMatrixWorld(true);const batches=new Map();scene.traverse(o=>{if(!o.isMesh||picks.includes(o)||o.material.transparent||o.material.map)return;let ancestor=o;while(ancestor){if(ancestor.userData.dynamic||ancestor.userData.target)return;ancestor=ancestor.parent;}const key=o.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);});
 for(const objects of batches.values()){if(objects.length<2)continue;const gs=objects.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();return g.applyMatrix4(o.matrixWorld);});const merged=mergeGeometries(gs,false);if(merged){const m=new T.Mesh(merged,objects[0].material);m.castShadow=true;m.receiveShadow=true;scene.add(m);objects.forEach(o=>o.removeFromParent());}gs.forEach(g=>g.dispose());}
 return {scene,targets,picks,animations,room:r};
}
export function makeEnvironment(renderer){const s=new T.Scene();s.background=new T.Color('#b0a18a');s.add(new T.HemisphereLight('#fff0d7','#42362a',3));for(const [x,y,z,w,h] of [[0,5,0,7,3],[-4,2,0,3,6],[4,3,-2,4,5]]){const p=mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:'#fff2d6'}),s,x,y,z);p.lookAt(0,1,0);}const gen=new T.PMREMGenerator(renderer);const env=gen.fromScene(s,.06).texture;gen.dispose();return env;}
