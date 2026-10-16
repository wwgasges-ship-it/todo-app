/* 치즈를 지켜라! 방귀 대소동 — 게임 규칙 */
(function(root){
'use strict';
const W=560,H=480,FLOORS=[432,330,228,126];
const STAGES=[
 {name:'치즈 정원',time:180,cheesePerFloor:5,speed:34,enemyCount:2,gasCount:1,color:'#142d34',accent:'#8dd6a2',ladders:[92,455,190,490,70,375]},
 {name:'노을 치즈 마을',time:180,cheesePerFloor:6,speed:43,enemyCount:3,gasCount:2,color:'#342638',accent:'#e8ac88',ladders:[75,420,145,480,95,355]},
 {name:'방귀 버섯 숲',time:180,cheesePerFloor:7,speed:52,enemyCount:4,gasCount:3,color:'#242342',accent:'#b7a0e7',ladders:[115,465,65,350,180,490]},
 {name:'치즈 요새',time:180,cheesePerFloor:8,speed:62,enemyCount:5,gasCount:4,color:'#173044',accent:'#82c6e0',ladders:[70,400,185,485,90,370]},
 {name:'방귀 대마왕의 성',time:180,cheesePerFloor:9,speed:72,enemyCount:6,gasCount:5,color:'#382537',accent:'#e692aa',ladders:[100,460,75,365,170,485]}
];
class Game{
 constructor(){this.reset('ready');}
 get stage(){return STAGES[this.stageIndex];}
 reset(state='playing'){this.stageIndex=0;this.score=0;this.stageStartScore=0;this.loadStage(state);}
 loadStage(state='playing'){
 const level=this.stage;
 this.state=state;this.lives=3;this.time=level.time;this.elapsed=0;this.jumpHeld=false;
 this.ladders=level.ladders.map((x,i)=>({x,low:Math.floor(i/2)}));
 this.cheeses=FLOORS.flatMap((y,row)=>Array.from({length:level.cheesePerFloor},(_,i)=>({x:46+i*470/(level.cheesePerFloor-1),y:y-14,row,taken:false})));
 const gasSpots=[{x:280,row:0},{x:280,row:2},{x:280,row:1},{x:420,row:3},{x:420,row:0}];
 this.gas=gasSpots.slice(0,level.gasCount).map(g=>({x:g.x,y:FLOORS[g.row]}));
 // 치즈가 방귀 구름 한가운데에 가려지지 않도록 옆으로 배치합니다.
 for(const c of this.cheeses){const cloud=this.gas.find(g=>g.y===FLOORS[c.row]&&Math.abs(g.x-c.x)<28);if(cloud)c.x=cloud.x-38;}
 // 처음에는 위층의 괴물부터 시작하고, 후반에는 아래층에도 등장합니다.
 const patrols=[{row:1,min:245,max:535,x:340},{row:3,min:130,max:415,x:240},{row:2,min:265,max:535,x:435},{row:0,min:330,max:535,x:490},{row:1,min:25,max:210,x:130},{row:2,min:25,max:220,x:110}];
 this.enemies=patrols.slice(0,level.enemyCount).map((e,i)=>({...e,y:FLOORS[e.row],speed:level.speed+(i%2)*4,dir:i%2?-1:1}));
 this.spawn();
 }
 nextStage(){if(this.state!=='cleared')return false;this.stageIndex++;this.stageStartScore=this.score;this.loadStage();return true;}
 retryStage(){if(this.state!=='lost')return false;this.score=this.stageStartScore;this.loadStage();return true;}
 spawn(){this.player={x:25,y:FLOORS[0],vy:0,facing:1,grounded:true,climbing:false,invul:2};}
 pause(){if(this.state==='playing')this.state='paused';}
 resume(){if(this.state==='paused')this.state='playing';}
 hurt(){if(this.player.invul>0||this.state!=='playing')return;this.lives--;if(this.lives<=0)this.state='lost';else this.spawn();}
 update(dt,input={}){
 if(this.state!=='playing')return;
 dt=Math.max(0,Math.min(dt,0.05));this.elapsed+=dt;this.time=Math.max(0,this.time-dt);
 if(this.time<=0){this.state='lost';return;}
 const p=this.player;p.invul=Math.max(0,p.invul-dt);
 const jump=!!input.jump&&!this.jumpHeld;this.jumpHeld=!!input.jump;
 const horizontal=Number(!!input.right)-Number(!!input.left),vertical=Number(!!input.down)-Number(!!input.up);
 if(horizontal)p.facing=horizontal;
 let ladder=null;
 if(vertical)ladder=this.ladders.find(l=>Math.abs(p.x-l.x)<17&&p.y>=FLOORS[l.low+1]-.5&&p.y<=FLOORS[l.low]+.5&&!(vertical<0&&p.y<=FLOORS[l.low+1]+.000001)&&!(vertical>0&&p.y>=FLOORS[l.low]-.000001));
 if(ladder){p.climbing=true;p.grounded=false;p.vy=0;p.x=ladder.x;p.y=Math.max(FLOORS[ladder.low+1],Math.min(FLOORS[ladder.low],p.y+vertical*100*dt));if(p.y===FLOORS[ladder.low+1]||p.y===FLOORS[ladder.low]){p.climbing=false;p.grounded=true;}}
 else if(!p.climbing||horizontal||jump){p.climbing=false;
 if(jump&&p.grounded){p.vy=-350;p.grounded=false;}
 p.x=Math.max(14,Math.min(W-14,p.x+horizontal*135*dt));
 const before=p.y;p.vy+=900*dt;p.y+=p.vy*dt;p.grounded=false;
 if(p.vy>=0){const landing=FLOORS.filter(y=>before<=y+.01&&p.y>=y).sort((a,b)=>a-b)[0];if(landing!==undefined){p.y=landing;p.vy=0;p.grounded=true;}}
 }
 for(const e of this.enemies){e.x+=e.speed*e.dir*dt;if(e.x>e.max){e.x=e.max;e.dir=-1;}if(e.x<e.min){e.x=e.min;e.dir=1;}}
 for(const cheese of this.cheeses){if(!cheese.taken&&Math.abs(p.x-cheese.x)<19&&Math.abs((p.y-14)-cheese.y)<23){cheese.taken=true;this.score+=100;}}
 if(this.cheeses.every(c=>c.taken)){this.state=this.stageIndex===STAGES.length-1?'won':'cleared';return;}
 if(this.enemies.some(e=>Math.abs(e.x-p.x)<23&&Math.abs(e.y-p.y)<25)||this.gas.some(g=>Math.abs(g.x-p.x)<20&&Math.abs(g.y-p.y)<22))this.hurt();
 }
}
const api={Game,W,H,FLOORS,STAGES};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NeoguriCore=api;
})(globalThis);
