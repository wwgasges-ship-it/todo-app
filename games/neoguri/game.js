'use strict';
const {Game,W,H,FLOORS,LADDERS}=NeoguriCore;
const game=new Game(),canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s),sources=new Map();
let best=0,lastTime=0,accumulator=0,previousState='ready',previousFruit=24;
try{best=Number(localStorage.getItem('neoguri-best-v1'))||0;}catch{}
function clearInput(){sources.clear();document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
function input(){const values=[...sources.values()];return Object.fromEntries(['left','right','up','down','jump'].map(k=>[k,values.includes(k)]));}
function record(){if(game.score<=best)return;best=game.score;try{localStorage.setItem('neoguri-best-v1',String(best));}catch{}}
function setOverlay(title,body,button,icon,kicker){$('#overlay-title').textContent=title;$('#overlay-body').textContent=body;$('#start').textContent=button;$('#overlay-icon').textContent=icon;$('#overlay-kicker').textContent=kicker;}
function sync(){
 const count=game.fruits.filter(f=>!f.taken).length;
 $('#score').textContent=String(game.score).padStart(4,'0');$('#fruit').textContent=count+'개';$('#lives').textContent='♥ '.repeat(game.lives).trim()||'목숨 없음';$('#time').textContent=Math.ceil(game.time)+'초';$('#best').textContent='최고 점수 '+best;
 $('#pause').disabled=game.state!=='playing';$('#overlay').hidden=game.state==='playing';
 if(previousState!==game.state){
 if(game.state==='paused')setOverlay('잠깐 쉬어가요','준비되면 다시 모험을 이어가세요.','계속하기 ▶','☕','일시정지');
 if(game.state==='won')setOverlay('과일을 모두 모았어요!',`점수 ${game.score}점 · 남은 목숨 ${game.lives}개. 멋진 모험이었어요!`,'다시 도전 ▶','🏆','스테이지 클리어');
 if(game.state==='lost')setOverlay('다시 한번 도전할까요?',game.time<=0?`시간이 다 됐어요. 이번 점수는 ${game.score}점이에요.`:`이번 점수는 ${game.score}점이에요. 점프로 장애물을 피해보세요.`,'다시 도전 ▶','🌙','모험 종료');
 const message={playing:'과일을 모두 모아보세요!',paused:'일시정지했어요.',won:'성공! 과일을 모두 모았어요.',lost:'모험이 끝났어요.'};$('#status').textContent=message[game.state]||'천천히 시작해 보세요.';
 if(game.state!=='playing'){clearInput();$('#start').focus({preventScroll:true});}
 previousState=game.state;
 }
 if(count!==previousFruit&&game.state==='playing')$('#status').textContent=`과일을 모았어요! ${count}개 남았어요.`;
 previousFruit=count;
}
$('#start').addEventListener('click',()=>{clearInput();if(game.state==='paused')game.resume();else game.reset();accumulator=0;sync();$('#start').blur();$('#restart').blur();});
$('#pause').addEventListener('click',()=>{game.pause();clearInput();sync();});
$('#restart').addEventListener('click',()=>{clearInput();game.reset();accumulator=0;sync();$('#start').blur();$('#restart').blur();});
const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Space:'jump',KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down'};
window.addEventListener('keydown',e=>{if((e.target.tagName==='BUTTON'&&(e.code==='Space'||e.code==='Enter'))||e.ctrlKey||e.altKey||e.metaKey)return;if(keys[e.code]){e.preventDefault();sources.set('key:'+e.code,keys[e.code]);}if(e.code==='KeyP'&&!e.repeat){if(game.state==='paused')game.resume();else game.pause();clearInput();sync();}});
window.addEventListener('keyup',e=>{sources.delete('key:'+e.code);});
document.querySelectorAll('[data-control]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);sources.set('pointer:'+e.pointerId,b.dataset.control);b.classList.add('pressed');});
 const release=e=>{sources.delete('pointer:'+e.pointerId);b.classList.toggle('pressed',[...sources.values()].includes(b.dataset.control));};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);b.addEventListener('contextmenu',e=>e.preventDefault());
});
function suspend(){clearInput();game.pause();sync();}
window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
function pixelSprite(pattern,x,y,scale,palette,flip=false){for(let r=0;r<pattern.length;r++)for(let c=0;c<pattern[r].length;c++){const color=palette[pattern[r][c]];if(color)rect(x+(flip?pattern[r].length-1-c:c)*scale,y+r*scale,scale,scale,color);}}
const raccoon=['..bb....bb..','.bttb..bttb.','.bttttttttb.','bttttttttttb','bwwwwwwwwwwb','bwddwddwddwb','bwdwwddwwdwb','.bwwwddwwwb.','..bwwddwwb..','...bttttb...','..bttttttb..','..bttttttb..','...bb..bb...'];
const palette={b:'#303447',t:'#b9a38f',w:'#f5e5ca',d:'#343745'};
function drawRaccoon(){const p=game.player;if(p.invul>0&&Math.floor(game.elapsed*12)%2===0&&game.state==='playing')return;
 const walk=p.grounded&&!p.climbing&&Math.abs(Number(input().right)-Number(input().left))?Math.sin(game.elapsed*17)*2:0;
 ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));if(p.facing<0)ctx.scale(-1,1);
 // 줄무늬 꼬리와 직접 그린 픽셀 너구리
 rect(-24,-14,14,9,'#7b736e');rect(-25,-12,5,7,'#343745');rect(-15,-14,4,9,'#343745');
 pixelSprite(raccoon,-12,-29+walk,2,palette);rect(-9,-3,6,3,'#303447');rect(5,-3,6,3,'#303447');ctx.restore();
}
function drawFruit(f){const x=f.x,y=f.y+Math.sin(game.elapsed*3+f.x)*1.4;ctx.save();ctx.translate(x,y);
 if(f.kind===0){rect(-7,-4,14,12,'#f49a49');rect(-5,-6,10,16,'#f9ab51');rect(-5,-4,3,4,'#ffe7a5');rect(0,-11,3,5,'#6faa7c');rect(3,-12,5,3,'#82cf92');}
 if(f.kind===1){rect(-8,-3,7,10,'#f77888');rect(1,-1,7,10,'#e95c79');rect(-6,-5,4,3,'#f99dab');rect(-3,-10,2,7,'#81ba83');rect(3,-10,2,9,'#81ba83');rect(-2,-11,7,2,'#81ba83');}
 if(f.kind===2){rect(-9,-4,18,10,'#77be94');rect(-7,-5,14,9,'#ef8b89');rect(-5,5,10,3,'#46856f');rect(-4,-2,2,3,'#474258');rect(3,-1,2,3,'#474258');}
 ctx.restore();}
function draw(){
 ctx.clearRect(0,0,W,H);rect(0,0,W,H,'#101d30');
 for(let i=0;i<42;i++){let x=(i*89+23)%W,y=(i*53+17)%400;rect(x,y,i%4===0?2:1,2,'#3d5165');}
 // 달과 멀리 보이는 나무
 rect(471,24,28,28,'#f6dca3');rect(480,20,25,23,'#101d30');
 for(let i=0;i<8;i++){const x=i*83-20,y=365+(i%3)*12;rect(x+17,y,8,80,'#203c42');rect(x,y+6,42,28,'#1c3540');rect(x+7,y-12,29,26,'#1c3540');}
 for(const l of LADDERS){const top=FLOORS[l.low+1],bottom=FLOORS[l.low];rect(l.x-10,top,4,bottom-top,'#ad9475');rect(l.x+7,top,4,bottom-top,'#ad9475');for(let y=top+9;y<bottom;y+=12)rect(l.x-6,y,13,3,'#c4ad85');}
 FLOORS.forEach((y,row)=>{rect(0,y,W,5,'#77a38c');rect(0,y+5,W,13,'#4b555c');rect(0,y+18,W,3,'#253b46');for(let x=0;x<W;x+=28){rect(x+(row%2)*14,y+7,1,10,'#2f424d');rect(x+4,y+7,14,2,'#68706e');}});
 for(const b of game.bombs){rect(b.x-8,b.y-15,16,13,'#3e4358');rect(b.x-10,b.y-11,20,7,'#3e4358');rect(b.x-4,b.y-13,4,4,'#7f8997');rect(b.x,b.y-20,3,6,'#c5a974');rect(b.x+4,b.y-23,3,4,Math.floor(game.elapsed*7)%2?'#ffca78':'#ed816f');}
 game.fruits.filter(f=>!f.taken).forEach(drawFruit);
 for(const e of game.enemies){const bounce=Math.sin(game.elapsed*7+e.x*.01)>0?1:0;const y=e.y-bounce;rect(e.x-13,y-16,26,14,'#7ecca6');rect(e.x-9,y-20,18,5,'#7ecca6');rect(e.x-16,y-8,32,7,'#66aa90');rect(e.x-7,y-14,5,6,'#fff3cf');rect(e.x+4,y-14,5,6,'#fff3cf');rect(e.x-5+e.dir,y-12,2,3,'#233849');rect(e.x+5+e.dir,y-12,2,3,'#233849');rect(e.x-2,y-4,4,2,'#325a59');}
 drawRaccoon();rect(0,462,W,18,'#101b2b');ctx.font='10px monospace';ctx.fillStyle='#627e90';ctx.textAlign='center';ctx.fillText('과일을 모으고 달빛 과수원을 탐험하세요',280,475);
}
function frame(time){const delta=lastTime?Math.min((time-lastTime)/1000,.1):0;lastTime=time;
 if(game.state==='playing'){accumulator+=delta;while(accumulator>=1/60){game.update(1/60,input());accumulator-=1/60;if(game.state!=='playing'){accumulator=0;break;}}record();}else accumulator=0;
 sync();draw();requestAnimationFrame(frame);
}
sync();draw();requestAnimationFrame(frame);
