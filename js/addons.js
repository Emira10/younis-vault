/* Younis & Co. — addons.js (v15)
   Additions only: this file does not edit or remove anything in the other JS files.
   It sits on top of them (loaded last) and can be switched off by removing its <script> and addons.css <link> from index.html.
   Demo data only — no backend. */
(()=>{
const LS=(()=>{try{localStorage.setItem('_a','1');localStorage.removeItem('_a');return localStorage}catch(e){const m={};return{getItem:k=>m[k]??null,setItem:(k,v)=>{m[k]=String(v)}}}})();
const lg=()=>I18N.lang,T=(en,ar,sv)=>lg()==='ar'?ar:(lg()==='sv'&&sv?sv:en);
const RTL=['ar','he','fa','ur'];
const FEE={p2p:[0,0],local:[.005,.5],intl:[.012,1.5]};          // same numbers the existing fee box already shows
const el=h=>{const d=document.createElement('div');d.innerHTML=h.trim();return d.firstChild};
const modal=h=>{const m=el(`<div class="yc-ov" style="z-index:9950"><div class="yc-m">${h}</div></div>`);m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-x]'))m.remove()});document.body.appendChild(m);return m};
const say=(sel,ok,txt)=>{if(typeof msg==='function')msg(sel,ok,txt);else{const n=$(sel);if(n){n.style.color=ok?'var(--ok)':'var(--bad)';n.textContent=txt}}};
const persist=()=>{try{API.saveSettings({})}catch(e){}};
const fmt=(v,c)=>{try{return f(v,c)}catch(e){return v.toFixed(2)+' '+c}};

/* =====================================================================
   1) Transfer screen: sender, recipient name, recipient currency,
      corridors (Europe <-> UAE), live exchange rate, full fee box
   ===================================================================== */
const CORR=[['Europe → UAE','أوروبا ← الإمارات','Europa → UAE','EUR','AED'],['UAE → Europe','الإمارات ← أوروبا','UAE → Europa','AED','EUR'],['Within Europe','داخل أوروبا','Inom Europa','SEK','EUR'],['Global','عالمي','Globalt','USD','EUR']];
let corr=-1,LAST=null;
$('#fee').insertAdjacentHTML('beforebegin',`<div class="ad-box" id="ad-send"><div class="ad-corr" id="adCorr"></div><div class="ad-row"><span id="adSL"></span><b id="adSnd" dir="auto"></b></div><label id="adNL" for="adName"></label><input id="adName" dir="auto" autocomplete="off"><label id="adCL" for="adRc"></label><select id="adRc"></select><div class="ad-rate"><i></i><span id="adRate"></span></div></div>`);
const rcFill=()=>{const s=$('#adRc'),ks=Object.keys(rate).sort();if(s.options.length!==ks.length){const v=s.value;s.innerHTML=ks.map(c=>`<option>${c}</option>`).join('');if(v)s.value=v}};
$('#adRc').onchange=()=>{$('#adRc').dataset.u=1;upd()};
function drawCorr(){$('#adCorr').innerHTML=CORR.map((c,i)=>`<button type="button" class="${i===corr?'on':''}" data-i="${i}">${T(c[0],c[1],c[2])}</button>`).join('');
  $$('#adCorr [data-i]').forEach(b=>b.onclick=()=>{const c=CORR[+b.dataset.i];corr=+b.dataset.i;if(c[3] in wal){$('#from').value=c[3];$('#from').dispatchEvent(new Event('change'))}rcFill();$('#adRc').value=c[4];$('#adRc').dataset.u=1;drawCorr();upd()})}
const senderIban=c=>{try{return iban(c)}catch(e){return''}};
function upd(){
  rcFill();const c=$('#from').value||'SEK';if(!$('#adRc').dataset.u)$('#adRc').value=c;const rc=$('#adRc').value||c;
  const r=rate[c]/rate[rc];
  $('#adSnd').textContent=set.name+' · '+c+(senderIban(c)?' · '+senderIban(c):'');
  $('#adRate').innerHTML=`<b>1 ${c} = ${r<.01?r.toFixed(6):r.toFixed(4)} ${rc}</b> <small>· ${T('Live rate','سعر الصرف المباشر','Live-kurs')} · ${new Date().toLocaleTimeString(({ar:'ar-u-nu-latn',sv:'sv-SE'})[lg()]||'en-GB')}</small>`;
  post();
}
function post(){
  const c=$('#from').value||'SEK',rc=$('#adRc').value||c,a=parseFloat($('#amt').value)||0,r=rate[c]/rate[rc],to=$('#to').value.trim(),box=$('#feeBox');if(!box)return;
  const row=(k,v)=>`<div class="rw"><span>${k}</span><b>${v}</b></div>`;
  if(mode==='p2p'){
    $('#to').placeholder=T('Phone number, email or @user ID','رقم الهاتف أو الإيميل أو معرّف المستخدم @','Telefon, e-post eller @användar-ID');
    if(!to){box.innerHTML='';return}
    const u=findUser(to);
    if(u){box.innerHTML=`<div class="free">✓ ${T('Transfer fee: 0.00 — Free & instant','رسوم التحويل: 0.00 — مجاني وفوري بالكامل','Överföringsavgift: 0,00 — Gratis och direkt')}</div><div class="ad-who">${T('Younis & Co. member','عضو في Younis & Co.','Medlem i Younis & Co.')}: <bdi>${esc(u[1])}</bdi> ${u[0]?'· <bdi dir="ltr">'+esc(u[0])+'</bdi>':''}</div>`+(a>0?`<div class="fb">${row(T('Recipient gets','يصل للمستلم','Mottagaren får'),fmt(a*r,rc))}</div>`:'')}
    else if(/^@?[\w.\-]{3,}$|^\S+@\S+\.\S+$|^\+?\d[\d\s]{6,}$/.test(to)){box.innerHTML=`<div class="ad-warn">${T('Not a registered Younis & Co. user. Free transfers work only between app members — use “International” or “Local” for a bank account.','هذا المستخدم غير مسجّل في Younis & Co. التحويل المجاني بين أعضاء التطبيق فقط — استخدم تحويل "دولي" أو "محلي" لحساب بنكي.','Inte en registrerad Younis & Co.-användare. Gratis överföring gäller bara mellan medlemmar — använd Internationell eller Lokal för bankkonto.')}</div>`}
    else box.innerHTML='';
    return}
  const [p,x]=FEE[mode],pct=a*p,tot=pct+x;
  box.innerHTML=`<div class="fb">${row(`${T('Transfer fee','رسوم التحويل','Överföringsavgift')} (${(p*100).toFixed(1)}%)`,fmt(pct,c))}${row(T('Fixed bank charge','رسوم بنكية ثابتة','Fast bankavgift'),fmt(x,c))}${row(T('Total fees','إجمالي الرسوم','Totala avgifter'),fmt(tot,c))}${row(T('Total debited','المبلغ المخصوم','Totalt debiterat'),fmt(a+tot,c))}${row(T('Recipient gets','يصل للمستلم','Mottagaren får'),fmt(a*r,rc))}</div>`;
}
['#to','#amt','#from'].forEach(i=>{$(i).addEventListener('input',upd);$(i).addEventListener('change',upd)});
$$('#mode button').forEach(b=>b.addEventListener('click',()=>setTimeout(upd,30)));
['#to','#amt','#from'].forEach(i=>$(i).addEventListener('input',()=>{const m=$('#sMsg');if(m.dataset.ad){m.textContent='';delete m.dataset.ad}}));
$$('#mode button').forEach(b=>b.addEventListener('click',()=>{const m=$('#sMsg');if(m.dataset.ad){m.textContent='';delete m.dataset.ad}}));
setInterval(()=>{if($('#send').classList.contains('on')&&!document.hidden)upd()},4000);

/* =====================================================================
   2) P2P free transfer only for REGISTERED members (phone / email / @user ID)
   ===================================================================== */
const USERS=[['@layla.k','Layla K.','+971501234567','layla@younis.co'],['@omar.s','Omar S.','+4915123456789','omar@younis.co'],['@sara.m','Sara M.','+46701234567','sara@younis.co'],['@hassan','Hassan A.','+33612345678','hassan@younis.co'],['@nour','Nour H.','+41791234567','nour@younis.co']];
const digits=s=>s.replace(/\D/g,'');
function findUser(q){q=q.trim().toLowerCase();if(!q)return null;const id=q.replace(/^@/,''),dg=digits(q);
  const u=USERS.find(u=>u[0].slice(1)===id||u[3]===q||(dg.length>=7&&digits(u[2])===dg));if(u)return u;
  const au=(API.state.auth&&API.state.auth.users)||[];const a=au.find(x=>x.email===q&&q!==String(set.email).toLowerCase());return a?['',q.split('@')[0],'',q]:null}
$('#sendBtn').addEventListener('click',e=>{
  if(mode!=='p2p')return;const to=$('#to').value.trim();if(!to)return;
  const u=findUser(to),m=$('#sMsg');
  if(!u){e.stopImmediatePropagation();e.preventDefault();m.dataset.ad=1;say('#sMsg',0,T('This recipient is not a registered member. Use International / Local transfer for bank accounts.','هذا المستلم غير مسجّل في التطبيق. استخدم التحويل الدولي / المحلي للحسابات البنكية.','Mottagaren är inte medlem. Använd Internationell / Lokal för bankkonton.'));return}
  if(!/^\S+@\S+\.\S+$|^\+?\d[\d\s]{6,}$/.test(to))$('#to').value=u[2]||u[3];      // a user ID is resolved to the member's phone so the existing validation passes
},true);

/* =====================================================================
   3) Fixed bank charge is really charged, so the disclosed fees match the balance
   ===================================================================== */
const T0=API.transfer.bind(API);
API.transfer=async function(o){
  const fx=(FEE[o.mode]||[0,0])[1];
  if(fx>0&&o.amount>0&&o.amount*(1+FEE[o.mode][0])+fx>(wal[o.currency]||0))return{ok:false,code:'funds',available:wal[o.currency]||0};
  const r=await T0(o);
  if(r.ok&&fx>0){wal[o.currency]-=fx;txs.unshift(['Fixed bank charge','Bills',-fx,o.currency,new Date().toISOString()]);persist()}
  return r};
$('#cfOk').addEventListener('click',()=>{const c=$('#from').value,a=parseFloat($('#amt').value)||0,to=$('#to').value.trim(),rc=$('#adRc').value||c;
  LAST={c,a,to,rc,mode,name:$('#adName').value.trim()||(mode==='p2p'&&(findUser(to)||[])[1])||'',r:rate[c]/rate[rc],snd:set.name+' · '+senderIban(c)}},true);

/* =====================================================================
   4) Receipt: recipient name + account, sent & received amounts/currencies, rate, all fees
   ===================================================================== */
new MutationObserver(()=>{
  const r=$('#rcpt'),sl=r&&r.querySelector('.rc-slip');if(!sl||sl.dataset.ad||!LAST)return;sl.dataset.ad=1;
  const L=LAST,[p,x]=FEE[L.mode],pct=L.a*p,get=L.a*L.r;
  const row=(k,v)=>`<div class="rw"><span>${k}</span><b><bdi dir="auto">${v}</bdi></b></div>`;
  const acct=L.mode==='p2p'?esc(L.to):esc(L.to.replace(/\s/g,'').replace(/(.{4})/g,'$1 ').trim());
  const typ={p2p:T('Younis & Co. member (P2P)','عضو Younis & Co. (P2P)','Medlem (P2P)'),local:T('Local bank transfer','تحويل بنكي محلي','Lokal banköverföring'),intl:T('International transfer','تحويل دولي','Internationell överföring')}[L.mode];
  sl.insertAdjacentHTML('beforeend',row(T('Recipient','المستلم','Mottagare'),esc(L.name||'—'))+row(T('Recipient account','حساب المستلم','Mottagarens konto'),acct)+row(T('Transfer type','نوع التحويل','Typ'),typ)+row(T('Amount sent','المبلغ المرسل','Skickat belopp'),fmt(L.a,L.c))+row(T('Exchange rate','سعر الصرف','Växelkurs'),`1 ${L.c} = ${L.r<.01?L.r.toFixed(6):L.r.toFixed(4)} ${L.rc}`)+row(T('Amount received','المبلغ المستلم','Mottaget belopp'),fmt(get,L.rc))+(x>0?row(T('Fixed bank charge','رسوم بنكية ثابتة','Fast bankavgift'),fmt(x,L.c)):'')+row(T('Total fees','إجمالي الرسوم','Totala avgifter'),fmt(pct+x,L.c)));
  [...sl.querySelectorAll('.rw')].forEach(w=>{const k=w.children[0].textContent;
    if(k===t('r_tot'))w.children[1].innerHTML=`<bdi dir="auto">${fmt(L.a+pct+x,L.c)}</bdi>`;
    if(k===t('r_fee'))w.children[1].innerHTML=`<bdi dir="auto">${fmt(pct+x,L.c)}</bdi>`});
  $('#adName').value='';delete $('#adRc').dataset.u;upd();
}).observe($('#rcpt'),{childList:true});

/* =====================================================================
   5) Global bank search (~190 banks, 45+ countries) with monogram badges
   ===================================================================== */
const BANKS={AE:'Emirates NBD|Mashreq|ADCB|First Abu Dhabi Bank|Dubai Islamic Bank|RAKBANK|Commercial Bank of Dubai|Emirates Islamic|Abu Dhabi Islamic Bank|Sharjah Islamic Bank|Ajman Bank|National Bank of Fujairah|Wio Bank|Liv',SA:'Al Rajhi Bank|Saudi National Bank|Riyad Bank|SABB|Alinma Bank|Banque Saudi Fransi',QA:'QNB|Doha Bank|Commercial Bank Qatar|Dukhan Bank',KW:'National Bank of Kuwait|Kuwait Finance House|Gulf Bank',BH:'National Bank of Bahrain|BBK',OM:'Bank Muscat|Sohar International',EG:'CIB Egypt|Banque Misr|National Bank of Egypt',JO:'Arab Bank|Housing Bank',MA:'Attijariwafa Bank|CIH Bank|Bank of Africa',TR:'Akbank|Garanti BBVA|Ziraat Bankası|İş Bankası|Yapı Kredi|QNB Finansbank|Halkbank|VakıfBank|DenizBank',DE:'Deutsche Bank|Commerzbank|Sparkasse|Volksbank|N26|DKB|ING Germany|Postbank|HypoVereinsbank|Comdirect',FR:'BNP Paribas|Société Générale|Crédit Agricole|LCL|BPCE|Boursorama|Crédit Mutuel|La Banque Postale',ES:'Santander|BBVA|CaixaBank|Sabadell|Bankinter|Unicaja',IT:'Intesa Sanpaolo|UniCredit|Banco BPM|Fineco|Mediobanca|Poste Italiane',NL:'ING|ABN AMRO|Rabobank|bunq|Triodos',BE:'KBC|Belfius|BNP Paribas Fortis|ING Belgium',AT:'Erste Bank|Raiffeisen Bank|Bank Austria|BAWAG',CH:'UBS|ZKB|PostFinance|Raiffeisen Switzerland|Julius Baer|Migros Bank',LU:'BGL BNP Paribas|Banque et Caisse d\'Epargne',SE:'Swedbank|SEB|Nordea|Handelsbanken|Länsförsäkringar|Skandia|ICA Banken|Danske Bank Sweden',NO:'DNB|SpareBank 1|Nordea Norway|Sparebanken Vest|Storebrand',DK:'Danske Bank|Jyske Bank|Nordea Denmark|Sydbank|Nykredit',FI:'OP Financial|Nordea Finland|S-Pankki|Danske Bank Finland',IS:'Landsbankinn|Íslandsbanki|Arion banki',PL:'PKO BP|Pekao|mBank|ING Bank Śląski|Santander Bank Polska|Millennium|Alior Bank',CZ:'ČSOB|Komerční banka|Česká spořitelna|Moneta',HU:'OTP Bank|K&H Bank|Erste Hungary',RO:'BCR|BRD|Banca Transilvania|Raiffeisen Romania',BG:'UniCredit Bulbank|DSK Bank|First Investment Bank',HR:'Zagrebačka banka|Privredna banka Zagreb|Erste Croatia',SK:'Slovenská sporiteľňa|Tatra banka|VÚB',SI:'NLB|SKB',GR:'Piraeus|National Bank of Greece|Alpha Bank|Eurobank',PT:'Caixa Geral de Depósitos|Millennium bcp|Novo Banco|Santander Portugal',IE:'AIB|Bank of Ireland|PTSB',EE:'LHV|Swedbank Estonia|SEB Estonia',LV:'Swedbank Latvia|SEB Latvia|Citadele',LT:'Swedbank Lithuania|SEB Lithuania|Šiaulių bankas',GB:'HSBC|Barclays|Lloyds|NatWest|Santander UK|Monzo|Revolut|Starling|Nationwide|Halifax',US:'Chase|Bank of America|Wells Fargo|Citibank|Capital One|U.S. Bank|Goldman Sachs Marcus|PNC',CA:'RBC|TD Bank|Scotiabank|BMO|CIBC',AU:'Commonwealth Bank|Westpac|ANZ|NAB',NZ:'ANZ New Zealand|ASB|BNZ',IN:'HDFC Bank|ICICI Bank|State Bank of India|Axis Bank|Kotak',PK:'HBL|MCB Bank|UBL|Meezan Bank',SG:'DBS|OCBC|UOB',HK:'HSBC Hong Kong|Hang Seng Bank|Bank of China (HK)',JP:'MUFG|Mizuho|SMBC|Rakuten Bank',CN:'ICBC|Bank of China|China Construction Bank|Agricultural Bank of China',KR:'KB Kookmin|Shinhan|Woori|Hana',BR:'Itaú|Bradesco|Nubank|Banco do Brasil|Santander Brasil',MX:'BBVA México|Banorte|Santander México',ZA:'Standard Bank|FNB|Absa|Nedbank|Capitec',NG:'GTBank|Zenith Bank|Access Bank|First Bank of Nigeria',KE:'KCB|Equity Bank|Co-operative Bank'};
const BK=[];Object.keys(BANKS).forEach(cc=>BANKS[cc].split('|').forEach(n=>BK.push([n,cc])));
const hue=s=>[...s].reduce((a,c)=>a*31+c.charCodeAt(0),7)%360;
const badge=n=>{const ini=(n.match(/[A-Za-zÀ-ž0-9]/g)||['?']).slice(0,2).join('').toUpperCase(),h=hue(n);return`<svg viewBox="0 0 36 36" aria-hidden="true"><defs><linearGradient id="g${h}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${h} 50% 42%)"/><stop offset="1" stop-color="hsl(${(h+40)%360} 55% 26%)"/></linearGradient></defs><circle cx="18" cy="18" r="18" fill="url(#g${h})"/><text x="18" y="23" text-anchor="middle" font-size="14" font-weight="700" fill="#fff" font-family="Inter,system-ui,sans-serif">${ini}</text></svg>`};
const linked=()=>set.linked||[];
function bankDraw(){
  const q=$('#bS').value.trim().toLowerCase();let h='';
  if(q){const r=BK.filter(b=>b[0].toLowerCase().includes(q)||b[1].toLowerCase()===q).slice(0,14);
    h=r.map(b=>`<div class="ad-bk" data-ab="${esc(b[0])}" role="button" tabindex="0">${badge(b[0])}<div><b>${esc(b[0])}</b><br><small>${b[1]}</small></div>${linked().includes(b[0])?'<em>✓</em>':''}</div>`).join('')||`<div class="ad-bk" data-ab="${esc($('#bS').value.trim())}" role="button" tabindex="0">${badge($('#bS').value.trim()||'?')}<div>${T('Request this bank','اطلب إضافة هذا البنك','Begär denna bank')}</div></div>`}
  h+=linked().length?`<div class="ad-linked">✓ ${T('Linked banks','البنوك المربوطة','Länkade banker')}: <bdi>${linked().map(esc).join(' · ')}</bdi></div>`:'';
  $('#bR').innerHTML=h}
$('#bS').addEventListener('input',bankDraw);
$('#bR').addEventListener('click',e=>{const d=e.target.closest('[data-ab]');if(!d)return;const n=d.dataset.ab;API.saveSettings({linked:[n,...linked().filter(x=>x!==n)].slice(0,10)});toast(T('Linked via Open Banking (demo): ','تم الربط عبر Open Banking (تجريبي): ','Länkad via Open Banking (demo): ')+n);bankDraw()});
$('#bR').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset.ab)e.target.click()});

/* =====================================================================
   6) Languages: full list + RTL for Arabic, Hebrew, Persian, Urdu; remembers the choice after reload
   ===================================================================== */
const ALL={en:'English',ar:'العربية',sv:'Svenska',de:'Deutsch',tr:'Türkçe',fr:'Français',es:'Español',it:'Italiano',nl:'Nederlands',pl:'Polski',pt:'Português',cs:'Čeština',hu:'Magyar',ro:'Română',el:'Ελληνικά',da:'Dansk',nb:'Norsk',fi:'Suomi',bg:'Български',hr:'Hrvatski',sk:'Slovenčina',sl:'Slovenščina',et:'Eesti',lv:'Latviešu',lt:'Lietuvių',is:'Íslenska',he:'עברית',fa:'فارسی',ur:'اردو',ru:'Русский',uk:'Українська',zh:'中文',ja:'日本語',ko:'한국어',hi:'हिन्दी',id:'Bahasa Indonesia',ms:'Bahasa Melayu',vi:'Tiếng Việt',th:'ไทย',sw:'Kiswahili',sr:'Српски',bs:'Bosanski',sq:'Shqip',mk:'Македонски',mt:'Malti',ga:'Gaeilge',cy:'Cymraeg',ca:'Català',eu:'Euskara',gl:'Galego',af:'Afrikaans'};
Object.keys(ALL).forEach(l=>{if(!I18N[l])I18N[l]={}});   // missing keys fall back to English through the existing t()
function pickLang(){
  const m=modal(`<h3>${T('Language','اللغة','Språk')}</h3><input class="ad-lsearch" id="adLs" placeholder="${T('Search…','ابحث…','Sök…')}" dir="auto"><div class="lg" id="adLg"></div>`);
  const draw=q=>{$('#adLg').innerHTML=Object.keys(ALL).filter(l=>!q||(ALL[l]+' '+l).toLowerCase().includes(q)).map(l=>`<button class="btn ${l===lg()?'':'ghost'}" data-l="${l}">${ALL[l]}</button>`).join('');
    $$('#adLg [data-l]').forEach(b=>b.onclick=()=>{setLang(b.dataset.l);m.remove()})};
  draw('');$('#adLs').oninput=e=>draw(e.target.value.trim().toLowerCase())}
document.addEventListener('click',e=>{if(e.target.closest('#lang,#lang2,#langPick,#oL')){e.stopImmediatePropagation();e.preventDefault();pickLang()}},true);
const _al=applyLang;
applyLang=function(){_al();document.documentElement.lang=lg();document.documentElement.dir=RTL.includes(lg())?'rtl':'ltr';
  const nm=ALL[lg()]||lg();['#lang','#lang2','#langPick'].forEach(s=>{const n=$(s);if(n)n.textContent=nm});relabel()};

/* =====================================================================
   7) KYC screen: Residency + Passport option and a shortcut to the guided onboarding flow
   ===================================================================== */
$('#kDoc').insertAdjacentHTML('afterend',`<label class="chk ad-res"><input type="checkbox" id="adRes"><span id="adResT"></span></label><div id="adResUp" hidden><div class="ups" style="grid-template-columns:1fr"><div><label class="up" for="kRes"><img id="kResImg" alt="" hidden><span id="adResL"></span><small id="adResH"></small></label><input class="vh" id="kRes" type="file" accept="image/*" capture="environment"></div></div></div>`);
$('#adRes').onchange=()=>{$('#adResUp').hidden=!$('#adRes').checked};
$('#kRes').onchange=e=>{const f0=e.target.files[0];if(!f0)return;if(!/^image\//.test(f0.type)||f0.size>10*1024*1024){e.target.value='';return say('#kMsg',0,t('k_efile'))}const i=$('#kResImg');i.src=URL.createObjectURL(f0);i.onload=()=>URL.revokeObjectURL(i.src);i.hidden=false};
const needRes=e=>{if($('#adRes').checked&&!$('#kRes').files.length){e.stopImmediatePropagation();e.preventDefault();say('#kMsg',0,T('Residents: scan the residency card first, then the passport.','للمقيمين: امسح بطاقة الإقامة أولاً ثم جواز السفر.','Bosatta: skanna uppehållskortet först, sedan passet.'))}};
$$('[data-kn="3"]').forEach(b=>b.addEventListener('click',needRes,true));$('#kSubmit').addEventListener('click',needRes,true);
$('#kyc .top>div').insertAdjacentHTML('beforeend','<button class="btn ghost ad-kbn" id="adGuided" style="margin-top:10px"></button>');
$('#adGuided').onclick=()=>{const b=$('#dx [data-t="ob"]');if(b)b.click()};

/* =====================================================================
   8) Add wallet: choose the currency yourself (one tap)
   ===================================================================== */
const NEWC={CZK:[.43,'Kč'],HUF:[.027,'Ft'],RON:[2.2,'lei'],ISK:[.075,'kr'],BGN:[5.62,'лв'],SAR:[2.53,'SAR'],QAR:[2.61,'QAR'],KWD:[30.9,'KD'],BHD:[25.3,'BD'],OMR:[24.7,'OMR'],JOD:[13.4,'JD'],EGP:[.2,'E£']};
$('#dx').addEventListener('click',e=>{if(!e.target.closest('[data-t="addw"]'))return;e.stopImmediatePropagation();e.preventDefault();
  const free=Object.keys(NEWC).filter(c=>!(c in wal));
  const m=modal(`<h3>${T('Add a wallet','إضافة محفظة','Lägg till plånbok')}</h3><p style="color:var(--mut)">${T('Tap a currency to open its wallet.','اضغط على العملة لفتح محفظتها.','Tryck på en valuta för att öppna plånboken.')}</p><div class="ad-cur">${free.map(c=>`<button data-c="${c}"><b>${c}</b>${NEWC[c][1]}</button>`).join('')||'—'}</div><div class="btns"><button class="btn ghost" data-x>${t('p_x')}</button></div>`);
  m.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const c=b.dataset.c;wal[c]=0;if(!rate[c])rate[c]=NEWC[c][0];if(!sym[c])sym[c]=NEWC[c][1];persist();m.remove();drawWallet();try{drawExtra()}catch(x){}drawHistory();toast(T('Wallet added: ','تمت إضافة المحفظة: ','Plånbok tillagd: ')+c)})},true);

/* =====================================================================
   9) Wireframes & timeline page link, and Brief mode (hides screens that were not in the brief)
   ===================================================================== */
const wfTile=()=>{const d=$('#dx');if(!d||d.querySelector('[data-wf]'))return;d.insertAdjacentHTML('beforeend',`<button data-wf="1"><b>📐 ${T('Wireframes & Timeline','المخططات والجدول الزمني','Wireframes & tidsplan')}</b><small style="color:var(--mut)">${T('Flows · screens · schedule','التدفقات · الشاشات · الجدول','Flöden · skärmar · schema')}</small></button>`)};
new MutationObserver(wfTile).observe($('#dx'),{childList:true});
$('#dx').addEventListener('click',e=>{if(e.target.closest('[data-wf]'))window.open('wireframes.html','_blank','noopener')});
$('#design .top>div').insertAdjacentHTML('beforeend','<p><a id="adWf" href="wireframes.html" target="_blank" rel="noopener" style="color:var(--gold2)"></a></p>');
$('#settings .grid').insertAdjacentHTML('beforeend','<div class="panel" id="adBP"><h3 style="font-size:24px" id="adBT"></h3><p style="color:var(--mut);margin:8px 0 14px" id="adBD"></p><div class="sw"><span id="adBL"></span><button class="tg" role="switch" id="adBrief" aria-checked="false" aria-label="Brief mode"></button></div></div>');
const brief=on=>{document.body.classList.toggle('brief',on);$('#adBrief').setAttribute('aria-checked',on);LS.setItem('yc_brief',on?'1':'0');if(on&&['vaults','insights'].includes((document.querySelector('.view.on')||{}).id))show('wallet')};
$('#adBrief').onclick=()=>brief($('#adBrief').getAttribute('aria-checked')!=='true');
brief(LS.getItem('yc_brief')==='1');

/* ---------- labels that depend on language ---------- */
function relabel(){
  const s=(id,v)=>{const n=$(id);if(n)n.textContent=v};
  s('#adSL',T('From (sender)','المرسل','Från (avsändare)'));s('#adNL',T('Recipient name','اسم المستلم','Mottagarens namn'));s('#adCL',T('Recipient currency','عملة المستلم','Mottagarens valuta'));
  s('#adResT',T('I am a resident: Residency card + Passport','أنا مقيم: بطاقة الإقامة + جواز السفر','Jag är bosatt: Uppehållskort + Pass'));s('#adResL',T('Residency card','بطاقة الإقامة','Uppehållskort'));s('#adResH',T('Scan this first, then your passport above.','امسحها أولاً ثم جواز السفر أعلاه.','Skanna detta först, sedan passet ovan.'));
  s('#adGuided',T('Start guided scan flow','ابدأ رحلة التحقق بالمسح','Starta guidad skanning'));
  s('#adWf',T('Wireframes, flows & delivery timeline →','المخططات والتدفقات والجدول الزمني ←','Wireframes, flöden & tidsplan →'));
  s('#adBT',T('Brief mode','وضع البريف','Brief-läge'));s('#adBD',T('Hides Vaults and Insights, which were not in the original brief. Nothing is deleted.','يخفي شاشتي الخزائن والتحليلات لأنهما خارج البريف الأصلي. لا يُحذف أي شيء.','Döljer Kassaskåp och Analyser som inte fanns i briefen. Inget raderas.'));s('#adBL',T('Show only brief screens','إظهار شاشات البريف فقط','Visa bara brief-skärmar'));
  drawCorr();wfTile();upd();bankDraw()}
/* ---------- start ---------- */
const sl=set.lang;if(sl&&sl!==lg()&&I18N[sl]&&ALL[sl])I18N.lang=sl;
applyLang();
})();
