// This visit stays in memory. Nothing is uploaded or inferred about unread exhibits.
export function createVisit(){
 let started=null,activeSince=null,activeMs=0;const rooms=[],stops=new Set(),read=new Set(),moments=new Set();
 return {
  start(){if(started)return;started=new Date();activeSince=performance.now();},
  visibility(visible){if(!started)return;const now=performance.now();if(activeSince!==null){activeMs+=now-activeSince;activeSince=null;}if(visible)activeSince=now;},
  arrive(room,id){if(!started)return;if(!rooms.includes(room))rooms.push(room);stops.add(id);},
  read(id){if(started)read.add(id);},moment(id){if(started)moments.add(id);},
  snapshot(){if(!started)return null;return {started:new Date(started),issued:new Date(),elapsedMs:activeMs+(activeSince===null?0:performance.now()-activeSince),rooms:[...rooms],read:[...read],moments:[...moments],stops:[...stops]};}
 };
}
const roomNames=['序厅','风华','才识','温意','可爱','终厅'];
const pad=n=>String(n).padStart(2,'0');
export const localDate=d=>`${d.getFullYear()}.${pad(d.getMonth()+1)}.${pad(d.getDate())}`;
const clock=d=>`${pad(d.getHours())}:${pad(d.getMinutes())}`;
export function duration(ms){const seconds=Math.max(0,Math.floor(ms/1000));return seconds<60?`${seconds} 秒`:`${Math.floor(seconds/60)} 分 ${seconds%60} 秒`;}
export function drawTicket(canvas,visit){
 const W=1600,H=720;canvas.width=W*2;canvas.height=H*2;const c=canvas.getContext('2d');c.scale(2,2);
 const gradient=c.createLinearGradient(0,0,W,H);gradient.addColorStop(0,'#e3c697');gradient.addColorStop(.6,'#cbaa7b');gradient.addColorStop(1,'#b99166');c.fillStyle=gradient;c.fillRect(0,0,W,H);
 c.fillStyle='#6a472705';for(let y=0;y<H;y+=4)c.fillRect(0,y,W,1);
 c.strokeStyle='#7c583a88';c.lineWidth=1.5;c.strokeRect(25,25,1550,670);c.strokeRect(34,34,1532,652);
 c.setLineDash([7,9]);c.beginPath();c.moveTo(1155,0);c.lineTo(1155,H);c.stroke();c.setLineDash([]);
 for(const y of [0,H]){c.fillStyle='#f6eedf';c.beginPath();c.arc(1155,y,19,0,Math.PI*2);c.fill();}
 const text=(value,x,y,size=32,color='#513720',font='"Songti SC", "SimSun", "Noto Serif CJK SC", serif',align='left')=>{c.fillStyle=color;c.font=`${font.startsWith('italic ')?'italic ':''}${size}px ${font.replace(/^italic /,'')}`;c.textAlign=align;c.fillText(value,x,y);};
 text('THE LITTLE CHRONICLES OF PROFESSOR HE ZHAOPENG',80,91,24,'#765236','Georgia, serif');
 text('Museum of Time',80,185,76,'#513720','italic Georgia, serif');
 c.save();c.translate(988,174);c.rotate(-.16);c.strokeStyle='#91604688';c.lineWidth=2;c.beginPath();c.arc(0,0,66,0,Math.PI*2);c.stroke();c.beginPath();c.arc(0,0,57,0,Math.PI*2);c.stroke();text('留 念',0,0,27,'#8c5e42',undefined,'center');text('2026',0,29,20,'#8c5e42','Georgia, serif','center');c.restore();
 c.strokeStyle='#8d653f';c.beginPath();c.moveTo(82,240);c.lineTo(1057,240);c.stroke();
 text('这一次，您来过。',80,307,37);
 text(`${localDate(visit.started)}  ${clock(visit.started)}`,80,369,31);
 text('停留 '+duration(visit.elapsedMs),1057,369,27,'#765236',undefined,'right');
 text('今天的足迹',80,435,24,'#785637');
 text(visit.rooms.map(i=>roomNames[i]).join('  ·  '),80,484,32);
 const books=visit.moments.filter(x=>x.startsWith('book:')).length;
 const memory=visit.moments.includes('drawer')?'还打开了那只藏着民间评价的抽屉。':books?'还从书架抽出了老师推荐的书。':visit.read.length?`在 ${visit.read.length} 件展品前，读过留下的文字。`:'在这座小馆里，留下了一次到访。';
 text(memory,80,545,28,'#785637');
 c.beginPath();c.moveTo(82,593);c.lineTo(1057,593);c.stroke();
 text('永久馆藏 · 更新至2026',80,639,25,'#765236');text('策展人 逸',1057,639,25,'#765236',undefined,'right');
 text('2026 TEACHERS’ DAY',80,676,21,'#7b593a','italic Georgia, serif');
 const cx=1365;text('VISIT KEEPSAKE',cx,94,23,'#765236','Georgia, serif','center');
 c.strokeRect(cx-60,142,120,127);text('H',cx,239,94,'#755034','Georgia, serif','center');
 text('参观纪念票',cx,345,39,'#513720',undefined,'center');
 text(localDate(visit.started),cx,410,29,'#513720','Georgia, serif','center');
 text('何老师，教师节快乐。',cx,483,25,'#785637',undefined,'center');
 text('2022 - forever',cx,581,27,'#765236','Georgia, serif','center');
 text('POUR VOUS',cx,657,23,'#765236','Georgia, serif','center');
 return canvas;
}
// A self-contained, high-resolution image PDF. Byte offsets are computed after JPEG encoding.
export function ticketPDF(jpeg,width,height){
 const enc=new TextEncoder(),chunks=[],offsets=[0];let length=0;const put=x=>{const bytes=typeof x==='string'?enc.encode(x):x;chunks.push(bytes);length+=bytes.length;};
 const object=(id,body)=>{offsets[id]=length;put(`${id} 0 obj\n${body}\nendobj\n`);};
 put('%PDF-1.4\n% Museum visit ticket\n');
 object(1,'<< /Type /Catalog /Pages 2 0 R >>');object(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
 const pageHeight=559.28*height/width+36;object(3,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 ${pageHeight}] /Resources << /XObject << /Ticket 4 0 R >> >> /Contents 5 0 R >>`);
 offsets[4]=length;put(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);put(jpeg);put('\nendstream\nendobj\n');
 const w=559.28,h=w*height/width,y=18,content=`q\n${w} 0 0 ${h} 18 ${y} cm\n/Ticket Do\nQ\n`;
 object(5,`<< /Length ${enc.encode(content).length} >>\nstream\n${content}endstream`);
 const xref=length;put('xref\n0 6\n0000000000 65535 f \n');for(let i=1;i<=5;i++)put(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
 put(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);return new Blob(chunks,{type:'application/pdf'});
}
export function setupSouvenir(visit){
 const $=id=>document.getElementById(id);let snapshot=null,completed=false;
 async function open(){await document.fonts.ready;snapshot=visit.snapshot();if(!snapshot)return;drawTicket($('souvenir-canvas'),snapshot);
  $('souvenir-summary').textContent=`${localDate(snapshot.started)}，停留 ${duration(snapshot.elapsedMs)}；走过${snapshot.rooms.map(i=>roomNames[i]).join('、')}，读过 ${snapshot.read.length} 件展品的展签。`;
  if($('detail-dialog').open)$('detail-dialog').close();$('souvenir-dialog').showModal();
 }
 $('souvenir-open').onclick=$('souvenir-detail-open').onclick=open;
 $('souvenir-save').onclick=async()=>{const button=$('souvenir-save');button.disabled=true;button.textContent='正在保存…';
  try{const canvas=$('souvenir-canvas'),jpg=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.96));if(!jpg)throw new Error('encoding');const pdf=ticketPDF(new Uint8Array(await jpg.arrayBuffer()),canvas.width,canvas.height);const url=URL.createObjectURL(pdf),a=document.createElement('a');a.href=url;a.download=`何老师的博物馆-参观纪念票-${localDate(snapshot.started)}.pdf`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);completed=true;$('souvenir-dialog').classList.add('visit-complete');$('souvenir-kicker').textContent='MERCI DE VOTRE VISITE';$('souvenir-title').textContent='教师节快乐，老师。';$('visit-farewell').hidden=false;$('ending-ticket-label').textContent='再看看您的纪念票';$('souvenir-note').textContent='PDF 已生成并发起下载；若浏览器打开了 PDF，请在其中保存。';}
  catch{$('souvenir-note').textContent='这次保存没有成功，请再试一次。';}finally{button.disabled=false;button.textContent=completed?'再次保存 PDF ↓':'保存 PDF，留下这次参观 ↓';}
 };
 return {open};
}
