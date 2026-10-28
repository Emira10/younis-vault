/* Younis & Co. — v18.js
   Additions only: nothing in the other JS files is edited or deleted. Loaded last; remove its <script> and v18.css <link> to switch it off.
   draft.js / addons.js keep their internals private, so this file works only through the page (DOM) and the globals of app.js / features.js.
   1) Start screen with "Log in" + "Create account". The 5-step registration journey is untouched: it runs after sign-up / first login, as before.
   2) Add wallet: every world currency, with search.
   3) Receive screen: Country of residence lists every country.
   Rates are demo values; draft.js already pulls live rates (open.er-api.com) and they overwrite these automatically. */
(()=>{
const $1=s=>document.querySelector(s);
const lang=()=>I18N.lang,isAr=()=>lang()==='ar';
const tr=(en,ar,sv)=>isAr()?ar:(lang()==='sv'&&sv?sv:en);
const dn=(type,code,l)=>{try{return new Intl.DisplayNames([l||(['ar','sv'].includes(lang())?lang():'en')],{type}).of(code)||code}catch(e){return code}};
const mk=(cls,h,z)=>{const m=document.createElement('div');m.className=cls;if(z)m.style.zIndex=z;m.innerHTML=h;document.body.appendChild(m);return m};

/* ---------- 1) Start screen + registration journey removed ---------- */
const startLabels=()=>{const a=$1('#oLogin'),b=$1('#oReg'),l=$1('#v18L'),g=$1('#lang');if(a)a.textContent=t('a_login');if(b)b.textContent=t('a_reg');if(l&&g)l.textContent=g.textContent.trim()};
const go=mode=>{const o=$1('#v18-start');if(o)o.remove();if(S.auth.session)return;am=mode;auOtp=null;auPend=null;authUI();auInit()};
const showStart=()=>{if(S.auth.session||$1('#v18-start'))return;
  const o=mk('yc-ov full','<div class="ob"><img src="icons/logo.png" width="170" alt="Younis Vault"><p style="color:var(--mut);margin:6px 0 14px">Trust in Every Detail</p><button class="btn ghost" id="v18L"></button><div class="v18-start"><button class="btn" id="oLogin"></button><button class="btn ghost" id="oReg"></button></div></div>');
  o.id='v18-start';startLabels();
  $1('#oLogin').onclick=()=>go('login');$1('#oReg').onclick=()=>go('reg');$1('#v18L').onclick=()=>{const g=$1('#lang');if(g)g.click()}};
const al=applyLang;applyLang=function(){al();startLabels()};
showStart();

/* ---------- 2) Add wallet: all world currencies ---------- */
const CU=V18_CU;
const SPC={XOF:'SN',XAF:'CM',XCD:'AG',XPF:'PF',XCG:'CW'};
const symOf=c=>{try{const p=new Intl.NumberFormat('en',{style:'currency',currency:c,currencyDisplay:'narrowSymbol'}).formatToParts(0).find(x=>x.type==='currency');return p?p.value:c}catch(e){return c}};
const fillCur=c=>{if(!CU[c])return;if(!(c in rate)){rate[c]=9.5/CU[c];try{const x=JSON.parse(localStorage.yc_fx||'null');if(x&&x.r&&x.r[c]>0)rate[c]=1/x.r[c]}catch(e){}}if(!(c in sym))sym[c]=symOf(c);if(!(c in cc))cc[c]=SPC[c]||c.slice(0,2)};
const persist=()=>{try{API.saveSettings({})}catch(e){}};
const dxNote=()=>{const s=$1('#dx [data-t="addw"] small'),v=tr('All world currencies','كل عملات العالم','Alla världens valutor');if(s&&s.textContent!==v)s.textContent=v};
const addWallet=c=>{fillCur(c);wal[c]=0;persist();try{drawWallet()}catch(e){}try{drawExtra()}catch(e){}try{drawHistory()}catch(e){}try{xRate()}catch(e){}toast(tr('Wallet added: ','تمت إضافة المحفظة: ','Plånbok tillagd: ')+c)};
const openAdd=()=>{
  const TOP=['USD','EUR','TRY'];const names=Object.keys(CU).sort((a,b)=>(TOP.includes(a)?TOP.indexOf(a):99)-(TOP.includes(b)?TOP.indexOf(b):99)||(a<b?-1:1)).map(c=>[c,dn('currency',c)]);
  const m=mk('yc-ov',`<div class="yc-m"><h3>${tr('Add a wallet','إضافة محفظة','Lägg till plånbok')}</h3><p style="color:var(--mut)">${tr('Choose any world currency to open its wallet.','اختر أي عملة في العالم لفتح محفظتها.','Välj valfri valuta för att öppna plånboken.')}</p><input id="v18q" type="search" autocomplete="off" dir="auto" placeholder="${tr('Search currency or code…','ابحث عن عملة أو رمزها…','Sök valuta eller kod…')}"><div class="ad-cur" id="v18l"></div><div class="btns"><button class="btn ghost" data-x>${t('p_x')}</button></div></div>`,9950);
  m.addEventListener('click',e=>{if(e.target===m||e.target.closest('[data-x]'))m.remove()});
  const list=m.querySelector('#v18l'),q=m.querySelector('#v18q');
  const draw=()=>{const s=q.value.trim().toLowerCase();list.innerHTML=names.filter(([c,n])=>!s||c.toLowerCase().includes(s)||String(n).toLowerCase().includes(s)).map(([c,n])=>`<button data-c="${c}"${c in wal?' style="opacity:.6"':''}><b>${c}${c in wal?' ✓':''}</b>${esc(n)}</button>`).join('')||'—'};
  q.oninput=draw;draw();
  list.onclick=e=>{const b=e.target.closest('[data-c]');if(!b)return;if(b.dataset.c in wal){toast(tr('You already have this wallet: ','محفظة هذه العملة موجودة عندك: ','Du har redan denna plånbok: ')+b.dataset.c);return}m.remove();addWallet(b.dataset.c)}};
/* registered on document (capture) so it runs before the old 12-currency handler in addons.js, which it replaces */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#dx [data-t="addw"]');if(!b)return;e.stopImmediatePropagation();e.preventDefault();openAdd()},true);
const dx=$1('#dx');if(dx){new MutationObserver(dxNote).observe(dx,{childList:true});dxNote()}
/* wallets saved from an earlier visit need their rate/symbol again after a reload */
Object.keys(wal).forEach(fillCur);try{drawWallet();drawHistory()}catch(e){}

/* ---------- 3) Receive: Country of residence = every country ---------- */
const IBL='AD24,AE23,AL28,AT20,AZ28,BA20,BE16,BG22,BH22,BI16,BR29,BY28,CH21,CR22,CY28,CZ24,DE22,DJ27,DK18,DO28,EE20,EG29,ES24,FI18,FO18,FR27,GB22,GE22,GI23,GL18,GR27,GT28,HN28,HR21,HU28,IE22,IL23,IQ23,IS26,IT27,JO30,KW30,KZ20,LB28,LC32,LI21,LT20,LU20,LV21,LY25,MC27,MD24,ME22,MK19,MN20,MR27,MT31,MU30,NI28,NL18,NO15,OM23,PK24,PL28,PS29,PT25,QA29,RO24,RS22,RU33,SA24,SC31,SD18,SE24,SI19,SK24,SM27,SO23,ST25,SV28,TL23,TN24,TR26,UA29,VA22,VG24,XK20,YE30';
const SEPA=new Set('AT BE CY EE FI FR DE GR IE IT LV LT LU MT NL PT SK SI ES HR BG CZ DK HU PL RO SE IS LI NO CH GB MC SM AD VA ME MK AL RS MD'.split(' '));
const IBANLEN={};IBL.split(',').forEach(p=>IBANLEN[p.slice(0,2)]=+p.slice(2));
const OLD11=new Set('DE FR ES IT NL SE PL CH NO DK AE'.split(' '));   /* the countries draft.js handles by itself */
const mtFor=k=>k==='GB'?'Faster Payments · BACS · CHAPS · SEPA':SEPA.has(k)?'SEPA Credit Transfer · SEPA Instant':k==='US'?'ACH · Fedwire · SWIFT':k==='CA'?'EFT · Interac e-Transfer · SWIFT':'SWIFT international transfer · Local bank transfer';
const ibanOf=k=>{const n=IBANLEN[k]||22,b=('50000000058398254417902361584'.repeat(3)).slice(0,n-4);return k+String(98-m97(b+k+'00')).padStart(2,'0')+b};
const showCountry=(box,k)=>{
  const ib=ibanOf(k),sp=ib.replace(/(.{4})/g,'$1 ').trim(),bd=box.querySelectorAll('bdi');
  if(bd[0])bd[0].textContent=sp;if(bd[1])bd[1].textContent=mtFor(k);
  let cp=box.querySelector('#rcCp');if(cp){const c2=cp.cloneNode(true);cp.replaceWith(c2);c2.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(ib);toast(t('rc_copied'))}}
  box.querySelectorAll('.v18-find').forEach(x=>x.remove());
  if(!IBANLEN[k]){const p=document.createElement('p');p.className='v18-find';p.style.cssText='color:var(--mut);font-size:13px';p.textContent=tr('This country does not use IBAN. A Younis demo IBAN is shown for receiving international transfers.','هذه الدولة لا تستخدم نظام IBAN. نعرض IBAN تجريبياً من يونس لاستقبال الحوالات الدولية.');box.appendChild(p)}};
const augment=()=>{const box=$1('#rcList'),s=box&&box.querySelector('#rcC');if(!s||s.dataset.v18)return;
  const cur=s.value,i=isAr()?1:0,loc=isAr()?'ar':lang()==='sv'?'sv':'en';
  const all=(typeof auC!=='undefined'?auC:[]).slice();OLD11.forEach(k=>{if(!all.includes(k))all.push(k)});
  s.innerHTML=all.map(k=>[k,dn('region',k)]).sort((a,b)=>a[1].localeCompare(b[1],loc)).map(([k,n])=>`<option value="${k}"${k===cur?' selected':''}>${esc(n)}</option>`).join('');
  s.dataset.v18='1';
  /* the 11 original countries keep working through draft.js; every other country is handled here */
  s.addEventListener('change',e=>{if(OLD11.has(s.value))return;e.stopImmediatePropagation();showCountry(box,s.value)},true);
  void i};
const rcl=$1('#rcList');if(rcl){new MutationObserver(augment).observe(rcl,{childList:true});augment()}
})();
