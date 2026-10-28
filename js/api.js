/* ===== Younis & Co. — طبقة API وهمية (Mock BaaS) =====
   كل دالة هنا ترجع Promise مثل أي طلب HTTP حقيقي.
   عند الربط مع مزوّد BaaS: خلّي أسماء الدوال وشكل النتائج كما هي،
   واستبدلي المحتوى داخل كل دالة بـ fetch() للمزوّد. الواجهة ما بتتغيّر.
   البيانات محفوظة بـ localStorage بدل السيرفر. */
const API=(()=>{
const KEY='yc_demo_v3',DAY=864e5,ago=n=>new Date(Date.now()-n*DAY).toISOString();
const rate={SEK:1,USD:10.4,EUR:11.2,GBP:13.2,AED:2.83,NOK:.95,DKK:1.5,TRY:.25} /* أسعار تجريبية مقابل SEK — بالإنتاج من API حقيقي */,fee={p2p:0,local:.005,intl:.012};
const seed=()=>({
  kyc:70,
  settings:{name:'Ammar Younes',email:'ammar@younis.co',phone:'+46 70 000 00 00',lang:'en',base:'SEK',twofa:true,notif:{payments:true,security:true,promo:false}},
  wal:{SEK:48200.5,USD:6350.75,EUR:1310.2,GBP:820,AED:5200,NOK:9400,DKK:3100,TRY:36500},
  txs:[['Spotify','Subscriptions',-119,'SEK',ago(0)],['Salary — Younis & Co.','Income',28400,'SEK',ago(1)],['ICA Maxi','Groceries',-842.5,'SEK',ago(2)],['Layla K.','Transfer in',150,'EUR',ago(3)],['SL Transport','Transport',-39,'SEK',ago(4)],['Espresso House','Dining',-78,'SEK',ago(5)],['Netflix','Subscriptions',-139,'SEK',ago(9)],['Åhléns','Other',-599,'SEK',ago(12)],['Freelance payment','Income',620,'EUR',ago(15)],['Carrefour Dubai','Groceries',-185,'AED',ago(18)],['Apple','Subscriptions',-9.99,'USD',ago(6)],['Client invoice — NYC','Income',1800,'USD',ago(8)],['Amazon US','Other',-64.2,'USD',ago(11)]],
  vaults:[{n:'Emergency fund',t:50000,s:32000},{n:'New laptop',t:15000,s:4200}]
});
let S;try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.wal||!S.settings||!Array.isArray(S.txs)||!Array.isArray(S.vaults))S=seed();
S.auth=S.auth||{users:[],session:null};
const hh=async s=>crypto.subtle?[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join(''):btoa(s);
const hp=async(s,salt)=>{if(!salt||!crypto.subtle)return hh(s);const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(s),'PBKDF2',false,['deriveBits']),b=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:150000,hash:'SHA-256'},k,256);return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const wait=v=>new Promise(r=>setTimeout(()=>r(v),150));
const addTx=(n,c,v,cu)=>S.txs.unshift([n,c,v,cu,new Date().toISOString()]);
return{
  state:S,rate,
  async transfer({mode,to,amount,currency}){
    if(!to)return wait({ok:false,code:'to'});
    if(!(amount>0))return wait({ok:false,code:'amt'});
    if(mode==='intl'&&S.kyc<100)return wait({ok:false,code:'intl'});
    const tot=amount*(1+fee[mode]);
    if(tot>S.wal[currency])return wait({ok:false,code:'funds',available:S.wal[currency]});
    S.wal[currency]-=tot;
    addTx(to,mode==='p2p'?'Transfer out':'Bank transfer',-amount,currency);
    save();return wait({ok:true});
  },
  async fundVault(i,amount,cur='SEK'){const v=S.vaults[i];if(!v||!(amount>0)||S.wal[cur]<amount)return wait({ok:false});S.wal[cur]-=amount;v.s+=amount*rate[cur];addTx('Vault: '+v.n,'Savings',-amount,cur);save();return wait({ok:true})},
  async createVault(n,target){
    if(!n||!(target>0))return wait({ok:false});
    S.vaults.push({n,t:target,s:0});save();return wait({ok:true});
  },
  async setKyc(p){S.kyc=p;save();return wait({ok:true})},
  async register({name,email,pass,profile}){email=email.toLowerCase();if(S.auth.users.some(u=>u.email===email))return wait({ok:false,code:'dup'});const salt=[...crypto.getRandomValues(new Uint8Array(16))].map(x=>x.toString(16).padStart(2,'0')).join('');S.auth.users.push({email,salt,h:await hp(pass,salt)});S.auth.session=email;Object.assign(S.settings,{name,email});S.profile=profile||{};S.kyc=0;save();return wait({ok:true})},
  async verifyPassword({email,pass}){email=email.toLowerCase();S.auth.fails=S.auth.fails||{};const f=S.auth.fails[email]=S.auth.fails[email]||{n:0,until:0};if(Date.now()<f.until)return wait({ok:false,code:'lock',sec:Math.ceil((f.until-Date.now())/1000)});if(!S.auth.users.some(x=>x.email==='demo@younis.co'))S.auth.users.push({email:'demo@younis.co',h:await hh('demo1234')});const u=S.auth.users.find(x=>x.email===email);if(!u||u.h!==await hp(pass,u.salt)){if(++f.n>=5){f.n=0;f.until=Date.now()+6e4}save();return wait({ok:false,code:'bad'})}f.n=0;save();return wait({ok:true})},
  async login({email,pass}){const r=await API.verifyPassword({email,pass});if(!r.ok)return r;S.auth.session=email.toLowerCase();save();return wait({ok:true})},
  async logout(){S.auth.session=null;save();return wait({ok:true})},
  async topup({to,amount,method}){S.wal[to]+=amount;addTx(method==='card'?'Card top-up':'Bank top-up','Top up',amount,to);save();return wait({ok:true})},
  async exchange({from,to,amount}){if(from===to||amount>S.wal[from])return wait({ok:false,code:'funds'});const out=amount*rate[from]/rate[to]*.995;S.wal[from]-=amount;S.wal[to]+=out;addTx('FX '+from+' → '+to,'Exchange',-amount,from);addTx('FX '+from+' → '+to,'Exchange',out,to);save();return wait({ok:true,out})},
  async withdrawVault(i,amount,cur='SEK'){const v=S.vaults[i],sek=amount*rate[cur];if(!v||!(amount>0)||v.s<sek)return wait({ok:false});v.s-=sek;S.wal[cur]+=amount;addTx('Vault: '+v.n,'Savings',amount,cur);save();return wait({ok:true})},
  async deleteVault(i){const v=S.vaults[i];if(!v)return wait({ok:false});S.wal.SEK+=v.s;if(v.s>0)addTx('Vault: '+v.n,'Savings',v.s,'SEK');S.vaults.splice(i,1);save();return wait({ok:true})},
  async saveSettings(p){Object.assign(S.settings,p);save();return wait({ok:true})},
  reset(){try{localStorage.removeItem(KEY)}catch(e){}}
};
})();
