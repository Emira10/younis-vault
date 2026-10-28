/* ===== Younis & Co. — منطق الواجهة =====
   البيانات من js/api.js  ·  النصوص من js/i18n.js */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const S=API.state,wal=S.wal,txs=S.txs,vaults=S.vaults,set=S.settings,rate=API.rate;
const sym={SEK:'kr',USD:'$',EUR:'€',GBP:'£',AED:'د.إ',NOK:'kr',DKK:'kr',TRY:'₺'};
const tiers={std:{cls:'std',sub:'Standard Class',net:'VISA'},exe:{cls:'exe',sub:'VIP · Executive Gold',net:'●●'},sov:{cls:'sov',sub:'VVVIP · The Sovereign Elite',net:'001/015'}};
let tier='std',mode='p2p',toastT;
const H={q:'',cur:'',dir:'all',from:'',to:''};

const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const f=(v,c)=>new Intl.NumberFormat(I18N.lang==='ar'?'ar-u-nu-latn':'sv-SE',{style:'currency',currency:c}).format(v);
const base=()=>set.base||'SEK';const usd=()=>Object.entries(wal).reduce((a,[c,v])=>a+v*rate[c],0)/rate[base()];
const cat=n=>{const k='cat_'+n.replace(/ /g,'_'),s=t(k);return s===k?n:s};
const nm=n=>n.replace(/^Vault: /,t('v_pre'));
const fd=d=>new Date(d).toLocaleDateString(({ar:'ar-u-nu-latn',sv:'sv-SE'})[I18N.lang]||'en-GB',{day:'2-digit',month:'short',year:'numeric'});
const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('on');clearTimeout(toastT);toastT=setTimeout(()=>e.classList.remove('on'),3500)};
const tgl=(id,on,fn)=>{const b=$(id);b.setAttribute('aria-checked',on);b.onclick=()=>{const v=b.getAttribute('aria-checked')!=='true';b.setAttribute('aria-checked',v);fn(v)}};
const saveSet=p=>API.saveSettings(p);
const txRow=([n,c,v,cu])=>`<tr><td><bdi>${esc(nm(n))}</bdi><br><small style="color:var(--mut)">${esc(cat(c))}</small></td><td class="${v>0?'pos':'neg'}">${v>0?'+':'−'}${f(Math.abs(v),cu)}</td></tr>`;

/* ---------- navigation ---------- */
function show(v){$$('.view').forEach(e=>e.classList.toggle('on',e.id===v));$$('nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));scrollTo(0,0)}
$$('nav button').forEach(b=>b.onclick=()=>show(b.dataset.v));
$$('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));

/* ---------- wallet ---------- */
function drawWallet(){
  $('#hello').textContent=t('w_hello',{n:set.name.split(' ')[0]});
  $('#total').textContent=f(usd(),base());
  $('#wallets').innerHTML=Object.entries(wal).map(([c,v])=>`<div class="panel cur"><div><small>${t('w_wallet',{c})}</small><div class="amt">${f(v,c)}</div></div><div class="flag">${sym[c]}</div></div>`).join('');
  $('#tx').innerHTML=txs.slice(0,6).map(txRow).join('');
  $$('#baseSeg button').forEach(b=>b.classList.toggle('on',b.dataset.b===base()));
  const cur=$('#from').value;
  $('#from').innerHTML=Object.keys(wal).map(c=>`<option>${c}</option>`).join('');
  if(cur)$('#from').value=cur;
}

$$('#baseSeg button').forEach(b=>b.onclick=()=>{saveSet({base:b.dataset.b});drawWallet();drawHistory()});

/* ---------- cards ---------- */
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/premium.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
function drawCard(){
  const ti=tiers[tier],fr=$('#freeze').getAttribute('aria-checked')==='true';
  $('#tiers').innerHTML=Object.keys(tiers).map(k=>`<button class="${k===tier?'on':''}" data-t="${k}">${t('t_'+k)}</button>`).join('');
  $$('#tiers button').forEach(b=>b.onclick=()=>{tier=b.dataset.t;$('#freeze').setAttribute('aria-checked','false');$('#cMsg').textContent='';drawCard()});
  $('#cName').textContent=t('t_'+tier);$('#cDesc').textContent=t('d_'+tier);
  $('#cardArt').innerHTML=`<div class="card ${ti.cls}${fr?' frozen':''}" id="theCard"><div class="t"><div><b>Younis &amp; Co.</b><br>${ti.sub}</div><span class="serif" style="font-size:26px">YC</span></div><div><div class="chip"></div><div class="num">5287 5612 3456 7890</div></div><div class="b"><span>${esc(set.name.toUpperCase())}<br>VALID THRU 12/28</span><b>${ti.net}</b></div></div>`;
}
tgl('#freeze',false,on=>{$('#cMsg').textContent=t(on?'m_frozen':'m_active');$('#theCard').classList.toggle('frozen',on)});
tgl('#online',true,on=>$('#cMsg').textContent=t(on?'m_on1':'m_on0'));
tgl('#nfc',true,on=>$('#cMsg').textContent=t(on?'m_nfc1':'m_nfc0'));
$('#pinBtn').onclick=()=>{$('#p1').value=$('#p2').value='';$('#pMsg').textContent='';$('#dlg').showModal()};
$('#pX').onclick=()=>$('#dlg').close();
$('#pOk').onclick=()=>{
  const a=$('#p1').value,b=$('#p2').value;
  if(!/^\d{4}$/.test(a))return $('#pMsg').textContent=t('p_e4');
  if(a!==b)return $('#pMsg').textContent=t('p_em');
  $('#dlg').close();$('#cMsg').textContent=t('m_pin');
  if(set.notif.security)toast(t('toast_pin'));
};

/* ---------- transfers ---------- */
const feeRate={p2p:0,local:.005,intl:.012};
function setMode(m){
  mode=m;$$('#mode button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));
  $('#toLbl').textContent=t('lbl_'+m);$('#to').placeholder=t('ph_'+m);$('#fee').textContent=t('fee_'+m);
}
$$('#mode button').forEach(b=>b.onclick=()=>setMode(b.dataset.m));
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/features.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
$('#sendBtn').onclick=async()=>{
  const m=$('#sMsg'),btn=$('#sendBtn'),c=$('#from').value,a=parseFloat($('#amt').value),to=$('#to').value.trim();
  m.style.color='var(--bad)';btn.disabled=true;
  const r=await API.transfer({mode,to,amount:a,currency:c});
  btn.disabled=false;
  if(!r.ok){m.textContent=r.code==='funds'?t('e_funds',{c,v:f(r.available,c)}):t('e_'+r.code);return}
  m.style.color='var(--ok)';m.textContent=t('ok_sent',{a:f(a,c),to});
  if(set.notif.payments)toast(t('toast_sent',{a:f(a,c),to}));
  $('#amt').value=$('#to').value='';drawWallet();drawHistory();
};

/* ---------- history ---------- */
function filtered(){
  const q=H.q.trim().toLowerCase(),d0=H.from?new Date(H.from+'T00:00:00'):null,d1=H.to?new Date(H.to+'T23:59:59'):null;
  return txs.filter(([n,c,v,cu,d])=>{
    const dt=new Date(d);
    return(!q||`${n} ${nm(n)} ${c} ${cat(c)}`.toLowerCase().includes(q))&&(!H.cur||cu===H.cur)&&(H.dir==='all'||(H.dir==='in')===(v>0))&&(!d0||dt>=d0)&&(!d1||dt<=d1);
  });
}
function drawHistory(){
  const rows=filtered();let inn=0,out=0;
  rows.forEach(([,,v,cu])=>{const u=v*rate[cu];if(u>0)inn+=u;else out-=u});
  $('#hCount').textContent=t('h_count',{n:rows.length});
  $('#hTot').textContent=t('h_tot',{i:f(inn/rate[base()],base()),o:f(out/rate[base()],base())});
  $('#hBody').innerHTML=rows.length?rows.map(([n,c,v,cu,d])=>`<tr><td>${fd(d)}</td><td><bdi>${esc(nm(n))}</bdi></td><td>${esc(cat(c))}</td><td class="${v>0?'pos':'neg'}">${v>0?'+':'−'}${f(Math.abs(v),cu)}</td></tr>`).join(''):`<tr><td colspan="4" class="empty">${t('h_empty')}</td></tr>`;
}
[['#hq','q'],['#hc','cur'],['#hd','dir'],['#hf','from'],['#ht','to']].forEach(([id,k])=>$(id).addEventListener('input',e=>{H[k]=e.target.value;drawHistory()}));
$('#hClr').onclick=()=>{Object.assign(H,{q:'',cur:'',dir:'all',from:'',to:''});['#hq','#hc','#hf','#ht'].forEach(i=>$(i).value='');$('#hd').value='all';drawHistory()};
$('#csv').onclick=()=>{
  const q=s=>{s=String(s);if(/^[=+\-@]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"'};
  const lines=['Date,Description,Category,Currency,Amount',...filtered().map(([n,c,v,cu,d])=>[new Date(d).toISOString().slice(0,10),q(n),q(c),cu,v.toFixed(2)].join(','))];
  const url=URL.createObjectURL(new Blob(['\uFEFF'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download=`statement-${new Date().toISOString().slice(0,10)}.csv`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
addEventListener('beforeprint',()=>{$('#pHead').textContent=`${set.name} · ${fd(new Date())} · ${$('#hCount').textContent}`});
$('#print').onclick=()=>window.print();

/* ---------- vaults ---------- */
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/features.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
function drawVaults(){
  $('#vaultList').innerHTML=vaults.map((v,i)=>{const p=Math.min(100,v.s/v.t*100);return `<div class="panel"><div class="row"><h3 style="font-size:22px"><bdi>${esc(v.n)}</bdi></h3><b style="color:var(--gold2)">${p.toFixed(0)}%</b></div><div class="bar"><u style="width:${p}%"></u></div><small style="color:var(--mut)">${t('v_of',{s:f(v.s,'SEK'),t:f(v.t,'SEK')})}</small><button class="btn ghost" style="margin-top:14px;width:100%" data-i="${i}">${t('v_add')}</button></div>`}).join('');
  $$('#vaultList [data-i]').forEach(b=>b.onclick=async()=>{const r=await API.fundVault(+b.dataset.i,1000);if(r.ok){drawVaults();drawWallet();drawHistory()}});
}
$('#vAdd').onclick=async()=>{
  const n=$('#vn').value.trim(),tg=+$('#vt').value;
  const r=await API.createVault(n,tg);
  if(r.ok){$('#vn').value=$('#vt').value='';drawVaults()}
};

/* ---------- insights ---------- */
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/features.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
function drawInsights(){
  const cats=[['Groceries',4200],['Dining',2600],['Transport',1500],['Subscriptions',640],['Other',1100]],mx=4200;
  $('#cats').innerHTML=cats.map(([n,v])=>`<div class="cat"><span>${cat(n)}</span><div class="bar"><u style="width:${v/mx*100}%"></u></div><span>${f(v,'SEK').replace(/,00\s/,' ')}</span></div>`).join('');
  const d=[22,48,15,60,35,90,41],l=t('i_days').split(',');
  $('#week').setAttribute('aria-label',t('i_aria'));
  $('#week').innerHTML=d.map((v,i)=>`<rect x="${i*44+10}" y="${150-v*1.4}" width="28" height="${v*1.4}" rx="5" fill="${v===90?'#f3d97a':'#d4af37'}" opacity="${v===90?1:.55}"/><text x="${i*44+24}" y="167" text-anchor="middle" fill="#8f9bbd" font-size="11">${l[i]}</text>`).join('');
  $('#tip').textContent=t('i_tip');
}

/* ---------- settings ---------- */
$('#sName').value=set.name;$('#sEmail').value=set.email;$('#sPhone').value=set.phone;
tgl('#tfa',set.twofa,v=>saveSet({twofa:v}));
tgl('#nPay',set.notif.payments,v=>saveSet({notif:{...set.notif,payments:v}}));
tgl('#nSec',set.notif.security,v=>saveSet({notif:{...set.notif,security:v}}));
tgl('#nPromo',set.notif.promo,v=>saveSet({notif:{...set.notif,promo:v}}));
$('#sSave').onclick=async()=>{
  const n=$('#sName').value.trim(),e=$('#sEmail').value.trim(),m=$('#stMsg');
  if(!n||!/^\S+@\S+\.\S+$/.test(e)){m.style.color='var(--bad)';m.textContent=t('st_e');return}
  await saveSet({name:n,email:e,phone:$('#sPhone').value.trim()});
  m.style.color='var(--ok)';m.textContent=t('st_saved');drawWallet();drawCard();
};
$('#reset').onclick=()=>{if(confirm(t('st_rq'))){API.reset();location.reload()}};

/* ---------- KYC ---------- */
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/kyc.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
function drawKyc(){
  const done=S.kyc>=100;
  $('#kycSteps').innerHTML=[['k_s1',1],['k_s2',2],['k_s3',3]].map(([k,n])=>`<li class="${done||(n<3&&S.kyc>=70)?'ok':''}"><span>${done||(n<3&&S.kyc>=70)?'✓':n}</span>${t(k)}</li>`).join('');
  $('#kycForm').style.display=done?'none':'block';
  $('#kMsg').style.color=done?'var(--ok)':'';$('#kMsg').textContent=done?t('k_done'):'';
  $('#kycPct').textContent=S.kyc+'%';$('#kycBar').style.width=S.kyc+'%';
}
$('#kId').onchange=e=>{$('#kFile').textContent=e.target.files[0]?e.target.files[0].name:''};
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/kyc.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
$('#kSubmit').onclick=async()=>{
  const m=$('#kMsg');
  if(!$('#kName').value.trim()||!/^\S+@\S+\.\S+$/.test($('#kEmail').value.trim())||!$('#kId').files.length){m.style.color='var(--bad)';m.textContent=t('k_e');return}
  await API.setKyc(100);drawKyc();toast(t('k_done'));
};
$('.kyc').onclick=()=>show('kyc');$('.kyc').style.cursor='pointer';

/* ---------- language ---------- */
function applyLang(){
  const l=I18N.lang;
  document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';document.title=t('title');
  I18N.apply(document);
  $('#lang').textContent={en:'عربي',ar:'Svenska',sv:'EN'}[l];
  $$('#langSeg button').forEach(b=>b.classList.toggle('on',b.dataset.l===l));
  ['#cMsg','#sMsg','#stMsg','#pMsg'].forEach(i=>$(i).textContent='');
  drawWallet();drawCard();drawVaults();drawInsights();setMode(mode);drawHistory();drawKyc();typeof drawExtra==='function'&&drawExtra();
}
const setLang=l=>{I18N.lang=l;saveSet({lang:l});applyLang()};
$('#lang').onclick=()=>setLang({en:'ar',ar:'sv',sv:'en'}[I18N.lang]);
$$('#langSeg button').forEach(b=>b.onclick=()=>setLang(b.dataset.l));

/* ---------- PWA ---------- */
let dp;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e;$('#inst').disabled=false});
addEventListener('appinstalled',()=>{dp=null;$('#inst').disabled=true});
$('#inst').onclick=async()=>{if(!dp)return;dp.prompt();await dp.userChoice;dp=null;$('#inst').disabled=true};
if('serviceWorker' in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});

/* ---------- init ---------- */
$('#kycPct').textContent=S.kyc+'%';$('#kycBar').style.width=S.kyc+'%';
I18N.lang=['ar','sv'].includes(set.lang)?set.lang:'en';
applyLang();
