export const SYLLABLES=['ЛА','ЛО','ЛУ'];
export const TRAIL=[[10,72],[31,48.4],[47.5,62.2],[67.2,35.7],[82.8,48.3]];
export function newTrail(){return {step:0,syllable:'ЛА',moving:false,done:false};}
export function advanceTrail(state,index){if(state.moving||state.done||index!==state.step+1||index>=TRAIL.length)return false;state.step=index;state.moving=true;return true;}
export function finishFlight(state){if(!state.moving)return false;state.moving=false;state.done=state.step===TRAIL.length-1;return state.done;}
export class FireflyTrial {
 constructor(root,{active,onStep,onComplete}){this.root=root;this.active=active;this.onStep=onStep;this.onComplete=onComplete;this.state=newTrail();this.remaining=0;
  root.querySelectorAll('[data-syllable]').forEach(b=>b.onclick=()=>{if(!active()||this.state.moving)return;this.state.syllable=b.dataset.syllable;this.render();});
  this.nodes=root.querySelector('#trail-nodes');this.nodes.replaceChildren();
  TRAIL.forEach(([x,y],i)=>{const b=document.createElement('button');b.className='trail-node';b.style.left=x+'%';b.style.top=y+'%';b.onclick=()=>this.go(i);this.nodes.append(b);});
  this.fly=root.querySelector('#firefly');this.status=root.querySelector('#trail-status');
 }
 reset(){this.state=newTrail();this.remaining=0;this.render();this.place();}
 place(){const [x,y]=TRAIL[this.state.step];this.fly.style.left=x+'%';this.fly.style.top=y+'%';}
 go(index){if(!this.active()||!advanceTrail(this.state,index))return;this.remaining=650;this.from=TRAIL[index-1];this.to=TRAIL[index];this.onStep();this.render();}
 tick(delta){if(!this.active()||!this.state.moving)return;this.remaining=Math.max(0,this.remaining-delta);const t=1-this.remaining/650,q=t*t*(3-2*t);this.fly.style.left=(this.from[0]+(this.to[0]-this.from[0])*q)+'%';this.fly.style.top=(this.from[1]+(this.to[1]-this.from[1])*q-Math.sin(t*Math.PI)*5)+'%';
  if(this.remaining===0){const done=finishFlight(this.state);this.render();if(done)this.onComplete();else this.nodes.children[this.state.step+1].focus({preventScroll:true});}
 }
 render(){const s=this.state;this.root.querySelectorAll('[data-syllable]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.syllable===s.syllable));b.disabled=s.moving;});
  [...this.nodes.children].forEach((b,i)=>{b.disabled=s.moving||i!==s.step+1;b.classList.toggle('visited',i<=s.step);b.classList.toggle('next',i===s.step+1);b.textContent=i<=s.step?'✧':s.syllable;b.setAttribute('aria-label',`Огонёк ${i}: произнеси ${s.syllable}`);});
  this.status.textContent=s.done?'Светлячок добрался! Паутина распускается.':s.moving?'Светлячок летит по ниточке…':`Произнеси «${s.syllable}» и нажми на следующий огонёк · ${s.step} / 4`;

 }
}
