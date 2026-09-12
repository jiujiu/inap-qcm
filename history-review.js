(function(){
  const d=document;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const style=d.createElement('style');
  style.textContent=`
    .history-answers{display:grid;gap:9px;margin:16px 0}
    .history-answer{padding:12px 14px;border:1px solid #d7dde8;border-radius:11px;background:#fff}
    .history-answer.wrong-choice{background:#fdecec;border-color:#d95c5c;color:#8f1d1d}
    .history-answer.correct-choice{background:#eaf8ee;border-color:#4caf67;color:#176b36}
    .history-answer .tag{display:block;font-size:12px;font-weight:700;margin-top:4px}
    .history-explanation{padding:14px;border-radius:12px;background:#f8fafc;line-height:1.5}
  `;
  d.head.appendChild(style);

  const actions=d.querySelector('#history .history-actions');
  if(actions){
    actions.innerHTML='<button id="historyPrev" onclick="prevHistoryError()">Erreur précédente</button><button id="historyNext" class="primary" onclick="nextHistoryError()">Erreur suivante</button><button onclick="goHome()">Retour à l’accueil</button><button class="danger" onclick="clearHistory()">Effacer l\'historique</button>';
  }

  let historyItems=[];
  let historyIndex=0;

  window.renderHistory=function(){
    const all=window.getHistory();
    const filter=d.getElementById('historyFilter').value;
    historyItems=(filter==='ALL'?all:all.filter(x=>x.subject===filter)).sort((a,b)=>new Date(b.lastDate)-new Date(a.lastDate));
    historyIndex=0;
    const counts={};
    all.forEach(x=>counts[x.subject]=(counts[x.subject]||0)+1);
    d.getElementById('historyStats').textContent=`Total enregistré : ${all.length} • PGP ${counts.PGP||0} • DOAP ${counts.DOAP||0} • CGE ${counts.CGE||0} • CCC ${counts.CCC||0}`;
    renderHistoryItem();
  };

  function renderHistoryItem(){
    const list=d.getElementById('historyList');
    const total=d.getElementById('historyTotal');
    const prev=d.getElementById('historyPrev');
    const next=d.getElementById('historyNext');
    list.innerHTML='';
    total.textContent=historyItems.length?`${historyIndex+1}/${historyItems.length}`:'0 à revoir';
    if(prev)prev.disabled=historyIndex<=0;
    if(next)next.disabled=historyIndex>=historyItems.length-1;
    if(!historyItems.length){list.innerHTML='<div class="empty">Aucune erreur enregistrée pour ce filtre.</div>';return;}

    const x=historyItems[historyIndex];
    const card=d.createElement('div');
    card.className='history-item';
    const date=new Date(x.lastDate).toLocaleString('fr-FR');
    const answers=(x.answers||[]).map((a,i)=>{
      const isCorrect=i===x.correctIndex||a===x.correct;
      const isWrong=a===x.userAnswer&&!isCorrect;
      const cls=isCorrect?' correct-choice':(isWrong?' wrong-choice':'');
      const tag=isCorrect?'<span class="tag">✓ Bonne réponse</span>':(isWrong?'<span class="tag">✗ Votre réponse</span>':'');
      return `<div class="history-answer${cls}">${esc(a)}${tag}</div>`;
    }).join('');
    const noAnswer=x.userAnswer==='Sans réponse'?'<p class="answer-bad"><b>Votre réponse :</b> aucune réponse</p>':'';
    card.innerHTML=`<div class="history-meta">${esc(x.subject)} • dernière erreur : ${date}</div><h3>${esc(x.question)}</h3><div class="history-answers">${answers}</div>${noAnswer}<div class="history-explanation"><b>Explication :</b><br>${esc(x.explanation||'Aucune explication disponible.')}</div>${x.source&&x.source!=='support'?`<p class="small muted">Source : ${esc(x.source)}</p>`:''}`;
    list.appendChild(card);
  }

  window.prevHistoryError=function(){if(historyIndex>0){historyIndex--;renderHistoryItem();}};
  window.nextHistoryError=function(){if(historyIndex<historyItems.length-1){historyIndex++;renderHistoryItem();}};
})();
