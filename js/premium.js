/* ===== Younis & Co. — الطبقة الفاخرة (v10) =====
   بتشتغل فوق app.js و features.js بدون ما تغيّر منطقهم:
   بطاقات بوجهين، لوحة رصيد، أيقونات وشريط سفلي، إيصال نجاح، Design System. */

/* ---------- نصوص إضافية (الجديدة فقط) ---------- */
const PX={
en:{px_more:'More',px_30d:'Last 30 days',px_other:'Other wallets ({n})',px_hide:'Hide other wallets',px_flip:'Tap the card to flip it',r_title:'Transfer sent',r_to:'To',r_from:'From wallet',r_fee:'Fee',r_tot:'Total debited',r_ref:'Reference',r_date:'Date',r_copy:'Copy receipt',r_done:'Done'},
ar:{px_more:'المزيد',px_30d:'آخر 30 يوماً',px_other:'محافظ أخرى ({n})',px_hide:'إخفاء المحافظ الأخرى',px_flip:'اضغط على البطاقة لقلبها',r_title:'تم إرسال الحوالة',r_to:'إلى',r_from:'من محفظة',r_fee:'العمولة',r_tot:'المبلغ المخصوم',r_ref:'المرجع',r_date:'التاريخ',r_copy:'نسخ الإيصال',r_done:'تم'},
sv:{px_more:'Mer',px_30d:'Senaste 30 dagarna',px_other:'Övriga plånböcker ({n})',px_hide:'Dölj övriga plånböcker',px_flip:'Tryck på kortet för att vända det',r_title:'Överföring skickad',r_to:'Till',r_from:'Från plånbok',r_fee:'Avgift',r_tot:'Totalt debiterat',r_ref:'Referens',r_date:'Datum',r_copy:'Kopiera kvitto',r_done:'Klar'}};
Object.keys(PX).forEach(l=>Object.assign(I18N[l],PX[l]));

/* ---------- أيقونات (خط واحد، 24px) ---------- */
const ICONS={
wallet:'<path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h11"/><circle cx="16.5" cy="13.5" r="1.2"/>',
cards:'<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3 10h18M7 15h4"/>',
send:'<path d="M7 17 17 7M9 7h8v8"/>',
history:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
vaults:'<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
insights:'<path d="M5 20V10M12 20V4M19 20v-7"/>',
kyc:'<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="M6 16c.6-1.6 1.8-2.2 3-2.2s2.4.6 3 2.2M14 10h4M14 13h3"/>',
settings:'<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
design:'<path d="M12 3a9 9 0 1 0 0 18c1.2 0 1.8-.9 1.4-2-.4-1 .2-2 1.3-2H17a4 4 0 0 0 4-4c0-5-4-10-9-10z"/><circle cx="8" cy="11" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="11" r="1"/>',
topup:'<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
receive:'<path d="M17 7 7 17M15 17H7V9"/>',
exch:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
more:'<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>'};
const ic=n=>`<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[n]||''}</svg>`;
function decorate(){
  $$('nav button[data-v],#more button[data-v],#wallet .qa [data-go]').forEach(b=>{if(!b.querySelector('svg'))b.insertAdjacentHTML('afterbegin',ic(b.dataset.v||b.dataset.go))});
  const mb=$('#moreBtn');if(!mb.querySelector('svg'))mb.insertAdjacentHTML('afterbegin',ic('more'));
  $('#lang2').textContent=$('#lang').textContent;
}

/* ---------- أعلام العملات ---------- */
const FLAG={
SEK:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#006AA7"/><rect x="9" width="6" height="32" fill="#FECC02"/><rect y="13" width="32" height="6" fill="#FECC02"/></svg>',
EUR:`<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#003399"/>${[...Array(12)].map((_,i)=>`<circle cx="${(16+8*Math.sin(i*Math.PI/6)).toFixed(1)}" cy="${(16-8*Math.cos(i*Math.PI/6)).toFixed(1)}" r="1.4" fill="#FFCC00"/>`).join('')}</svg>`,
AED:'<svg viewBox="0 0 32 32"><rect width="32" height="32" fill="#fff"/><rect width="32" height="10.7" fill="#00732F"/><rect y="21.3" width="32" height="10.7" fill="#000"/><rect width="9" height="32" fill="#CE1126"/></svg>'};

/* ---------- المحفظة: رقم يعدّ + خط بياني + 3 عملات ---------- */
const FEAT=['SEK','EUR','AED'];let allW=false,lastTot=0,lastBase='',raf=0;
const reduced=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches;
const _dw=drawWallet;
drawWallet=function(){
  _dw();
  const items=Object.entries(wal),list=allW?items:items.filter(([c])=>FEAT.includes(c)),rest=items.length-items.filter(([c])=>FEAT.includes(c)).length;
  $('#wallets').innerHTML=list.map(([c,v])=>`<div class="panel cur"><div><small>${t('w_wallet',{c})}</small><div class="amt">${f(v,c)}</div></div><div class="flag fl">${FLAG[c]||sym[c]}</div></div>`).join('');
  $('#moreW').hidden=rest<=0;$('#moreW').textContent=allW?t('px_hide'):t('px_other',{n:rest});
  countUp();spark();
};
function countUp(){
  const b=base(),target=usd(),from=lastBase===b?lastTot:target,el=$('#total');
  cancelAnimationFrame(raf);lastTot=target;lastBase=b;
  if(reduced()||Math.abs(target-from)<.005){el.textContent=f(target,b);return}
  const t0=performance.now();
  const step=now=>{const p=Math.min(1,(now-t0)/900),e=1-Math.pow(1-p,3);el.textContent=f(from+(target-from)*e,b);if(p<1)raf=requestAnimationFrame(step)};
  raf=requestAnimationFrame(step);
}
function spark(){
  const b=base(),D=864e5,now=Date.now(),N=30,cur=usd();
  const pts=[...Array(N)].map((_,i)=>{const cut=now-(N-1-i)*D;let v=cur;txs.forEach(([,,a,cu,d])=>{if(new Date(d).getTime()>cut)v-=a*rate[cu]/rate[b]});return v});
  const mn=Math.min(...pts),rg=(Math.max(...pts)-mn)||1,Y=v=>8+(1-(v-mn)/rg)*74;
  const line=pts.map((v,i)=>`${i?'L':'M'}${(i/(N-1)*600).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
  $('#spark').innerHTML=`<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3d97a" stop-opacity=".35"/><stop offset="1" stop-color="#f3d97a" stop-opacity="0"/></linearGradient></defs><path d="${line} L600 90 L0 90Z" fill="url(#sg)"/><path class="ln" d="${line}"/>`;
  const d=cur-pts[0],el=$('#sparkDelta');
  el.textContent=new Intl.NumberFormat(I18N.lang==='ar'?'ar-u-nu-latn':'sv-SE',{style:'percent',signDisplay:'always',maximumFractionDigits:1}).format(pts[0]?d/Math.abs(pts[0]):0);
  el.style.color=d>=0?'var(--ok)':'var(--bad)';
}

/* ---------- البطاقات: وجهان، شعار، حواف، 001/015 ---------- */
let flipped=false;
const CT={std:null,exe:['YOUNIS EXECUTIVE','EXECUTIVE GOLD'],sov:['YOUNIS SOVEREIGNTY','VVVIP — THE SOVEREIGN ELITE']};
const CC={std:'#e6ebf5',exe:'#f3d97a',sov:'#17120a'};
const mark=c=>`<svg class="mk" viewBox="0 0 120 120" aria-hidden="true"><path d="M34 24l8 10 9-17 9 17 9-17 9 17 8-10-5 21H39z" fill="${c}"/><text x="43" y="98" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="60" font-weight="600" fill="${c}">Y</text><path d="M71 52 55 104" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/><text x="82" y="104" text-anchor="middle" font-family="Cormorant Garamond,Georgia,serif" font-size="60" font-weight="600" fill="${c}">C</text></svg>`;
function faces(k,reveal){
  const ct=CT[k],hn=esc(set.name.toUpperCase()),num=reveal?'5287 5612 3456 7890':'•••• •••• •••• 7890';
  const net=cd.net!=='VISA'?'<span class="mcl" role="img"><i></i><i></i><span class="vh">Mastercard</span></span>':'<span class="visa">VISA</span>';
  const top={std:'Trust in Every Detail.',exe:'EXECUTIVE GOLD · VIP',sov:'LIMITED EDITION · 001/015'}[k];
  return `<div class="face front"><div class="sheen"></div>${mark(CC[k])}<div class="brand"><b>Younis &amp; Co.</b><small>International Wealth &amp; Fintech Hub</small></div>${ct?`<div class="rule"></div><div class="ctag">${ct[0]}<br>${ct[1]}</div>`:''}${k==='sov'?`<span class="serial">001/015</span><span class="holder">${hn}</span>`:''}</div>`+
  `<div class="face back"><div class="mag"></div><div class="bk-top"><span>${top}</span><span>${cd.form==='virtual'?'VIRTUAL':'PHYSICAL'}</span></div>${k==='std'?'<div class="sig"></div>':''}<div class="bk-main"><div class="row1"><span class="chipx"></span><span class="nfc">)))</span></div><div class="cnum">${num}</div><div class="meta"><span>VALID THRU 12/28<br>${hn}</span>${net}</div></div></div>`;
}
const staticCard=(k,back)=>`<div class="cwrap"><div class="ycard static ${k}${back?' bk':''}"><div class="cin">${faces(k,false)}</div></div></div>`;
function drawCard(){
  const fr=$('#freeze').getAttribute('aria-checked')==='true';
  if(tier==='sov'&&cd.form!=='plastic')cd.form='plastic';
  $('#tiers').innerHTML=Object.keys(tiers).map(k=>`<button class="${k===tier?'on':''}" data-t="${k}">${t('t_'+k)}</button>`).join('');
  $$('#tiers button').forEach(b=>b.onclick=()=>{tier=b.dataset.t;flipped=false;$('#freeze').setAttribute('aria-checked','false');$('#cMsg').textContent='';drawCard()});
  $$('#cForm button').forEach(b=>{b.classList.toggle('on',b.dataset.f===cd.form);b.disabled=tier==='sov'&&b.dataset.f==='virtual'});
  $$('#cNet button').forEach(b=>b.classList.toggle('on',b.dataset.n===cd.net));
  $('#cShow').textContent=t(cd.show?'cn_hide':'cn_show');
  $('#cName').textContent=t('t_'+tier);$('#cDesc').textContent=t('d_'+tier);
  $('#cardArt').innerHTML=`<div class="cwrap"><div class="ycard ${tier}${fr?' frozen':''}${flipped?' bk':''}" id="theCard" role="button" tabindex="0" aria-pressed="${flipped}" aria-label="${t('px_flip')}"><div class="cin">${faces(tier,cd.show)}</div></div><div class="cflip"><button class="btn ghost" id="cFlip" aria-label="${t('px_flip')}">⟲</button><span>${t('px_flip')}</span></div></div>`;
  const c=$('#theCard'),flip=()=>{flipped=!flipped;c.classList.toggle('bk',flipped);c.setAttribute('aria-pressed',flipped)};
  c.onclick=flip;c.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();flip()}};$('#cFlip').onclick=flip;
}

/* ---------- نجاح الحوالة: علامة ✓ ذهبية + إيصال ---------- */
function showReceipt(r){
  const row=(k,v)=>`<div class="rw"><span>${t(k)}</span><b><bdi dir="auto">${v}</bdi></b></div>`;
  $('#rcpt').innerHTML=`<div class="rc"><svg class="okc" viewBox="0 0 52 52" aria-hidden="true"><circle cx="26" cy="26" r="24"/><path d="M15 27l8 8 15-17"/></svg><h3>${t('r_title')}</h3><div class="rc-amt">${f(r.a,r.c)}</div><div class="rc-slip">${row('r_to',esc(r.to))}${row('r_from',r.c)}${row('r_fee',f(r.fee,r.c))}${row('r_tot',f(r.a+r.fee,r.c))}${row('r_ref',r.ref)}${row('r_date',new Date().toLocaleString(LOC()))}</div><div class="btns"><button class="btn ghost" id="rcCopy">${t('r_copy')}</button><button class="btn" id="rcDone">${t('r_done')}</button></div></div>`;
  $('#rcDone').onclick=()=>$('#rcpt').close();
  $('#rcCopy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText($$('#rcpt .rw').map(x=>x.children[0].textContent+': '+x.children[1].textContent).join('\n'));toast(t('rc_copied'))};
  $('#rcpt').showModal();
}
const _cfOk=$('#cfOk').onclick;
$('#cfOk').onclick=async()=>{
  const c=$('#from').value,a=parseFloat($('#amt').value),to=$('#to').value.trim(),fee=a*feeRate[mode];
  await _cfOk();
  const ref=($('#sMsg').textContent.match(/(YC[0-9A-Z]{5,})$/)||[])[1];
  if(ref)showReceipt({a,c,to,fee,ref});
};

/* ---------- موبايل: القائمة السفلية ---------- */
const mo=$('#more'),closeMore=()=>{mo.hidden=true};
$('#moreBtn').onclick=()=>{mo.hidden=false;$('#more button').focus()};
mo.onclick=e=>{if(e.target===mo)closeMore()};
$$('#more button[data-v]').forEach(b=>b.onclick=()=>{show(b.dataset.v);closeMore()});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!mo.hidden)closeMore()});
$('#lang2').onclick=()=>$('#lang').click();
const _show=show;
show=function(v){_show(v);$$('#more button[data-v]').forEach(b=>b.classList.toggle('on',b.dataset.v===v));$('#moreBtn').classList.toggle('on',['history','insights','kyc','settings','design'].includes(v))};
const _al=applyLang;
applyLang=function(){_al();decorate()};

/* ---------- Design System الكامل ---------- */
function buildDesign(){
  const DEF={'--navy':'#050d24','--navy2':'#0b1a42','--navy3':'#12275c','--gold':'#d4af37','--gold2':'#f3d97a','--ink':'#eef1f8','--mut':'#8f9bbd','--ok':'#5fcf9a','--bad':'#ff7b7b','--line':'rgba(212,175,55,.22)'};
  const cs=getComputedStyle(document.documentElement),V=n=>cs.getPropertyValue(n).trim()||DEF[n],hx=s=>s[0]==='#'?s.toUpperCase():s;
  const cols=[['--navy','Navy','Page background, inputs'],['--navy2','Navy 2','Dialogs, toasts, sheets'],['--navy3','Navy 3','Tracks, toggles, gradient'],['--gold','Gold','Primary action, active'],['--gold2','Gold 2','Headings, balances'],['--ink','Ink','Primary text'],['--mut','Muted','Secondary text'],['--ok','Success','Incoming, success'],['--bad','Error','Errors, outgoing alerts'],['--line','Line','Borders, gold at 22%']];
  const lum=h=>{const[r,g,b]=[1,3,5].map(i=>parseInt(h.substr(i,2),16)/255).map(v=>v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4));return .2126*r+.7152*g+.0722*b};
  const cr=(a,b)=>{const x=lum(a),y=lum(b);return((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(1)};
  const pairs=[['Ink on Navy','--ink','--navy'],['Muted on Navy','--mut','--navy'],['Gold 2 on Navy','--gold2','--navy'],['Gold on Navy','--gold','--navy'],['Success on Navy','--ok','--navy'],['Error on Navy','--bad','--navy']].map(([n,a,b])=>[n,cr(V(a),V(b))]).concat([['Button text on Gold',cr('#1a1405',V('--gold'))]]);
  const ty=[['Display','Cormorant Garamond',56,600,'kr 48,200.50','font-family:Cormorant Garamond,serif;color:var(--gold2)'],['H1','Cormorant Garamond',40,600,'Good evening','font-family:Cormorant Garamond,serif'],['H2','Cormorant Garamond',26,600,'Sovereignty','font-family:Cormorant Garamond,serif'],['H3 / Amount','Cormorant Garamond',22,600,'Recent activity','font-family:Cormorant Garamond,serif'],['Body','Inter',15,400,'Send money to anyone, instantly.',''],['Label','Inter',13,400,'Phone or email','color:var(--mut)'],['Caption','Inter',11,400,'International Wealth & Fintech Hub','color:var(--mut)'],['Card number','Inter',18,500,'5287 5612 3456 7890','letter-spacing:.12em'],['Arabic body','Cairo',15,400,'ثقة في كل تفصيل','font-family:Cairo,sans-serif;direction:rtl']];
  const rad=[['Button, input',10],['Toast',12],['Panel, dialog',16],['Card',18],['Pill',20]],spc=[6,12,18,22,28];
  $('#design').innerHTML=`<div class="top"><div><h1 data-i18n="ds_title"></h1><p data-i18n="ds_sub"></p></div><button class="btn" id="dsCopy">Copy tokens (JSON)</button></div><div class="ds">
  <div class="panel"><h2>Colors</h2><p class="sub">Read live from css/style.css — change :root and this page follows.</p><div class="sw3">${cols.map(([v,n,u])=>`<div class="c"><i style="background:var(${v})"></i><div><b>${n}</b> <code>${hx(V(v))}</code><small>${v} · ${u}</small></div></div>`).join('')}</div>
   <h2 class="sec">Contrast (WCAG)</h2><p class="sub">AA needs 4.5:1 for body text, 3:1 for large text.</p><table class="tt">${pairs.map(([n,r])=>`<tr><td>${n}</td><td><b class="${r>=4.5?'ok':'bad'}">${r}:1</b></td><td>${r>=7?'AAA':r>=4.5?'AA':r>=3?'AA large only':'Fail'}</td></tr>`).join('')}</table></div>
  <div class="panel sec"><h2>Typography</h2><p class="sub">Display and headings: Cormorant Garamond · UI: Inter · Arabic: Cairo.</p><table class="tt"><tr><th>Style</th><th>Font · size / weight</th><th>Sample</th></tr>${ty.map(([n,fn,sz,w,s,x])=>`<tr><td>${n}</td><td>${fn} · ${sz} / ${w}</td><td><span style="font-size:${sz}px;font-weight:${w};${x}">${s}</span></td></tr>`).join('')}</table></div>
  <div class="panel sec"><h2>Buttons</h2><p class="sub">Radius 10 · padding 11 × 20 · weight 600.</p><div class="demo"><button class="btn">Primary</button><button class="btn" style="filter:brightness(1.08)">Hover</button><button class="btn" style="outline:2px solid var(--gold2);outline-offset:2px">Focus</button><button class="btn" disabled>Disabled</button></div><div class="demo" style="margin-top:12px"><button class="btn ghost">Secondary</button><button class="btn ghost" style="outline:2px solid var(--gold2);outline-offset:2px">Focus</button><button class="btn ghost" disabled>Disabled</button></div></div>
  <div class="panel sec"><h2>Inputs and controls</h2><div class="row3"><div><label>Input</label><input placeholder="0.00"></div><div><label>Input · error</label><input style="border-color:var(--bad)" value="abc"><small class="bad">Invalid IBAN. Please check the number.</small></div><div><label>Select</label><select><option>SEK</option><option>EUR</option><option>AED</option></select></div></div>
   <div class="demo" style="margin-top:16px"><button class="tg" role="switch" aria-checked="true" aria-label="On"></button><button class="tg" role="switch" aria-checked="false" aria-label="Off"></button><div class="seg" style="min-width:260px"><button class="on">Active</button><button>Idle</button></div><div class="tiers" style="margin:0"><button class="on">Standard</button><button>Executive Gold</button></div></div>
   <div class="demo" style="margin-top:16px"><div class="bar" style="width:220px"><u style="width:65%"></u></div><div class="spin" role="status" aria-label="Loading"></div><span class="ok">+28 400,00 kr</span><span>−119,00 kr</span><span class="bad">Error message</span></div></div>
  <div class="panel sec"><h2>Cards</h2><p class="sub">Aspect 1.586 · radius 18 · front and back. Tap on the Cards page to flip.</p><div class="row3">${['std','exe','sov'].map(k=>staticCard(k)).join('')}</div><div class="row3" style="margin-top:16px">${['std','exe','sov'].map(k=>staticCard(k,1)).join('')}</div></div>
  <div class="panel sec"><h2>Icons</h2><p class="sub">24 px grid · 1.7 px stroke · round caps.</p><div class="icons">${Object.keys(ICONS).map(k=>`<div>${ic(k)}${k}</div>`).join('')}</div></div>
  <div class="panel sec"><h2>Shape, spacing, motion</h2><div class="rad">${rad.map(([n,r])=>`<div style="border-radius:${r}px">${r}px<br>${n}</div>`).join('')}</div><p class="sub" style="margin-top:14px">Spacing: ${spc.join(' · ')} px · Panel padding 22 · Grid gap 18 · Sidebar 250 · Mobile breakpoint 820.<br>Motion: rise 550 ms · card flip 850 ms · balance count-up 900 ms (ease-out) · transitions 250 ms · splash 2.4 s. All disabled under reduced-motion.</p></div></div>`;
  $('#dsCopy').onclick=()=>{
    const tok={colors:Object.fromEntries(cols.map(([v])=>[v.slice(2),V(v)])),fonts:{heading:'Cormorant Garamond 500/600/700',body:'Inter 400/500/600',arabic:'Cairo 400/600'},radius:Object.fromEntries(rad.map(([n,r])=>[n,r])),spacing:spc,breakpoint:820};
    navigator.clipboard&&navigator.clipboard.writeText(JSON.stringify(tok,null,2));toast(t('rc_copied'));
  };
}

/* ---------- تشغيل ---------- */
$('#wallet>.btns').classList.add('qa');
$('#moreW').onclick=()=>{allW=!allW;drawWallet()};
buildDesign();
applyLang();
