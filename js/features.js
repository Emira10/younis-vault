/* ===== Younis & Co. — v6: دخول، شحن، استلام، تحويل عملات، بطاقات، تأكيد حوالة، تقارير، خزنات ===== */
const cd=set.card=set.card||{form:'virtual',net:'VISA',show:false};
const msg=(id,ok,x)=>{const m=$(id);m.style.color=ok?'var(--ok)':'var(--bad)';m.textContent=x};
const keep=(id,h)=>{const e=$(id),v=e.value;e.innerHTML=h;if(v)e.value=v};
const cc={SEK:'SE',EUR:'DE',USD:'US',GBP:'GB',AED:'AE',NOK:'NO',DKK:'DK',TRY:'TR'};
const m97=s=>[...s].reduce((r,ch)=>(r*(/\d/.test(ch)?10:100)+(/\d/.test(ch)?+ch:ch.charCodeAt(0)-55))%97,0);
const ibanOk=s=>{s=s.replace(/\s/g,'').toUpperCase();return /^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)&&m97(s.slice(4)+s.slice(0,4))===1};
const iban=c=>{const b='5000000005839825'+String(c.charCodeAt(0)*c.charCodeAt(1)).padStart(4,'0'),k=98-m97(b+cc[c]+'00');return(cc[c]+String(k).padStart(2,'0')+b).replace(/(.{4})/g,'$1 ').trim()};
const LOC=()=>({ar:'ar-u-nu-latn',sv:'sv-SE'})[I18N.lang]||'en-GB';
let tm='card',am='login';

/* ---------- دخول / تسجيل (v13): تسجيل بخمس خطوات + رمز تحقق + قفل بعد محاولات فاشلة ---------- */
Object.assign(I18N.en,{r_next:'Continue',r_back:'Back',r_show:'Show',r_hide:'Hide',r_pwh:'10+ characters with upper and lower case, a number and a symbol.',
 r_e_email:'Enter a valid email address.',r_e_phone:'Enter a valid mobile number.',r_e_pass:'Password must have 10+ characters, upper and lower case, a number and a symbol, and must not be a common password.',r_e_pass2:'Passwords do not match.',
 r_e_name:'Enter your first and last name exactly as on your ID.',r_e_dob:'You must be 18 or older.',r_e_req:'Please complete all required fields.',r_e_id:'Invalid ID number.',r_e_pnr:'Invalid Swedish personal number (check digits and birth date).',
 r_e_addr:'Enter a complete address.',r_e_tin:'Enter a valid tax identification number.',r_e_pep:'Please answer the political exposure question.',r_e_cons:'You must accept all required declarations.',
 r_e_otp:'Wrong code. {n} attempts left.',r_e_otpx:'Code expired or too many attempts. Please start again.',r_e_lock:'Too many failed attempts. Try again in {s} seconds.',
 r_otp_t:'Verify it is you',r_otp_s:'Enter the 6-digit code sent to your phone and email.',r_demo_code:'Demo only — your code is {c}. A real app sends it by SMS or email.',r_verify:'Verify',r_resend:'Resend code',r_resend_in:'Resend in {s}s'});
Object.assign(I18N.ar,{r_next:'متابعة',r_back:'رجوع',r_show:'إظهار',r_hide:'إخفاء',r_pwh:'10 أحرف أو أكثر مع حرف كبير وصغير ورقم ورمز.',
 r_e_email:'أدخل بريداً إلكترونياً صحيحاً.',r_e_phone:'أدخل رقم جوال صحيحاً.',r_e_pass:'كلمة المرور يجب أن تكون 10 أحرف فأكثر مع حرف كبير وصغير ورقم ورمز، وألا تكون شائعة.',r_e_pass2:'كلمتا المرور غير متطابقتين.',
 r_e_name:'أدخل الاسم الأول واسم العائلة تماماً كما في الهوية.',r_e_dob:'يجب أن يكون عمرك 18 سنة أو أكثر.',r_e_req:'أكمل كل الحقول المطلوبة.',r_e_id:'رقم الوثيقة غير صالح.',r_e_pnr:'الرقم الشخصي السويدي غير صالح (تحقق من الأرقام وتاريخ الميلاد).',
 r_e_addr:'أدخل عنواناً كاملاً.',r_e_tin:'أدخل رقماً ضريبياً صحيحاً.',r_e_pep:'أجب عن سؤال الانكشاف السياسي.',r_e_cons:'يجب قبول كل الإقرارات المطلوبة.',
 r_e_otp:'الرمز خاطئ. بقي {n} محاولات.',r_e_otpx:'انتهى الرمز أو تجاوزت عدد المحاولات. ابدأ من جديد.',r_e_lock:'محاولات فاشلة كثيرة. حاول بعد {s} ثانية.',
 r_otp_t:'تحقق من هويتك',r_otp_s:'أدخل الرمز المكوّن من 6 أرقام المرسل إلى جوالك وبريدك.',r_demo_code:'للتجربة فقط — رمزك هو {c}. التطبيق الحقيقي يرسله برسالة نصية أو بريد.',r_verify:'تحقق',r_resend:'إعادة إرسال الرمز',r_resend_in:'إعادة الإرسال بعد {s} ث'});
const auL=a=>I18N.lang==='ar'?a[1]:a[0];
const auC=['SE','NO','DK','FI','DE','FR','NL','GB','US','TR','AE','SA','EG','JO','LB','SY','IQ','PS','KW','QA'];
const auPH={SE:46,NO:47,DK:45,FI:358,DE:49,FR:33,NL:31,GB:44,US:1,TR:90,AE:971,SA:966,EG:20,JO:962,LB:961,SY:963,IQ:964,PS:970,KW:965,QA:974};
const auCN=c=>{try{return new Intl.DisplayNames([LOC()],{type:'region'}).of(c)}catch(e){return c}};
const auO={emp:[['emp','Employed','موظف'],['self','Self-employed','يعمل لحسابه'],['biz','Business owner','صاحب شركة'],['stu','Student','طالب'],['ret','Retired','متقاعد'],['non','Not employed','بدون عمل']],
 src:[['sal','Salary','راتب'],['biz','Business income','دخل تجاري'],['sav','Savings','مدخرات'],['inv','Investments','استثمارات'],['inh','Inheritance or gift','ميراث أو هبة']],
 vol:[['1','Under 10,000 kr / month','أقل من 10,000 kr شهرياً'],['2','10,000 – 50,000 kr','10,000 – 50,000 kr'],['3','50,000 – 200,000 kr','50,000 – 200,000 kr'],['4','Over 200,000 kr','أكثر من 200,000 kr']],
 pur:[['day','Everyday spending','إنفاق يومي'],['sav','Saving','ادخار'],['abr','Sending money abroad','تحويلات للخارج'],['biz','Business payments','مدفوعات تجارية']],
 idt:[['pnr','Swedish personal number','رقم شخصي سويدي'],['pas','Passport number','رقم جواز السفر'],['nid','National ID number','رقم الهوية الوطنية']],
 sq:[['pet','Name of your first pet','اسم أول حيوان أليف'],['sch','Your first school','اسم أول مدرسة'],['cty','City where you were born','مدينة الولادة']]};
const auF={rEmail:['Email','البريد الإلكتروني','email',0,'email'],rPhone:['Mobile number','رقم الجوال'],rPass:['Password','كلمة المرور','password',0,'new-password'],rPass2:['Confirm password','تأكيد كلمة المرور','password',0,'new-password'],
 rFirst:['First name (as on ID)','الاسم الأول (كما في الهوية)','text',0,'given-name'],rLast:['Last name','اسم العائلة','text',0,'family-name'],rDob:['Date of birth','تاريخ الميلاد','date',0,'bday'],rNat:['Nationality','الجنسية','country'],
 rIdT:['ID document type','نوع الوثيقة','sel','idt'],rId:['ID number','رقم الوثيقة','text'],rStreet:['Street address','العنوان','text',0,'address-line1'],rZip:['Postal code','الرمز البريدي','text',0,'postal-code'],
 rCity:['City','المدينة','text',0,'address-level2'],rCtry:['Country of residence','بلد الإقامة','country'],rEmp:['Employment status','الحالة الوظيفية','sel','emp'],rEmpr:['Employer or business (optional)','جهة العمل (اختياري)','text'],
 rSrc:['Source of funds','مصدر الأموال','sel','src'],rVol:['Expected monthly volume','الحجم الشهري المتوقع','sel','vol'],rPur:['Main purpose of the account','الغرض الرئيسي من الحساب','sel','pur'],
 rTaxC:['Country of tax residence','بلد الإقامة الضريبية','country'],rTin:['Tax identification number (TIN)','الرقم الضريبي (TIN)','text'],rSq:['Security question','سؤال الأمان','sel','sq'],rSa:['Your answer','إجابتك','text']};
const auS=[['Account','الحساب',['rEmail','rPhone','rPass','rPass2']],['Personal details','البيانات الشخصية',['rFirst','rLast','rDob','rNat','rIdT','rId']],['Address','العنوان',['rStreet','rZip','rCity','rCtry']],
 ['Financial profile','الملف المالي',['rEmp','rEmpr','rSrc','rVol','rPur','rTaxC','rTin','PEP']],['Security and consent','الأمان والموافقات',['rSq','rSa','CONS']]];
let auWs=1,auWd={},auPend=null,auOtp=null,auTm=0;
const auField=id=>{const[l,a,ty,o,ac]=auF[id],lab=auL([l,a]);let c;
  if(ty==='country'||ty==='sel'){const op=ty==='country'?auC.map(x=>[x,auCN(x)]):auO[o].map(x=>[x[0],auL([x[1],x[2]])]);c=`<select id="${id}"><option value="">—</option>${op.map(x=>`<option value="${x[0]}">${esc(x[1])}</option>`).join('')}</select>`}
  else if(id==='rPhone')c=`<div class="ph"><select id="rCc" aria-label="+">${auC.map(x=>`<option value="${x}">${x} +${auPH[x]}</option>`).join('')}</select><input id="rPhone" type="tel" inputmode="tel" dir="ltr" autocomplete="tel-national"></div>`;
  else c=`<input id="${id}" type="${ty}"${ac?` autocomplete="${ac}"`:''} dir="${ty==='text'?'auto':'ltr'}">`;
  return `<label for="${id}">${lab}</label>${c}`};
const auPep=()=>`<label>${auL(['Are you, or a close family member, a politically exposed person?','هل أنت أو أحد أقاربك المقرّبين شخصية سياسية بارزة؟'])}</label><div class="seg" id="rPep"><button type="button" data-v="no">${auL(['No','لا'])}</button><button type="button" data-v="yes">${auL(['Yes','نعم'])}</button></div><label class="ck"><input type="checkbox" id="rUs"> ${auL(['I am a US citizen or US tax resident','أنا مواطن أمريكي أو مقيم ضريبياً في أمريكا'])}</label>`;
const auCons=()=>[['rTerms',['I accept the Terms of Service','أوافق على شروط الخدمة']],['rPriv',['I accept the Privacy Policy and the processing of my data','أوافق على سياسة الخصوصية ومعالجة بياناتي']],['rTrue',['I confirm all information is true and I am acting on my own behalf','أقرّ بصحة كل المعلومات وأنني أتصرف لحسابي الخاص']],['rMkt',['Send me product updates (optional)','أرغب باستلام تحديثات المنتج (اختياري)']]].map(([i,l])=>`<label class="ck"><input type="checkbox" id="${i}"> ${auL(l)}</label>`).join('');
const auSave=()=>{Object.keys(auF).forEach(id=>{const e=$('#'+id);if(e)auWd[id]=e.value});['rCc','rUs','rTerms','rPriv','rTrue','rMkt'].forEach(id=>{const e=$('#'+id);if(e)auWd[id]=e.type==='checkbox'?e.checked:e.value})};
const auScore=p=>[p.length>=10,/[a-z]/.test(p),/[A-Z]/.test(p),/\d/.test(p),/[^\w\s]/.test(p)].filter(Boolean).length;
const auBad=['password','12345678','qwerty','letmein','welcome','demo1234','younis','11111111','abc12345'];
const auPwOk=(p,e)=>{const l=e.split('@')[0].toLowerCase();return auScore(p)===5&&!auBad.some(b=>p.toLowerCase().includes(b))&&!(l.length>=4&&p.toLowerCase().includes(l))};
const auAge=d=>{const b=new Date(d),n=new Date();if(isNaN(b))return -1;let a=n.getFullYear()-b.getFullYear();if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;return a};
const auLuhn=s=>{let sum=0;[...s].reverse().forEach((d,i)=>{const x=+d*(i%2?2:1);sum+=x>9?x-9:x});return sum%10===0};
function auVal(n){const v=id=>(($('#'+id)||{}).value||'').trim();
  if(n===1){if(!/^\S+@\S+\.\S+$/.test(v('rEmail')))return'r_e_email';if(!/^\d{6,12}$/.test(v('rPhone').replace(/[\s-]/g,'')))return'r_e_phone';if(!auPwOk($('#rPass').value,v('rEmail')))return'r_e_pass';if($('#rPass').value!==$('#rPass2').value)return'r_e_pass2'}
  if(n===2){const nm=/^\p{L}[\p{L}\s'’-]+$/u;if(!nm.test(v('rFirst'))||!nm.test(v('rLast')))return'r_e_name';const a=auAge(v('rDob'));if(a<18||a>120)return'r_e_dob';if(!v('rNat')||!v('rIdT')||!v('rId'))return'r_e_req';
    if(v('rIdT')==='pnr'){let d=v('rId').replace(/\D/g,'');if(d.length===12)d=d.slice(2);if(d.length!==10||!auLuhn(d)||d.slice(0,6)!==v('rDob').slice(2).replace(/-/g,''))return'r_e_pnr'}else if(!/^[A-Za-z0-9]{6,20}$/.test(v('rId').replace(/\s/g,'')))return'r_e_id'}
  if(n===3){if(v('rStreet').length<4||!/^[A-Za-z0-9 -]{3,10}$/.test(v('rZip'))||v('rCity').length<2||!v('rCtry'))return'r_e_addr'}
  if(n===4){if(!v('rEmp')||!v('rSrc')||!v('rVol')||!v('rPur')||!v('rTaxC'))return'r_e_req';if(!/^[A-Za-z0-9\- ]{5,20}$/.test(v('rTin')))return'r_e_tin';if(!auWd.pep)return'r_e_pep'}
  if(n===5){if(!v('rSq')||v('rSa').length<3)return'r_e_req';if(!$('#rTerms').checked||!$('#rPriv').checked||!$('#rTrue').checked)return'r_e_cons'}
  return''}
function auReg(){const s=auS[auWs-1];
  $('#aBody').innerHTML=`<div class="wz">${auS.map((x,i)=>`<i class="${i<auWs?'on':''}"></i>`).join('')}</div><h3 style="font-size:22px;margin-top:4px">${auWs}/${auS.length} · ${auL([s[0],s[1]])}</h3>`+s[2].map(id=>id==='PEP'?auPep():id==='CONS'?auCons():auField(id)).join('')+(auWs===1?`<div class="pwm"><u id="pwm"></u></div><small style="color:var(--mut)">${t('r_pwh')}</small>`:'')+`<div class="btns" style="margin-top:16px">${auWs>1?`<button class="btn ghost" id="wBack">${t('r_back')}</button>`:''}<button class="btn" id="wNext" style="flex:1">${t(auWs===auS.length?'a_reg':'r_next')}</button></div>`;
  Object.entries(auWd).forEach(([k,x])=>{const e=$('#'+k);if(e){if(e.type==='checkbox')e.checked=!!x;else e.value=x}});
  $$('#rPep button').forEach(b=>{b.classList.toggle('on',auWd.pep===b.dataset.v);b.onclick=()=>{auWd.pep=b.dataset.v;$$('#rPep button').forEach(x=>x.classList.toggle('on',x===b))}});
  const pw=$('#rPass'),upd=()=>{const s=auScore(pw.value);$('#pwm').style.width=s*20+'%';$('#pwm').style.background=s<3?'var(--bad)':s<5?'var(--gold)':'var(--ok)'};if(pw){pw.oninput=upd;upd()}
  $('#aDemo').textContent=auWs===2?auL(['Demo ID: 811218-9876 (born 1981-12-18) — or choose Passport','رقم تجريبي: 811218-9876 (مواليد 1981-12-18) — أو اختر جواز سفر']):'';
  $('#wNext').onclick=()=>{const e=auVal(auWs);if(e)return msg('#aMsg',0,t(e));auSave();msg('#aMsg',1,'');if(auWs<auS.length){auWs++;auReg()}else auSendOtp('reg')};
  if($('#wBack'))$('#wBack').onclick=()=>{auSave();msg('#aMsg',1,'');auWs--;auReg()}}
function auLogin(){$('#aBody').innerHTML=`<label for="aEmail">${t('k_email')}</label><input id="aEmail" type="email" dir="ltr" autocomplete="username" value="demo@younis.co"><label for="aPass">${t('a_pass')}</label><div class="ph"><input id="aPass" type="password" dir="ltr" autocomplete="current-password" placeholder="demo1234"><button class="btn ghost" id="aEye" type="button">${t('r_show')}</button></div><button class="btn" id="aGo" style="margin-top:16px;width:100%">${t('a_login')}</button>`;
  $('#aDemo').textContent='Demo: demo@younis.co / demo1234';
  $('#aEye').onclick=()=>{const p=$('#aPass'),h=p.type==='password';p.type=h?'text':'password';$('#aEye').textContent=t(h?'r_hide':'r_show')};
  $('#aGo').onclick=async()=>{const e=$('#aEmail').value.trim(),p=$('#aPass').value;if(!/^\S+@\S+\.\S+$/.test(e)||!p)return msg('#aMsg',0,t('a_e'));
    const r=await API.verifyPassword({email:e,pass:p});if(!r.ok)return msg('#aMsg',0,r.code==='lock'?t('r_e_lock',{s:r.sec}):t('a_bad'));auPend={type:'login',email:e,pass:p};auSendOtp()}}
function auSendOtp(type){if(type)auPend={type};const a=new Uint32Array(1);crypto.getRandomValues(a);auOtp={c:String(a[0]%1e6).padStart(6,'0'),exp:Date.now()+3e5,n:3,cool:Date.now()+20000};auOtpView()}
function auOtpView(){$('#aTabs').style.display='none';msg('#aMsg',1,'');$('#aDemo').textContent='';
  $('#aBody').innerHTML=`<h3 style="font-size:22px">${t('r_otp_t')}</h3><p style="color:var(--mut);font-size:14px">${t('r_otp_s')}</p><input id="aCode" inputmode="numeric" maxlength="6" dir="ltr" autocomplete="one-time-code" style="letter-spacing:.5em;font-size:22px;text-align:center"><p style="color:var(--gold2);font-size:13px;margin-top:10px">${t('r_demo_code',{c:auOtp.c})}</p><button class="btn" id="aVer" style="width:100%;margin-top:12px">${t('r_verify')}</button><button class="btn ghost" id="aRes" style="width:100%;margin-top:10px"></button><button class="btn ghost" id="aBk" style="width:100%;margin-top:10px">${t('p_x')}</button>`;
  clearInterval(auTm);const tick=()=>{const s=Math.ceil((auOtp.cool-Date.now())/1000),b=$('#aRes');if(!b)return clearInterval(auTm);b.disabled=s>0;b.textContent=s>0?t('r_resend_in',{s}):t('r_resend')};tick();auTm=setInterval(tick,1000);
  $('#aRes').onclick=()=>auSendOtp();$('#aBk').onclick=()=>{auOtp=null;auPend=null;auInit()};
  $('#aVer').onclick=async()=>{const c=$('#aCode').value.trim();if(Date.now()>auOtp.exp){auOtp=null;auInit();return msg('#aMsg',0,t('r_e_otpx'))}
    if(c!==auOtp.c){auOtp.n--;if(auOtp.n<=0){auOtp=null;auPend=null;auInit();return msg('#aMsg',0,t('r_e_otpx'))}return msg('#aMsg',0,t('r_e_otp',{n:auOtp.n}))}
    const r=auPend.type==='reg'?await API.register(auPayload()):await API.login({email:auPend.email,pass:auPend.pass});if(!r.ok)return msg('#aMsg',0,t('a_'+r.code));location.reload()}}
function auPayload(){const v=id=>(auWd[id]||'').toString().trim(),last=(id,n)=>'••••'+v(id).replace(/\W/g,'').slice(-n);
  return{email:v('rEmail'),pass:auWd.rPass,name:v('rFirst')+' '+v('rLast'),profile:{first:v('rFirst'),last:v('rLast'),dob:v('rDob'),nat:v('rNat'),phone:'+'+auPH[auWd.rCc||'SE']+v('rPhone').replace(/\D/g,''),idType:v('rIdT'),idMask:last('rId',4),
    addr:{street:v('rStreet'),zip:v('rZip'),city:v('rCity'),country:v('rCtry')},emp:v('rEmp'),employer:v('rEmpr'),src:v('rSrc'),vol:v('rVol'),purpose:v('rPur'),taxCountry:v('rTaxC'),tinMask:last('rTin',3),pep:auWd.pep==='yes',usPerson:!!auWd.rUs,secQ:v('rSq'),consent:{terms:true,privacy:true,marketing:!!auWd.rMkt,at:Date.now()}}}}
function auInit(){$('#aTabs').style.display='';clearInterval(auTm);msg('#aMsg',1,'');am==='reg'?auReg():auLogin();$$('#aTabs button').forEach(b=>b.classList.toggle('on',b.dataset.a===am))}
function authTab(){$('#aLang').textContent=$('#lang').textContent;if($('#auth').style.display==='none')return;if(auOtp)return auOtpView();if(am==='reg'&&$('#wNext'))auSave();auInit()}
const authUI=()=>{$('#auth').style.display=S.auth.session?'none':'flex'};
$$('#aTabs button').forEach(b=>b.onclick=()=>{am=b.dataset.a;auOtp=null;auPend=null;auInit()});
$('#aLang').onclick=()=>$('#lang').click();
$('#aBody').onkeydown=e=>{if(e.key==='Enter'&&e.target.tagName!=='BUTTON'){const b=$('#aGo')||$('#wNext')||$('#aVer');if(b)b.click()}};
setTimeout(()=>{if(S.profile&&S.profile.first){const fill=(i,x)=>{const e=$(i);if(e&&!e.value)e.value=x};fill('#kName',S.settings.name);fill('#kEmail',S.settings.email);fill('#kDob',S.profile.dob)}});
$('#aReset').onclick=()=>{if(confirm(t('st_rq'))){API.reset();location.reload()}};
$('#logout').onclick=async()=>{await API.logout();location.reload()};

/* ---------- شحن / استلام / تحويل عملات ---------- */
function xRate(){const a=$('#xFrom').value,b=$('#xTo').value;$('#xInfo').textContent=a&&b?t('x_rate',{a,b,r:(rate[a]/rate[b]).toFixed(4)}):''}
['#xFrom','#xTo'].forEach(i=>$(i).onchange=xRate);
$$('#tuM button').forEach(b=>b.onclick=()=>{tm=b.dataset.m;drawExtra()});
$('#tuBtn').onclick=async()=>{
  const c=$('#tuTo').value,a=parseFloat($('#tuAmt').value);
  if(!(a>0&&a<=100000))return msg('#tuMsg',0,t('e_amt'));
  await API.topup({to:c,amount:a,method:tm});msg('#tuMsg',1,t('tu_ok',{a:f(a,c)}));$('#tuAmt').value='';drawWallet();drawHistory();
};
$('#xBtn').onclick=async()=>{
  const a=$('#xFrom').value,b=$('#xTo').value,v=parseFloat($('#xAmt').value);
  if(a===b)return msg('#xMsg',0,t('x_same'));if(!(v>0))return msg('#xMsg',0,t('e_amt'));
  const r=await API.exchange({from:a,to:b,amount:v});
  if(!r.ok)return msg('#xMsg',0,t('e_funds',{c:a,v:f(wal[a],a)}));
  msg('#xMsg',1,t('x_ok',{a:f(v,a),b:f(r.out,b)}));$('#xAmt').value='';drawWallet();drawHistory();
};
function drawBn(){$('#bn').innerHTML=(set.benef||[]).map(x=>`<option value="${esc(x)}">`).join('')}
function drawExtra(){
  const o=Object.keys(wal).map(c=>`<option>${c}</option>`).join('');
  keep('#tuTo',o);keep('#vCur',o);keep('#xFrom',o);keep('#xTo',o);
  if(!$('#xTo').dataset.i){$('#xTo').value='USD';$('#xTo').dataset.i=1}
  $('#rcList').innerHTML=Object.keys(wal).map(c=>`<div class="sw"><div><b>${c}</b><br><bdi dir="ltr">${iban(c)}</bdi></div><button class="btn ghost" data-c="${c}">${t('rc_copy')}</button></div>`).join('');
  $$('#rcList [data-c]').forEach(b=>b.onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(iban(b.dataset.c).replace(/ /g,''));toast(t('rc_copied'))});
  $('#rcHolder').textContent=set.name;xRate();drawBn();authTab();
  $$('#tuM button').forEach(b=>b.classList.toggle('on',b.dataset.m===tm));
}

/* ---------- تأكيد الحوالة + إيصال + مستفيدين ---------- */
$('#to').setAttribute('list','bn');
$('#sendBtn').onclick=()=>{
  const c=$('#from').value,a=parseFloat($('#amt').value),to=$('#to').value.trim(),m=$('#sMsg');m.style.color='var(--bad)';
  if(!to)return m.textContent=t('e_to');if(!(a>0))return m.textContent=t('e_amt');
  if(mode==='p2p'&&!/^\S+@\S+\.\S+$|^\+?\d[\d\s]{6,}$/.test(to))return m.textContent=t('e_to');
  if(mode!=='p2p'&&!ibanOk(to))return m.textContent=t('e_iban');
  if(mode==='intl'&&S.kyc<100)return m.textContent=t('e_intl');
  m.textContent='';$('#cfBody').textContent=t('cf_body',{a:f(a,c),to,fee:f(a*feeRate[mode],c)});$('#cdlg').showModal();
};
$('#cfX').onclick=()=>$('#cdlg').close();
$('#cfOk').onclick=async()=>{
  $('#cdlg').close();const m=$('#sMsg'),c=$('#from').value,a=parseFloat($('#amt').value),to=$('#to').value.trim();
  const r=await API.transfer({mode,to,amount:a,currency:c});
  if(!r.ok){m.style.color='var(--bad)';m.textContent=r.code==='funds'?t('e_funds',{c,v:f(r.available,c)}):t('e_'+r.code);return}
  m.style.color='var(--ok)';m.textContent=t('ok_sent',{a:f(a,c),to})+' · '+t('ok_ref')+' YC'+Date.now().toString(36).toUpperCase();
  if(set.notif.payments)toast(t('toast_sent',{a:f(a,c),to}));
  saveSet({benef:[to,...(set.benef||[]).filter(x=>x!==to)].slice(0,8)});drawBn();
  $('#amt').value=$('#to').value='';drawWallet();drawHistory();
};

/* ---------- بطاقات: افتراضية/بلاستيكية، Visa/Mastercard، إظهار الرقم ---------- */
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/premium.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
function drawCard(){
  const ti=tiers[tier],fr=$('#freeze').getAttribute('aria-checked')==='true',nt=cd.net==='VISA'?'VISA':'mastercard';
  $('#tiers').innerHTML=Object.keys(tiers).map(k=>`<button class="${k===tier?'on':''}" data-t="${k}">${t('t_'+k)}</button>`).join('');
  $$('#tiers button').forEach(b=>b.onclick=()=>{tier=b.dataset.t;$('#freeze').setAttribute('aria-checked','false');$('#cMsg').textContent='';drawCard()});
  $$('#cForm button').forEach(b=>b.classList.toggle('on',b.dataset.f===cd.form));$$('#cNet button').forEach(b=>b.classList.toggle('on',b.dataset.n===cd.net));
  $('#cShow').textContent=t(cd.show?'cn_hide':'cn_show');
  $('#cName').textContent=t('t_'+tier);$('#cDesc').textContent=t('d_'+tier);
  $('#cardArt').innerHTML=`<div class="card ${ti.cls}${fr?' frozen':''}" id="theCard"><div class="t"><div><b>Younis &amp; Co.</b><br>${ti.sub}</div><span class="serif" style="font-size:26px">YC</span></div><div><div class="chip"></div><div class="num">${cd.show?'5287 5612 3456 7890':'•••• •••• •••• 7890'}</div></div><div class="b"><span>${esc(set.name.toUpperCase())}<br>VALID THRU 12/28 · ${cd.form==='virtual'?'VIRTUAL':'PHYSICAL'}</span><b>${nt.toUpperCase()}</b></div></div>`;
}
const setCd=p=>{Object.assign(cd,p);saveSet({card:cd});drawCard()};
$$('#cForm button').forEach(b=>b.onclick=()=>setCd({form:b.dataset.f}));
$$('#cNet button').forEach(b=>b.onclick=()=>setCd({net:b.dataset.n}));
$('#cShow').onclick=()=>setCd({show:!cd.show});
$('#cCopy').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText('5287561234567890');toast(t('rc_copied'))};
$('#cOrder').onclick=()=>{$('#cMsg').textContent=t('m_ord',{f:t(cd.form==='virtual'?'cf_virtual':'cf_plastic'),n:cd.net==='VISA'?'Visa':'Mastercard'})};

/* ---------- KYC: نوع الوثيقة + قيد المراجعة ---------- */
/* ⚠ نسخة قديمة محفوظة كما هي. النسخة الفعّالة الآن في js/kyc.js (بتغلب هاي بعد التحميل). عدّلي هناك. */
$('#kSubmit').onclick=async()=>{
  const m=$('#kMsg'),b=$('#kSubmit');
  if(!$('#kName').value.trim()||!/^\S+@\S+\.\S+$/.test($('#kEmail').value.trim())||!$('#kId').files.length)return msg('#kMsg',0,t('k_e'));
  b.disabled=true;await API.setKyc(90);msg('#kMsg',1,t('k_pend'));
  setTimeout(async()=>{await API.setKyc(100);b.disabled=false;drawKyc();toast(t('k_done'))},2500);
};

/* ---------- الخزنات: إضافة / سحب / حذف ---------- */
function drawVaults(){
  $('#vaultList').innerHTML=vaults.map((v,i)=>{const p=Math.min(100,v.s/v.t*100);return `<div class="panel"><div class="row"><h3 style="font-size:22px"><bdi>${esc(v.n)}</bdi></h3><b style="color:var(--gold2)">${p.toFixed(0)}%</b></div><div class="bar"><u style="width:${p}%"></u></div><small style="color:var(--mut)">${t('v_of',{s:f(v.s,'SEK'),t:f(v.t,'SEK')})}</small><div class="btns" style="margin-top:14px"><button class="btn ghost" data-a="fundVault" data-i="${i}">${t('v_add')}</button><button class="btn ghost" data-a="withdrawVault" data-i="${i}">${t('v_wd')}</button><button class="btn ghost" data-a="deleteVault" data-i="${i}">${t('v_del')}</button></div></div>`}).join('');
  $$('#vaultList [data-a]').forEach(b=>b.onclick=async()=>{
    const del=b.dataset.a==='deleteVault',a=parseFloat($('#vAmt').value),c=$('#vCur').value||'SEK';
    if(del&&!confirm(t('v_delq')))return;if(!del&&!(a>0))return toast(t('e_amt'));
    const r=await API[b.dataset.a](+b.dataset.i,a,c);
    if(r.ok){drawVaults();drawWallet();drawHistory()}else toast(t('e_vault'));
  });
}

/* ---------- تقارير المصاريف: محسوبة من العمليات الفعلية (آخر 30 يوم / 7 أيام) ---------- */
function drawInsights(){
  const b=base(),D=864e5,now=Date.now(),L=LOC(),fm=(v,c)=>new Intl.NumberFormat(L,{style:'currency',currency:c,maximumFractionDigits:0}).format(v);
  const sp=txs.filter(x=>x[2]<0&&x[1]!=='Savings'&&x[1]!=='Exchange').map(([n,c,v,cu,d])=>({c,u:-v*rate[cu]/rate[b],a:(now-new Date(d))/D}));
  const m={};sp.filter(x=>x.a<=30).forEach(x=>m[x.c]=(m[x.c]||0)+x.u);
  const cats=Object.entries(m).sort((x,y)=>y[1]-x[1]).slice(0,6),mx=cats.length?cats[0][1]:1;
  $('#cats').innerHTML=cats.map(([n,v])=>`<div class="cat"><span>${esc(cat(n))}</span><div class="bar"><u style="width:${v/mx*100}%"></u></div><span>${fm(v,b)}</span></div>`).join('')||`<p style="color:var(--mut)">${t('h_empty')}</p>`;
  const d=[6,5,4,3,2,1,0].map(i=>({u:sp.filter(x=>Math.floor(x.a)===i).reduce((s,x)=>s+x.u,0),l:new Date(now-i*D)})),mxd=Math.max(...d.map(x=>x.u),1),top=d.reduce((p,x)=>x.u>p.u?x:p,d[0]);
  $('#week').setAttribute('aria-label',t('i_aria'));
  $('#week').innerHTML=d.map((x,i)=>{const h=x.u/mxd*130,on=x===top&&x.u>0;return `<rect x="${i*44+10}" y="${150-h}" width="28" height="${h}" rx="5" fill="${on?'#f3d97a':'#d4af37'}" opacity="${on?1:.55}"/><text x="${i*44+24}" y="167" text-anchor="middle" fill="#8f9bbd" font-size="11">${x.l.toLocaleDateString(L,{weekday:'narrow'})}</text>`}).join('');
  $('#tip').textContent=cats.length&&top.u>0?t('i_tip2',{d:top.l.toLocaleDateString(L,{weekday:'long'}),a:fm(top.u,b),c:cat(cats[0][0])}):'';
}

authUI();applyLang();
