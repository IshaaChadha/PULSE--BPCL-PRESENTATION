(function(){
"use strict";

/* ============================================================
   CONFIG — chapter titles + which scenes require an interaction
   ============================================================ */
const CHAPTERS = [
  "Every Asset Has a Story",
  "The Data Never Stops",
  "From Raw Data to Intelligence",
  "Turning Data Into Awareness",
  "A Normal Shift",
  "One Asset Begins to Whisper",
  "Real Success Story · Compressor",
  "Real Success Story · Coupling Shim",
  "Value Beyond Prediction",
  "Measuring Success",
  "Building a Smarter Refinery Together",
  "Future AI Assistant",
  "Closing Scene"
];
const REQUIRES_INTERACTION = new Set(); // Continue is the single required action on every scene now; per-scene clicks (rings, cards, etc.) remain as optional cosmetic flourishes only
const TOTAL = CHAPTERS.length;

let current = 0;
let unlocked = new Array(TOTAL).fill(false);
unlocked[TOTAL-1] = true;

const scenes = Array.from(document.querySelectorAll('.scene'));
const hudIndex = document.getElementById('hudIndex');
const hudTitle = document.getElementById('hudTitle');
const dotsWrap = document.getElementById('dots');
const btnNext = document.getElementById('btnNext');
const btnPrev = document.getElementById('btnPrev');
const btnHome = document.getElementById('btnHome');
const btnRestart = document.getElementById('btnRestart');
const dockHint = document.getElementById('dockHint');

/* build progress dots */
CHAPTERS.forEach((t,i)=>{
  const d = document.createElement('button');
  d.className = 'dot' + (i===0?' active':'');
  d.title = t;
  d.addEventListener('click', ()=>{ if(i<=current || unlocked[i-1] || i===0) goTo(i); else nudge(current); });
  dotsWrap.appendChild(d);
});
const dotEls = Array.from(dotsWrap.children);

function updateHud(){
  hudIndex.textContent = String(current+1).padStart(2,'0') + ' / ' + TOTAL;
  hudTitle.textContent = CHAPTERS[current];
  dotEls.forEach((d,i)=> d.classList.toggle('active', i===current));
  const isFirst = current === 0;
  document.getElementById('hudLeft').style.display = isFirst ? 'none' : 'flex';
  document.getElementById('hudBrand').style.display = isFirst ? 'none' : 'flex';
}

function updateDockState(){
  const isLast = current === TOTAL-1;
  const need = REQUIRES_INTERACTION.has(current) && !unlocked[current];
  btnNext.disabled = need;
  btnNext.style.display = isLast ? 'none' : 'flex';
  btnPrev.style.display = current===0 ? 'none' : 'flex';
  dockHint.classList.toggle('show', need);
}

function goTo(i, dir){
  if(i<0 || i>=TOTAL) return;
  const prevEl = scenes[current];
  current = i;
  scenes.forEach((s,idx)=>{
    s.classList.toggle('active', idx===i);
  });
  updateHud();
  updateDockState();
  runSceneEnter(i);
}

function nudge(i){
  const el = scenes[i].querySelector('.js-interact');
  if(!el) return;
  el.animate([{transform:'scale(1)'},{transform:'scale(1.05)'},{transform:'scale(1)'}], {duration:380, easing:'ease-out'});
  dockHint.classList.add('show');
  setTimeout(()=>{ if(!REQUIRES_INTERACTION.has(current) || unlocked[current]) dockHint.classList.remove('show'); }, 1400);
}

const CS_SCENES = {6:'cs1', 7:'cs2'};

function tryNext(){
  if(REQUIRES_INTERACTION.has(current) && !unlocked[current]){ nudge(current); return; }
  if(current===2){ if(plAdvance()) return; }
  if(CS_SCENES[current]){
    const handled = csAdvance(CS_SCENES[current]);
    if(handled) return;
  }
  if(current < TOTAL-1) goTo(current+1);
}
function tryPrev(){
  if(current===2){ if(plRetreat()) return; }
  if(CS_SCENES[current]){
    const handled = csRetreat(CS_SCENES[current]);
    if(handled) return;
  }
  if(current>0) goTo(current-1);
}

function unlockCurrent(){
  unlocked[current] = true;
  updateDockState();
}

btnNext.addEventListener('click', tryNext);
btnPrev.addEventListener('click', tryPrev);
btnHome.addEventListener('click', ()=> goTo(0));
btnRestart.addEventListener('click', restart);
document.getElementById('s12restart').addEventListener('click', restart);

function restart(){
  unlocked = new Array(TOTAL).fill(false);
  unlocked[TOTAL-1]=true;
  document.querySelectorAll('.js-interact').forEach(el=>el.classList.remove('done'));
  document.querySelectorAll('.narr .ln').forEach(el=>el.classList.remove('on'));
  document.querySelectorAll('.cnum').forEach(el=>el.textContent='0');
  document.querySelectorAll('.s8card').forEach(el=>el.classList.remove('on'));
  resetScene2(); resetScene6(); resetScene7();
  const chat = document.getElementById('s11chat'); if(chat) chat.style.opacity=0;
  goTo(0);
}

window.addEventListener('keydown', (e)=>{
  if(e.key==='ArrowRight' || e.key===' '){ e.preventDefault(); tryNext(); }
  else if(e.key==='ArrowLeft'){ e.preventDefault(); tryPrev(); }
  else if(e.key==='Home'){ goTo(0); }
  else if(e.key==='r' || e.key==='R'){
    if(CS_SCENES[current]) csReplayCurrentPhase(CS_SCENES[current]);
  }
});

/* ============================================================
   Narration line reveal (staggered) — runs each time a scene enters
   ============================================================ */
function revealNarration(scopeEl, startDelay){
  const lines = scopeEl.querySelectorAll('.narr .ln');
  lines.forEach((ln,i)=>{
    setTimeout(()=> ln.classList.add('on'), startDelay + i*750);
  });
}

function animateCount(el, target, duration){
  const start = performance.now();
  function tick(now){
    const p = Math.min(1,(now-start)/duration);
    const eased = 1 - Math.pow(1-p,3);
    const val = Math.floor(eased*target);
    el.textContent = val.toLocaleString('en-IN');
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ============================================================
   SCENE 0 — intro
   ============================================================ */
function initScene0(){
  const bg = document.getElementById('s0bg');
  const stacks = document.getElementById('stacks');
  const svg = document.getElementById('s0svg');
  // scatter blinking lights across skyline
  const lg = document.getElementById('blinkLights');
  const pts = [[140,555],[218,515],[336,595],[1186,535],[1296,575],[1408,505],[560,650],[760,630],[960,640]];
  pts.forEach((p,i)=>{
    const c = document.createElementNS('http://www.w3.org/2000/svg','circle');
    c.setAttribute('cx',p[0]); c.setAttribute('cy',p[1]); c.setAttribute('r', 3+ (i%3));
    c.setAttribute('fill','#ffd98a'); c.classList.add('blink-light');
    c.style.animationDelay = (i*0.4)+'s';
    lg.appendChild(c);
  });
}
function enterScene0(){
  const bg = document.getElementById('s0bg');
  setTimeout(()=> bg.style.opacity = 1, 150);
  setTimeout(()=> document.getElementById('s0eyebrow').style.opacity = 1, 300);
  document.getElementById('s0eyebrow').style.transform='translateY(0)';
  revealNarration(document.getElementById('s0'), 900);
  setTimeout(()=>{
    ['s0title','s0sub','s0begin'].forEach((id,i)=>{
      const el = document.getElementById(id);
      setTimeout(()=>{ el.style.opacity=1; el.style.transform='translateY(0)'; }, i*160);
    });
  }, 3300);
}
document.getElementById('s0begin').addEventListener('click', function(){
  this.classList.add('done');
  tryNext();
});

/* ============================================================
   SCENE 1 — control room: three information sources converge on Pulse
   ============================================================ */
function layoutRing(nodes, radiusRatio){
  nodes.forEach((n,i)=>{
    const angle = (i/nodes.length) * Math.PI*2 - Math.PI/2;
    const r = radiusRatio;
    n.style.left = (50 + Math.cos(angle)*r) + '%';
    n.style.top = (50 + Math.sin(angle)*r) + '%';
  });
}
let crdTimers = [];
function crdClearTimers(){ crdTimers.forEach(t=>clearTimeout(t)); crdTimers = []; }
function crdAfter(ms, fn){ crdTimers.push(setTimeout(fn, ms)); }

function initScene1(){
  const canvas = document.getElementById('crdCanvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width = canvas.clientWidth*devicePixelRatio; canvas.height = canvas.clientHeight*devicePixelRatio; }
  resize(); window.addEventListener('resize', resize);
  let particles = [];
  let spawnTimer = null;
  function spawnFromMonitors(){
    const target = document.querySelector('#hudBrand .hud-pulse-txt') || document.getElementById('hudBrand');
    if(!target) return;
    const hb = target.getBoundingClientRect();
    const hubX = (hb.left+hb.right)/2, hubY = (hb.top+hb.bottom)/2;
    ['crdMon1','crdMon2','crdMon3'].forEach(id=>{
      if(Math.random()>0.6) return;
      const el = document.getElementById(id);
      const b = el.getBoundingClientRect();
      particles.push({x:b.left+b.width/2, y:b.top+b.height*0.3, tx:hubX, ty:hubY, t:0, speed:0.010+Math.random()*0.008});
    });
  }
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.scale(devicePixelRatio,devicePixelRatio);
    particles.forEach(p=>{
      p.t += p.speed;
      const x = p.x+(p.tx-p.x)*p.t, y=p.y+(p.ty-p.y)*p.t;
      ctx.beginPath(); ctx.arc(x,y,2.4,0,Math.PI*2);
      ctx.fillStyle='rgba(34,211,238,'+(0.9*(1-p.t*0.2))+')';
      ctx.shadowColor='rgba(34,211,238,0.8)'; ctx.shadowBlur=8;
      ctx.fill();
    });
    particles = particles.filter(p=>p.t<1);
    ctx.restore();
    requestAnimationFrame(draw);
  }
  draw();
  window.__crdSpawnStart = ()=>{ if(!spawnTimer) spawnTimer = setInterval(spawnFromMonitors, 340); };
  window.__crdSpawnStop = ()=>{ clearInterval(spawnTimer); spawnTimer=null; particles=[]; };
}

function crdReset(){
  crdClearTimers();
  if(window.__crdSpawnStop) window.__crdSpawnStop();
  if(window.__crdMiniStop) window.__crdMiniStop();
  ['crdMon1','crdMon2','crdMon3'].forEach(id=> document.getElementById(id).classList.remove('active'));
  document.querySelectorAll('#crdMiniRow .crd-mini-bezel').forEach(b=> b.classList.remove('focus','settled'));
  document.getElementById('crdToast').classList.remove('on');
  document.getElementById('crdFinal').classList.remove('on');
  document.querySelectorAll('#s1narr .ln').forEach(l=>l.classList.remove('on'));
  document.querySelectorAll('#crdTags .crd-tag').forEach(t=>t.classList.remove('on'));
}

function crdStartMiniCycle(){
  const bezels = Array.from(document.querySelectorAll('#crdMiniRow .crd-mini-bezel'));
  if(!bezels.length) return;
  let idx = 0;
  bezels[0].classList.add('focus');
  const timer = setInterval(()=>{
    bezels[idx].classList.remove('focus');
    idx++;
    if(idx >= bezels.length){
      // one full pass complete — settle into all-screens-lit, static state
      clearInterval(timer);
      bezels.forEach(b=> b.classList.add('focus', 'settled'));
      return;
    }
    bezels[idx].classList.add('focus');
  }, 1400);
  window.__crdMiniStop = ()=>{ clearInterval(timer); bezels.forEach(b=>{ b.classList.remove('focus'); b.classList.remove('settled'); }); };
}

function enterScene1(){
  crdReset();
  const mon1 = document.getElementById('crdMon1');
  const mon2 = document.getElementById('crdMon2');
  const mon3 = document.getElementById('crdMon3');
  const toast = document.getElementById('crdToast');

  // Sequence 1 — first information source
  crdAfter(200, ()=> mon1.classList.add('active'));
  // Sequence 2 — second information source (metadata, scrolling)
  crdAfter(2600, ()=>{ mon1.classList.remove('active'); mon2.classList.add('active'); });
  // Sequence 3 — third information source (P&ID, pan/zoom)
  crdAfter(5000, ()=>{ mon2.classList.remove('active'); mon3.classList.add('active'); });
  // Sequence 4 — complete engineering workspace, all three alive at once
  crdAfter(7400, ()=>{
    mon1.classList.add('active'); mon2.classList.add('active'); mon3.classList.add('active');
    crdStartMiniCycle(); // secondary screens begin their gentle attention cycle
  });
  crdAfter(8600, ()=> toast.classList.add('on'));
  crdAfter(11500, ()=> toast.classList.remove('on'));

  // Sequence 5 — messaging beats
  crdAfter(10200, ()=> revealNarration(document.getElementById('s1'), 0));

  // symptom tags build up progressively and stay visible
  const tags = Array.from(document.querySelectorAll('#crdTags .crd-tag'));
  tags.forEach((tag,i)=> crdAfter(12200 + i*650, ()=> tag.classList.add('on')));

  // Transition to Pulse — information quietly flows up to the Pulse mark already in the corner
  crdAfter(15600, ()=>{
    if(window.__crdSpawnStart) window.__crdSpawnStart();
  });
  crdAfter(19000, ()=>{
    if(window.__crdSpawnStop) window.__crdSpawnStop();
    document.getElementById('crdFinal').classList.add('on');
  });
}

/* ============================================================
   SCENE 2 — from raw data to engineering intelligence
   Topology now branches and re-converges (Raw -> Processed -> {Benchmark,
   Predictive} -> FaultTree -> Incident -> Question), matching the approved
   workflow diagram. One Continue click starts the whole pipeline; it plays
   automatically end-to-end, pausing only once fully settled.
   ============================================================ */
const PL_NODE_IDS = ['plNodeRaw','plNodeProcessed','plNodeBenchmark','plNodePredict','plNodeFaultTree','plNodeIncident','plNodeQuestion'];
const PL_ALL_CONNECTORS = ['plPathRawProc','plPathProcBench','plPathProcPred','plPathBenchFT','plPathPredFT','plPathFTInc','plPathIncQ'];
const PL_ALL_DOTS = ['plDotRawProc','plDotProcBench','plDotProcPred','plDotBenchFT','plDotPredFT','plDotFTInc','plDotIncQ'];

/* each step: nodes to activate simultaneously, the connector(s) feeding them,
   and the caption to show. A step with two connectors means two arrows travel
   at once (the diagram's branch-out and merge-back moments). */
const PL_STEPS = [
  { nodes:['plNodeRaw'],                          conns:[],                                   caption:'Raw process signals arriving from the refinery.' },
  { nodes:['plNodeProcessed'],                     conns:['plPathRawProc'],                    caption:'Validated, processed, and made engineering-ready.' },
  { nodes:['plNodeBenchmark','plNodePredict'],     conns:['plPathProcBench','plPathProcPred'],  caption:'Benchmarked against expected performance, and projected forward at the same time.' },
  { nodes:['plNodeFaultTree'],                     conns:['plPathBenchFT','plPathPredFT'],      caption:'Engineering knowledge combines both views to narrow the probable cause.' },
  { nodes:['plNodeIncident'],                      conns:['plPathFTInc'],                       caption:'Incident raised — root cause identified, recommendation issued.' },
  { nodes:['plNodeQuestion'],                      conns:['plPathIncQ'],                        caption:'How do I get value? Where is my money saved?' },
];

let plState = 'idle'; // idle | playing | done
let plTimers = [];
function plClearTimers(){ plTimers.forEach(t=>clearTimeout(t)); plTimers = []; }
function plAfter(ms, fn){ plTimers.push(setTimeout(fn, ms)); }

function initScene2(){ /* nothing to build — all markup is static */ }

function plSetCaption(text){
  const el = document.getElementById('plCaption');
  el.classList.add('fading');
  setTimeout(()=>{ el.textContent = text; el.classList.remove('fading'); }, 250);
}

function plLightConnector(connId, dotId){
  document.getElementById(connId).classList.add('lit');
  const dot = document.getElementById(dotId);
  const path = document.getElementById(connId);
  dot.classList.add('moving');
  const len = path.getTotalLength();
  const t0 = performance.now();
  const DUR = 1250; // ~1-1.5s per the requested cinematic timing
  function tick(now){
    const p = Math.min(1, (now-t0)/DUR);
    const pt = path.getPointAtLength(len*p);
    dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
    if(p<1) requestAnimationFrame(tick); else dot.classList.remove('moving');
  }
  requestAnimationFrame(tick);
}

function plRunStep(i){
  const step = PL_STEPS[i];

  // demote whatever was active into 'done' (stays visible, never disappears)
  PL_NODE_IDS.forEach(id=>{
    const el = document.getElementById(id);
    if(el.classList.contains('active')){ el.classList.remove('active'); el.classList.add('done'); }
  });

  plSetCaption(step.caption);

  // light the connector(s) feeding this step first, arrows travel ~1.2s, then the node(s) reveal
  const connDots = step.conns.map(c => [c, PL_ALL_DOTS[PL_ALL_CONNECTORS.indexOf(c)]]);
  connDots.forEach(([c,d])=> plLightConnector(c,d));
  const revealDelay = connDots.length ? 1350 : 0;

  plAfter(revealDelay, ()=>{
    step.nodes.forEach(id=>{
      const el = document.getElementById(id);
      el.classList.add('active','wiping');
    });
  });

  const stepDuration = revealDelay + 2100; // brief pause before the next step begins
  if(i+1 < PL_STEPS.length){
    plAfter(stepDuration, ()=> plRunStep(i+1));
  } else {
    plAfter(stepDuration, ()=> plFinish());
  }
}

function plFinish(){
  const lastIds = PL_STEPS[PL_STEPS.length-1].nodes;
  lastIds.forEach(id=>{
    const el = document.getElementById(id);
    el.classList.remove('active');
    el.classList.add('done'); // the Question node's pulse animation is tied to .done, so it keeps gently glowing rather than going fully static
  });
  // quick sweep: re-flash every connector in sequence to show the complete, fully-connected pipeline
  PL_ALL_CONNECTORS.forEach((id,i)=>{
    plAfter(i*150, ()=>{
      const path = document.getElementById(id);
      path.animate([{opacity:0.4},{opacity:1},{opacity:1}],{duration:340, easing:'ease-out'});
    });
  });
  plAfter(PL_ALL_CONNECTORS.length*150 + 400, ()=>{
    plSetCaption('From raw refinery data to actionable engineering intelligence.');
    document.getElementById('plCaption').classList.add('pl-final-glow');
    plState = 'done';
  });
}

function plAdvance(){
  if(plState === 'idle'){
    plState = 'playing';
    plRunStep(0);
    return true; // consumed — do not advance the outer scene yet
  }
  if(plState === 'playing') return true; // ignore repeated clicks mid-sequence
  return false; // done — let outer nav proceed to scene 3
}
function plRetreat(){
  if(plState === 'idle') return false; // let outer nav go back to scene 1
  plResetVisual();
  plState = 'idle';
  return true;
}

function plResetVisual(){
  plClearTimers();
  PL_NODE_IDS.forEach(id=>{
    const el = document.getElementById(id);
    el.classList.remove('active','done','wiping');
  });
  PL_ALL_CONNECTORS.forEach(id=> document.getElementById(id).classList.remove('lit'));
  PL_ALL_DOTS.forEach(id=> document.getElementById(id).classList.remove('moving'));
  document.getElementById('plCaption').classList.remove('pl-final-glow');
  document.getElementById('plCaption').textContent = 'Click Continue to begin the journey.';
}

function enterScene2(){ /* waits for the presenter's first Continue — nothing plays yet */ }
function resetScene2(){ plState = 'idle'; plResetVisual(); }

/* ============================================================
   SCENE 3 — turning data into awareness
   ============================================================ */
function initScene3(){
  document.getElementById('s3pulse').addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
    document.querySelectorAll('#s3 .s3src').forEach(s=> s.style.borderColor='rgba(34,211,238,0.55)');
  });
  const canvas = document.getElementById('s3canvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width=canvas.clientWidth*devicePixelRatio; canvas.height=canvas.clientHeight*devicePixelRatio; }
  resize(); window.addEventListener('resize', resize);
  let particles = []; let raf; 
  function spawn(){
    const pulse = document.getElementById('s3pulse');
    if(!pulse.offsetParent) return;
    const pb = pulse.getBoundingClientRect();
    const px=(pb.left+pb.right)/2, py=(pb.top+pb.bottom)/2;
    document.querySelectorAll('#s3sources .s3src').forEach(s=>{
      if(Math.random()>0.5) return;
      const sb = s.getBoundingClientRect();
      particles.push({x:(sb.left+sb.right)/2, y:(sb.top+sb.bottom)/2, tx:px, ty:py, t:0, speed:0.012+Math.random()*0.01});
    });
  }
  let timer = setInterval(spawn, 380);
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save(); ctx.scale(devicePixelRatio,devicePixelRatio);
    particles.forEach(p=>{
      p.t += p.speed;
      const x = p.x+(p.tx-p.x)*p.t, y=p.y+(p.ty-p.y)*p.t;
      ctx.beginPath(); ctx.arc(x,y,2.2,0,Math.PI*2);
      ctx.fillStyle='rgba(111,161,255,'+(0.9*(1-p.t*0.2))+')';
      ctx.shadowColor='rgba(111,161,255,0.8)'; ctx.shadowBlur=7;
      ctx.fill();
    });
    particles = particles.filter(p=>p.t<1);
    ctx.restore();
    raf = requestAnimationFrame(draw);
  }
  draw();
}
function enterScene3(){ revealNarration(document.getElementById('s3'), 300); }

/* ============================================================
   SCENE 4 — normal shift
   ============================================================ */
function initScene4(){
  document.getElementById('s4frame').addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
  });
}

/* ============================================================
   SCENE 5 — whisper
   ============================================================ */
function initScene5(){
  const frame = document.getElementById('s5frame');
  const ring = document.getElementById('s5ring');
  // position ring roughly over the drift point on the trend chart (right-hand dip area)
  function place(){
    ring.style.left = '78%'; ring.style.top='46%';
  }
  place();
  frame.addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
    ring.style.borderColor = '#2fae72';
  });
}

/* ============================================================
   REUSABLE CASE STUDY DOCUMENTARY ENGINE — drives scenes 6 & 7 (and any
   future case study using the same phase HTML pattern below).
   Each case study is a strict sequence of phases; each phase may contain
   several "bullets" that reveal one at a time. Nothing ever auto-advances —
   every reveal is triggered by the presenter via Continue / Right Arrow /
   Previous / Left Arrow. R replays the current phase from scratch.
   To add a new case study: duplicate the scene 6/7 HTML block with new
   ids, add one line to CS_PHASE_DEFS below, and register it in CS_SCENES.
   ============================================================ */
const CS_PHASE_DEFS_BY_PREFIX = {
  cs1: [
    { name:'equipment', title:'Establishing the equipment' },
    { name:'problem',   title:'Problem statement' },
    { name:'graph',     title:'The trend graph' },
    { name:'observe',   title:'What Pulse observed',        bulletSel:'.cs-check' },
    { name:'recommend', title:'Engineering recommendation', bulletSel:'.cs-reco' },
    { name:'action',    title:'Action taken',                bulletSel:'.cs-step', linkSel:'.cs-link' },
    { name:'rootcause', title:'Root cause',                  bulletSel:'.cs-chain-item' },
    { name:'resolve',   title:'Resolution',                  onEnter:'resolve' },
    { name:'value',     title:'Business value',              bulletSel:'.cs-kpi', onBullet:'kpi' },
    { name:'summary',   title:'Engineering summary' },
  ],
  cs2: [
    { name:'equipment', title:'Establishing the equipment' },
    { name:'problem',   title:'Problem statement' },
    { name:'graph',     title:'The trend graph' },
    { name:'observe',   title:'What Pulse observed',        bulletSel:'.cs-check' },
    { name:'recommend', title:'Engineering recommendation', bulletSel:'.cs-reco' },
    { name:'action',    title:'Action taken',                bulletSel:'.cs-step', linkSel:'.cs-link' },
    { name:'rootcause', title:'Root cause',                  bulletSel:'.cs-chain-item' },
    { name:'resolve',   title:'Resolution',                  onEnter:'resolve' },
    { name:'value',     title:'Business value',              bulletSel:'.cs-kpi', onBullet:'kpi' },
    { name:'summary',   title:'Engineering summary' },
  ],
  pl: [
    { name:'raw',        title:'Raw Data' },
    { name:'processed',  title:'Validated & Processed Data', bulletSel:'.cs-check' },
    { name:'benchmark',  title:'Benchmarking',                bulletSel:'.cs-check' },
    { name:'predict',    title:'Predictive Models' },
    { name:'faulttree',  title:'Fault Tree Engine',           bulletSel:'.cs-check' },
    { name:'incident',   title:'Incident Generation',         bulletSel:'.cs-check' },
    { name:'teaser',     title:'Value Realization',           bulletSel:'.cs-check' },
  ],
};

const csState = {}; // e.g. csState.cs1 = {phaseIdx:0, bulletsShown:0}
const CS_RESOLVE_DOT = { cs1:'cs1resdot', cs2:'cs2resdot' };

function csStageEl(prefix){ return document.getElementById(prefix+'stage'); }
function csPhaseEl(prefix, name){ return csStageEl(prefix).querySelector('.cs-phase[data-phase="'+name+'"]'); }
function csBulletCount(prefix, def){ return def.bulletSel ? csPhaseEl(prefix, def.name).querySelectorAll(def.bulletSel).length : 0; }

function csUpdateProgress(prefix){
  const st = csState[prefix];
  const defs = CS_PHASE_DEFS_BY_PREFIX[prefix];
  const def = defs[st.phaseIdx];
  const el = document.getElementById(prefix+'progress');
  if(el) el.textContent = 'Step ' + (st.phaseIdx+1) + ' / ' + defs.length + ' \u00b7 ' + def.title;
}

function csShowPhase(prefix, idx){
  const name = CS_PHASE_DEFS_BY_PREFIX[prefix][idx].name;
  csStageEl(prefix).querySelectorAll('.cs-phase').forEach(p=> p.classList.toggle('on', p.dataset.phase===name));
}

function csRevealBullet(prefix, def, i){
  const phase = csPhaseEl(prefix, def.name);
  const bullets = phase.querySelectorAll(def.bulletSel);
  if(bullets[i]) bullets[i].classList.add('on');
  if(def.linkSel){
    const links = phase.querySelectorAll(def.linkSel);
    if(i>0 && links[i-1]) links[i-1].classList.add('on');
  }
  if(def.onBullet==='kpi' && bullets[i]){
    const count = bullets[i].querySelector('.cs-count');
    if(count) animateCount(count, +count.dataset.target, 1100);
  }
}

function csRunPhaseSideEffects(prefix, def){
  if(def.onEnter==='resolve'){
    const dot = document.getElementById(CS_RESOLVE_DOT[prefix]);
    if(dot) dot.classList.add('healthy');
  }
}

/* advance(): returns true if handled internally, false if the sequence
   is fully finished and the outer deck should move to the next scene */
function csAdvance(prefix){
  const st = csState[prefix];
  const defs = CS_PHASE_DEFS_BY_PREFIX[prefix];
  const def = defs[st.phaseIdx];
  const bulletsTotal = def.bulletSel ? csBulletCount(prefix, def) : 0;
  if(st.bulletsShown < bulletsTotal){
    csRevealBullet(prefix, def, st.bulletsShown);
    st.bulletsShown++;
    return true;
  }
  if(st.phaseIdx+1 >= defs.length) return false; // exhausted — let outer nav proceed
  st.phaseIdx++; st.bulletsShown = 0;
  const newDef = defs[st.phaseIdx];
  csShowPhase(prefix, st.phaseIdx);
  csRunPhaseSideEffects(prefix, newDef);
  csUpdateProgress(prefix);
  return true;
}

/* retreat(): symmetric — un-reveals the last bullet, or steps back a phase
   (re-showing all its bullets, since the presenter already discussed them) */
function csRetreat(prefix){
  const st = csState[prefix];
  const defs = CS_PHASE_DEFS_BY_PREFIX[prefix];
  if(st.bulletsShown > 0){
    const def = defs[st.phaseIdx];
    st.bulletsShown--;
    const phase = csPhaseEl(prefix, def.name);
    const bullets = phase.querySelectorAll(def.bulletSel);
    if(bullets[st.bulletsShown]) bullets[st.bulletsShown].classList.remove('on');
    if(def.linkSel){
      const links = phase.querySelectorAll(def.linkSel);
      if(st.bulletsShown>0 && links[st.bulletsShown-1]) links[st.bulletsShown-1].classList.remove('on');
    }
    return true;
  }
  if(st.phaseIdx === 0) return false; // exhausted — let outer nav go to previous scene
  st.phaseIdx--;
  const def = defs[st.phaseIdx];
  st.bulletsShown = def.bulletSel ? csBulletCount(prefix, def) : 0;
  csShowPhase(prefix, st.phaseIdx);
  // re-reveal all bullets of that phase instantly (no need to re-animate on the way back)
  if(def.bulletSel){
    const phase = csPhaseEl(prefix, def.name);
    phase.querySelectorAll(def.bulletSel).forEach(b=> b.classList.add('on'));
    if(def.linkSel) phase.querySelectorAll(def.linkSel).forEach(l=> l.classList.add('on'));
  }
  csRunPhaseSideEffects(prefix, def);
  csUpdateProgress(prefix);
  return true;
}

function csReplayCurrentPhase(prefix){
  const st = csState[prefix];
  const def = CS_PHASE_DEFS_BY_PREFIX[prefix][st.phaseIdx];
  st.bulletsShown = 0;
  const phase = csPhaseEl(prefix, def.name);
  if(def.bulletSel) phase.querySelectorAll(def.bulletSel).forEach(b=> b.classList.remove('on'));
  if(def.linkSel) phase.querySelectorAll(def.linkSel).forEach(l=> l.classList.remove('on'));
  if(def.onEnter==='resolve'){
    const dot = document.getElementById(CS_RESOLVE_DOT[prefix]);
    if(dot) dot.classList.remove('healthy');
  }
  // brief flash to signal "replaying"
  phase.animate([{opacity:0.4},{opacity:1}], {duration:400, easing:'ease-out'});
}

function csRestartStudy(prefix){
  csState[prefix] = {phaseIdx:0, bulletsShown:0};
  csShowPhase(prefix, 0);
  CS_PHASE_DEFS_BY_PREFIX[prefix].forEach(def=>{
    if(!def.bulletSel) return;
    const phase = csPhaseEl(prefix, def.name);
    phase.querySelectorAll(def.bulletSel).forEach(b=> b.classList.remove('on'));
    if(def.linkSel) phase.querySelectorAll(def.linkSel).forEach(l=> l.classList.remove('on'));
    if(def.onBullet==='kpi') phase.querySelectorAll('.cs-count').forEach(c=> c.textContent='0');
  });
  const dot = document.getElementById(CS_RESOLVE_DOT[prefix]); if(dot) dot.classList.remove('healthy');
  csUpdateProgress(prefix);
}

function initScene6(){
  csState.cs1 = {phaseIdx:0, bulletsShown:0};
  document.getElementById('cs1replay').addEventListener('click', ()=> csReplayCurrentPhase('cs1'));
  document.getElementById('cs1restart').addEventListener('click', ()=> csRestartStudy('cs1'));
}
function enterScene6(){ csUpdateProgress('cs1'); }

function initScene7(){
  csState.cs2 = {phaseIdx:0, bulletsShown:0};
  document.getElementById('cs2replay').addEventListener('click', ()=> csReplayCurrentPhase('cs2'));
  document.getElementById('cs2restart').addEventListener('click', ()=> csRestartStudy('cs2'));
}
function enterScene7(){ csUpdateProgress('cs2'); }

function resetScene6(){ csRestartStudy('cs1'); }
function resetScene7(){ csRestartStudy('cs2'); }

/* ============================================================
   SCENE 8 — value pillars
   ============================================================ */
function initScene8(){
  document.querySelector('#s8grid .js-interact').addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
    const cards = document.querySelectorAll('.s8card');
    cards.forEach((c,i)=> setTimeout(()=> c.classList.add('on'), i*180));
  });
}

/* ============================================================
   SCENE 9 — measuring success
   ============================================================ */
function initScene9(){
  document.getElementById('s9frame').addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
  });
}

/* ============================================================
   SCENE 10 — network of roles
   ============================================================ */
function initScene10(){
  const nodes = Array.from(document.querySelectorAll('.s10node'));
  layoutRing(nodes, 42);
  document.getElementById('s10ring').addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
    nodes.forEach((n,i)=> setTimeout(()=>{ n.style.borderColor='rgba(34,211,238,0.7)'; n.style.color='#fff'; }, i*90));
  });
  const canvas = document.getElementById('s10canvas');
  const ctx = canvas.getContext('2d');
  function resize(){ canvas.width=canvas.clientWidth*devicePixelRatio; canvas.height=canvas.clientHeight*devicePixelRatio; }
  resize(); window.addEventListener('resize', resize);
  function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    if(scenes[current].dataset.scene==='10'){
      ctx.save(); ctx.scale(devicePixelRatio,devicePixelRatio);
      const center = document.getElementById('s10center');
      const cb = center.getBoundingClientRect();
      const cx=(cb.left+cb.right)/2, cy=(cb.top+cb.bottom)/2;
      nodes.forEach(n=>{
        const nb = n.getBoundingClientRect();
        const nx=(nb.left+nb.right)/2, ny=(nb.top+nb.bottom)/2;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(nx,ny);
        ctx.strokeStyle='rgba(111,161,255,0.22)'; ctx.lineWidth=1;
        ctx.stroke();
      });
      ctx.restore();
    }
    requestAnimationFrame(draw);
  }
  draw();
}
function enterScene10(){ revealNarration(document.getElementById('s10'), 300); }

/* ============================================================
   SCENE 11 — future assistant
   ============================================================ */
function initScene11(){
  document.getElementById('s11avatar').addEventListener('click', function(){
    this.classList.add('done'); unlockCurrent();
    document.getElementById('s11chat').style.opacity = 1;
  });
}

/* ============================================================
   SCENE 12 — closing
   ============================================================ */
function enterScene12(){
  revealNarration(document.getElementById('s12'), 300);
  setTimeout(()=>{
    document.getElementById('s12logo').style.opacity=1;
    document.getElementById('s12logo').style.transform='translateY(0)';
  }, 2900);
  setTimeout(()=> document.getElementById('s12sub').style.opacity=1, 3100);
  setTimeout(()=> document.getElementById('s12restart').style.opacity=1, 3500);
}

/* reset scene 12 elements each time we leave/enter so replays look right */
function resetScene12(){
  ['s12logo','s12sub'].forEach(id=>{ const el=document.getElementById(id); el.style.opacity=0; if(id==='s12logo') el.style.transform='translateY(14px)';});
  document.getElementById('s12restart').style.opacity=0;
  document.querySelectorAll('#s12 .narr .ln').forEach(l=>l.classList.remove('on'));
}
function resetScene0(){
  document.getElementById('s0bg').style.opacity=0;
  const eb = document.getElementById('s0eyebrow'); eb.style.opacity=0; eb.style.transform='translateY(10px)';
  ['s0title','s0sub','s0begin'].forEach(id=>{ const el=document.getElementById(id); el.style.opacity=0; el.style.transform='translateY(16px)'; });
  document.querySelectorAll('#s0 .narr .ln').forEach(l=>l.classList.remove('on'));
}

const SCENE_ENTER = {0:enterScene0,1:enterScene1,2:enterScene2,3:enterScene3,6:enterScene6,7:enterScene7,10:enterScene10,12:enterScene12};
function runSceneEnter(i){
  if(i===0) resetScene0();
  if(i===12) resetScene12();
  if(SCENE_ENTER[i]) SCENE_ENTER[i]();
}

/* ============================================================
   Pulse rail — continuous heartbeat line across bottom of screen
   ============================================================ */
function initPulseRail(){
  const path = document.getElementById('pulseLine');
  const dot = document.getElementById('pulseDot');
  let t=0;
  function wave(x){
    // gentle heartbeat waveform
    const seg = 160;
    const local = (x % seg) / seg;
    let y = 32;
    if(local>0.42 && local<0.5) y = 32 - (local-0.42)/0.08*22;
    else if(local>=0.5 && local<0.58) y = 10 + (local-0.5)/0.08*22;
    else if(local>0.58 && local<0.64) y = 32 - (local-0.58)/0.06*10;
    else if(local>=0.64 && local<0.7) y = 22 + (local-0.64)/0.06*10;
    return y;
  }
  function build(offset){
    let d = 'M0,32 ';
    for(let x=0;x<=1600;x+=8){ d += 'L'+x+','+wave(x+offset)+' '; }
    return d;
  }
  function loop(){
    t += 2.4;
    if(t>10000) t=0;
    path.setAttribute('d', build(t));
    const dx = (t*1.4) % 1650 - 20;
    dot.setAttribute('cx', dx);
    dot.setAttribute('cy', wave(dx+t));
    requestAnimationFrame(loop);
  }
  loop();
}

/* ============================================================
   BOOTSTRAP
   ============================================================ */
window.addEventListener('DOMContentLoaded', ()=>{
  initScene0(); initScene1(); initScene2(); initScene3(); initScene4();
  initScene5(); initScene6(); initScene7(); initScene8(); initScene9();
  initScene10(); initScene11();
  initPulseRail();
  scenes[0].classList.add('active');
  updateHud(); updateDockState();
  runSceneEnter(0);
  setTimeout(()=> document.getElementById('loader').classList.add('hide'), 1400);
});

})();
