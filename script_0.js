
    // --- App Switcher Logic ---
    const APP_VERSION = '2.6.6-synapse-path-horizontal-fix';
    const APP_VERSION_DATE = '2026-07-17';
    window._vocabSuiteVersion = { version: APP_VERSION, date: APP_VERSION_DATE };
    const appIds = ['memoryApp', 'teamsApp'];
    function setActivityBarMode(active) {
      document.body.classList.toggle('activity-bar-mode', !!active);
      const mini = document.getElementById('miniScoreboard');
      if(mini) mini.classList.toggle('hidden', !active);
    }
    function setActiveApp(targetId) {
      document.getElementById('scrambleApp').style.display = 'none';
      document.getElementById('casinoBoard').style.display = 'none';
      document.getElementById('memoryBoard').style.display = 'none';
      const matchingBoard = document.getElementById('matchingBoard'); if(matchingBoard) matchingBoard.style.display = 'none';
      setActivityBarMode(false);
      appIds.forEach(id => { const app = document.getElementById(id); if(app) app.style.display = id === targetId ? (id === 'memoryApp' ? 'flex' : 'block') : 'none'; });
      document.querySelectorAll('.switcher-btn[data-target]').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-target') === targetId));
    }
    function openScrambleActivity() {
      document.getElementById('memoryApp').style.display = 'none';
      document.getElementById('teamsApp').style.display = 'none';
      document.getElementById('scrambleApp').style.display = 'block';
      document.querySelectorAll('.switcher-btn[data-target]').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-target') === 'memoryApp'));
      setActivityBarMode(true);
    }
    document.querySelectorAll('.switcher-btn[data-target]').forEach(btn => btn.addEventListener('click', e => setActiveApp(e.currentTarget.getAttribute('data-target'))));
    setActiveApp('memoryApp');

    // --- Shared Teams / Starboard Logic ---
    (() => {
      const STORAGE_KEY = 'starboard_v1';
      const DOLLAR_RATE = 3;
      let teams = [];
      const teamsListEl = document.getElementById('scoreTeamsList'), scoreBoardEl = document.getElementById('scoreBoard'), rewardBankEl = document.getElementById('rewardBank'), teamNameInput = document.getElementById('scoreTeamName'), teamColorInput = document.getElementById('scoreTeamColor'), addTeamBtn = document.getElementById('scoreAddTeam'), resetBtn = document.getElementById('teamsResetBtn'), exportBtn = document.getElementById('teamsExportBtn'), miniScoreboard = document.getElementById('miniScoreboard'), miniScoreToggle = document.getElementById('miniScoreToggle'), miniScoreSummary = document.getElementById('miniScoreSummary'), miniScoreBody = document.getElementById('miniScoreBody'), aboutBtn = document.getElementById('aboutAppBtn'), aboutModal = document.getElementById('aboutModal'), aboutCloseBtn = document.getElementById('aboutCloseBtn');
      const uid = (p='t') => p + Math.random().toString(36).slice(2,9);
      const clamp = (v,a,b) => Math.max(a, Math.min(b,v));
      const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      // Reward engine: one classroom dollar for each complete block of three stars.
      function dollarsForStars(stars) { return Math.max(0, Math.floor((Number(stars)||0) / DOLLAR_RATE)); }
      function visualProgressStarsFor(stars) {
        const total = Math.max(0, Number(stars)||0);
        if(total <= 0) return 0;
        const remainder = total % DOLLAR_RATE;
        return remainder === 0 ? DOLLAR_RATE : remainder;
      }
      function getRewardState() {
        const maxStars = teams.reduce((m,t) => Math.max(m, Number(t.stars)||0), 0);
        const winners = maxStars > 0 ? teams.filter(t => (Number(t.stars)||0) === maxStars) : [];
        const dollars = dollarsForStars(maxStars);
        return { maxStars, winners, dollars };
      }
      function dollarBills(count, oldEarnedDollars = 0) {
        if(count <= 0) return '<span class="score-small">No classroom dollars yet.</span>';
        const visible = Math.min(count, 12);
        let html = '';
        for(let i=0;i<visible;i++) {
          const isNew = i >= oldEarnedDollars;
          html += `<span class="dollar-bill ${isNew ? 'new-bill' : ''}" style="--i: ${i}">$1</span>`;
        }
        if(count > visible) html += `<span class="dollar-bill" style="--i: ${visible}">+${count-visible}</span>`;
        return html;
      }
      function loadTeams() {
        try { const raw = localStorage.getItem(STORAGE_KEY); teams = raw ? JSON.parse(raw) : []; if(!Array.isArray(teams)) teams = []; } catch(e) { teams = []; }
        teams = teams.map(t => ({ id:t.id||uid(), name:String(t.name||'New Team'), color:/^#[0-9a-fA-F]{6}$/.test(t.color||'')?t.color:'#ffd166', stars:Math.max(0, Number(t.stars||0)) }));
      }
      function saveTeams() { localStorage.setItem(STORAGE_KEY, JSON.stringify(teams)); }
      function render() { renderRewardBank(); renderTeamsTab(); renderMini(); }
      function renderRewardBank() {
        const state = getRewardState();
        if(!teams.length) {
          rewardBankEl.innerHTML = '<div class="reward-title">🏆 Reward Bank</div><div class="reward-leaders">No teams yet</div><div class="reward-conversion">Create a team to start tracking classroom dollars.</div>';
          return;
        }

        const earnedDollars = state.dollars;
        const visualProgressStars = visualProgressStarsFor(state.maxStars);
        const progressPercent = (visualProgressStars / DOLLAR_RATE) * 100;
        const leaderNames = state.winners.length ? state.winners.map(t=>String(t.name||'New Team')).join(' & ') : 'No reward leader yet';
        const conversionText = `${state.maxStars} ★ → $${earnedDollars} classroom dollars. Conversion: $1 for every complete 3 stars.`;

        function buildRewardBank() {
          rewardBankEl.innerHTML = `
            <div class="reward-title">🏆 Current Reward Leader${state.winners.length>1?'s':''}</div>
            <div class="reward-leaders" id="rewardLeadersText"></div>
            <div class="reward-conversion" id="rewardConversionText"></div>
            <div class="reward-visual-container">
               <div class="reward-progress-wrapper">
                 <div class="reward-progress-track">
                   <div class="reward-progress-fill" id="rewardProgressFill" style="width: ${progressPercent}%">
                     <div class="progress-flash"></div>
                   </div>
                   <div class="reward-progress-markers">
                     <div class="marker"></div>
                     <div class="marker"></div>
                   </div>
                 </div>
                 <div class="reward-progress-text" id="rewardProgressText"></div>
               </div>
               <div class="reward-bill-row" id="rewardBillRow" data-dollars="${earnedDollars}">${dollarBills(earnedDollars, earnedDollars)}</div>
            </div>
          `;
          const built = getRewardBankEls();
          if(built.leaders) built.leaders.textContent = leaderNames;
          if(built.conversion) built.conversion.textContent = conversionText;
          if(built.progressText) built.progressText.textContent = `${visualProgressStars}/${DOLLAR_RATE} Stars`;
          return built;
        }

        function getRewardBankEls() {
          const container = rewardBankEl.querySelector('.reward-visual-container');
          const leaders = document.getElementById('rewardLeadersText');
          const conversion = document.getElementById('rewardConversionText');
          const fill = document.getElementById('rewardProgressFill');
          const billRow = document.getElementById('rewardBillRow');
          const progressText = document.getElementById('rewardProgressText');
          const flash = fill ? fill.querySelector('.progress-flash') : null;
          const complete = !!(container && leaders && conversion && fill && billRow && progressText && flash);
          return { container, leaders, conversion, fill, billRow, progressText, flash, complete };
        }

        let els = getRewardBankEls();
        if(!els.complete) {
          els = buildRewardBank();
          if(!els.complete) return;
        }

        const oldWidth = parseFloat(els.fill.style.width || '0') || 0;
        const oldDollars = parseInt(els.billRow.dataset.dollars || '0', 10) || 0;

        els.leaders.textContent = leaderNames;
        els.conversion.textContent = conversionText;
        if(oldWidth < progressPercent || oldDollars < earnedDollars) {
          els.flash.classList.remove('animate-flash');
          void els.flash.offsetWidth;
          els.flash.classList.add('animate-flash');
        }
        els.fill.style.transition = 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        els.fill.style.width = `${progressPercent}%`;
        if(oldDollars !== earnedDollars) {
          els.billRow.innerHTML = dollarBills(earnedDollars, oldDollars);
          els.billRow.dataset.dollars = earnedDollars;
        }
        els.progressText.textContent = `${visualProgressStars}/${DOLLAR_RATE} Stars`;
      }
      function renderTeamsTab() {
        const state = getRewardState();
        const winnerIds = new Set(state.winners.map(t => t.id));
        teamsListEl.innerHTML = ''; scoreBoardEl.innerHTML = '';
        if(!teams.length) { teamsListEl.innerHTML = '<div class="score-empty">No teams yet. Add your first team above.</div>'; scoreBoardEl.innerHTML = '<div class="score-empty">Create teams to start awarding classroom stars.</div>'; return; }
        teams.forEach(team => {
          const isLeader = winnerIds.has(team.id) && state.maxStars > 0;
          const hasBankedDollars = isLeader && state.dollars > 0;
          const chargingStars = visualProgressStarsFor(state.maxStars);
          let row = document.createElement('div'); row.className='score-team-row';
          row.innerHTML = `<div class="score-color-bar" style="background:${team.color}"></div><div><div class="score-team-topline"><div class="score-team-name">${escapeHtml(team.name)}</div><div class="score-counter" id="scoreCounter-${team.id}">${team.stars} ★</div></div><div class="score-row-actions"><button class="score-btn primary" data-score-action="give" data-id="${team.id}">+ Star</button><button class="score-btn" data-score-action="remove" data-id="${team.id}">− Star</button><button class="score-btn danger" data-score-action="delete" data-id="${team.id}">Delete</button></div></div>`;
          teamsListEl.appendChild(row);
          let card = document.createElement('div'); card.className = 'score-team-card' + (isLeader ? ' winner' : ''); card.style.background = `linear-gradient(180deg,rgba(255,255,255,.12),rgba(0,0,0,.08)), ${team.color}44`;
          const rewardText = isLeader ? (hasBankedDollars ? `🏆 Reward: $${state.dollars} classroom dollars` : `Charging next dollar: ${chargingStars}/${DOLLAR_RATE} stars`) : 'Reward: leaders only';
          card.innerHTML = `<div class="score-card-top"><div><div class="score-team-name">${escapeHtml(team.name)}</div><div class="score-small">Team</div></div><div style="text-align:right"><div class="score-big-count" id="scoreBig-${team.id}">${team.stars}</div><div class="score-small">stars</div></div></div><div class="reward-indicator">${rewardText}</div><div class="score-card-actions"><button class="score-btn primary" data-score-action="give" data-id="${team.id}">Give Star</button><button class="score-btn" data-score-action="remove" data-id="${team.id}">Remove</button></div>`;
          scoreBoardEl.appendChild(card);
        });
      }
      function renderMini() {
        miniScoreSummary.textContent = teams.length ? `${teams.reduce((s,t)=>s+(t.stars||0),0)} ★` : '0 teams'; miniScoreBody.innerHTML='';
        if(!teams.length) { miniScoreBody.innerHTML='<div class="mini-empty">No teams yet.<br><button class="score-btn primary" data-score-action="openTeams">Open Teams</button></div>'; return; }
        teams.forEach(team => { let row=document.createElement('div'); row.className='mini-team-row'; row.innerHTML=`<div class="mini-color" style="background:${team.color}"></div><div class="mini-team-name">${escapeHtml(team.name)}</div><div class="mini-count" id="miniCounter-${team.id}">${team.stars}★</div><button class="mini-star-btn add" data-score-action="give" data-id="${team.id}">+</button><button class="mini-star-btn" data-score-action="remove" data-id="${team.id}">−</button>`; miniScoreBody.appendChild(row); });
      }
      function updateCounters(id) { const t=teams.find(x=>x.id===id); if(!t) return; [['scoreCounter-'+id,t.stars+' ★'],['scoreBig-'+id,''+t.stars],['miniCounter-'+id,t.stars+'★']].forEach(([eid,val])=>{const el=document.getElementById(eid); if(el) el.textContent=val;}); renderRewardBank(); renderTeamsTab(); renderMini(); }
      function addTeam() { teams.push({id:uid(), name:teamNameInput.value.trim()||'New Team', color:teamColorInput.value||'#ffd166', stars:0}); teamNameInput.value=''; saveTeams(); render(); }
      function giveStar(id,src) { const t=teams.find(x=>x.id===id); if(!t) return; animateStar(t,src); setTimeout(()=>{ t.stars=(t.stars||0)+1; saveTeams(); updateCounters(id); },260); }
      function removeStar(id,src) { const t=teams.find(x=>x.id===id); if(!t||t.stars<=0) return; const r=src.getBoundingClientRect(); spawnParticles(r.left+r.width/2,r.top+r.height/2,'#fff',10); t.stars=Math.max(0,t.stars-1); saveTeams(); updateCounters(id); }
      function handle(e) { const b=e.target.closest('[data-score-action]'); if(!b) return; const a=b.dataset.scoreAction,id=b.dataset.id; if(a==='give') giveStar(id,b); else if(a==='remove') removeStar(id,b); else if(a==='delete'){ if(confirm('Delete this team?')){ teams=teams.filter(t=>t.id!==id); saveTeams(); render(); } } else if(a==='openTeams') setActiveApp('teamsApp'); }
      addTeamBtn.addEventListener('click',addTeam); teamNameInput.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); addTeam(); } }); teamsListEl.addEventListener('click',handle); scoreBoardEl.addEventListener('click',handle); miniScoreBody.addEventListener('click',handle);
      miniScoreToggle.addEventListener('click',()=>{ const ex=miniScoreboard.classList.toggle('expanded'); miniScoreToggle.setAttribute('aria-expanded',String(ex)); });
      resetBtn.addEventListener('click',()=>{ if(confirm('Reset all teams and stars?')){ teams=[]; saveTeams(); render(); } });
      exportBtn.addEventListener('click',()=>{ const blob=new Blob([JSON.stringify({version:APP_VERSION,date:APP_VERSION_DATE,teams},null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a'); a.href=url; a.download=`classroom-teams-starboard-${APP_VERSION}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); });
      aboutBtn.addEventListener('click',()=>{ aboutModal.classList.remove('hidden'); aboutModal.setAttribute('aria-hidden','false'); }); aboutCloseBtn.addEventListener('click',()=>{ aboutModal.classList.add('hidden'); aboutModal.setAttribute('aria-hidden','true'); }); aboutModal.addEventListener('click',e=>{ if(e.target===aboutModal){ aboutModal.classList.add('hidden'); aboutModal.setAttribute('aria-hidden','true'); } });
      const canvas=document.getElementById('scoreFxCanvas'),ctx=canvas.getContext('2d'); let W=0,H=0,DPR=window.devicePixelRatio||1; function resize(){DPR=window.devicePixelRatio||1; W=innerWidth; H=innerHeight; canvas.width=W*DPR; canvas.height=H*DPR; canvas.style.width=W+'px'; canvas.style.height=H+'px'; ctx.setTransform(DPR,0,0,DPR,0,0);} addEventListener('resize',resize); resize(); const particles=[],flying=[];
      const reducedMotionQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
      let reducedMotion = !!(reducedMotionQuery && reducedMotionQuery.matches);
      if(reducedMotionQuery) {
        const updateReducedMotion = e => { reducedMotion = !!e.matches; };
        if(typeof reducedMotionQuery.addEventListener === 'function') reducedMotionQuery.addEventListener('change', updateReducedMotion);
        else if(typeof reducedMotionQuery.addListener === 'function') reducedMotionQuery.addListener(updateReducedMotion);
      }
      const FX_LIMITS = {
        maxParticles: () => reducedMotion ? 80 : 260,
        maxFlying: () => reducedMotion ? 3 : 18,
        secondaryBusyThreshold: () => reducedMotion ? 40 : 180
      };
      function pushParticleSafely(p) { if(particles.length < FX_LIMITS.maxParticles()) particles.push(p); }
      function trimParticles() { const extra = particles.length - FX_LIMITS.maxParticles(); if(extra > 0) particles.splice(0, extra); }
      function drawStar(ctx,size){ ctx.beginPath(); ctx.moveTo(0,-size*.65); for(let i=0;i<5;i++){ctx.rotate(Math.PI/5);ctx.lineTo(0,-size);ctx.rotate(Math.PI/5);ctx.lineTo(0,-size*.42);} ctx.fill(); }
      class P{constructor(x,y,vx,vy,s,c,l,sp,type='star'){Object.assign(this,{x,y,vx,vy,size:s,color:c,life:l,age:0,spin:sp,type,rotation:Math.random()*Math.PI*2})}update(dt){this.age+=dt;this.vy+= (this.type==='spark'?400:800)*dt;this.vx*=0.98;this.vy*=0.98;this.x+=this.vx*dt;this.y+=this.vy*dt;this.rotation+=this.spin*dt}draw(){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rotation);const alpha=clamp(1-this.age/this.life,0,1);ctx.globalAlpha=alpha;ctx.fillStyle=this.color;if(this.type==='flash'){ctx.shadowColor=this.color;ctx.shadowBlur=20;ctx.beginPath();ctx.arc(0,0,Math.max(0, this.size*(1-this.age/this.life)),0,Math.PI*2);ctx.fill();}else if(this.type==='ring'){ctx.strokeStyle=this.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,Math.max(0, this.size*this.age*10),0,Math.PI*2);ctx.stroke();}else{ctx.shadowColor=this.color;ctx.shadowBlur=this.type==='star'?12:4;drawStar(ctx,this.size);}ctx.restore()}get dead(){return this.age>=this.life}}
      class F{constructor(x,y,tx,ty,c){Object.assign(this,{x,y,tx,ty,color:c,age:0,duration:.75+Math.random()*.25,size:18+Math.random()*8,rotation:Math.random()*Math.PI*2,spin:(Math.random()-.5)*9,startX:x,startY:y,wobble:Math.random()*Math.PI*2})}update(dt){this.age+=dt;const t=clamp(this.age/this.duration,0,1),e=1-Math.pow(1-t,3);this.x=this.startX+(this.tx-this.startX)*e+Math.sin(this.age*12+this.wobble)*10*(1-e);this.y=this.startY+(this.ty-this.startY)*e-Math.sin(Math.PI*t)*80;this.rotation+=this.spin*dt}draw(){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.rotation);ctx.fillStyle=this.color;ctx.shadowColor=this.color;ctx.shadowBlur=25;drawStar(ctx,this.size);ctx.restore()}get arrived(){return this.age>=this.duration}}

      const FIREWORK_STANDARD = {
        flashInner: 40,
        flashOuter: 60,
        ringSize: 15,
        mainBurstDensity: 40,
        mainBurstDensityHigh: 60,
        secondaryBursts: 3,
        secondaryDensity: 12
      };

      function spawnParticles(x,y,c,n=18){
        if(reducedMotion && particles.length >= FX_LIMITS.maxParticles()) return;

        const flashInner = reducedMotion ? Math.max(10, FIREWORK_STANDARD.flashInner * 0.45) : FIREWORK_STANDARD.flashInner;
        const flashOuter = reducedMotion ? Math.max(16, FIREWORK_STANDARD.flashOuter * 0.45) : FIREWORK_STANDARD.flashOuter;
        pushParticleSafely(new P(x,y,0,0,flashInner, '#ffffff', reducedMotion ? 0.18 : 0.3, 0, 'flash'));
        pushParticleSafely(new P(x,y,0,0,flashOuter, c, reducedMotion ? 0.22 : 0.4, 0, 'flash'));
        if(!reducedMotion) pushParticleSafely(new P(x,y,0,0,FIREWORK_STANDARD.ringSize, '#ffffff', 0.4, 0, 'ring'));

        const burstCount = reducedMotion ? Math.min(10, n) : (n > 20 ? FIREWORK_STANDARD.mainBurstDensityHigh : FIREWORK_STANDARD.mainBurstDensity);
        for(let i=0; i<burstCount; i++){
          const a = Math.random()*Math.PI*2;
          const s = (reducedMotion ? 120 : 200) + Math.random()*(reducedMotion ? 260 : 800);
          const size = (reducedMotion ? 5 : 8) + Math.random()*(reducedMotion ? 5 : 12);
          pushParticleSafely(new P(x,y,Math.cos(a)*s, Math.sin(a)*s*0.7 - (reducedMotion ? 90 : 200), size, c, (reducedMotion ? 0.45 : 0.8) + Math.random()*(reducedMotion ? 0.35 : 0.8), (Math.random()-0.5)*(reducedMotion ? 6 : 15), 'star'));
          if(!reducedMotion && i % 2 === 0) {
            pushParticleSafely(new P(x,y,Math.cos(a)*s*1.2, Math.sin(a)*s*0.8 - 250, 4 + Math.random()*4, '#ffffff', 0.5 + Math.random()*0.5, (Math.random()-0.5)*20, 'spark'));
          }
        }

        if(!reducedMotion && particles.length < FX_LIMITS.secondaryBusyThreshold()) {
          for(let j=0; j<FIREWORK_STANDARD.secondaryBursts; j++) {
            const delay = 100 + j*100;
            setTimeout(() => {
              if(particles.length >= FX_LIMITS.secondaryBusyThreshold()) return;
              const bx = x + (Math.random()-0.5)*100;
              const by = y + (Math.random()-0.5)*100;
              for(let k=0; k<FIREWORK_STANDARD.secondaryDensity; k++) {
                const a = Math.random()*Math.PI*2;
                const s = 100 + Math.random()*300;
                pushParticleSafely(new P(bx, by, Math.cos(a)*s, Math.sin(a)*s*0.7, 5, '#ffd166', 0.5, (Math.random()-0.5)*10, 'star'));
              }
              trimParticles();
            }, delay);
          }
        }
        trimParticles();
      }
      function animateStar(team,src){
        const s=src.getBoundingClientRect(),tEl=document.getElementById('miniCounter-'+team.id)||document.getElementById('scoreBig-'+team.id)||document.getElementById('scoreCounter-'+team.id),t=tEl?tEl.getBoundingClientRect():s;
        const desired = reducedMotion ? 1 : 3;
        const available = Math.max(0, FX_LIMITS.maxFlying() - flying.length);
        const count = Math.min(desired, available);
        for(let i=0;i<count;i++) flying.push(new F(s.left+s.width/2+(Math.random()-.5)*18,s.top+s.height/2+(Math.random()-.5)*12,t.left+t.width/2+(Math.random()-.5)*12,t.top+t.height/2+(Math.random()-.5)*8,team.color||'#ffd166'));
      }
      let last=performance.now(); function loop(now){const dt=Math.min(.032,(now-last)/1000);last=now;ctx.clearRect(0,0,W,H);for(let i=flying.length-1;i>=0;i--){let f=flying[i];f.update(dt);f.draw();if(f.arrived){spawnParticles(f.tx,f.ty,f.color,20);flying.splice(i,1);}}for(let i=particles.length-1;i>=0;i--){let p=particles[i];p.update(dt);p.draw();if(p.dead)particles.splice(i,1);}requestAnimationFrame(loop);} requestAnimationFrame(loop);
      loadTeams(); if(!teams.length){teams=[{id:uid(),name:'Blue Rockets',color:'#6ec1ff',stars:0},{id:uid(),name:'Sunflowers',color:'#ffd166',stars:0},{id:uid(),name:'Green Giants',color:'#7ee787',stars:0}]; saveTeams();} render();
    })();

    // --- Memory Game Logic ---

/* Futuristic Vocabulary Memory - polished UI + animations
   - Single-file app
   - Accessibility: keyboard, ARIA
   - Performance: CSS-driven animations, minimal DOM updates
*/

(() => {
  const fileInput = document.getElementById('fileInput');
  const pairsContainer = document.getElementById('pairsContainer');
  const startBtn = document.getElementById('startGame');
  const clearAllBtn = document.getElementById('clearAll');
  const shufflePairsBtn = document.getElementById('shufflePairs');
  const hintEl = document.getElementById('hint');
  const pairCountEl = document.getElementById('pairCount');

  // Memory Elements
  const memoryBoard = document.getElementById('memoryBoard');
  const gameGrid = document.getElementById('gameGrid');
  const exitMemoryBtn = document.getElementById('exitMemory');
  const resetMemoryBtn = document.getElementById('resetMemory');
  const revealAllBtn = document.getElementById('revealAll');
  const matchCountEl = document.getElementById('matchCount');
  const matchMovesEl = document.getElementById('matchMoves');
  const totalPairsEl = document.getElementById('totalPairs');
  const confettiCanvas = document.getElementById('confetti');

  // Casino Elements
  const startCasinoBtn = document.getElementById('startCasino');
  const startMatchingBtn = document.getElementById('startMatching');
  const matchingBoard = document.getElementById('matchingBoard');
  const matchingArena = document.getElementById('matchingArena');
  const matchingPictureField = document.getElementById('matchingPictureField');
  const matchingWordField = document.getElementById('matchingWordField');
  const matchingSvg = document.getElementById('matchingSvg');
  const matchingLivePath = document.getElementById('matchingLivePath');
  const matchingPreviewPath = document.getElementById('matchingPreviewPath');
  const matchingCompletedPaths = document.getElementById('matchingCompletedPaths');
  const matchingRoundEl = document.getElementById('matchingRound');
  const matchingProgressEl = document.getElementById('matchingProgress');
  const matchingAttemptsEl = document.getElementById('matchingAttempts');
  const matchingComboEl = document.getElementById('matchingCombo');
  const matchingToast = document.getElementById('matchingToast');
  const matchingCompleteOverlay = document.getElementById('matchingCompleteOverlay');
  const matchingCompleteTitle = document.getElementById('matchingCompleteTitle');
  const matchingCompleteText = document.getElementById('matchingCompleteText');
  const matchingSummary = document.getElementById('matchingSummary');
  const startScrambleBtn = document.getElementById('startScramble');
  const casinoBoard = document.getElementById('casinoBoard');
  const exitCasinoBtn = document.getElementById('exitCasino');
  const autoWashBtn = document.getElementById('autoWash');
  const reviewCardsBtn = document.getElementById('reviewCards');
  const casinoReviewOverlay = document.getElementById('casinoReviewOverlay');
  const closeReviewCardsBtn = document.getElementById('closeReviewCards');
  const casinoReviewBelt = document.getElementById('casinoReviewBelt');
  const casinoReviewTrack = document.getElementById('casinoReviewTrack');

  let pairs = []; // {id, imgData, vocab}
  let gameState = null; // {cards, flipped, matches, moves, startTime}

  // Configuration Constants
  const CONFIG = {
    CARD_GAP: 12,
    CONTAINER_PADDING: 24, // 12px on each side
    CARD_ASPECT_RATIO: 3/4,
    MAX_CARD_WIDTH: 200
  };

  // small helpers
  const uid = () => Math.random().toString(36).slice(2,9);
  const readFileAsDataURL = file => new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(fr.result);
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
  const shuffle = arr => {
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  };
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  // render pairs list
  function renderPairs(){
    pairsContainer.innerHTML = '';
    pairs.forEach((p, idx) => {
      const el = document.createElement('div');
      el.className = 'pair';

      const img = document.createElement('img');
      img.className = 'thumb';
      img.src = p.imgData;
      img.alt = `uploaded picture ${idx + 1}`;

      const input = document.createElement('input');
      input.type = 'text';
      input.setAttribute('aria-label', `Vocabulary for image ${idx + 1}`);
      input.placeholder = 'Type vocabulary';
      input.value = p.vocab || '';
      input.dataset.id = p.id;

      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove';
      removeBtn.type = 'button';
      removeBtn.setAttribute('aria-label', `Remove picture ${idx + 1}`);
      removeBtn.dataset.id = p.id;
      removeBtn.textContent = '✕';

      el.appendChild(img);
      el.appendChild(input);
      el.appendChild(removeBtn);
      pairsContainer.appendChild(el);
    });
    // wire events
    pairsContainer.querySelectorAll('input[type="text"]').forEach((inp, i, list) => {
      inp.addEventListener('input', e => {
        const id = e.target.dataset.id;
        const p = pairs.find(x=>x.id===id);
        if(p) p.vocab = e.target.value.trim();
        updateStartState();
      });
      inp.addEventListener('keydown', e => {
        if(e.key === 'Enter'){
          e.preventDefault();
          const inputs = Array.from(pairsContainer.querySelectorAll('input[type="text"]'));
          const idx = inputs.indexOf(e.target);
          if(idx >= 0 && idx < inputs.length-1) inputs[idx+1].focus();
        }
      });
    });
    pairsContainer.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.target.dataset.id;
        pairs = pairs.filter(x=>x.id!==id);
        renderPairs();
        updateStartState();
      });
    });
    pairCountEl.textContent = `Pairs ${pairs.length}`;
    totalPairsEl.textContent = pairs.length;
  }

  function updateStartState(){
    const readyCount = pairs.filter(p => p.vocab && p.vocab.length>0).length;
    startBtn.disabled = !(pairs.length>0 && readyCount === pairs.length);
    startCasinoBtn.disabled = !(pairs.length>0 && readyCount === pairs.length);
    startMatchingBtn.disabled = !(pairs.length>0 && readyCount === pairs.length);
    startScrambleBtn.disabled = false;
    if(document.getElementById('saveLessonBtn')) document.getElementById('saveLessonBtn').disabled = pairs.length === 0;
    hintEl.textContent = pairs.length ? 'Assign vocabulary to each image to enable Start' : 'Upload images and assign words to enable the game.';
  }

  // Handle incoming image files (from input, paste, or drop)
  async function handleFiles(fileList) {
    const files = Array.from(fileList || []).filter(f => f.type && f.type.startsWith('image/'));
    if(!files.length) return;
    const startIndex = pairs.length;
    let addedCount = 0;
    let failedCount = 0;
    for(const f of files){
      try {
        const data = await readFileAsDataURL(f);
        pairs.push({id:uid(), imgData:data, vocab:''});
        addedCount++;
      } catch(e) {
        failedCount++;
        console.warn('Skipped unreadable image file:', f && f.name ? f.name : '(unnamed file)', e);
      }
    }
    renderPairs();
    updateStartState();
    if(failedCount > 0) {
      hintEl.textContent = addedCount > 0
        ? `${addedCount} image${addedCount===1?'':'s'} added. ${failedCount} file${failedCount===1?'':'s'} could not be read and were skipped.`
        : `${failedCount} file${failedCount===1?'':'s'} could not be read. Please try different image files.`;
    }
    // subtle entrance animation for newly added items
    const children = Array.from(pairsContainer.children);
    for(let i = startIndex; i < children.length; i++) {
      const el = children[i];
      el.style.opacity = 0; el.style.transform = 'translateY(8px)';
      requestAnimationFrame(()=> {
        setTimeout(()=> { el.style.transition = 'all .36s cubic-bezier(.2,.9,.2,1)'; el.style.opacity=1; el.style.transform='translateY(0)'; }, (i - startIndex)*40);
      });
    }
  }


  // Global Toast
  function showMainToast(msg, type='success') {
    const toast = document.getElementById('mainToast');
    if(!toast) return;
    toast.textContent = msg;
    toast.className = 'main-toast show ' + type;
    setTimeout(() => toast.classList.remove('show'), 3500);
  }

  // Save Lesson Logic
  const saveLessonBtn = document.getElementById('saveLessonBtn');
  if(saveLessonBtn) {
    saveLessonBtn.addEventListener('click', () => {
      try {
        if(pairs.length === 0) throw new Error("No vocabulary pairs to save.");
        const exportData = {
          app: 'VocabSuite',
          version: APP_VERSION,
          exportDate: new Date().toISOString(),
          pairs: pairs,
          scrambleExtraWords: JSON.parse(localStorage.getItem('scramble_extra_words_v3') || '[]'),
          scrambleDifficulty: localStorage.getItem('scramble_diff_v2') || 'easy'
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `Vocab_Lesson_${dateStr}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        showMainToast('Lesson saved successfully! Check your downloads.', 'success');
      } catch (e) {
        console.error('Save failed:', e);
        showMainToast('Failed to save lesson: ' + e.message, 'error');
      }
    });
  }

  // Load Lesson Logic
  const loadLessonInput = document.getElementById('loadLessonInput');
  if(loadLessonInput) {
    loadLessonInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if(!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.app !== 'VocabSuite' || !Array.isArray(data.pairs)) {
          throw new Error("Invalid file format. Please upload a valid Vocab Suite .json file.");
        }

        const validPairs = data.pairs.filter(p => p.id && p.imgData);
        if (validPairs.length === 0) throw new Error("No valid vocabulary pairs found in file.");

        pairs = validPairs;
        renderPairs();
        updateStartState();
        resetGame();

        if (data.scrambleExtraWords) localStorage.setItem('scramble_extra_words_v3', JSON.stringify(data.scrambleExtraWords));
        if (data.scrambleDifficulty) localStorage.setItem('scramble_diff_v2', data.scrambleDifficulty);

        const lessonWords = pairs.map(p => (p.vocab || '').trim()).filter(Boolean);
        if(window._scrambleApp && typeof window._scrambleApp.setLessonWords === 'function') {
           window._scrambleApp.setLessonWords(lessonWords);
           if(typeof window._scrambleApp.reloadState === 'function') window._scrambleApp.reloadState();
        }

        showMainToast(`Lesson loaded successfully! (${pairs.length} items)`, 'success');
      } catch (err) {
        console.error('Load failed:', err);
        showMainToast('Error loading lesson: ' + err.message, 'error');
      } finally {
        loadLessonInput.value = '';
      }
    });
  }

  // file input
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
  });

  // Global paste event listener for Snipping Tool & clipboard
  document.addEventListener('paste', (e) => {
    if(document.getElementById('memoryApp').style.display === 'none') return;
    if(e.clipboardData && e.clipboardData.files && e.clipboardData.files.length > 0) {
      const hasImage = Array.from(e.clipboardData.files).some(f => f.type.startsWith('image/'));
      if(hasImage) {
        e.preventDefault(); // Prevent default if pasting an image
        handleFiles(e.clipboardData.files);
      }
    }
  });

  // Global drag & drop event listeners
  const leftPanel = document.querySelector('.top .panel');
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, e => { e.preventDefault(); e.stopPropagation(); }, false);
  });

  document.body.addEventListener('dragenter', (e) => {
    if(document.getElementById('memoryApp').style.display === 'none') return;
    if (e.dataTransfer.types.includes('Files')) leftPanel.classList.add('drag-over');
  });

  document.body.addEventListener('dragover', (e) => {
    if(document.getElementById('memoryApp').style.display === 'none') return;
    if (e.dataTransfer.types.includes('Files')) leftPanel.classList.add('drag-over');
  });

  document.body.addEventListener('dragleave', (e) => {
    if(document.getElementById('memoryApp').style.display === 'none') return;
    // Only remove if we are leaving the actual document body (or dragging to an external window)
    if(e.target === document.body || e.relatedTarget === null || e.relatedTarget === document.documentElement) {
      leftPanel.classList.remove('drag-over');
    }
  });

  document.body.addEventListener('drop', (e) => {
    if(document.getElementById('memoryApp').style.display === 'none') return;
    leftPanel.classList.remove('drag-over');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  });

  clearAllBtn.addEventListener('click', () => {
    if(!confirm('Clear all uploaded pictures and vocabulary?')) return;
    pairs = [];
    renderPairs();
    updateStartState();
    resetGame();
  });

  shufflePairsBtn.addEventListener('click', () => {
    pairs = shuffle(pairs);
    renderPairs();
  });

  startScrambleBtn.addEventListener('click', () => {
    const lessonWords = pairs.map(p => (p.vocab || '').trim()).filter(Boolean);
    if(window._scrambleApp && typeof window._scrambleApp.setLessonWords === 'function') window._scrambleApp.setLessonWords(lessonWords);
    openScrambleActivity();
  });

  // --- Play Memory Game Logic ---
  startBtn.addEventListener('click', () => {
    if(pairs.length === 0) return;

    memoryBoard.style.display = 'block';
    setActivityBarMode(true);

    const cards = [];
    pairs.forEach(p => {
      cards.push({pairId:p.id, kind:'image', content:p.imgData});
      cards.push({pairId:p.id, kind:'text', content:p.vocab});
    });

    const shuffled = shuffle(cards);
    gameState = {
      cards: shuffled.map((c,i) => ({...c, index:i, sequenceId: i + 1, matched:false})),
      flipped: [],
      matches: 0,
      moves: 0,
      startTime: Date.now(),
      locked: false // Prevent clicking during animation
    };

    matchCountEl.textContent = '0';
    matchMovesEl.textContent = '0';
    totalPairsEl.textContent = pairs.length;

    renderMemoryGame();
  });

  exitMemoryBtn.addEventListener('click', () => {
    memoryBoard.style.display = 'none';
    setActivityBarMode(false);
    resetGame();
  });

  // Encapsulated dynamic sizing logic
  function adjustGridScale() {
    if (!gameState) return;

    const total = gameState.cards.length;
    const cols = Math.ceil(Math.sqrt(total));
    const rows = Math.ceil(total / cols);

    const containerWidth = gameGrid.parentElement.clientWidth - CONFIG.CONTAINER_PADDING;
    const containerHeight = gameGrid.parentElement.clientHeight - CONFIG.CONTAINER_PADDING;

    const maxCardWidthHoriz = (containerWidth - (cols - 1) * CONFIG.CARD_GAP) / cols;
    const maxCardHeightVert = (containerHeight - (rows - 1) * CONFIG.CARD_GAP) / rows;

    const optimalCardWidth = Math.min(maxCardWidthHoriz, maxCardHeightVert * CONFIG.CARD_ASPECT_RATIO, CONFIG.MAX_CARD_WIDTH);
    const optimalCardHeight = optimalCardWidth / CONFIG.CARD_ASPECT_RATIO;

    const allCards = gameGrid.querySelectorAll('.m-card');
    allCards.forEach(card => {
      card.style.width = `${optimalCardWidth}px`;
      card.style.height = `${optimalCardHeight}px`;
    });
  }

  // Handle window resize with requestAnimationFrame for performance
  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (memoryBoard.style.display !== 'block') return;
    if (!resizeTicking) {
      window.requestAnimationFrame(() => {
        adjustGridScale();
        resizeTicking = false;
      });
      resizeTicking = true;
    }
  });

  // render game grid with dynamic sizing
  function renderMemoryGame(){
    gameGrid.innerHTML = '';
    if(!gameState) return;

    const total = gameState.cards.length;
    const cols = Math.ceil(Math.sqrt(total));
    gameGrid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

    gameState.cards.forEach((card, idx) => {
      const c = document.createElement('div');
      c.className = 'm-card';
      c.dataset.index = idx;
      c.setAttribute('aria-label', `Card number ${card.sequenceId}`);

      const contentHtml = card.kind === 'image'
        ? `<img src="${card.content}" alt="vocabulary image">`
        : `<div class="word">${escapeHtml(card.content)}</div>`;

      c.innerHTML = `
        <div class="m-card-inner">
          <div class="m-face m-back" data-seq="${card.sequenceId}">
            <div class="m-back-number">${card.sequenceId}</div>
            <div class="m-back-corner-bottom">${card.sequenceId}</div>
          </div>
          <div class="m-face m-front ${card.kind === 'text' ? 'text-only' : ''}">
            ${contentHtml}
          </div>
        </div>
      `;

      // small staggered entrance
      c.style.opacity = 0; c.style.transform = 'translateY(20px) scale(.9)';
      setTimeout(()=> {
        c.style.transition = 'all .4s cubic-bezier(.2,.9,.2,1)';
        c.style.opacity = 1;
        c.style.transform = 'none';
        setTimeout(() => c.style.transition = '', 400);
      }, idx * 40);

      // click events
      c.addEventListener('click', onMemoryCardClick);

      gameGrid.appendChild(c);
    });

    // Re-calculate after DOM is populated
    setTimeout(() => {
      adjustGridScale();
    }, 50);
  }

  function onMemoryCardClick(e){
    if(!gameState || gameState.locked) return;

    const cardEl = e.currentTarget;
    const idx = Number(cardEl.dataset.index);
    const card = gameState.cards[idx];

    if(card.matched || gameState.flipped.includes(idx)) return;

    // Flip card
    cardEl.classList.add('flipped');
    gameState.flipped.push(idx);

    if(gameState.flipped.length === 2){
      gameState.locked = true; // Lock board
      gameState.moves++;
      matchMovesEl.textContent = gameState.moves;

      const [aIdx,bIdx] = gameState.flipped;
      const a = gameState.cards[aIdx];
      const b = gameState.cards[bIdx];

      if(a.pairId === b.pairId && a.kind !== b.kind){
        // Match!
        a.matched = b.matched = true;
        gameState.matches++;
        matchCountEl.textContent = gameState.matches;

        const els = Array.from(gameGrid.children);
        [aIdx,bIdx].forEach(i => {
          const el = els[i];
          if(el) {
            el.classList.add('matched');
            // Ensure they stay flipped
            el.classList.add('flipped');
          }
        });

        gameState.flipped = [];
        gameState.locked = false;

        if(gameState.matches === pairs.length){
          celebrate();
        }
      } else {
        // No match - flip back
        setTimeout(() => {
          const els = Array.from(gameGrid.children);
          [aIdx,bIdx].forEach(i => {
            const el = els[i];
            if(el) el.classList.remove('flipped');
          });
          gameState.flipped = [];
          gameState.locked = false;
        }, 1200); // Give them time to read both cards
      }
    }
  }

  resetMemoryBtn.addEventListener('click', () => {
    if(!gameState) return;
    if(!confirm('Restart this memory game?')) return;
    startBtn.click(); // Re-trigger start logic
  });

  revealAllBtn.addEventListener('click', () => {
    if(!gameState) return;
    const els = Array.from(gameGrid.children);
    els.forEach(el => el.classList.add('flipped'));

    gameState.locked = true;

    setTimeout(() => {
      els.forEach((el, i) => {
        if(!gameState.cards[i].matched) el.classList.remove('flipped');
      });
      gameState.locked = false;
      gameState.flipped = []; // reset any half-flipped state
    }, 2000);
  });

  function resetGame(){
    gameState = null;
    gameGrid.innerHTML = '';
    matchCountEl.textContent = '0';
    matchMovesEl.textContent = '0';
  }


  // --- Synapse Match Logic: Unified Continuous Path Render Loop ---
  let matchingState=null;
  const MATCHING_PAIRS_PER_ROUND=4;
  const matchingPermanentSvg=document.getElementById('matchingPermanentSvg');
  const matchingTransientSvg=document.getElementById('matchingTransientSvg');
  const matchingHintPath=document.getElementById('matchingHintPath');
  const matchingDragPath=document.getElementById('matchingDragPath');
  const synGesture={pointerId:null,wordId:null,startX:0,startY:0,x:0,y:0,dragging:false,target:null};
  let synSuppressClickUntil=0,synRenderLoopRaf=0;
  const synShuffle=list=>shuffle(list);
  function synRoundSizes(total){
    if(total<=0)return[];
    if(total<=4)return[total];
    if(total===5)return[3,2];
    const rounds=Math.ceil(total/4),threes=4*rounds-total,fours=rounds-threes;
    return[...Array(fours).fill(4),...Array(threes).fill(3)];
  }
  function synRounds(source){const copy=synShuffle(source),out=[];let offset=0;synRoundSizes(copy.length).forEach(size=>{out.push(copy.slice(offset,offset+size));offset+=size});return out}
  function synAnchorClient(el,side){const r=el.getBoundingClientRect();return{x:side==='right'?r.right:r.left,y:r.top+r.height/2}}
  function synPath(a,b){
    if(!a||!b)return'';
    const bend=Math.max(70,Math.abs(b.x-a.x)*.42);
    const y2=Math.abs(a.y-b.y)<4?b.y+4:b.y;
    return`M ${a.x} ${a.y} C ${a.x+bend} ${a.y}, ${b.x-bend} ${y2}, ${b.x} ${y2}`;
  }
  function synValidPoint(p){return!!p&&Number.isFinite(p.x)&&Number.isFinite(p.y)}
  function synGetNode(kind,id){return matchingBoard.querySelector(`.syn-${kind}[data-pair-id="${CSS.escape(id)}"]`)}
  function synNode(kind,pair,index){
    const node=document.createElement('button');node.type='button';node.className=`syn-node syn-${kind}`;node.dataset.pairId=pair.id;node.dataset.kind=kind;
    node.setAttribute('aria-label',kind==='word'?`Vocabulary ${pair.vocab}`:`Picture ${index+1}`);
    if(kind==='picture'){const img=document.createElement('img');img.src=pair.imgData;img.alt=`Vocabulary picture ${index+1}`;img.draggable=false;node.appendChild(img)}else node.appendChild(document.createTextNode(pair.vocab));
    const anchor=document.createElement('span');anchor.className='syn-anchor';node.appendChild(anchor);
    if(matchingState&&matchingState.completed.has(pair.id))node.classList.add('correct','resolved');
    return node;
  }
  function synClearSelection(){matchingBoard.querySelectorAll('.syn-node.selected').forEach(n=>n.classList.remove('selected'));if(matchingState)matchingState.selectedWordId=null}
  function synHud(){if(!matchingState)return;const total=matchingState.activePairs.length;matchingRoundEl.textContent=`Round ${matchingState.roundIndex+1} / ${matchingState.rounds.length}`;matchingProgressEl.textContent=`Matches ${matchingState.completed.size} / ${total}`;matchingAttemptsEl.textContent=`Attempts ${matchingState.attempts}`;matchingComboEl.textContent=`Combo ×${Math.max(1,matchingState.combo)}`}
  function synToast(msg,type='good'){matchingToast.textContent=msg;matchingToast.className=`syn-toast ${type} show`;clearTimeout(synToast.timer);synToast.timer=setTimeout(()=>matchingToast.classList.remove('show'),850)}
  function synPermanentPath(id){return Array.from(matchingCompletedPaths.children).find(p=>p.dataset.pairId===id)||null}

  function synRenderLoop() {
    if(!matchingState || matchingBoard.style.display!=='block') return;
    matchingState.completed.forEach(id => {
      const word = synGetNode('word', id), picture = synGetNode('picture', id);
      if(word && picture && word.getClientRects().length && picture.getClientRects().length) {
        const a = synAnchorClient(picture, 'right'), b = synAnchorClient(word, 'left');
        let path = synPermanentPath(id);
        if(!path) {
          path = document.createElementNS('http://www.w3.org/2000/svg','path');
          path.setAttribute('class','syn-path syn-complete-path');
          path.dataset.pairId = id;
          matchingCompletedPaths.appendChild(path);
        }
        path.setAttribute('d', synPath(a, b));
        path.hidden = false;
      }
    });
    Array.from(matchingCompletedPaths.children).forEach(p => {
      if(!matchingState.completed.has(p.dataset.pairId)) p.remove();
    });

    let dragD = '';
    if(synGesture.dragging && synGesture.wordId) {
      const word = synGetNode('word', synGesture.wordId);
      if(word && word.getClientRects().length) {
        const anchor = synAnchorClient(word, 'left');
        dragD = synPath({x: synGesture.x, y: synGesture.y}, anchor);
      }
    }
    if(dragD) { matchingDragPath.setAttribute('d', dragD); matchingDragPath.hidden = false; }
    else { matchingDragPath.hidden = true; matchingDragPath.removeAttribute('d'); }

    let hintD = '';
    if(matchingState.hintWordId && performance.now() < matchingState.hintExpires) {
      const word = synGetNode('word', matchingState.hintWordId), picture = synGetNode('picture', matchingState.hintWordId);
      if(word && picture && word.getClientRects().length && picture.getClientRects().length) {
        hintD = synPath(synAnchorClient(picture, 'right'), synAnchorClient(word, 'left'));
      }
    } else if(matchingState.hintWordId) {
      matchingState.hintWordId = null;
      matchingBoard.querySelectorAll('.syn-node.magnetic').forEach(n => n.classList.remove('magnetic'));
    }
    if(hintD) { matchingHintPath.setAttribute('d', hintD); matchingHintPath.hidden = false; }
    else { matchingHintPath.hidden = true; matchingHintPath.removeAttribute('d'); }

    synRenderLoopRaf = requestAnimationFrame(synRenderLoop);
  }

  function synRenderRound(){
    synGesture.dragging=false; synGesture.wordId=null; synClearSelection();
    matchingCompletedPaths.replaceChildren(); matchingPictureField.replaceChildren(); matchingWordField.replaceChildren();
    const active=matchingState.activePairs; matchingPictureField.style.setProperty('--syn-count',active.length); matchingWordField.style.setProperty('--syn-count',active.length);
    synShuffle(active).forEach((p,i)=>matchingPictureField.appendChild(synNode('picture',p,i)));
    synShuffle(active).forEach((p,i)=>matchingWordField.appendChild(synNode('word',p,i)));
    synHud();
  }
  function synStartRound(index){matchingState.roundIndex=index;matchingState.activePairs=matchingState.rounds[index];matchingState.completed=new Set();matchingState.selectedWordId=null;matchingState.combo=0;matchingState.roundAttempts=0;matchingState.locked=false;matchingState.hintWordId=null;synHideComplete();synRenderRound()}
  function synStartGame(source=pairs){if(!source.length)return;matchingState={rounds:synRounds(source),roundIndex:0,activePairs:[],completed:new Set(),selectedWordId:null,attempts:0,roundAttempts:0,combo:0,bestCombo:0,missedIds:new Set(),locked:false,startedAt:performance.now(),hintWordId:null,hintExpires:0};matchingBoard.style.display='block';setActivityBarMode(true);synStartRound(0);cancelAnimationFrame(synRenderLoopRaf);synRenderLoopRaf=requestAnimationFrame(synRenderLoop);}
  function synSelectWord(node){if(!node||!matchingState||matchingState.locked||matchingState.completed.has(node.dataset.pairId))return;synClearSelection();matchingState.selectedWordId=node.dataset.pairId;node.classList.add('selected')}
  function synCommitCorrect(wordId){
    if(!matchingState||matchingState.completed.has(wordId))return;
    matchingState.completed.add(wordId);matchingState.combo++;matchingState.bestCombo=Math.max(matchingState.bestCombo,matchingState.combo);
    const word=synGetNode('word',wordId), picture=synGetNode('picture',wordId);
    if(word)word.classList.add('correct','resolved'); if(picture)picture.classList.add('correct','resolved');
    synClearSelection();synToast('CONNECTED','good');synHud();
    setTimeout(()=>{if(!matchingState)return;matchingState.locked=false;if(matchingState.completed.size===matchingState.activePairs.length)synCompleteRound()},520);
  }
  function synResolveAttempt(wordId,pictureId){
    if(!matchingState||matchingState.locked||!wordId)return;matchingState.attempts++;matchingState.roundAttempts++;
    const word=synGetNode('word',wordId),picture=synGetNode('picture',pictureId);
    if(wordId===pictureId){matchingState.locked=true;synCommitCorrect(wordId)}else{matchingState.combo=0;matchingState.missedIds.add(wordId);matchingState.missedIds.add(pictureId);word?.classList.add('wrong');picture?.classList.add('wrong');synToast('SIGNAL MISSED','bad');synClearSelection();setTimeout(()=>{word?.classList.remove('wrong');picture?.classList.remove('wrong')},440);synHud()}
  }
  function synShowComplete(final=false,review=false){const elapsed=Math.max(1,Math.round((performance.now()-matchingState.startedAt)/1000));matchingCompleteTitle.textContent=review?'Reinforcement Connected':final?'Network Complete':'Round Connected';matchingCompleteText.textContent=final?`${pairs.length} vocabulary connections established.`:`${matchingState.activePairs.length} synapses completed.`;matchingSummary.replaceChildren();[[`${matchingState.attempts} attempts`,'🎯'],[`Best combo ×${Math.max(1,matchingState.bestCombo)}`,'⚡'],[`${elapsed}s elapsed`,'⏱️']].forEach(([label,icon])=>{const s=document.createElement('span');s.textContent=`${icon} ${label}`;matchingSummary.appendChild(s)});document.getElementById('matchingContinue').style.display=final?'none':'inline-flex';document.getElementById('matchingReview').style.display=matchingState.missedIds.size?'inline-flex':'none';document.getElementById('matchingPlayAgain').style.display=final?'inline-flex':'none';matchingCompleteOverlay.classList.remove('hidden');matchingCompleteOverlay.setAttribute('aria-hidden','false')}
  function synHideComplete(){matchingCompleteOverlay.classList.add('hidden');matchingCompleteOverlay.setAttribute('aria-hidden','true')}
  function synCompleteRound(){synShowComplete(matchingState.roundIndex===matchingState.rounds.length-1,false)}
  function synRestartRound(){if(matchingState)synStartRound(matchingState.roundIndex)}
  function synShuffleLayout(){if(!matchingState)return;synRenderRound();synToast('LAYOUT SHIFTED','good')}
  function synHint(){
    if(!matchingState)return;if(!matchingState.selectedWordId){synToast('SELECT A WORD FIRST','bad');return}
    const id=matchingState.selectedWordId;if(matchingState.completed.has(id)){synToast('SELECT AN UNMATCHED WORD','bad');return}
    matchingState.hintWordId=id; matchingState.hintExpires=performance.now()+900;
    const picture=synGetNode('picture',id); if(picture)picture.classList.add('magnetic');
  }
  function synExit(){synGesture.dragging=false;synGesture.wordId=null;if(matchingState)matchingState.hintWordId=null;matchingBoard.style.display='none';setActivityBarMode(false);matchingState=null;matchingCompletedPaths.replaceChildren();cancelAnimationFrame(synRenderLoopRaf);}
  function synNearestPicture(clientX,clientY){let nearest=null,best=90;matchingPictureField.querySelectorAll('.syn-picture:not(.resolved)').forEach(node=>{const r=node.getBoundingClientRect(),d=Math.hypot(clientX-(r.left+r.width/2),clientY-(r.top+r.height/2));node.classList.remove('magnetic');if(d<best){best=d;nearest=node}});if(nearest)nearest.classList.add('magnetic');return nearest}
  startMatchingBtn.addEventListener('click',()=>synStartGame());document.getElementById('exitMatching').addEventListener('click',synExit);document.getElementById('restartMatching').addEventListener('click',synRestartRound);document.getElementById('shuffleMatching').addEventListener('click',synShuffleLayout);document.getElementById('hintMatching').addEventListener('click',synHint);document.getElementById('matchingContinue').addEventListener('click',()=>synStartRound(matchingState.roundIndex+1));document.getElementById('matchingPlayAgain').addEventListener('click',()=>synStartGame(pairs));document.getElementById('matchingExitComplete').addEventListener('click',synExit);document.getElementById('matchingReview').addEventListener('click',()=>{const missed=pairs.filter(p=>matchingState.missedIds.has(p.id));if(missed.length)synStartGame(missed)});
  matchingBoard.addEventListener('click',e=>{if(performance.now()<synSuppressClickUntil)return;const node=e.target.closest('.syn-node');if(!node||node.classList.contains('resolved'))return;if(node.dataset.kind==='word')synSelectWord(node);else if(node.dataset.kind==='picture'&&matchingState?.selectedWordId)synResolveAttempt(matchingState.selectedWordId,node.dataset.pairId)});
  matchingBoard.addEventListener('pointerdown',e=>{const word=e.target.closest('.syn-word:not(.resolved)');if(!word||matchingState?.locked)return;synGesture.pointerId=e.pointerId;synGesture.wordId=word.dataset.pairId;synGesture.startX=synGesture.x=e.clientX;synGesture.startY=synGesture.y=e.clientY;synGesture.dragging=false;synGesture.target=null;word.setPointerCapture?.(e.pointerId)});
  matchingBoard.addEventListener('pointermove',e=>{if(synGesture.pointerId!==e.pointerId)return;synGesture.x=e.clientX;synGesture.y=e.clientY;if(!synGesture.dragging&&Math.hypot(e.clientX-synGesture.startX,e.clientY-synGesture.startY)>=8){synGesture.dragging=true;synSelectWord(synGetNode('word',synGesture.wordId))}if(synGesture.dragging){synGesture.target=synNearestPicture(synGesture.x,synGesture.y)}});
  function synEndPointer(e,cancelled=false){if(synGesture.pointerId!==e.pointerId)return;const wasDragging=synGesture.dragging,wordId=synGesture.wordId,target=synGesture.target||document.elementFromPoint(e.clientX,e.clientY)?.closest('.syn-picture:not(.resolved)');synGesture.pointerId=null;synGesture.wordId=null;synGesture.dragging=false;synGesture.target=null;if(wasDragging){synSuppressClickUntil=performance.now()+500;if(!cancelled&&target)synResolveAttempt(wordId,target.dataset.pairId);else if(!cancelled)synClearSelection()}}
  matchingBoard.addEventListener('pointerup',e=>synEndPointer(e,false));matchingBoard.addEventListener('pointercancel',e=>synEndPointer(e,true));
  window.addEventListener('blur',()=>{synGesture.dragging=false;synGesture.wordId=null;});
  document.addEventListener('keydown',e=>{if(matchingBoard.style.display!=='block')return;if(e.key==='Escape'){if(matchingState?.selectedWordId){synClearSelection()}else synExit()}if(e.key==='Enter'){const node=document.activeElement?.closest?.('.syn-node');if(node){e.preventDefault();node.click()}}});

  // --- Casino Shuffle Logic ---
  let casinoMaxZ = 100;
  let draggedCard = null;
  let dragStartX = 0, dragStartY = 0;
  let cardInitLeft = 0, cardInitTop = 0;
  let dragHasMoved = false;

  startCasinoBtn.addEventListener('click', () => {
    if(pairs.length === 0) return;

    // Setup Board
    casinoBoard.style.display = 'block';
    setActivityBarMode(true);

    // Clear old cards, keep controls
    Array.from(casinoBoard.children).forEach(child => {
      if(!child.classList.contains('casino-controls') && !child.classList.contains('casino-review-overlay')) child.remove();
    });

    // Layout math (center a grid of cards)
    const cardW = 220, cardH = 310, gap = 40;
    const cols = Math.ceil(Math.sqrt(pairs.length));
    const rows = Math.ceil(pairs.length / cols);
    const startX = (window.innerWidth - (cols * cardW + (cols - 1) * gap)) / 2;
    const barH = 68;
    const usableH = window.innerHeight - barH;
    const startY = barH + (usableH - (rows * cardH + (rows - 1) * gap)) / 2;

    pairs.forEach((p, i) => {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const x = startX + col * (cardW + gap);
      const y = startY + row * (cardH + gap);

      const card = document.createElement('div');
      card.className = 'c-card';
      card.dataset.state = 'initial'; // initial (face up)
      card.style.left = `${Math.max(20, x)}px`;
      card.style.top = `${Math.max(88, y)}px`;
      card.style.zIndex = ++casinoMaxZ;

      card.innerHTML = `
        <div class="c-card-inner">
          <div class="c-face c-front">
            <img src="${p.imgData}" draggable="false" />
            <div class="vocab">${escapeHtml(p.vocab)}</div>
          </div>
          <div class="c-face c-back"></div>
        </div>
      `;

      // Entrance animation
      card.style.opacity = 0;
      card.style.transform = 'translateY(20px) scale(0.9)';
      setTimeout(() => {
        card.style.transition = 'all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
        card.style.opacity = 1;
        card.style.transform = 'none';
        // Remove transition after entrance to avoid drag lag, CSS hover handles the rest
        setTimeout(() => card.style.transition = '', 500);
      }, i * 60);

      casinoBoard.appendChild(card);
    });
  });


  // Casino Review Belt
  function renderCasinoReviewBelt(){ casinoReviewTrack.innerHTML=''; if(!pairs.length){const empty=document.createElement('div');empty.className='casino-review-empty';empty.textContent='No review cards available.';casinoReviewTrack.appendChild(empty);return;} pairs.forEach((p,idx)=>{const card=document.createElement('div');card.className='review-card';card.innerHTML=`<img src="${p.imgData}" alt="Review picture ${idx+1}" draggable="false"/><div class="review-vocab">${escapeHtml(p.vocab||'')}</div>`;casinoReviewTrack.appendChild(card);}); casinoReviewBelt.scrollLeft=0; }
  function openCasinoReview(){renderCasinoReviewBelt();casinoReviewOverlay.classList.remove('hidden');casinoReviewOverlay.setAttribute('aria-hidden','false');setTimeout(()=>casinoReviewBelt.focus({preventScroll:true}),0)}
  function closeCasinoReview(){casinoReviewOverlay.classList.add('hidden');casinoReviewOverlay.setAttribute('aria-hidden','true');casinoReviewBelt.classList.remove('dragging')}
  reviewCardsBtn.addEventListener('click',openCasinoReview); closeReviewCardsBtn.addEventListener('click',closeCasinoReview); casinoReviewOverlay.addEventListener('click',e=>{if(e.target===casinoReviewOverlay)closeCasinoReview()});
  let reviewDragActive=false,reviewDragStartX=0,reviewScrollStart=0; casinoReviewBelt.addEventListener('pointerdown',e=>{reviewDragActive=true;reviewDragStartX=e.clientX;reviewScrollStart=casinoReviewBelt.scrollLeft;casinoReviewBelt.classList.add('dragging');casinoReviewBelt.setPointerCapture(e.pointerId)}); casinoReviewBelt.addEventListener('pointermove',e=>{if(!reviewDragActive)return;const dx=e.clientX-reviewDragStartX;if(Math.abs(dx)>4){e.preventDefault();casinoReviewBelt.scrollLeft=reviewScrollStart-dx}}); casinoReviewBelt.addEventListener('pointerup',e=>{if(!reviewDragActive)return;reviewDragActive=false;casinoReviewBelt.classList.remove('dragging');casinoReviewBelt.releasePointerCapture(e.pointerId)}); casinoReviewBelt.addEventListener('pointercancel',()=>{reviewDragActive=false;casinoReviewBelt.classList.remove('dragging')});

  exitCasinoBtn.addEventListener('click', () => {
    closeCasinoReview();
    casinoBoard.style.display = 'none';
    setActivityBarMode(false);
  });

  // Drag & Drop Physics (Pointer Events for Mouse/Touch)
  casinoBoard.addEventListener('pointerdown', e => {
    const card = e.target.closest('.c-card');
    if(!card) return;
    if(e.button !== 0 && e.type.startsWith('mouse')) return; // Left click only

    draggedCard = card;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    cardInitLeft = parseFloat(card.style.left) || 0;
    cardInitTop = parseFloat(card.style.top) || 0;
    dragHasMoved = false;

    card.style.zIndex = ++casinoMaxZ;
    card.setPointerCapture(e.pointerId);
  });

  casinoBoard.addEventListener('pointermove', e => {
    if(!draggedCard) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    // Threshold to distinguish click from drag
    if(!dragHasMoved && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
      dragHasMoved = true;
      draggedCard.classList.add('dragging');
    }

    if(dragHasMoved) {
      let newX = cardInitLeft + dx;
      let newY = cardInitTop + dy;

      // Keep mostly within screen bounds
      newX = Math.max(-100, Math.min(newX, window.innerWidth - 120));
      newY = Math.max(68, Math.min(newY, window.innerHeight - 200));

      draggedCard.style.left = `${newX}px`;
      draggedCard.style.top = `${newY}px`;

      // Velocity rotation for physical feel
      const rot = Math.max(-25, Math.min(25, dx * 0.15));
      draggedCard.style.transform = `rotate(${rot}deg)`;
    }
  });

  casinoBoard.addEventListener('pointerup', e => {
    if(!draggedCard) return;

    if(dragHasMoved) {
      draggedCard.classList.remove('dragging');
      // Intentionally leave the slight rotation! Adds to the messy "shuffled" feel.
    } else {
      // It was a click!
      handleCasinoClick(draggedCard);
    }

    draggedCard.releasePointerCapture(e.pointerId);
    draggedCard = null;
  });

  function handleCasinoClick(card) {
    const state = card.dataset.state;

    if(state === 'initial') {
      // Flip face down
      card.dataset.state = 'flipped';
    }
    else if(state === 'flipped') {
      // Unfocus others
      document.querySelectorAll('.c-card[data-state="focused"]').forEach(c => {
        c.dataset.state = 'flipped';
      });
      // Focus this one
      card.dataset.state = 'focused';
      card.style.zIndex = ++casinoMaxZ;
    }
    else if(state === 'focused') {
      // Tada!
      card.dataset.state = 'revealed';
      card.style.zIndex = ++casinoMaxZ;
      celebrate();
    }
    else if(state === 'revealed') {
      // Reset back to flipped so they can play more
      card.dataset.state = 'flipped';
    }
  }

  // Auto-Wash (Scramble)
  autoWashBtn.addEventListener('click', () => {
    const cards = document.querySelectorAll('.c-card');
    cards.forEach(card => {
      card.classList.add('auto-washing');

      const newX = Math.random() * (window.innerWidth - 250) + 20;
      const newY = Math.random() * Math.max(80, (window.innerHeight - 420)) + 88;
      const rot = (Math.random() - 0.5) * 80; // -40 to 40 deg

      card.style.left = `${newX}px`;
      card.style.top = `${newY}px`;
      card.style.transform = `rotate(${rot}deg)`;
      card.style.zIndex = ++casinoMaxZ;

      setTimeout(() => {
        card.classList.remove('auto-washing');
      }, 850);
    });
  });

  // celebration confetti (lightweight)
  function celebrate(){
    try {
      confettiCanvas.style.display = 'block';
      const ctx = confettiCanvas.getContext('2d');
      const DPR = window.devicePixelRatio || 1;
      confettiCanvas.width = window.innerWidth * DPR;
      confettiCanvas.height = window.innerHeight * DPR;
      confettiCanvas.style.width = window.innerWidth + 'px';
      confettiCanvas.style.height = window.innerHeight + 'px';
      ctx.scale(DPR, DPR);

      const pieces = [];
      const colors = ['#0066cc','#004499','#ffaa00','#00aa55'];
      const reducedCelebration = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const confettiCount = reducedCelebration ? 20 : 80;
      for(let i=0;i<confettiCount;i++){
        pieces.push({
          x: Math.random()*window.innerWidth,
          y: Math.random()*-window.innerHeight,
          vx: (Math.random()-0.5)*3,
          vy: Math.random()*4+2,
          size: Math.random()*8+4,
          color: colors[Math.floor(Math.random()*colors.length)],
          rot: Math.random()*360,
          vr: (Math.random()-0.5)*8
        });
      }
      let t0 = null;
      function frame(t){
        if(!t0) t0 = t;
        const dt = (t - t0)/1000;
        t0 = t;
        ctx.clearRect(0,0,window.innerWidth,window.innerHeight);
        pieces.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.06;
          p.rot += p.vr;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot * Math.PI/180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size*0.6);
          ctx.restore();
        });
        // stop after 3.2s
        if(performance.now() - startTime < (reducedCelebration ? 1400 : 3200)) requestAnimationFrame(frame);
        else { ctx.clearRect(0,0,window.innerWidth,window.innerHeight); confettiCanvas.style.display='none'; }
      }
      const startTime = performance.now();
      requestAnimationFrame(frame);
    } catch(e){
      // silent fail if canvas not supported
      confettiCanvas.style.display = 'none';
    }
  }

  // initial render
  renderPairs();
  updateStartState();

  // expose for debugging (optional)
  window._vocabApp = { pairs, renderPairs, resetGame };
})();


    // --- Scramble Game Logic ---
    (() => {

    // Scramble words are synced from Memory setup vocabulary plus optional Scramble-only extra words.
    const EXTRA_WORDS_KEY='scramble_extra_words_v3', DIFF_KEY='scramble_diff_v2';
    let syncedWords=[], extraWords=[], words=[], currentDifficulty='easy', index=0, currentScramble='', autoPlay=false, autoTimer=null, tempWords=[], tempDifficulty='easy';
    const scrambledText=document.getElementById('scrambledText'), answerText=document.getElementById('answerText'), showBtn=document.getElementById('showBtn'), nextBtn=document.getElementById('nextBtn'), prevBtn=document.getElementById('prevBtn'), shuffleBtn=document.getElementById('shuffleBtn'), autoBtn=document.getElementById('autoBtn'), countLabel=document.getElementById('countLabel'), cardEl=document.getElementById('card'), difficultyHint=document.getElementById('difficultyHint'), exitScrambleBtn=document.getElementById('exitScramble');
    const teacherBtn=document.getElementById('teacherBtn'), teacherModal=document.getElementById('teacherModal'), closeTeacherBtn=document.getElementById('closeTeacherBtn'), saveTeacherBtn=document.getElementById('saveTeacherBtn'), resetDefaultsBtn=document.getElementById('resetDefaultsBtn'), wordListEl=document.getElementById('wordList'), newWordInput=document.getElementById('newWordInput'), addWordBtn=document.getElementById('addWordBtn'), wordCountEl=document.getElementById('wordCount'), difficultyRadios=document.querySelectorAll('input[name="difficulty"]'), toastEl=document.getElementById('toast'), scrambleBarLeft=document.getElementById('scrambleBarLeft');
    exitScrambleBtn.className='scramble-exit-btn activity-bar-button'; shuffleBtn.className='btn activity-bar-button'; autoBtn.className='btn activity-bar-button';
    scrambleBarLeft.appendChild(exitScrambleBtn); scrambleBarLeft.appendChild(shuffleBtn); scrambleBarLeft.appendChild(autoBtn);
    function uniqueWords(list){const seen=new Set(), out=[]; list.map(w=>String(w||'').trim()).filter(Boolean).forEach(w=>{const k=w.toLocaleLowerCase(); if(!seen.has(k)){seen.add(k);out.push(w)}}); return out}
    function rebuildWords(){words=uniqueWords([...syncedWords,...extraWords]); if(index>=words.length)index=0}
    function loadState(){try{extraWords=JSON.parse(localStorage.getItem(EXTRA_WORDS_KEY)||'[]'); if(!Array.isArray(extraWords))extraWords=[]}catch(e){extraWords=[]} const d=localStorage.getItem(DIFF_KEY); currentDifficulty=['easy','medium','hard'].includes(d)?d:'easy'; rebuildWords()}
    function saveState(newWords,newDiff){const syncedKeys=new Set(syncedWords.map(w=>w.toLocaleLowerCase())); words=uniqueWords(newWords); extraWords=uniqueWords(words.filter(w=>!syncedKeys.has(w.toLocaleLowerCase()))); currentDifficulty=newDiff; localStorage.setItem(EXTRA_WORDS_KEY,JSON.stringify(extraWords)); localStorage.setItem(DIFF_KEY,currentDifficulty); if(index>=words.length)index=0; renderCard(); updateHint(); showToast('Settings Saved!')}
    function setLessonWords(list){syncedWords=uniqueWords(list); rebuildWords(); index=0; renderCard(); updateHint()}
    function updateHint(){difficultyHint.textContent=currentDifficulty==='easy'?'Slightly scrambled so kids can still read':currentDifficulty==='medium'?'Medium scramble: first letter kept intact':'Hard scramble: fully randomized'}
    function showToast(msg){toastEl.textContent=msg;toastEl.classList.add('show');setTimeout(()=>toastEl.classList.remove('show'),2500)}
    function shuffleArray(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]]}return arr}
    function swapLetters(letters,indices,a,b){const out=letters.slice(),i=indices[a],j=indices[b];out[i]=letters[j];out[j]=letters[i];return out.join('')}
    function scrambleToken(token,difficulty){const letters=token.split(''); if(!/[A-Za-z]/.test(token))return token; const idx=[], chars=[]; for(let i=0;i<letters.length;i++)if(/[A-Za-z]/.test(letters[i])){idx.push(i);chars.push(letters[i])} const n=chars.length; if(n<=1)return token; if(difficulty==='easy'){if(n===2)return swapLetters(letters,idx,0,1); if(n===3)return swapLetters(letters,idx,1,2); let middle=chars.slice(1,n-1), sh=shuffleArray(middle.slice()), tries=0; while(sh.join('')===middle.join('')&&tries<10){sh=shuffleArray(middle.slice());tries++} const out=letters.slice(); for(let k=0;k<sh.length;k++)out[idx[1+k]]=sh[k]; return out.join('')} if(difficulty==='medium'){if(n===2)return swapLetters(letters,idx,0,1); let rest=chars.slice(1), sh=shuffleArray(rest.slice()), tries=0; while(sh.join('')===rest.join('')&&tries<10){sh=shuffleArray(rest.slice());tries++} const out=letters.slice(); for(let k=0;k<sh.length;k++)out[idx[1+k]]=sh[k]; return out.join('')} let sh=shuffleArray(chars.slice()), tries=0; while(sh.join('')===chars.join('')&&tries<10){sh=shuffleArray(chars.slice());tries++} const out=letters.slice(); for(let k=0;k<sh.length;k++)out[idx[k]]=sh[k]; return out.join('')}
    function scramblePhrase(p,d){return p.split(' ').map(x=>scrambleToken(x,d)).join(' ')}
    function ensureScrambled(o,d){let s=scramblePhrase(o,d); if(s===o&&o.replace(/[^A-Za-z]/g,'').length>2){const tokens=o.split(' ');let li=0;for(let i=1;i<tokens.length;i++)if(tokens[i].replace(/[^A-Za-z]/g,'').length>tokens[li].replace(/[^A-Za-z]/g,'').length)li=i;const letters=tokens[li].split(''),pos=[];for(let i=0;i<letters.length;i++)if(/[A-Za-z]/.test(letters[i]))pos.push(i);if(pos.length>=2){const a=pos[Math.floor(pos.length/2)-1],b=pos[Math.floor(pos.length/2)];[letters[a],letters[b]]=[letters[b],letters[a]];tokens[li]=letters.join('');s=tokens.join(' ')}} return s}
    function updateTheme(i){const theme=i%3;cardEl.classList.remove('theme-0','theme-1','theme-2');cardEl.classList.add('theme-'+theme)}
    function renderCard(){if(words.length===0){scrambledText.textContent='No words yet';answerText.textContent='Open ⚙️ Teacher Controls to add Scramble-only words, or enter vocabulary in the Memory setup.';answerText.style.display='block';answerText.setAttribute('aria-hidden','false');showBtn.textContent='Show Answer';countLabel.textContent='0 / 0';updateTheme(0);return} const original=words[index];currentScramble=ensureScrambled(original,currentDifficulty);scrambledText.textContent=currentScramble;answerText.textContent=original;answerText.style.display='none';answerText.setAttribute('aria-hidden','true');showBtn.setAttribute('aria-pressed','false');showBtn.textContent='Show Answer';countLabel.textContent=`${index+1} / ${words.length}`;updateTheme(index)}
    showBtn.addEventListener('click',()=>{if(!words.length)return; const v=answerText.style.display!=='none'; answerText.style.display=v?'none':'block';answerText.setAttribute('aria-hidden',v?'true':'false');showBtn.setAttribute('aria-pressed',v?'false':'true');showBtn.textContent=v?'Show Answer':'Hide Answer'}); nextBtn.addEventListener('click',()=>{if(words.length){index=(index+1)%words.length;renderCard()}}); prevBtn.addEventListener('click',()=>{if(words.length){index=(index-1+words.length)%words.length;renderCard()}}); shuffleBtn.addEventListener('click',()=>{if(words.length){currentScramble=ensureScrambled(words[index],currentDifficulty);scrambledText.textContent=currentScramble;answerText.style.display='none';showBtn.textContent='Show Answer'}}); autoBtn.addEventListener('click',()=>{if(!words.length)return;autoPlay=!autoPlay;if(autoPlay){autoBtn.textContent='Stop';autoTimer=setInterval(()=>{index=(index+1)%words.length;renderCard()},3500)}else{autoBtn.textContent='Auto Play';clearInterval(autoTimer)}}); exitScrambleBtn.addEventListener('click',()=>{document.getElementById('scrambleApp').style.display='none';document.getElementById('memoryApp').style.display='flex';setActivityBarMode(false)});
    document.addEventListener('keydown',e=>{if(document.getElementById('scrambleApp').style.display==='none'||e.target.tagName==='INPUT')return; if(e.code==='Space'){e.preventDefault();if(words.length){index=(index+1)%words.length;renderCard()}}else if(e.code==='Enter')showBtn.click();else if(e.code==='ArrowRight')nextBtn.click();else if(e.code==='ArrowLeft')prevBtn.click()});
    function openTeacherPanel(){tempWords=[...words];tempDifficulty=currentDifficulty;document.querySelector(`input[name="difficulty"][value="${tempDifficulty}"]`).checked=true;renderWordList();teacherModal.classList.remove('hidden');teacherModal.setAttribute('aria-hidden','false')} function closeTeacherPanel(){teacherModal.classList.add('hidden');teacherModal.setAttribute('aria-hidden','true')} function renderWordList(){wordListEl.innerHTML='';wordCountEl.textContent=tempWords.length;tempWords.forEach((word,idx)=>{const div=document.createElement('div');div.className='word-item';const span=document.createElement('span');span.textContent=word;const btn=document.createElement('button');btn.className='remove-btn';btn.innerHTML='&times;';btn.onclick=()=>{tempWords.splice(idx,1);renderWordList()};div.appendChild(span);div.appendChild(btn);wordListEl.appendChild(div)})} function addNewWord(){const val=newWordInput.value.trim();if(val){tempWords.unshift(val);newWordInput.value='';renderWordList()}}
    teacherBtn.addEventListener('click',openTeacherPanel);closeTeacherBtn.addEventListener('click',closeTeacherPanel);teacherModal.addEventListener('click',e=>{if(e.target===teacherModal)closeTeacherPanel()});addWordBtn.addEventListener('click',addNewWord);newWordInput.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addNewWord()}});difficultyRadios.forEach(r=>r.addEventListener('change',e=>{if(e.target.checked)tempDifficulty=e.target.value}));resetDefaultsBtn.textContent='Keep Synced Only';resetDefaultsBtn.addEventListener('click',()=>{if(confirm('Remove Scramble-only words and keep only vocabulary synced from the Memory setup?')){tempWords=[...syncedWords];tempDifficulty='easy';document.querySelector(`input[name="difficulty"][value="easy"]`).checked=true;renderWordList()}});saveTeacherBtn.addEventListener('click',()=>{saveState(tempWords,tempDifficulty);closeTeacherPanel()});
    loadState();updateHint();renderCard();window._scrambleApp={setLessonWords,getWords:()=>[...words], reloadState: () => { loadState(); renderCard(); updateHint(); if(typeof renderWordList === 'function' && !document.getElementById('teacherModal').classList.contains('hidden')) renderWordList(); }};
    })();
