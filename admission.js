// Admission is a user gesture; background music is always opt-in.
export function setupAdmission({onEnter,onStatus}){
 const $=id=>document.getElementById(id),overlay=$('admission'),stub=$('admit'),audio=$('museum-audio');
 let ready=false,entering=false,failed=false,closed=false,starFrame=0;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 audio.volume=.35;
 const syncMusic=()=>{const playing=!audio.paused;$('music-toggle').setAttribute('aria-pressed',String(playing));$('music-toggle').setAttribute('aria-label',playing?'暂停背景音乐':'播放背景音乐');$('music-label').textContent=playing?'音乐 · 开':'音乐 · 关';};
 $('music-toggle').onclick=async()=>{if(!audio.paused){audio.pause();return;}try{await audio.play();}catch{onStatus('音乐暂时无法播放，请再点一次音乐按钮。');$('music-label').textContent='重试音乐';}};
 audio.addEventListener('play',syncMusic);audio.addEventListener('pause',syncMusic);audio.addEventListener('error',()=>{syncMusic();$('music-label').textContent='重试音乐';onStatus('音乐暂时没有载入，您仍可继续参观。');});
 stub.onclick=async()=>{
  if(failed){location.reload();return;}if(!ready||entering)return;entering=true;stub.disabled=true;$('ticket-status').textContent='';$('ticket').classList.add('tearing');
  await pause(reduced?0:700);overlay.classList.add('lit');await pause(reduced?200:1050);
  onEnter();document.body.classList.remove('awaiting-admission');$('museum-ui').inert=false;overlay.classList.add('departed');
  await pause(reduced?200:1100);overlay.hidden=true;closed=true;cancelAnimationFrame(starFrame);window.removeEventListener('resize',resizeStars);$('museum').focus({preventScroll:true});
 };
 const canvas=$('ticket-stars'),ctx=canvas.getContext('2d');let width=0,height=0;
 const stars=Array.from({length:110},(_,i)=>({x:((i*73.137)%101)/101,y:((i*37.73)%97)/97,r:.35+(i%5)*.19,phase:i*1.7}));
 function resizeStars(){width=innerWidth;height=innerHeight;canvas.width=width;canvas.height=height;}
 function paintStars(t){if(closed||!ctx)return;if(!document.hidden){ctx.clearRect(0,0,width,height);for(const s of stars){const a=.16+.20*(reduced?1:(1+Math.sin(t*.0005+s.phase))/2);ctx.fillStyle=`rgba(234,212,177,${a})`;ctx.beginPath();ctx.arc(s.x*width,s.y*height,s.r,0,Math.PI*2);ctx.fill();}}if(!reduced)starFrame=requestAnimationFrame(paintStars);}
 resizeStars();window.addEventListener('resize',resizeStars);paintStars(0);
 return {setProgress(n,total){$('ticket-status').textContent=`展馆正在准备 · ${n} / ${total}`;},setReady(){ready=true;stub.disabled=false;$('ticket-status').textContent='请持票入馆，慢慢参观。';},setError(message){failed=true;stub.disabled=false;$('ticket-status').textContent=message;stub.querySelector('strong').textContent='重新载入';}};
}
