'use strict';
/* ================= LEG 1 — Level 1: identify the structures ================= */
const dslot=(a,x,y,w,hh,W,H,hint)=>`<button class="slot" data-a="${a}" data-hint="${hint||''}" aria-label="Label spot" style="left:${(x/W*100).toFixed(2)}%;top:${(y/H*100).toFixed(2)}%;width:${(w/W*100).toFixed(2)}%;height:${(hh/H*100).toFixed(2)}%"></button>`;
const leadSVG=(W,H,lines,col='#111',halo='#fff')=>`<svg class="lead" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">${lines.map(l=>`<path d="M${l[0]} ${l[1]}L${l[2]} ${l[3]}" stroke="${halo}" stroke-width="${W/190}" stroke-linecap="round"/><path d="M${l[0]} ${l[1]}L${l[2]} ${l[3]}" stroke="${col}" stroke-width="${W/400}" stroke-linecap="round"/><circle cx="${l[2]}" cy="${l[3]}" r="${W/190}" fill="${col}" stroke="${halo}" stroke-width="${W/700}"/>`).join('')}</svg>`;

/* ---- Baggage Claim ---- */
const bsrc=k=>`img/${k.startsWith('cart-')?k:'bone-'+k}.jpg`;
const bchip=(v,name,icon)=>icon?chipHTML(v,`<img class="bimg" src="${bsrc(icon)}" alt="" draggable="false"><span>${name}</span>`,'bonechip'):chipHTML(v,name);
function binsPart(o){return(el,api)=>{api.prompt(o.q);
  const box=h(`<div><div class="bank ${o.items[0][2]?'pics':''} ${o.items.length>12?'tight':o.items.length===7?'seven':''}" aria-label="Bones on the carousel"><h3>${o.bank}</h3>${shuffle(o.items.map(i=>bchip(i[0],i[1],i[2]))).join('')}</div><div class="belt" aria-hidden="true"></div>
  <div class="bins" style="grid-template-columns:repeat(${o.bins.length},1fr)">${o.bins.map(b=>`<div class="bin" role="button" tabindex="0" data-a="${b.a}" aria-label="${b.t} bin"><h3>${b.t}</h3><p>${b.d}</p><div class="got"></div></div>`).join('')}</div></div>`);
  el.append(box);$$('.bin',box).forEach(b=>b.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();b.click();}}));
  DND(box,api,{bins:true,onDone:()=>doneBar(api,o.done)});};}
const SHAPES=[['long','Long bones','Longer than they are wide: a shaft with two ends'],['short','Short bones','Cube-shaped, mostly spongy bone'],['flat','Flat bones','Thin, flattened and usually curved'],['irreg','Irregular bones','Odd shapes that fit no other group']];
const bagParts=[
  binsPart({q:'Bones are rolling off the carousel. Move each one into the suitcase for its shape.',bank:'Unclaimed bones',done:'Every bone claimed by shape!',
    bins:SHAPES.map(s=>({a:[1,2,3,4,5].map(n=>s[0]+n).join('|'),t:s[1],d:s[2]})),
    items:[['long1','Femur','femur'],['long2','Humerus','humerus'],['long3','Tibia','tibia'],['long4','Phalanges','phalanges'],['short1','Carpals','carpals'],['short2','Tarsals','tarsals'],['flat1','Cranium','cranium'],['flat2','Scapula','scapula'],['flat3','Sternum','sternum'],['flat4','Ribs','ribs'],['irreg1','Vertebra','vertebra'],['irreg2','Pelvic girdle','pelvis'],['long5','Clavicle','clavicle'],['irreg3','Mandible','mandible'],['irreg4','Sacrum and coccyx','sacrum']]}),
  binsPart({q:'Two gates, two divisions of the skeleton. Send each bone to its gate.',bank:'Bones waiting to board',done:'Both divisions boarded!',
    bins:[{a:'ax1|ax2|ax3|ax4|ax5|ax6',t:'Axial skeleton',d:'Head and trunk bones'},{a:'ap1|ap2|ap3|ap4|ap5|ap6|ap7|ap8',t:'Appendicular skeleton',d:'Shoulders, arms and hands; pelvis, legs and feet'}],
    items:[['ax1','Cranium','cranium'],['ax2','Mandible','mandible'],['ax3','Vertebral column','vertebral-column'],['ax4','Ribcage','ribs'],['ax5','Sternum','sternum'],['ax6','Sacrum and coccyx','sacrum'],['ap1','Scapula','scapula'],['ap2','Clavicle','clavicle'],['ap3','Humerus','humerus'],['ap4','Phalanges','hand-phalanges'],['ap5','Pelvic girdle','pelvis'],['ap6','Femur','femur'],['ap7','Patella','patella'],['ap8','Tarsals','tarsals']]})
];

/* ---- Alphabet Soup Café ---- */
// [scramble, answer, x, y on the skeleton picture, zoom, {letter position: pun blank number}]
const WORDS=[['user hum','HUMERUS',705,275,1.3,{0:1}],['hang pale','PHALANGE',1085,492,1.6],['lanu','ULNA',962,402,1.4],['i bait','TIBIA',958,858,1.2],['brave tree','VERTEBRAE',778,425,1.5,{5:7}],['cram us','SACRUM',733,518,1.9,{1:4}],['music hi','ISCHIUM',748,556,1.9,{3:3}],['taco clip i','OCCIPITAL',789,104,2.6,{0:6}],['teal prom','TEMPORAL',837,106,2.6,{4:8}],['bean mild','MANDIBLE',883,143,2.6,{3:9}],['call vice','CLAVICLE',835,205,2.2],['clam liar','LACRIMAL',903,92,3],['fat lorn','FRONTAL',883,57,2.6,{3:5}],['state alarm','METATARSAL',1012,1018,1.7],['tall ape','PATELLA',975,738,1.6,{3:2}]];
const PUN=[[1,2],[3,4,'D'],[5,6],[7,8,9,'Y']];
function punLetters(upto){const m={};WORDS.forEach((w,i)=>{if(i<upto&&w[5])Object.entries(w[5]).forEach(([p,n])=>m[n]=w[1][p]);});return m;}
const punHTML=upto=>{const m=punLetters(upto);return `<div class="pun"><div class="q1">Why was the skeleton so lonely?</div><div class="lts" aria-label="Punchline letters collected so far">${PUN.map(wd=>`<span class="wd">${wd.map(p=>typeof p==='string'?`<i>${p}</i>`:`<i data-n="${p}" class="${m[p]?'got':''}">${m[p]||''}<small>${p}</small></i>`).join('')}</span>`).join('')}</div></div>`;};
// one piece of alphabet pasta: a fat, doughy letter with a darker rim and a soft shadow in the broth
const noodle=(c,k)=>`<svg viewBox="0 0 60 60" aria-hidden="true" style="transform:rotate(${[-9,6,-4,11,-12,4,8,-6,10,-3][k%10]}deg)"><text x="30" y="50" text-anchor="middle" class="nd-sh">${c}</text><text x="30" y="47" text-anchor="middle" class="nd">${c}</text><text x="29.2" y="46" text-anchor="middle" class="nd-hi">${c}</text></svg>`;
function soupPart(i){return(el,api)=>{const w=WORDS[i],ans=w[1],n=ans.length,keys=w[5]||{};
  api.prompt(`Bone ${i+1} of 15: tap or type the letters to unscramble it. The red ring shows where it lives.`);
  const skull=w[4]>=2.6,Z=.62,mk=(x,y)=>`left:${((x-400)/732*100).toFixed(2)}%;top:${(y/1066*100).toFixed(2)}%`;
  let letters;do{letters=shuffle(ans.split(''));}while(letters.join('')===ans);
  const per=n>5?Math.ceil(n/2):n;
  const box=h(`<div class="soup"><div class="panel"><div class="menu">Today's scramble<b>${w[0]}</b></div>
    <div class="ans" aria-label="Your answer">${ans.split('').map((_,p)=>`<button class="${keys[p]?'key':''}" ${keys[p]?`data-n="${keys[p]}"`:''} aria-label="Letter ${p+1}, empty"></button>`).join('')}</div>
    <div class="bowl">${ART.bowl()}<div class="tiles ${n>=9?'many':''}">${letters.map((c,k)=>{const row=k<per?0:1,col=row?k-per:k,cnt=row?n-per:per;return `<button class="tile" data-k="${k}" style="left:${((col+.5)/cnt*100).toFixed(1)}%;top:${n>5?(row?74:22):48}%;animation-delay:${(k*.23%1.6).toFixed(2)}s" aria-label="Letter ${c}">${noodle(c,k)}</button>`;}).join('')}</div></div>${punHTML(i)}</div>
    <div class="panel skelpanel"><h3>Where it lives</h3><div class="skel" role="img" aria-label="The whole skeleton with a red ring around where this bone is${skull?'. A close-up of the skull shows the exact spot':''}"><i class="ring" style="${mk(w[2],w[3])}"></i>
      ${skull?`<div class="skullzoom" style="background-position:${(-(848*Z-52)).toFixed(1)}px ${(-(92*Z-52)).toFixed(1)}px"><i class="ring sm" style="left:${((w[2]-848)*Z+52).toFixed(1)}px;top:${((w[3]-92)*Z+52).toFixed(1)}px"></i></div><svg class="zline" viewBox="400 0 732 1066" preserveAspectRatio="none" aria-hidden="true"><path d="M697 124L788 103" stroke="#0F2C52" stroke-width="5" stroke-dasharray="12 9" stroke-linecap="round"/></svg>`:''}</div></div></div>`);
  el.append(box);const slots=Array(n).fill(null),lock=Array(n).fill(false),A=$$('.ans button',box),T=$$('.tile',box);let missed=false,over=false,echo=0;
  function draw(){A.forEach((b,p)=>{const k=slots[p];b.textContent=k==null?'':letters[k];b.classList.toggle('lock',lock[p]);b.setAttribute('aria-label',`Letter ${p+1}, ${k==null?'empty':letters[k]}`);});T.forEach((t,k)=>t.classList.toggle('used',slots.includes(k)));}
  function add(k){if(over||slots.includes(k))return;const p=slots.indexOf(null);if(p<0)return;slots[p]=k;SFX.pick();draw();if(!slots.includes(null))check();}
  function check(){const g=slots.map(k=>letters[k]).join('');
    if(g===ans){over=true;$('.ans',box).classList.add('ok');SFX.right();burst($('.ans',box));if(!missed){api.right();plus($('.ans',box),'+10 mi');}say('Correct: '+ans);
      Object.entries(keys).forEach(([p,num])=>{const c=$(`.pun i[data-n="${num}"]`,box);c.childNodes[0].nodeType===3?c.childNodes[0].textContent=ans[p]:c.prepend(ans[p]);c.classList.add('got');burst(c,'#F2B705');});
      setTimeout(()=>api.done(),S.set.rm?900:1500);}
    else{$('.ans',box).classList.add('no');SFX.wrong();if(!missed){missed=true;api.wrong(1,ans.toLowerCase());}say('Not a bone yet. The letters went back in the soup.');setTimeout(()=>{$('.ans',box).classList.remove('no');slots.forEach((_,p)=>{if(!lock[p])slots[p]=null;});echo=0;draw();},450);}}
  function give(p){slots.forEach((_,q)=>{if(!lock[q])slots[q]=null;});const k=letters.findIndex((c,kk)=>c===ans[p]&&!slots.includes(kk));slots[p]=k;lock[p]=true;draw();if(!slots.includes(null))check();}
  T.forEach(t=>t.onclick=()=>add(+t.dataset.k));A.forEach((b,p)=>b.onclick=()=>{if(over||lock[p]||slots[p]==null)return;slots[p]=null;SFX.pick();draw();});
  const key=e=>{if(over||(e.target.matches&&e.target.matches('input,textarea'))||e.ctrlKey||e.metaKey||e.altKey)return;if(e.key==='Backspace'){for(let p=n-1;p>=0;p--)if(slots[p]!=null&&!lock[p]){slots[p]=null;break;}draw();e.preventDefault();return;}
    const c=e.key.toUpperCase();if(c.length===1&&c>='A'&&c<='Z'){let L=lock.indexOf(false);if(L<0)L=n;if(echo<L&&c===ans[echo]&&!slots.some((k,p)=>k!=null&&!lock[p])){echo++;return;}const k=letters.findIndex((x,kk)=>x===c&&!slots.includes(kk));if(k>=0)add(k);}};
  document.addEventListener('keydown',key);api.onCleanup(()=>document.removeEventListener('keydown',key));
  api.hint(()=>{const p=lock.indexOf(false);if(p<0||over)return 'You have got this one!';give(p);return `Letter ${p+1} is <b>${ans[p]}</b>. I locked it in for you.`;});
  if(api.support)give(0);draw();};}
function punPart(el,api){api.prompt('All 15 bones unscrambled. Your gold letters spell the answer to the "humerus" pun.');
  const box=h(`<div class="panel" style="text-align:center;max-width:720px;margin:0 auto"><div style="width:170px;margin:0 auto">${ART.captain()}</div><h2 style="font-size:2rem;margin:.4rem 0">Why was the skeleton so lonely?</h2>${punHTML(15)}<div style="margin-top:1.6rem"><button class="btn">Deliver the punchline</button></div><h2 class="punch" hidden style="font-size:3rem;color:var(--red);margin-top:.6rem"></h2></div>`);
  el.append(box);$('.btn',box).onclick=e=>{e.target.hidden=true;const p=$('.punch',box);p.hidden=false;p.innerHTML='"He had no body."'.split(' ').map((x,i)=>`<span style="display:inline-block;animation:drop .6s ${i*.18}s both">${x}&nbsp;</span>`).join('');SFX.rim();confetti();say('He had no body.');setTimeout(()=>doneBar(api,'Ba-dum-tss!','Collect my stamp'),1200);};}

/* ---- Skeleton Coast ---- */
const SKEL=[['scapula',143,'The shoulder blade, a flat bone'],['humerus',223,'The single long bone of the upper arm'],['lumbar vertebrae',334,'The 5 lower-back vertebrae. Think dinner at 5',110],['ilium',444,'The big flaring upper part of the coxal (hip) bone'],['sacrum',506,'5 fused vertebrae at the back of the pelvic girdle',44],['coccyx',572,'The tailbone: 4 tiny fused vertebrae',44],['fibula',756,'The thin lower-leg bone beside the tibia'],['calcaneum',857,'The heel bone'],['metatarsals',933,'Foot bones between the ankle and the toes'],['phalanges',1006,'Toe bones. Finger bones share this name']];
const SKER=[['mandible',75,'The lower jaw'],['cervical vertebrae',146,'The 7 neck vertebrae. Think breakfast at 7'],['clavicle',222,'The collarbone'],['femur',639,'The thigh bone'],['patella',713,'The kneecap'],['tibia',786,'The shin bone, the thicker lower-leg bone'],['tarsals',861,'Short bones of the ankle']];
function skelPart(el,api){api.prompt('Move each luggage tag onto the line that points to that bone.');
  const W=1456,H=1080;const box=h(`<div class="cols"><div class="diagram"><img src="img/skeleton-lateral.jpg" alt="Side view of a walking skeleton with 17 blank label lines" width="1456" height="1080">
    ${SKEL.map(s=>dslot(s[0],20,s[1]-(s[3]||46)/2,346,s[3]||46,W,H,s[2])).join('')}${SKER.map(s=>dslot(s[0],1058,s[1]-23,392,46,W,H,s[2])).join('')}</div>
    <div class="side">${bankHTML([...SKEL,...SKER].map(s=>chipHTML(s[0],s[0],'tag')),'Luggage tags')}</div></div>`);
  el.append(box);DND(box,api,{onDone:()=>doneBar(api,'17 bones labeled. The whole coast is mapped!','Collect my stamp')});}

/* ---- Port Diaphysis ---- */
// [label, box x, box y, line start x, y, target x, y, hint, end dot?]  (stage is the 1536x1024 image plus 160px of black on the right)
const LONG=[['periosteum',35,291,305,320,705,468,'The bone skin wrapped around the outside',1],['medullary cavity',245,171,515,200,1010,350,'The hollow nook inside the shaft',1],['epiphyseal line',465,66,735,95,1071,252,'The line where the shaft meets the ball end. It is what is left of the growth plate',1],['spongy bone',825,16,1060,74,1170,235,'Needle-like pieces of bone with lots of open space',1],['yellow marrow',830,600,900,600,900,455,'Fat stored inside the shaft in adults',1],['compact bone',915,500,1040,500,1035,422,'Dense, smooth bone that makes up the wall of the shaft',1],['articular cartilage',1205,392,1445,392,1445,305,'Hyaline cartilage capping the end of the bone',1],['perforating fibers',605,722,740,722,745,650,'Fibers that hold the bone skin onto the bone',1],
  ['diaphysis',919,794,940,794,907.7,771.4,'The shaft of the bone. Its bracket runs from one dashed line to the other',0],['epiphysis',1400,530,1445,530,1423,503,'The ball end of the bone. Its bracket runs from the dashed line to the tip',0]];
function longPart(el,api){api.prompt('Welcome to Port Diaphysis. Move each tag to its box. The two brackets mark the two main regions of the bone.');
  const W=1696,H=1024,ln=l=>`M${l[3]} ${l[4]}L${l[5]} ${l[6]}`;
  // junction lines cross the bone at right angles to its long axis; the brackets run parallel to the axis
  const svg=`<svg class="lead" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke-linecap="round">
    <path d="M1066 224L1140 366" stroke="#111" stroke-width="9"/><path d="M1066 224L1140 366" stroke="#fff6d8" stroke-width="5"/>
    <g stroke="#111" stroke-width="8"><path d="M566.5 949.1L1249 593.6L1596.7 412.5"/>${LONG.map(l=>`<path d="${ln(l)}"/>`).join('')}</g>
    <g stroke="#fff" stroke-width="3.5" stroke-dasharray="11 10"><path d="M1140 366L1249 593.6M386 602L488 799L566.5 949.1M1495 217L1596.7 412.5"/></g>
    <g stroke="#fff" stroke-width="4.5"><path d="M566.5 949.1L1249 593.6L1596.7 412.5M559.6 935.8L573.4 962.4M1242.1 580.3L1255.900 606.900M1589.800 399.200L1603.600 425.800"/>${LONG.map(l=>`<path d="${ln(l)}"/>`).join('')}</g></g>
    ${LONG.filter(l=>l[8]).map(l=>`<circle cx="${l[5]}" cy="${l[6]}" r="8" fill="#fff" stroke="#111" stroke-width="2.5"/>`).join('')}</svg>`;
  const box=h(`<div class="cols"><div class="diagram dark" style="aspect-ratio:${W}/${H};background:#000"><img src="img/long-bone.jpg" alt="Long bone cut open to show its inner structures, with 8 blank labels and 2 blank bracket labels" style="position:absolute;left:0;top:0;width:${(1536/W*100).toFixed(3)}%;height:100%">
    <div style="position:absolute;top:0;bottom:0;left:${(1476/W*100).toFixed(3)}%;width:${(62/W*100).toFixed(3)}%;background:linear-gradient(90deg,transparent,#000)"></div>
    ${svg}${LONG.map(l=>dslot(l[0],l[1],l[2],270,58,W,H,l[7])).join('')}</div>
    <div class="side">${bankHTML(LONG.map(l=>chipHTML(l[0],l[0],'tag')),'Luggage tags')}</div></div>`);
  el.append(box);DND(box,api,{onDone:()=>doneBar(api,'Long bone labeled from end to end!')});}

/* ---- Osteon City ---- */
// [label, box x, box y, line start x, y, target x, y, hint, end dot?] in the pixel grid of the original review slide (y offset 146)
const MICRO=[['compact bone',2.8,619.4,141.8,619.4,247.5,526.4,'Dense bone built from osteons',1],['osteon',338.3,185.3,477.3,216.3,477.3,357.7,'The circled complex of rings around one canal',0],['spongy bone',14.4,270.5,150,301.5,168.5,396.2,'Needle-like pieces of bone with lots of open space',1],['lacuna',656.5,510.9,791.5,512.2,697.7,404.9,'The cavity a bone cell sits in',1],['central canal',542.2,666.8,681.1,666.8,501.6,591.8,'Runs lengthwise through the middle of an osteon',1],['osteocyte',666.7,195.5,805.7,226.5,680,368.9,'A mature bone cell',1],['perforating canal',656.5,568.5,656.6,584.1,422.2,547,'Runs sideways, linking neighboring osteons',1],['lamella',251.8,666.8,390.7,666.8,329.4,422.1,'One of the rings of bony matrix under the curved line',0]];
function microPart(el,api){api.prompt('Zoom in on compact bone. Move each tag to the box on its line.');
  const W=950,H=560,Y=146,ax=x=>(213+x*201.6/1920201).toFixed(1),ay=y=>(422.1-Y+y*66.9/636798).toFixed(1);
  const ln=l=>`M${l[3]} ${l[4]-Y}L${l[5]} ${l[6]-Y}`;
  const svg=`<svg class="lead" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke-linecap="round">${MICRO.map(l=>`<path d="${ln(l)}" stroke="#fff" stroke-width="5"/>`).join('')}
    <ellipse cx="479.3" cy="${388.8-Y}" rx="69.7" ry="31.4" stroke="#111" stroke-width="2.5"/>
    <path d="M${ax(0)} ${ay(370098)}C${ax(92869)} ${ay(247066)} ${ax(185738)} ${ay(124035)} ${ax(400050)} ${ay(65298)}C${ax(614362)} ${ay(6561)} ${ax(1044575)} ${ay(-20427)} ${ax(1285875)} ${ay(17673)}C${ax(1527175)} ${ay(55773)} ${ax(1746250)} ${ay(190711)} ${ax(1847850)} ${ay(293898)}C${ax(1949450)} ${ay(397085)} ${ax(1922462)} ${ay(516941)} ${ax(1895475)} ${ay(636798)}" stroke="#111" stroke-width="2.5"/>
    ${MICRO.map(l=>`<path d="${ln(l)}" stroke="#111" stroke-width="2.4"/>`).join('')}</g>${MICRO.filter(l=>l[8]).map(l=>`<circle cx="${l[5]}" cy="${l[6]-Y}" r="4.6" fill="#111" stroke="#fff" stroke-width="1.4"/>`).join('')}</svg>`;
  const box=h(`<div class="cols"><div class="diagram" style="aspect-ratio:${W}/${H};background:#fff"><img src="img/compact-bone.jpg" alt="Cut-away wedge of bone showing osteons, canals with blood vessels, spongy bone, and a magnified bone cell, with 8 blank labels" style="position:absolute;left:${(9.9/W*100).toFixed(2)}%;top:${((152.9-Y)/H*100).toFixed(2)}%;width:${(780.9/W*100).toFixed(2)}%;height:${(539.9/H*100).toFixed(2)}%">${svg}${MICRO.map(l=>dslot(l[0],l[1],l[2]-Y,278,31,W,H,l[7])).join('')}</div>
    <div class="side">${bankHTML(MICRO.map(l=>chipHTML(l[0],l[0],'tag')),'Luggage tags')}</div></div>`);
  el.append(box);DND(box,api,{onDone:()=>doneBar(api,'Osteon City is on the map!')});}
function cellsPart(el,api){api.prompt('Meet the three bone cells of Osteon City. Give each one its name tag.');
  const C=[['osteoblast','blast','Bone-building cells','The B in its name stands for build'],['osteoclast','clast','Bone-crushing cells','The C in its name stands for crush'],['osteocyte','cyte','Mature bone cells that regulate the mineralization of bone','It lives in a lacuna']];
  const box=h(`<div><div class="cells">${shuffle(C).map(c=>`<div class="jcard">${ART.cell(c[1])}<p style="margin:.3rem 0;min-height:3.2rem">${c[2]}</p><button class="slot" data-a="${c[0]}" data-hint="${c[3]}" aria-label="Name for: ${c[2]}"></button></div>`).join('')}</div><div style="max-width:560px;margin:1rem auto 0">${bankHTML(C.map(c=>chipHTML(c[0],c[0],'tag')),'Name tags')}</div></div>`);
  el.append(box);DND(box,api,{onDone:()=>doneBar(api,'All three cells named!','Collect my stamp')});}
