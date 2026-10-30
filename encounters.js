import {groundAt} from './scenery.js';
// Replace this list when the complete speech material is ready.
export const PHRASES=['Лы-лы-лы — вымыли полы'];
export const SPIDER_POSITIONS=[680,1900,3130,4380,5540];
export function touches(body,x,y,halfWidth=13,halfHeight=21){return body.right>=x-halfWidth&&body.left<=x+halfWidth&&body.bottom>=y-halfHeight&&body.top<=y+halfHeight;}
const clamp=n=>Math.max(0,Math.min(1,n));
const ease=n=>{n=clamp(n);return n*n*(3-2*n);};
export class Spiders {
 constructor(scene,cleared,onCatch,onReady,onFree){this.scene=scene;this.onCatch=onCatch;this.onReady=onReady;this.onFree=onFree;this.clock=0;this.active=null;
  const t=scene.textures.get('spider'),s=t.getSourceImage();for(let i=0;i<4;i++)if(!t.has(String(i)))t.add(String(i),0,(i%2)*s.width/2,Math.floor(i/2)*s.height/2,s.width/2,s.height/2);
  this.web=scene.add.graphics().setDepth(6);this.silk=scene.add.graphics().setDepth(7);
  this.items=SPIDER_POSITIONS.map((x,id)=>({id,x,y:-100,phase:cleared.includes(id)?'gone':'waiting',t:0,art:scene.add.image(x,-100,'spider','0').setDisplaySize(112,112).setDepth(8)}));
  this.cocoon=scene.add.image(0,0,'cocoon').setDisplaySize(91,137).setDepth(7).setAlpha(0);
 }
 release(){if(this.active?.phase!=='cocoon')return;this.active.phase='release';this.active.t=0;}
 update(dt,body){this.clock+=dt;this.web.clear();this.silk.clear();
  for(const p of this.items){p.t+=dt;
   if(p.phase==='waiting'&&Math.abs(body.center.x-p.x)<230){p.phase='descend';p.t=0;}
   if(p.phase==='descend'){p.y=-70+(groundAt(p.x)+38)*ease(p.t/1.35);if(p.t>=1.35){p.phase='hang';p.t=0;}}
   if(p.phase==='hang')p.y=groundAt(p.x)-32+Math.sin(this.clock*2.3)*7;
   let x=p.x+Math.sin(this.clock*2+p.id)*9;
   if(p.phase==='wrap'||p.phase==='cocoon'||p.phase==='release'){
    const h=this.scene.player;const cx=h.x,cy=h.body.bottom-36;
    if(p.phase==='wrap'){
     const progress=clamp(p.t/2);x=cx+Math.cos(p.t*9)*48;p.y=cy-45+Math.sin(p.t*9)*24;
     this.cocoon.setPosition(cx,cy-9).setAlpha(progress*.92);
     this.scene.hero.setAlpha(1-progress*.62);
     this.silk.lineStyle(1.3,0xf0ffff,.8);this.silk.beginPath();
     for(let j=0;j<progress*240;j++){const a=j*.23,wx=cx+Math.cos(a)*37,wy=cy+29-j*.27+Math.sin(a)*8;if(j===0)this.silk.moveTo(wx,wy);else this.silk.lineTo(wx,wy);}this.silk.strokePath();
     this.silk.lineBetween(x,p.y,cx+Math.cos(p.t*9)*34,cy);
     if(progress===1){p.phase='cocoon';p.t=0;this.onReady(PHRASES[p.id%PHRASES.length]);}
    }else if(p.phase==='cocoon'){x=cx+48;p.y=cy-83+Math.sin(this.clock*2)*4;this.cocoon.setRotation(Math.sin(this.clock*1.7)*.035);}
    else {const q=ease(p.t/1.3);x=cx+48;p.y=cy-83-(cy+120)*q;this.cocoon.setAlpha((1-q)*.92).setRotation(q*.24);this.cocoon.setDisplaySize(91+q*45,137+q*22);this.scene.hero.setAlpha(.38+q*.62);if(p.t>1.3){p.phase='gone';this.active=null;this.cocoon.setAlpha(0).setRotation(0).setDisplaySize(91,137);this.onFree(p.id);}}
   }
   p.art.setPosition(x,p.y).setRotation(Math.sin(this.clock*2+p.id)*.07);
   p.art.setFrame(String(p.phase==='wrap'?2:[0,1,0,3][Math.floor(this.clock*5)%4]));
   p.art.setDisplaySize(112+Math.sin(this.clock*3)*2,112+Math.cos(this.clock*3)*3);
   p.art.setVisible(p.phase!=='gone'&&p.phase!=='waiting');
   if(p.art.visible){this.web.lineStyle(1.2,0xf0ffff,.72);this.web.beginPath();this.web.moveTo(p.x,-10);this.web.lineTo(x,p.y-32);this.web.strokePath();}
   if(!this.active&&(p.phase==='descend'||p.phase==='hang')&&touches(body,x,p.y,26,30)){
    this.active=p;p.phase='wrap';p.t=0;this.onCatch();break;
   }
  }
 }
}
