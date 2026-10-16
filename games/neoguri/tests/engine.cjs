const assert=require('node:assert/strict');
const {Game,FLOORS,W,STAGES}=require('../engine.js');let passed=0;
function test(name,fn){fn();passed++;console.log('통과: '+name);}
function step(g,input={},seconds=1){for(let i=0;i<Math.ceil(seconds*60);i++)g.update(1/60,input);}
function safe(){const g=new Game();g.reset();g.enemies=[];g.gas=[];return g;}
test('시작 전에는 시간과 위치가 유지됨',()=>{const g=new Game();step(g,{right:true});assert.equal(g.time,180);assert.equal(g.player.x,25);});
test('좌우 이동과 화면 경계',()=>{const g=safe();step(g,{right:true},5);assert.equal(g.player.x,W-14);step(g,{left:true},5);assert.equal(g.player.x,14);});
test('점프 상승, 복귀, 누른 상태에서 자동 재점프 방지',()=>{const g=safe();step(g,{jump:true},.2);assert(g.player.y<FLOORS[0]-30);step(g,{jump:true},1);assert.equal(g.player.y,FLOORS[0]);assert(g.player.grounded);step(g,{},.05);step(g,{jump:true},.1);assert(g.player.y<FLOORS[0]);});
test('사다리로 한 층 오르고 내려감',()=>{const g=safe();g.player.x=92;step(g,{up:true},1.2);assert.equal(g.player.y,FLOORS[1]);step(g,{down:true},1.2);assert.equal(g.player.y,FLOORS[0]);});
test('사다리 밖에서는 위 버튼으로 날아가지 않음',()=>{const g=safe();step(g,{up:true},1);assert.equal(g.player.y,FLOORS[0]);});
test('치즈는 한 번만 획득, 100점 증가',()=>{const g=safe();g.player.x=46;step(g,{},.05);assert.equal(g.score,100);step(g,{},.2);assert.equal(g.score,100);});
test('피격 후 목숨 감소, 치즈 유지와 무적 시간',()=>{const g=safe();g.player.x=46;step(g,{},.05);g.player.invul=0;g.hurt();assert.equal(g.lives,2);assert.equal(g.score,100);assert.equal(g.player.x,25);g.hurt();assert.equal(g.lives,2);});
test('목숨 소진 시 게임 종료',()=>{const g=safe();for(let i=0;i<3;i++){g.player.invul=0;g.hurt();}assert.equal(g.state,'lost');assert.equal(g.lives,0);});
test('방귀 충돌과 점프로 피하기',()=>{const g=new Game();g.reset();g.player.x=280;g.player.invul=0;step(g,{},.02);assert.equal(g.lives,2);const h=new Game();h.reset();h.player.x=245;h.player.invul=0;step(h,{jump:true,right:true},.45);assert.equal(h.lives,3);assert(h.player.x>280);});
test('적 충돌과 왕복 이동',()=>{const g=new Game();g.reset();g.player.invul=0;g.player.x=g.enemies[0].x;g.player.y=FLOORS[1];step(g,{},.02);assert.equal(g.lives,2);const h=safe();h.enemies=[{x:99,y:FLOORS[3],min:50,max:100,speed:40,dir:1}];step(h,{},.1);assert.equal(h.enemies[0].dir,-1);});
test('일시정지 중 시간 정지, 계속하기',()=>{const g=safe();g.pause();step(g,{right:true},2);assert.equal(g.time,180);assert.equal(g.player.x,25);g.resume();step(g,{right:true},.1);assert(g.time<180);assert(g.player.x>25);});
test('시간 만료와 다시 시작',()=>{const g=safe();g.time=.01;step(g,{},.1);assert.equal(g.state,'lost');g.reset();assert.equal(g.state,'playing');assert.equal(g.lives,3);assert.equal(g.time,180);assert.equal(g.score,0);});
test('5개 단계의 시간, 괴물 수·속도와 방귀 수가 점점 증가',()=>{const g=new Game();g.reset();let enemies=0,speed=0,gas=0;for(let i=0;i<STAGES.length;i++){assert.equal(g.stageIndex,i);assert.equal(g.time,180);assert.equal(g.lives,3);assert(g.enemies.length>enemies);assert(g.enemies[0].speed>speed);assert(g.gas.length>gas);enemies=g.enemies.length;speed=g.enemies[0].speed;gas=g.gas.length;assert.equal(g.cheeses.length,20+i*4);g.state='cleared';if(i<4)assert(g.nextStage());}});
test('모든 단계에서 사다리 경로를 통해 모든 치즈 수집 가능',()=>{
 const g=new Game();g.reset();let expected=0;
 for(let stage=0;stage<STAGES.length;stage++){
  // 지형과 수집 가능성만 검증하며 적과 방귀의 충돌은 별도 테스트합니다.
  g.enemies=[];g.gas=[];
  function move(x){for(let i=0;i<500&&Math.abs(g.player.x-x)>1.5&&g.state==='playing';i++)g.update(1/60,{right:g.player.x<x,left:g.player.x>x});}
  for(let row=0;row<4;row++){
   move(533);move(28);
   if(row<3){const ladder=g.ladders.find(l=>l.low===row);move(ladder.x);step(g,{up:true},1.05);assert.equal(g.player.y,FLOORS[row+1]);}
  }
  expected+=(20+stage*4)*100;
  assert.equal(g.score,expected);assert(g.cheeses.every(c=>c.taken));
  assert.equal(g.state,stage===4?'won':'cleared');
  if(stage<4){const remaining=g.time;step(g,{},2);assert.equal(g.time,remaining);g.nextStage();assert.equal(g.score,expected);}
 }
 assert.equal(g.score,14000);assert.equal(g.stageIndex,4);assert.equal(g.nextStage(),false);
});
test('실패한 단계 재시도: 누적 시작 점수 복원 및 목숨·시간 초기화',()=>{const g=new Game();g.reset();g.score=2000;g.state='cleared';g.nextStage();g.score=2300;g.time=10;g.lives=0;g.state='lost';assert(g.retryStage());assert.equal(g.stageIndex,1);assert.equal(g.score,2000);assert.equal(g.lives,3);assert.equal(g.time,180);assert(g.cheeses.every(c=>!c.taken));assert(!g.retryStage());});
test('단계 완료 전 다음 단계로 건너뛰기 차단',()=>{const g=safe();assert(!g.nextStage());assert.equal(g.stageIndex,0);});
test('치즈가 방귀 구름 중심과 겹치지 않음',()=>{const g=new Game();g.reset();for(let i=0;i<5;i++){for(const c of g.cheeses)for(const gas of g.gas)if(FLOORS[c.row]===gas.y)assert(Math.abs(c.x-gas.x)>=28);if(i<4){g.state='cleared';g.nextStage();}}});
console.log(passed+'개 규칙 테스트 통과');
