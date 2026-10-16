/* 너구리 과일 원정대: 화면과 분리한 게임 규칙 */
(function(root){
'use strict';
const W=560,H=480,FLOORS=[432,330,228,126];
const LADDERS=[{x:92,low:0},{x:455,low:0},{x:190,low:1},{x:490,low:1},{x:70,low:2},{x:375,low:2}];
const FRUIT_X=[48,140,225,335,420,520];
class Game{
 constructor(){this.reset('ready');}
 reset(state='playing'){
 this.state=state;this.score=0;this.lives=3;this.time=100;this.elapsed=0;this.jumpHeld=false;
 this.fruits=FLOORS.flatMap((y,row)=>FRUIT_X.map((x,i)=>({x,y:y-14,row,kind:(row+i)%3,taken:false})));
 this.bombs=[{x:280,y:FLOORS[0]},{x:280,y:FLOORS[2]}];
 this.enemies=[{x:340,y:FLOORS[1],min:260,max:535,speed:45,dir:1},{x:435,y:FLOORS[2],min:340,max:535,speed:40,dir:-1},{x:220,y:FLOORS[3],min:145,max:330,speed:43,dir:1}];
 this.spawn();
 }
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
 if(vertical)ladder=LADDERS.find(l=>Math.abs(p.x-l.x)<17&&p.y>=FLOORS[l.low+1]-.5&&p.y<=FLOORS[l.low]+.5&&!(vertical<0&&p.y<=FLOORS[l.low+1]+.000001)&&!(vertical>0&&p.y>=FLOORS[l.low]-.000001));
 if(ladder){p.climbing=true;p.grounded=false;p.vy=0;p.x=ladder.x;p.y=Math.max(FLOORS[ladder.low+1],Math.min(FLOORS[ladder.low],p.y+vertical*100*dt));if(p.y===FLOORS[ladder.low+1]||p.y===FLOORS[ladder.low]){p.climbing=false;p.grounded=true;}}
 else if(!p.climbing||horizontal||jump){p.climbing=false;
 if(jump&&p.grounded){p.vy=-350;p.grounded=false;}
 p.x=Math.max(14,Math.min(W-14,p.x+horizontal*135*dt));
 const before=p.y;p.vy+=900*dt;p.y+=p.vy*dt;p.grounded=false;
 if(p.vy>=0){const landing=FLOORS.filter(y=>before<=y+.01&&p.y>=y).sort((a,b)=>a-b)[0];if(landing!==undefined){p.y=landing;p.vy=0;p.grounded=true;}}
 }
 for(const e of this.enemies){e.x+=e.speed*e.dir*dt;if(e.x>e.max){e.x=e.max;e.dir=-1;}if(e.x<e.min){e.x=e.min;e.dir=1;}}
 for(const f of this.fruits){if(!f.taken&&Math.abs(p.x-f.x)<19&&Math.abs((p.y-14)-f.y)<23){f.taken=true;this.score+=100;}}
 if(this.fruits.every(f=>f.taken)){this.state='won';return;}
 if(this.enemies.some(e=>Math.abs(e.x-p.x)<23&&Math.abs(e.y-p.y)<25)||this.bombs.some(b=>Math.abs(b.x-p.x)<20&&Math.abs(b.y-p.y)<22))this.hurt();
 }
}
const api={Game,W,H,FLOORS,LADDERS};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.NeoguriCore=api;
})(globalThis);
