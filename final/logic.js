const ICONS = ['🍎','🍌','🍇','🍉','🍒','🍍','🥝','🍑','🥥','🍓','🍐','🍈']; 
    const PAIRS = 12;

    let first = null, second = null, lock = false, matches = 0;
    let moves = 0; let startTime = null; let timerInterval = null;

    const grid = document.getElementById('grid');
    const timeEl = document.getElementById('time');
    const movesEl = document.getElementById('moves');
    const bestEl = document.getElementById('best');
    const restartBtn = document.getElementById('restart');
    const winModal = document.getElementById('win');
    const winTimeEl = document.getElementById('win-time');
    const winMovesEl = document.getElementById('win-moves');
    const playAgainBtn = document.getElementById('play-again');

    const pad = n => String(n).padStart(2,'0');

    function formatTime(ms){
      const s = Math.floor(ms/1000), m = Math.floor(s/60), r = s%60;
      return `${pad(m)}:${pad(r)}`;
    }

    function startTimer(){
      if (timerInterval) return;
      startTime = Date.now();
      timerInterval = setInterval(()=>{
        timeEl.textContent = formatTime(Date.now()-startTime);
      }, 250);
    }

    function stopTimer(){
      clearInterval(timerInterval); timerInterval = null;
    }

    function shuffle(arr){
      for(let i=arr.length-1;i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [arr[i],arr[j]]=[arr[j],arr[i]];
      }
      return arr;
    }

    function buildDeck(){
      const picks = ICONS.slice(0, PAIRS);
      const deck = shuffle([...picks, ...picks]).map((icon,i)=>({ id:i, icon }));
      return deck;
    }

    function render(){
      grid.innerHTML = '';
      const deck = buildDeck();
      deck.forEach(card => {
        const el = document.createElement('button');
        el.className = 'card';
        el.type = 'button';
        el.setAttribute('aria-label','Hidden card');
        el.innerHTML = `
          <div class="card-inner">
<div class="face front" aria-hidden="true"></div>            <div class="face back">${card.icon}</div>
          </div>`;
        el.dataset.icon = card.icon;
        el.addEventListener('click', ()=> onFlip(el));
        grid.appendChild(el);
      });
    }

    function resetGame(){
      first = second = null; lock = false; matches = 0; moves = 0;
      movesEl.textContent = '0'; timeEl.textContent = '00:00';
      stopTimer(); startTime = null; hideWin();
      render();
    }

    function onFlip(el){
      if (lock || el.classList.contains('matched') || el === first) return;
      startTimer();
      el.classList.add('is-flipped');

      if (!first){ first = el; return; }
      second = el; lock = true; moves++; movesEl.textContent = moves;

      const isMatch = first.dataset.icon === second.dataset.icon;
      if (isMatch){
        first.classList.add('matched');
        second.classList.add('matched');
        setTimeout(()=>{ first = second = null; lock = false; }, 350);
        matches++;
        if (matches === PAIRS) win();
      } else {
        first.classList.add('wrong');
        second.classList.add('wrong');
        setTimeout(()=>{
          first.classList.remove('is-flipped','wrong');
          second.classList.remove('is-flipped','wrong');
          first = second = null; lock = false;
        }, 800);
      }
    }

    function win(){
      stopTimer();
      const elapsed = Date.now()-startTime;
      winTimeEl.textContent = formatTime(elapsed);
      winMovesEl.textContent = moves;
      const bestKey = `memory-best-${PAIRS}`;
      const prev = localStorage.getItem(bestKey);
      const current = JSON.stringify({ t: elapsed, m: moves });
      if (!prev || JSON.parse(prev).t > elapsed) localStorage.setItem(bestKey, current);
      const best = JSON.parse(localStorage.getItem(bestKey));
      bestEl.textContent = best ? `${formatTime(best.t)} / ${best.m}` : '--';
      winModal.setAttribute('open','');
    }

    function hideWin(){ winModal.removeAttribute('open'); }

    restartBtn.addEventListener('click', resetGame);
    playAgainBtn.addEventListener('click', ()=>{ hideWin(); resetGame(); });

    (function init(){
      const bestKey = `memory-best-${PAIRS}`;
      const best = JSON.parse(localStorage.getItem(bestKey) || null);
      bestEl.textContent = best ? `${formatTime(best.t)} / ${best.m}` : '--';
      render();
    })();