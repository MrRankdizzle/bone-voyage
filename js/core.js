'use strict';
/* ---------- tiny helpers ---------- */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const h=html=>{const t=document.createElement('template');t.innerHTML=html.trim();return t.content.firstElementChild;};
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const strip=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* ---------- saved progress ---------- */
const KEY='boneVoyage.v1';
const DEF={v:1,name:'',period:'',ms:0,miles:0,reflection:'',set:{size:1,dys:false,hc:false,rm:false,tts:false,sfx:true,support:false},stops:{}};
function load(){try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&j.v===1)return Object.assign({},DEF,j,{set:Object.assign({},DEF.set,j.set||{})});}catch(e){}return JSON.parse(JSON.stringify(DEF));}
let S=load();
function save(){try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function st(id){return S.stops[id]||(S.stops[id]={part:0,right:0,wrong:0,hints:0,best:null,plays:0});}

/* ---------- sound ---------- */
const SFX=(()=>{let ctx;
  function ac(){if(!S.set.sfx)return null;if(!ctx){try{ctx=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return null;}}if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx;}
  function tone(f,t0,d,type='sine',g=.12){const c=ac();if(!c)return;const o=c.createOscillator(),v=c.createGain(),t=c.currentTime+t0;o.type=type;o.frequency.value=f;v.gain.setValueAtTime(.0001,t);v.gain.linearRampToValueAtTime(g,t+.012);v.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(v);v.connect(c.destination);o.start(t);o.stop(t+d+.05);}
  function noise(t0,d,g=.25){const c=ac();if(!c)return;const n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource(),v=c.createGain();s.buffer=b;v.gain.value=g;s.connect(v);v.connect(c.destination);s.start(c.currentTime+t0);}
  return{right(){tone(660,0,.12,'triangle');tone(990,.09,.2,'triangle');},wrong(){tone(170,0,.2,'sawtooth',.07);},pick(){tone(520,0,.05,'square',.035);},pop(){tone(880,0,.07,'sine',.07);},
    stamp(){noise(0,.16,.4);tone(80,0,.22,'sine',.35);},fanfare(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.1,.3,'triangle',.11));},rim(){noise(0,.05,.3);noise(.14,.05,.3);tone(300,.3,.25,'triangle',.1);noise(.3,.3,.18);},crunch(){noise(0,.09,.22);},brick(){tone(240,0,.07,'square',.05);}};
})();
function speak(t){try{if(!('speechSynthesis' in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(strip(t));u.rate=.95;speechSynthesis.speak(u);}catch(e){}}
function say(t){const l=$('#live');if(l){l.textContent='';setTimeout(()=>l.textContent=strip(t),30);}}

/* ---------- little celebrations ---------- */
function burst(el,color){const r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;const cols=color?[color]:['#F2B705','#4B9CD3','#178F5F','#F06BA8'];
  for(let i=0;i<10;i++){const s=document.createElement('i');s.className='spark';const a=Math.PI*2*i/10,d=40+Math.random()*40;s.style.cssText=`left:${cx-5}px;top:${cy-5}px;background:${cols[i%cols.length]};--dx:${Math.cos(a)*d}px;--dy:${Math.sin(a)*d}px`;document.body.append(s);setTimeout(()=>s.remove(),650);}}
function plus(el,txt){const r=el.getBoundingClientRect();const s=document.createElement('b');s.className='plus';s.textContent=txt;s.style.left=(r.left+r.width/2-20)+'px';s.style.top=(r.top-8)+'px';document.body.append(s);setTimeout(()=>s.remove(),950);}
function confetti(){const cols=['#F2B705','#4B9CD3','#9BCBEB','#F06BA8','#fff'];for(let i=0;i<46;i++){const c=h(`<svg class="conf" viewBox="0 0 30 14" width="${18+Math.random()*16}"><path d="M5 7h20" stroke="${cols[i%5]}" stroke-width="5" stroke-linecap="round"/><circle cx="4" cy="4" r="3.4" fill="${cols[i%5]}"/><circle cx="4" cy="10" r="3.4" fill="${cols[i%5]}"/><circle cx="26" cy="4" r="3.4" fill="${cols[i%5]}"/><circle cx="26" cy="10" r="3.4" fill="${cols[i%5]}"/></svg>`);c.style.left=Math.random()*100+'vw';c.style.animationDuration=(2.2+Math.random()*2.2)+'s';c.style.animationDelay=Math.random()*.6+'s';document.body.append(c);setTimeout(()=>c.remove(),5200);}}
function addMiles(n,el){S.miles+=n;const m=$('#miles');if(m)m.textContent=S.miles.toLocaleString();if(el)plus(el,'+'+n+' mi');}

/* ---------- drag, drop, or tap-then-tap ---------- */
// chips: .chip[data-v]   targets: .slot[data-a="x|y"] (one chip each) or .bin[data-a] (many chips)
function DND(root,api,opt={}){
  let sel=null,drag=null,quiet=false,finished=false;
  const targets=()=>$$('.slot:not(.filled),.bin',root);
  const left=()=>$$('.chip:not(.out)',root).filter(c=>!c.dataset.decoy).length;
  function pick(c){if(sel)sel.classList.remove('sel');sel=(sel===c)?null:c;if(sel){sel.classList.add('sel');SFX.pick();}}
  function place(c,t){
    const ok=(t.dataset.a||'').split('|').includes(c.dataset.v);
    if(sel){sel.classList.remove('sel');sel=null;}
    if(!ok){t.classList.remove('no');void t.offsetWidth;t.classList.add('no');setTimeout(()=>t.classList.remove('no'),450);SFX.wrong();
      if(!c.dataset.missed){c.dataset.missed=1;api.wrong(1,c.dataset.decoy?null:(c.dataset.name||strip(c.textContent)||null));}
      say('Not there. Try another spot.');opt.onWrong&&opt.onWrong(c,t);return;}
    SFX.right();
    if(t.classList.contains('bin')){const g=$('.got',t)||t;g.append(h(`<span>${c.innerHTML}</span>`));}
    else{t.classList.add('filled');t.innerHTML=c.dataset.show||c.innerHTML;t.setAttribute('aria-label',(t.getAttribute('aria-label')||'')+' answered: '+strip(c.textContent));t.disabled=true;}
    burst(t);if(!c.dataset.missed){api.right();plus(t,'+10 mi');}
    if(c.dataset.keep){/* reusable chip */}else{c.classList.add('out');c.remove();}
    say('Correct: '+strip(c.textContent));opt.onRight&&opt.onRight(c,t);
    const allSlots=$$('.slot',root).length, open=$$('.slot:not(.filled)',root).length;
    const complete=opt.bins?left()===0:(allSlots>0&&open===0);
    if(complete&&!finished){finished=true;$$('.chip',root).forEach(x=>x.classList.add('out'));setTimeout(()=>opt.onDone&&opt.onDone(),650);}
  }
  root.addEventListener('click',e=>{if(quiet)return;const c=e.target.closest('.chip');if(c&&root.contains(c)&&!c.classList.contains('out')){pick(c);return;}
    const t=e.target.closest('.slot:not(.filled),.bin');if(t&&root.contains(t)){if(sel)place(sel,t);else{say('Pick a label first, then pick this spot.');t.classList.add('pulse');setTimeout(()=>t.classList.remove('pulse'),900);}}});
  root.addEventListener('pointerdown',e=>{const c=e.target.closest('.chip');if(!c||!root.contains(c)||c.classList.contains('out')||e.button>0)return;
    drag={c,x:e.clientX,y:e.clientY,on:false,g:null,id:e.pointerId};});
  function move(e){if(!drag||e.pointerId!==drag.id)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
    if(!drag.on){if(Math.hypot(dx,dy)<7)return;drag.on=true;const r=drag.c.getBoundingClientRect();const g=drag.c.cloneNode(true);g.classList.add('ghost');g.classList.remove('sel');g.style.width=r.width+'px';g.style.height=r.height+'px';drag.ox=drag.x-r.left;drag.oy=drag.y-r.top;document.body.append(g);drag.g=g;drag.c.classList.add('dragging');if(sel){sel.classList.remove('sel');sel=null;}}
    drag.g.style.left=(e.clientX-drag.ox)+'px';drag.g.style.top=(e.clientY-drag.oy)+'px';drag.py=e.clientY;
    const u=document.elementFromPoint(e.clientX,e.clientY);const t=u&&u.closest('.slot:not(.filled),.bin');targets().forEach(x=>x.classList.toggle('over',x===t));e.preventDefault();}
  function up(e){if(!drag||e.pointerId!==drag.id)return;const d=drag;drag=null;if(!d.on)return;d.g.remove();d.c.classList.remove('dragging');targets().forEach(x=>x.classList.remove('over'));
    quiet=true;setTimeout(()=>quiet=false,60);const u=document.elementFromPoint(e.clientX,e.clientY);const t=u&&u.closest('.slot:not(.filled),.bin');if(t&&root.contains(t))place(d.c,t);}
  const tick=setInterval(()=>{if(drag&&drag.on){if(drag.py<110)window.scrollBy(0,-14);else if(drag.py>innerHeight-70)window.scrollBy(0,14);}},30);
  window.addEventListener('pointermove',move,{passive:false});window.addEventListener('pointerup',up);window.addEventListener('pointercancel',up);
  api.onCleanup(()=>{clearInterval(tick);window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',up);if(drag&&drag.g)drag.g.remove();});
  // Marty's hint: point at one open spot and read its clue
  api.hint(()=>{const open=$$('.slot:not(.filled)',root);if(opt.bins){const c=$$('.chip:not(.out)',root)[0];if(!c)return 'You have sorted everything!';const b=$$('.bin',root).find(b=>b.dataset.a.split('|').includes(c.dataset.v));b.classList.add('pulse');setTimeout(()=>b.classList.remove('pulse'),3000);return `Try <b>${strip(c.textContent)}</b> in the glowing bin.`;}
    if(!open.length)return 'Everything is placed!';const t=open[Math.random()*open.length|0];t.classList.add('pulse');setTimeout(()=>t.classList.remove('pulse'),3200);t.scrollIntoView({block:'center',behavior:'smooth'});
    const a=t.dataset.a.split('|')[0];return t.dataset.hint?`The glowing spot: ${t.dataset.hint}`:`The glowing spot starts with the letter <b>${a.charAt(0).toUpperCase()}</b>.`;});
}
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chipHTML=(v,label,cls='',extra='')=>`<button class="chip ${cls}" data-v="${v}" ${extra}>${label||v}</button>`;
const bankHTML=(chips,title='Labels')=>`<div class="bank" aria-label="${title}"><h3>${title}</h3>${shuffle(chips).join('')}</div>`;
function doneBar(api,msg='All done!',label='Next'){SFX.fanfare();const b=h(`<div class="donebar" role="status"><span>${msg}</span><button class="btn">${label}</button></div>`);$('button',b).onclick=()=>{b.remove();api.done();};document.body.append(b);api.onCleanup(()=>b.remove());setTimeout(()=>$('button',b).focus(),400);say(msg);}

/* ---------- reusable question parts ---------- */
// multiple choice: opts[0] is always the correct one (shuffled on screen)
function mcPart(o){return(el,api)=>{api.prompt(o.q);
  let opts=o.opts.map((t,i)=>({t,ok:i===0}));if(api.support&&opts.length>3)opts=[opts[0],...shuffle(opts.slice(1)).slice(0,2)];opts=shuffle(opts);
  const box=h(`<div class="q ${o.art?'hasart':''}">${o.art?`<div class="art">${o.art}</div>`:''}<div class="qr"><div class="opts ${o.pics?'pics':''}"></div><div class="why" hidden></div></div></div>`);el.append(box);let missed=false;
  opts.forEach(op=>{const b=h(`<button class="opt">${op.t}</button>`);b.dataset.ok=op.ok?1:'';b.onclick=()=>{
    if(op.ok){b.classList.add('ok');SFX.right();burst(b);if(!missed){api.right();plus(b,'+10 mi');}$$('.opt',box).forEach(x=>x.disabled=true);const w=$('.why',box);w.hidden=false;w.innerHTML=`<p>${o.why||'Correct!'}</p>`;const n=h('<button class="btn go">Next</button>');n.onclick=()=>api.done();w.append(n);n.focus();say('Correct. '+(o.why||''));o.onRight&&o.onRight(box);}
    else{b.classList.add('no');b.disabled=true;SFX.wrong();if(!missed){missed=true;api.wrong(1,o.topic);}say('Not quite. Try again.');}};$('.opts',box).append(b);});
  api.hint(()=>{const w=$$('.opt:not(:disabled)',box).filter(b=>!b.dataset.ok);if(w.length>1){w[0].disabled=true;w[0].classList.add('no');}return o.clue||'I crossed off one wrong answer for you.';});};}
// pick exactly n: checks itself when n are selected
function pickPart(o){return(el,api)=>{api.prompt(o.q);const opts=shuffle([...o.yes.map(t=>({t,ok:true})),...(api.support?o.no.slice(0,Math.max(1,o.no.length-2)):o.no).map(t=>({t,ok:false}))]);
  const box=h(`<div class="q"><div class="opts"></div><div class="why" hidden></div></div>`);el.append(box);let missed=false;
  opts.forEach(op=>{const b=h(`<button class="opt" aria-pressed="false">${op.t}</button>`);b.onclick=()=>{const on=b.classList.toggle('on');b.setAttribute('aria-pressed',on);SFX.pick();const chosen=$$('.opt.on',box);
    if(chosen.length===o.yes.length){const bad=chosen.filter(x=>!x._ok);if(!bad.length){chosen.forEach(x=>{x.classList.remove('on');x.classList.add('ok');});$$('.opt',box).forEach(x=>x.disabled=true);SFX.right();burst(box);if(!missed){api.right();plus(box,'+10 mi');}const w=$('.why',box);w.hidden=false;w.innerHTML=`<p>${o.why||'Correct!'}</p>`;const n=h('<button class="btn go">Next</button>');n.onclick=()=>api.done();w.append(n);n.focus();say('Correct.');}
      else{SFX.wrong();if(!missed){missed=true;api.wrong(1,o.topic);}bad.forEach(x=>{x.classList.remove('on');x.classList.add('no');x.disabled=true;x.setAttribute('aria-pressed',false);});say('One of those does not belong. It has been crossed off. Pick again.');}}};b._ok=op.ok;$('.opts',box).append(b);});
  api.hint(()=>{const w=$$('.opt:not(:disabled)',box).filter(b=>!b._ok&&!b.classList.contains('on'));if(w.length){w[0].disabled=true;w[0].classList.add('no');}return o.clue||'I crossed off one that does not belong.';});};}
// match: rows of [text → slot] with a chip bank
function matchPart(o){return(el,api)=>{api.prompt(o.q);const chips=o.pairs.map(p=>chipHTML(p[1],p[2]||p[1],'',o.rowNames?`data-name="${esc(strip(p[0]))}"`:''));(api.support?[]:(o.decoys||[])).forEach(d=>chips.push(chipHTML(d,d,'','data-decoy="1"')));
  const box=h(`<div class="qcols"><div><div class="pairs">${o.art?`<div class="art" style="display:flex;justify-content:center">${o.art}</div>`:''}${o.pairs.map(p=>`<div class="pair"><span>${p[0]}</span><button class="slot" data-a="${p[1]}" ${p[3]?`data-hint="${p[3]}"`:''} aria-label="Answer for: ${strip(p[0])}"></button></div>`).join('')}</div></div><div class="side">${bankHTML(chips,o.bank||'Answers')}</div></div>`);el.append(box);
  DND(box,api,{onDone:()=>doneBar(api,o.done||'Matched!')});};}

/* ---------- settings ---------- */
function applySet(){const c=document.documentElement.classList,s=S.set;c.toggle('s2',s.size===2);c.toggle('s3',s.size===3);c.toggle('dys',s.dys);c.toggle('hc',s.hc);c.toggle('rm',s.rm);c.toggle('tts',s.tts);}
function openSettings(){const m=$('#settings');const sw=(k,t,d)=>`<div class="setrow"><div><b>${t}</b><span>${d}</span></div><button class="sw" role="switch" aria-checked="${!!S.set[k]}" data-k="${k}" aria-label="${t}"></button></div>`;
  m.innerHTML=`<div class="sheet" role="dialog" aria-modal="true" aria-label="Settings"><h2>Settings</h2>
  <div class="setrow"><div><b>Text size</b><span>Make everything bigger</span></div><div class="seg3">${[1,2,3].map(n=>`<button data-size="${n}" aria-pressed="${S.set.size===n}">${['A','A+','A++'][n-1]}</button>`).join('')}</div></div>
  ${sw('tts','Read aloud','Adds a speaker button that reads each direction to you')}
  ${sw('dys','Easy-read font','Wider letters and extra spacing')}
  ${sw('hc','High contrast','Stronger colors and thicker outlines')}
  ${sw('rm','Calm mode','Turns off moving animations')}
  ${sw('sfx','Sound effects','Dings, thumps and fanfares')}
  ${sw('support','Extra support','Fewer answer choices, no decoy words, a slower calcium game and a free first letter in Alphabet Soup')}
  <div class="setrow"><div><b>Start over</b><span>Erase all stamps and miles on this device</span></div><button class="btn red" id="wipe">Erase</button></div>
  <p class="note">Keyboard: press Tab to move, Enter to pick a label, then Enter on the spot where it goes.</p>
  <div style="text-align:right;margin-top:.6rem"><button class="btn" id="setclose">Done</button></div></div>`;
  m.classList.add('on');
  m.onclick=e=>{const b=e.target.closest('button');if(e.target===m||(b&&b.id==='setclose')){m.classList.remove('on');route();return;}if(!b)return;
    if(b.dataset.k){S.set[b.dataset.k]=!S.set[b.dataset.k];b.setAttribute('aria-checked',S.set[b.dataset.k]);if(b.dataset.k==='sfx'&&S.set.sfx)SFX.right();}
    if(b.dataset.size){S.set.size=+b.dataset.size;$$('[data-size]',m).forEach(x=>x.setAttribute('aria-pressed',x===b));}
    if(b.id==='wipe'){if(b.dataset.sure){try{localStorage.removeItem(KEY);}catch(e){}S=load();applySet();m.classList.remove('on');location.hash='home';route();return;}b.dataset.sure=1;b.textContent='Tap again to erase';}
    save();applySet();};
  $('#setclose').focus();}

/* ---------- Marty the tour guide ---------- */
function marty(html){$$('.marty').forEach(x=>x.remove());const m=h(`<div class="marty" role="status"><div class="av">${ART.marty()}</div><b>Marty, your tour guide</b><p>${html}</p><button>Got it</button></div>`);$('button',m).onclick=()=>m.remove();document.body.append(m);say('Marty says: '+html);if(S.set.tts)speak(html);setTimeout(()=>m.remove(),14000);}
function askHint(){if(!RUN)return;if(!RUN.hintFn){marty('Read the directions at the top one more time, then give it your best try.');return;}const t=RUN.hintFn();RUN.d.hints++;save();marty(t);}

/* ---------- running a stop ---------- */
let RUN=null,STOPS=[];
const API={right(n=1){RUN.d.right+=n;addMiles(10*n);save();},wrong(n=1,label){RUN.d.wrong+=n;if(label){const m=RUN.d.miss||(RUN.d.miss=[]);if(!m.includes(label)&&m.length<10)m.push(label);}save();},
  prompt(t){RUN.prompt=t;$('#promptTxt').innerHTML=t;if(S.set.tts)speak(t);},hint(fn){RUN.hintFn=fn;},
  onCleanup(fn){RUN.clean.push(fn);},get support(){return S.set.support;},
  done(){RUN.d.part++;save();if(RUN.d.part>=RUN.stop.parts.length)finishStop();else runPart();}};
function cleanup(){if(RUN&&RUN.clean){RUN.clean.forEach(f=>{try{f();}catch(e){}});RUN.clean=[];}$$('.donebar,.marty').forEach(x=>x.remove());}
function openStop(id){const stop=STOPS.find(s=>s.id===id);if(!stop)return false;cleanup();const d=st(id);if(d.part>=stop.parts.length){d.part=0;d.right=0;d.wrong=0;d.hints=0;d.miss=[];}
  RUN={stop,d,hintFn:null,prompt:'',clean:[]};$('#stopTitle').textContent=stop.name;$('#stopCode').textContent=stop.code;runPart();arrive(stop,d.part>0);return true;}
function arrive(stop,resume){if(S.set.rm)return;$$('.arrive').forEach(x=>x.remove());const a=h(`<div class="arrive" aria-hidden="true"><div class="band"><small>${resume?'Welcome back to':'Now arriving at'}</small>${stop.name}</div><div class="pl">${ART.plane()}</div></div>`);document.body.append(a);setTimeout(()=>a.remove(),1500);}
function runPart(){cleanup();const{stop,d}=RUN;RUN.hintFn=null;const body=$('#stopBody');body.innerHTML='';
  $('#dots').innerHTML=stop.parts.map((_,i)=>`<i class="${i<d.part?'d':i===d.part?'c':''}"></i>`).join('');$('#dots').setAttribute('aria-label',`Part ${d.part+1} of ${stop.parts.length}`);
  stop.parts[d.part](body,API);window.scrollTo(0,0);}
function medalFor(acc){return acc>=.9?'gold':acc>=.75?'silver':'bronze';}
function finishStop(){cleanup();const{stop,d}=RUN;const tot=d.right+d.wrong,acc=tot?d.right/tot:1,medal=medalFor(acc);d.plays++;
  const rec={acc,medal,miss:(d.miss||[]).slice(0,8),hints:d.hints,date:new Date().toLocaleDateString('en-CA'),support:S.set.support};const first=!d.best;if(first||acc>=d.best.acc)d.best=rec;if(first)addMiles(100);save();
  const nxt=STOPS[STOPS.findIndex(s=>s.id===stop.id)+1];const allDone=STOPS.every(s=>st(s.id).best);
  const c=h(`<div class="cere" role="dialog" aria-modal="true" aria-label="Stamp earned"><div class="ppage hit"><h2>${stop.name}</h2><div class="stampwrap"><div class="stamp">${ART.stamp(stop,medal,rec.date)}</div></div>
  <div class="stats"><div><b>${Math.round(acc*100)}%</b>first-try accuracy</div><div><b>${d.hints}</b>hints from Marty</div><div><b>${cap(medal)}</b>entry stamp</div></div>
  <p>${medal==='gold'?'A perfect landing. Gold stamp in your passport!':medal==='silver'?'Smooth flight. Fly it again any time to chase gold.':'Stamp earned. Fly this stop again to raise your accuracy and upgrade the stamp.'}${first?' <b>+100 bonus miles.</b>':''}</p>
  <div style="display:flex;gap:.6rem;justify-content:center;flex-wrap:wrap">${nxt?`<button class="btn go" data-go="${nxt.id}">Next stop: ${nxt.name}</button>`:''}<button class="btn ${allDone?'go':'ghost'}" data-go="passport">${allDone?'Get my passport':'My passport'}</button><button class="btn ghost" data-go="departures">Departures</button></div></div></div>`);
  c.onclick=e=>{const b=e.target.closest('[data-go]');if(!b)return;c.remove();if(location.hash==='#'+b.dataset.go)route();else location.hash=b.dataset.go;};
  document.body.append(c);setTimeout(()=>{SFX.stamp();},620);setTimeout(()=>{SFX.fanfare();confetti();},900);setTimeout(()=>{const b=$('.btn',c);b&&b.focus();},1000);say(`Stamp earned for ${stop.name}. ${Math.round(acc*100)} percent first-try accuracy.`);}

/* ---------- routing ---------- */
function route(){$$('.cere').forEach(x=>x.remove());const id=(location.hash||'#home').slice(1);let v='home';
  if(id==='passport'){v='passport';cleanup();RUN=null;renderPassport();}
  else if(STOPS.some(s=>s.id===id)){if(!RUN||RUN.stop.id!==id||RUN.d.part>=RUN.stop.parts.length)openStop(id);v='stop';}
  else if(id==='departures'&&S.name.trim()){cleanup();RUN=null;renderDepartures();v='dep';}
  else{cleanup();RUN=null;renderWelcome();}
  if(v!=='home')$('#v-home').innerHTML='';
  $$('.view').forEach(x=>x.classList.toggle('on',x.id==='v-'+v));if(v!=='stop')window.scrollTo(0,0);try{speechSynthesis.cancel();}catch(e){}}
