const C=window.FRECA_CONFIG||{};
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
let cards=[],q='',chara='',page=1;
const PAGE=30;

function normalizeSearchText(s){
  return String(s??'')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\u30a1-\u30f6]/g,ch =>
      String.fromCharCode(ch.charCodeAt(0)-0x60)
    );
}

async function load(){
  document.body.innerHTML='<div class="loading">読み込み中...</div>';
  try{
    const r=await fetch(C.gasUrl+'?action=list');
    const j=await r.json();
    cards=Array.isArray(j)?j:(j.cards||[]);
    buildShell();
    renderResults();
  }catch(e){
    document.body.innerHTML='<div class="empty">読み込みに失敗しました</div>';
    console.error(e);
  }
}

function filteredCards(){
  return cards.filter(x=>
    (!chara||x.chara===chara) &&
    (!q||normalizeSearchText(x.code).includes(normalizeSearchText(q)))
  );
}

function buildShell(){
  const chars=[...new Set(cards.map(x=>x.chara).filter(Boolean))];

  document.body.innerHTML=`
    <header class="header">
      <div class="header-inner">
        <div class="title">${esc(C.appName||'フレカ置き場')}</div>
      </div>
    </header>

    <div class="hero">
      <div class="search">⌕<input id="q" inputmode="search" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="コーデ名で検索"></div>
    </div>

    <div class="tabs" id="tabs">
      <button class="tab active" data-c="">すべて</button>
      ${chars.map(c=>`<button class="tab" data-c="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>

    <main class="grid" id="grid"></main>
    <div class="pager" id="pager"></div>

    <div class="modal" id="modal">
      <button class="close" id="close">×</button>
      <img id="modal-img">
    </div>`;

  const input=$('#q');
  let timer;

  input.addEventListener('input',e=>{
    clearTimeout(timer);
    timer=setTimeout(()=>{
      q=e.target.value.trim();
      page=1;
      renderResults();
    },180);
  });

  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{
    chara=b.dataset.c;
    page=1;
    document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));
    renderResults();
  });

  $('#close').onclick=()=>$('#modal').classList.remove('open');
  $('#modal').onclick=e=>{
    if(e.target.id==='modal')$('#modal').classList.remove('open');
  };
}

function renderResults(){
  const filtered=filteredCards();
  const total=Math.max(1,Math.ceil(filtered.length/PAGE));
  page=Math.min(page,total);
  const list=filtered.slice((page-1)*PAGE,page*PAGE);

  const grid=$('#grid');
  const pager=$('#pager');

  grid.innerHTML=list.length
    ? list.map((x,i)=>`
      <article class="card" data-id="${x.id}" style="--delay:${Math.min(i,18)*55}ms">
        <div class="card-img"><img loading="lazy" src="${esc(x.image_url)}"></div>
        <div class="card-info">
          <div class="chara">${esc(x.chara||'未設定')}</div>
          <div class="code">${esc(x.code||'')}</div>
        </div>
      </article>`).join('')
    : '<div class="empty" style="grid-column:1/-1">カードがありません</div>';

  pager.innerHTML=`
    <button class="btn" id="prev" ${page<=1?'disabled':''}>‹ 前へ</button>
    <span style="padding:8px;font-size:12px;color:var(--sub)">${page} / ${total}</span>
    <button class="btn" id="next" ${page>=total?'disabled':''}>次へ ›</button>`;

  $('#prev').onclick=()=>{
    if(page>1){page--;renderResults();}
  };
  $('#next').onclick=()=>{
    if(page<total){page++;renderResults();}
  };

  document.querySelectorAll('.card').forEach(el=>el.onclick=()=>{
    const x=cards.find(x=>String(x.id)===String(el.dataset.id));
    if(!x)return;
    $('#modal-img').src=x.image_url;
    $('#modal').classList.add('open');
  });
}

load();
