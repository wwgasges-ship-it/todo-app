'use strict';
const {Game,W,H,FLOORS,STAGES}=NeoguriCore;
const game=new Game(),canvas=document.querySelector('#game'),ctx=canvas.getContext('2d');
const $=s=>document.querySelector(s),sources=new Map();
let best=0,lastTime=0,accumulator=0,previousState='ready',previousCheese=20;
try{best=Number(localStorage.getItem('neoguri-best-v1'))||0;}catch{}
function clearInput(){sources.clear();document.querySelectorAll('.pressed').forEach(b=>b.classList.remove('pressed'));}
function input(){const values=[...sources.values()];return Object.fromEntries(['left','right','up','down','jump'].map(k=>[k,values.includes(k)]));}
function record(){if(game.score<=best)return;best=game.score;try{localStorage.setItem('neoguri-best-v1',String(best));}catch{}}
function setOverlay(title,body,button,icon,kicker){$('#overlay-title').textContent=title;$('#overlay-body').textContent=body;$('#start').textContent=button;$('#overlay-icon').textContent=icon;$('#overlay-kicker').textContent=kicker;}
function sync(){
 const count=game.cheeses.filter(c=>!c.taken).length;
 $('#score').textContent=String(game.score).padStart(5,'0');$('#cheese').textContent=count+'개';$('#lives').textContent='♥ '.repeat(game.lives).trim()||'목숨 없음';$('#time').textContent=Math.ceil(game.time)+'초';$('#best').textContent='최고 점수 '+best;
 $('#stage-label').textContent=`${game.stageIndex+1} / ${STAGES.length} 단계`;
 $('#stage-name').textContent=`${String(game.stageIndex+1).padStart(2,'0')}단계 · ${game.stage.name}`;
 document.querySelectorAll('[data-stage-dot]').forEach((dot,i)=>{dot.classList.toggle('current',i===game.stageIndex);dot.classList.toggle('finished',i<game.stageIndex);dot.setAttribute('aria-current',i===game.stageIndex?'step':'false');});
 $('#pause').disabled=game.state!=='playing';$('#overlay').hidden=game.state==='playing';
 if(previousState!==game.state){
 if(game.state==='paused')setOverlay('잠깐 쉬어가요','준비되면 치즈 원정을 이어가세요.','계속하기 ▶','☕','일시정지');
 if(game.state==='cleared')setOverlay(`${game.stageIndex+1}단계 성공!`,`누적 ${game.score}점! 다음은 ${STAGES[game.stageIndex+1].name}. 목숨 3개와 180초로 출발해요.`,'다음 단계 ▶','🧀','치즈를 모두 모았어요');
 if(game.state==='won')setOverlay('모든 치즈를 지켰어요!',`5개 단계를 모두 통과했어요! 최종 점수 ${game.score}점. 치즈 원정대 최고예요!`,'1단계부터 다시 ▶','🏆','전체 스테이지 클리어');
 if(game.state==='lost')setOverlay('한 번 더 도전해요!',game.time<=0?`${game.stageIndex+1}단계 시간이 다 됐어요. 이번 단계 시작 점수부터 다시 도전할 수 있어요.`:`괴물이나 방귀 구름은 점프로 피하세요. ${game.stageIndex+1}단계부터 다시 도전해요!`,'이 단계 다시 도전 ▶','💨','도전은 계속돼요');
 const message={playing:`${game.stageIndex+1}단계 · 치즈를 모두 모아보세요!`,paused:'일시정지했어요.',cleared:'성공! 다음 단계 버튼을 눌러주세요.',won:'축하해요! 5개 단계를 모두 깼어요!',lost:'이 단계부터 다시 도전할 수 있어요.'};$('#status').textContent=message[game.state]||'치즈 원정 준비 완료!';
 if(game.state!=='playing'){clearInput();$('#start').focus({preventScroll:true});}
 previousState=game.state;
 }
 if(count<previousCheese&&game.state==='playing')$('#status').textContent=`치즈 획득! ${count}개 남았어요.`;
 previousCheese=count;
}
$('#start').addEventListener('click',()=>{
 clearInput();
 if(game.state==='paused')game.resume();else if(game.state==='cleared')game.nextStage();else if(game.state==='lost')game.retryStage();else game.reset();
 accumulator=0;sync();$('#start').blur();$('#restart').blur();
});
$('#pause').addEventListener('click',()=>{game.pause();clearInput();sync();});
$('#restart').addEventListener('click',()=>{clearInput();game.reset();accumulator=0;sync();$('#start').blur();$('#restart').blur();});
const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',Space:'jump',KeyA:'left',KeyD:'right',KeyW:'up',KeyS:'down'};
window.addEventListener('keydown',e=>{if(e.ctrlKey||e.altKey||e.metaKey)return;if(e.target.tagName==='BUTTON'&&(e.code==='Enter'||(e.code==='Space'&&game.state!=='playing')))return;if(keys[e.code]){e.preventDefault();sources.set('key:'+e.code,keys[e.code]);}if(e.code==='KeyP'&&!e.repeat){if(game.state==='paused')game.resume();else game.pause();clearInput();sync();}});
window.addEventListener('keyup',e=>{sources.delete('key:'+e.code);});
document.querySelectorAll('[data-control]').forEach(b=>{
 b.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();b.setPointerCapture(e.pointerId);sources.set('pointer:'+e.pointerId,b.dataset.control);b.classList.add('pressed');});
 const release=e=>{sources.delete('pointer:'+e.pointerId);b.classList.toggle('pressed',[...sources.values()].includes(b.dataset.control));};
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);b.addEventListener('contextmenu',e=>e.preventDefault());
});
function suspend(){clearInput();game.pause();sync();}
window.addEventListener('blur',suspend);document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});
function rect(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h);}
// 사진을 참고해 만든 투명 캐릭터. 이미지 로딩 실패 시에도 게임은 계속됩니다.
const heroImage=new Image();
heroImage.src='assets/photo-hero-v1.webp';
function drawHero(){
 const p=game.player;
 if(p.invul>0&&Math.floor(game.elapsed*12)%2===0&&game.state==='playing')return;
 const controls=input();
 const walking=p.grounded&&!p.climbing&&(controls.right||controls.left);
 const bob=walking?Math.sin(game.elapsed*17)*1.2:0;
 const tilt=walking?Math.sin(game.elapsed*17)*.035:p.climbing?Math.sin(game.elapsed*12)*.045:0;
 ctx.save();ctx.translate(Math.round(p.x),Math.round(p.y));
 if(p.facing<0)ctx.scale(-1,1);
 ctx.rotate(tilt);
 if(heroImage.complete&&heroImage.naturalWidth>0){
   const height=44,width=height*heroImage.naturalWidth/heroImage.naturalHeight;
   ctx.imageSmoothingEnabled=true;
   ctx.drawImage(heroImage,-width/2,-height-Math.abs(bob),width,height);
 }else{
   // 작은 화면에서도 구분되는 앞머리·양갈래 머리·흰 원피스 대체 그림
   rect(-12,-37,24,15,'#302a2c');rect(-17,-30,7,14,'#302a2c');rect(10,-30,7,14,'#302a2c');
   rect(-9,-28,18,13,'#f2c4a1');rect(-10,-32,20,6,'#302a2c');
   rect(-5,-25,2,3,'#302a2c');rect(4,-25,2,3,'#302a2c');
   rect(-8,-15,16,6,'#fff5e3');rect(-12,-9,24,6,'#fff5e3');
   rect(-7,-3,5,3,'#403947');rect(3,-3,5,3,'#403947');
 }
 ctx.restore();
}
const monsterImage=new Image();
monsterImage.src='assets/cheese-monster-v1.webp';
function drawCheese(c){
 const x=c.x,y=c.y+Math.sin(game.elapsed*3+c.x)*1.4;
 ctx.save();ctx.translate(x,y);
 ctx.fillStyle='#e6a33b';ctx.beginPath();ctx.moveTo(-10,7);ctx.lineTo(10,7);ctx.lineTo(10,-7);ctx.closePath();ctx.fill();
 ctx.fillStyle='#ffda72';ctx.beginPath();ctx.moveTo(-10,3);ctx.lineTo(10,3);ctx.lineTo(10,-10);ctx.closePath();ctx.fill();
 rect(-5,0,3,3,'#d7a141');rect(3,-4,4,4,'#d7a141');rect(5,4,3,2,'#ba7d2e');ctx.restore();
}
function drawGas(g){
 const puff=Math.sin(game.elapsed*4+g.x)*1.5;
 ctx.save();ctx.translate(g.x,g.y-8);ctx.fillStyle='#a7be7a';ctx.globalAlpha=.82;
 for(const [x,y,r] of [[-9,0,7],[0,-5,10],[10,-1,7],[3,4,8]]){ctx.beginPath();ctx.arc(x,y+puff,r,0,Math.PI*2);ctx.fill();}
 ctx.globalAlpha=.5;ctx.strokeStyle='#cee79e';ctx.lineWidth=2;
 for(const x of [-6,4]){ctx.beginPath();ctx.moveTo(x,-16);ctx.quadraticCurveTo(x+5,-21,x,-25);ctx.stroke();}
 ctx.restore();
}
function drawMonster(e){
 ctx.save();ctx.translate(Math.round(e.x),Math.round(e.y));if(e.dir<0)ctx.scale(-1,1);
 const bob=Math.abs(Math.sin(game.elapsed*7+e.x*.01))*1.5;
 if(monsterImage.complete&&monsterImage.naturalWidth>0){
 const height=44,width=height*monsterImage.naturalWidth/monsterImage.naturalHeight;
 ctx.imageSmoothingEnabled=true;ctx.drawImage(monsterImage,-width/2,-height-bob,width,height);
 }else{
 rect(-10,-34,20,12,'#302a2c');rect(-8,-23,16,11,'#edbb96');rect(-6,-37,4,5,'#77cfbd');rect(5,-37,4,5,'#77cfbd');
 rect(-5,-20,2,3,'#302a2c');rect(4,-20,2,3,'#302a2c');rect(-10,-12,20,8,'#d2d4d4');rect(-9,-4,7,4,'#429789');rect(3,-4,7,4,'#429789');
 }
 ctx.restore();
}
function draw(){
 ctx.clearRect(0,0,W,H);rect(0,0,W,H,game.stage.color);
 for(let i=0;i<42;i++){let x=(i*89+23)%W,y=(i*53+17)%400;rect(x,y,i%4===0?2:1,2,'#3d5165');}
 // 달과 멀리 보이는 나무
 rect(471,24,28,28,'#f6dca3');rect(480,20,25,23,game.stage.color);
 for(let i=0;i<8;i++){const x=i*83-20,y=365+(i%3)*12;rect(x+17,y,8,80,'#203c42');rect(x,y+6,42,28,'#1c3540');rect(x+7,y-12,29,26,'#1c3540');}
 for(const l of game.ladders){const top=FLOORS[l.low+1],bottom=FLOORS[l.low];rect(l.x-10,top,4,bottom-top,'#ad9475');rect(l.x+7,top,4,bottom-top,'#ad9475');for(let y=top+9;y<bottom;y+=12)rect(l.x-6,y,13,3,'#c4ad85');}
 FLOORS.forEach((y,row)=>{rect(0,y,W,5,game.stage.accent);rect(0,y+5,W,13,'#4b555c');rect(0,y+18,W,3,'#253b46');for(let x=0;x<W;x+=28){rect(x+(row%2)*14,y+7,1,10,'#2f424d');rect(x+4,y+7,14,2,'#68706e');}});
 game.gas.forEach(drawGas);
 game.cheeses.filter(c=>!c.taken).forEach(drawCheese);
 game.enemies.forEach(drawMonster);
 drawHero();rect(0,462,W,18,'#101b2b');ctx.font='10px monospace';ctx.fillStyle='#627e90';ctx.textAlign='center';ctx.fillText(`${game.stageIndex+1} / ${STAGES.length} · ${game.stage.name}`,280,475);
}
function frame(time){const delta=lastTime?Math.min((time-lastTime)/1000,.1):0;lastTime=time;
 if(game.state==='playing'){accumulator+=delta;while(accumulator>=1/60){game.update(1/60,input());accumulator-=1/60;if(game.state!=='playing'){accumulator=0;break;}}record();}else accumulator=0;
 sync();draw();requestAnimationFrame(frame);
}
sync();draw();requestAnimationFrame(frame);
