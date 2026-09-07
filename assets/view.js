(function(){
const C=window.FRECA_CONFIG||{}; const $=s=>document.querySelector(s); let cards=[],q="",chara="",page=1; const PAGE=20;
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const configured=()=>C.gasUrl&&/^https:\/\/script\.google\.com\/macros\/s\//.test(C.gasUrl)&&!C.gasUrl.includes('YOUR_');
async function call(action,params={}){const u=new URL(C.gasUrl);u.searchParams.set('action',action);Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));const r=await fetch(u.toString(),{redirect:'follow'});if(!r.ok)throw new Error('HTTP '+r.status);const j=await r.json();if(!j.ok)throw new Error(j.error||'API error');return j;}
async function load(){if(!configured()){document.body.innerHTML='<div class="setup-warning"><b>初期設定が必要です</b><br>assets/config.js の gasUrl にGASのウェブアプリURLを貼り付けてください。<br><br>詳しくは同梱の「はじめかた.txt」をご確認ください。</div>';return}try{cards=(await call('list')).cards||[];render()}catch(e){document.body.innerHTML='<div class="setup-warning"><b>データを読み込めませんでした</b><br>GASのデプロイ設定とURLをご確認ください。<br><small>'+esc(e.message)+'</small></div>'}}
function render(){
  const filtered=cards.filter(x=>(!chara||x.chara===chara)&&(!q||String(x.code||'').toLowerCase().includes(q.toLowerCase())));
  const total=Math.max(1,Math.ceil(filtered.length/PAGE));
  page=Math.min(page,total);
  const list=filtered.slice((page-1)*PAGE,page*PAGE);
  const chars=[...new Set(cards.map(x=>x.chara).filter(Boolean))];

  document.body.innerHTML=`
    <header class="header">
      <div class="header-inner">
        <div class="title">${esc(C.appName||'フレカ置き場')}</div>
      </div>
    </header>

    <div class="hero">
      <div class="search">⌕<input id="q" placeholder="コーデ名で検索" value="${esc(q)}"></div>
    </div>

    <div class="tabs">
      <button class="tab ${!chara?'active':''}" data-c="">すべて</button>
      ${chars.map(c=>`<button class="tab ${chara===c?'active':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>

    <main class="grid">
      ${list.length
        ? list.map((x,i)=>`
          <article class="card" data-id="${x.id}" style="--delay:${Math.min(i,18)*55}ms">
            <div class="card-img"><img loading="lazy" src="${esc(x.image_url)}"></div>
            <div class="card-info">
              <div class="chara">${esc(x.chara||'未設定')}</div>
              <div class="code">${esc(x.code||'')}</div>
            </div>
          </article>`).join('')
        : '<div class="empty" style="grid-column:1/-1">カードがありません</div>'}
    </main>

    <div class="pager">
      <button class="btn" id="prev" ${page<=1?'disabled':''}>‹ 前へ</button>
      <span style="padding:8px;font-size:12px;color:var(--sub)">${page} / ${total}</span>
      <button class="btn" id="next" ${page>=total?'disabled':''}>次へ ›</button>
    </div>

    <div class="modal" id="modal">
      <button class="close" id="close">×</button>
      <img id="modal-img">
    </div>`;

  $('#q').addEventListener('keydown',e=>{
    if(e.key==='Enter'){
      q=e.target.value.trim();
      page=1;
      render();
    }
  });
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{chara=b.dataset.c;page=1;render()});
  $('#prev').onclick=()=>{page--;render()};
  $('#next').onclick=()=>{page++;render()};
  document.querySelectorAll('.card').forEach(el=>el.onclick=()=>{
    const x=cards.find(x=>x.id===el.dataset.id);
    $('#modal-img').src=x.image_url;
    $('#modal').classList.add('open')
  });
  $('#close').onclick=()=>$('#modal').classList.remove('open');
  $('#modal').onclick=e=>{if(e.target.id==='modal')$('#modal').classList.remove('open')}
}
load();
})();
