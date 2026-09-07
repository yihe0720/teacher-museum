import {museum} from './content.js';
// Footprints of furniture, expanded by the visitor's clearance. Units are metres.
const furniture=[
 [[3,-1.4,.85,2.6],[-3.5,-4.2,.72,.72],[3.5,-4.2,.72,.72]],
 [[-3,4.6,.9,3.0],[5.65,-2.5,1.8,1.4],...[-6.1,6.1].flatMap(x=>[-6.8,6.7].map(z=>[x,z,.8,.8]))],
 [[-5.72,2.8,.65,3.2],[-5.72,-.8,.65,3.2],[-3.6,-5.35,3.15,1.38],[3.45,.2,2.45,4.65],[-2,3.55,2.25,.92]],
 [[-4.4,2.5,.8,1.8],[-2.65,-1.6,1.15,1.15],[3.1,2.55,.92,2.05]],
 [[-3.9,6.2,3.05,1.2],[-3.9,4.7,1.6,.75],[-5.32,.02,1.4,.95],[4.5,-2.5,1.8,1.7]],
 [[0,1.95,2.8,.91]]
];
export function blocked(x,z,room,clearance=.22){const r=museum.rooms[room];return Math.abs(x)>r.width/2-.38||Math.abs(z)>r.depth/2-.5||furniture[room].some(([cx,cz,w,d])=>Math.abs(x-cx)<w/2+clearance&&Math.abs(z-cz)<d/2+clearance);}
function segmentClear(a,b,room){const steps=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/.09));for(let i=1;i<steps;i++){const k=i/steps;if(blocked(a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,room))return false;}return true;}
export function findPath(start,end,room){
 if(segmentClear(start,end,room))return [start,end];
 const cell=.28,r=museum.rooms[room],nx=Math.ceil(r.width/cell),nz=Math.ceil(r.depth/cell);
 const point=k=>[(k%nx)*cell-r.width/2+cell/2,Math.floor(k/nx)*cell-r.depth/2+cell/2];
 const near=p=>{let best=-1,d=Infinity;for(let k=0;k<nx*nz;k++){const q=point(k);if(blocked(...q,room))continue;const dd=Math.hypot(q[0]-p[0],q[1]-p[1]);if(dd<d&&segmentClear(p,q,room)){d=dd;best=k;}}return best;};
 const a=near(start),b=near(end);if(a<0||b<0)return null;
 const open=[a],came=new Map(),cost=new Map([[a,0]]),closed=new Set();const estimate=k=>{const q=point(k),v=point(b);return Math.hypot(q[0]-v[0],q[1]-v[1]);};
 while(open.length){open.sort((a,b)=>cost.get(a)+estimate(a)-cost.get(b)-estimate(b));const k=open.shift();if(k===b){const chain=[end];let cursor=k;while(cursor!==undefined){chain.push(point(cursor));cursor=came.get(cursor);}chain.push(start);chain.reverse();const result=[chain[0]];let i=0;while(i<chain.length-1){let j=chain.length-1;while(j>i+1&&!segmentClear(chain[i],chain[j],room))j--;result.push(chain[j]);i=j;}return result;}
  closed.add(k);const x=k%nx,z=Math.floor(k/nx);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||xx>=nx||zz<0||zz>=nz)continue;const n=zz*nx+xx;if(closed.has(n)||blocked(...point(n),room)||!segmentClear(point(k),point(n),room))continue;const score=cost.get(k)+Math.hypot(dx,dz)*cell;if(score<(cost.get(n)??Infinity)){cost.set(n,score);came.set(n,k);if(!open.includes(n))open.push(n);}}
 }
 return null;
}
