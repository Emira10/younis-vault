/* ===== Younis & Co. — رحلة الهوية الكاملة KYC (v11) =====
   3 خطوات: البيانات الشخصية ← المستند والسيلفي ← المراجعة والموافقة، ثم فحص تلقائي.
   الصور تبقى بالذاكرة فقط وتنمسح بعد التحقق (ما بتنرفع ولا بتنحفظ).
   عند الربط الحقيقي: بدّلي مرحلة المراجعة بطلب لمزوّد KYC (مثل Sumsub / Onfido). */
let kStep=1,kPhase='form';            // form | review | done (done بتنحسب من S.kyc)
const kFiles={doc:null,self:null},kUrls=[],kTimers=[];
const kHas=()=>!!(kFiles.doc&&kFiles.self);

function kAge(v){
  const b=new Date(v+'T00:00:00'),n=new Date();
  if(isNaN(b)||b>n)return null;
  let a=n.getFullYear()-b.getFullYear();
  if(n.getMonth()<b.getMonth()||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))a--;
  return a;
}
function kValid(step){
  if(step===1){
    const em=$('#kEmail').value.trim(),dob=$('#kDob').value;
    if(!$('#kName').value.trim()||!/^\S+@\S+\.\S+$/.test(em)||!dob)return t('k_e');
    const a=kAge(dob);if(a===null||a<18||a>120)return t('k_e18');
  }
  if(step===2&&!kHas())return t('k_e');
  return '';
}
function kSummary(){
  const row=(k,v)=>`<div class="rw"><span>${t(k)}</span><b><bdi dir="auto">${v}</bdi></b></div>`;
  const dt={pass:'k_pass',id:'k_idc',digi:'k_digi'}[$('#kDoc').value];
  $('#kSum').innerHTML=row('k_name',esc($('#kName').value.trim()))+row('k_email',esc($('#kEmail').value.trim()))+row('k_dob',esc($('#kDob').value?fd($('#kDob').value+'T00:00:00'):''))+row('k_doc',t(dt))+row('k_id',t(kFiles.doc?'k_att':'k_miss'))+row('k_self',t(kFiles.self?'k_att':'k_miss'));
}
function drawKyc(){
  const ph=S.kyc>=100?'done':kPhase;
  $('#kycSteps').innerHTML=[['k_s1',1],['k_s2',2],['k_s3',3]].map(([k,n])=>{const ok=ph!=='form'||n<kStep,cur=ph==='form'&&n===kStep;return `<li class="${ok?'ok':cur?'cur':''}"><span>${ok?'✓':n}</span>${t(k)}</li>`}).join('');
  $('#kycForm').style.display=ph==='form'?'block':'none';
  $$('#kycForm [data-kp]').forEach(p=>p.hidden=+p.dataset.kp!==kStep);
  $('#kReview').hidden=ph==='form';
  $('#kRevT').textContent=t(ph==='done'?'k_done':'k_pend');
  if(ph==='done')$$('#kChecks li').forEach(li=>li.className='ok');
  $('#kOpen').hidden=ph!=='done';
  $('#kVer').textContent=ph==='done'&&set.kycAt?t('k_ver',{d:fd(set.kycAt)}):'';
  if(ph!=='form')$('#kMsg').textContent='';
  if(ph==='form'){
    if(!$('#kName').value)$('#kName').value=set.name;
    if(!$('#kEmail').value)$('#kEmail').value=set.email;
    if(kStep===3)kSummary();
  }
  $('#kycPct').textContent=S.kyc+'%';$('#kycBar').style.width=S.kyc+'%';
}

/* ---------- التنقل بين الخطوات ---------- */
$$('[data-kn]').forEach(b=>b.onclick=()=>{
  const n=+b.dataset.kn;
  if(n>kStep){const e=kValid(kStep);if(e)return msg('#kMsg',0,e)}
  kStep=n;$('#kMsg').textContent='';drawKyc();
});

/* ---------- رفع الصور (معاينة فقط) ---------- */
[['#kId','#kIdImg','doc'],['#kSelf','#kSelfImg','self']].forEach(([inp,img,key])=>{
  $(inp).onchange=e=>{
    const f=e.target.files[0];if(!f)return;
    if(!/^image\//.test(f.type)||f.size>10*1024*1024){kFiles[key]=null;$(img).hidden=true;e.target.value='';return msg('#kMsg',0,t('k_efile'))}
    kFiles[key]=f;
    if(typeof URL.createObjectURL==='function'){const u=URL.createObjectURL(f);kUrls.push(u);$(img).src=u;$(img).hidden=false}
    $('#kFile').textContent=[kFiles.doc&&kFiles.doc.name,kFiles.self&&kFiles.self.name].filter(Boolean).join(' · ');
    $('#kMsg').textContent='';
  };
});

/* ---------- الإرسال والفحص التلقائي ---------- */
$('#kSubmit').onclick=async()=>{
  const e=kValid(1)||kValid(2);
  if(e)return msg('#kMsg',0,e);
  if(!$('#kConsent').checked)return msg('#kMsg',0,t('k_e'));
  const btn=$('#kSubmit');btn.disabled=true;
  await API.setKyc(90);
  kPhase='review';drawKyc();
  const li=$$('#kChecks li');li.forEach(l=>l.className='');
  li.forEach((l,i)=>{kTimers.push(setTimeout(()=>{l.className='run'},900*i));kTimers.push(setTimeout(()=>{l.className='ok'},900*(i+1)))});
  kTimers.push(setTimeout(async()=>{
    await saveSet({name:$('#kName').value.trim(),email:$('#kEmail').value.trim(),kycDoc:$('#kDoc').value,kycAt:new Date().toISOString()});
    await API.setKyc(100);
    kUrls.splice(0).forEach(u=>URL.revokeObjectURL&&URL.revokeObjectURL(u));
    kFiles.doc=kFiles.self=null;
    ['#kId','#kSelf'].forEach(i=>$(i).value='');
    ['#kIdImg','#kSelfImg'].forEach(i=>{$(i).hidden=true;$(i).removeAttribute('src')});
    $('#kConsent').checked=false;$('#kFile').textContent='';
    btn.disabled=false;kPhase='done';kStep=1;
    drawKyc();drawWallet();drawCard();toast(t('k_done'));
  },900*li.length+400));
};
$('#kOpen').onclick=()=>show('wallet');

/* ---------- بعد إنشاء حساب جديد: افتح KYC تلقائياً ---------- */
const _register=API.register;
API.register=async p=>{const r=await _register.call(API,p);if(r.ok){try{sessionStorage.setItem('yc_go_kyc','1')}catch(e){}}return r};
try{
  if(sessionStorage.getItem('yc_go_kyc')){
    sessionStorage.removeItem('yc_go_kyc');
    if(S.auth.session&&S.kyc<100)show('kyc');
  }
}catch(e){}
applyLang();
