const KEY='jfc-estimates-v1';const $=s=>document.querySelector(s);
const money=n=>(n||0).toLocaleString('en-US',{style:'currency',currency:'USD'});
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const today=()=>new Date().toISOString().slice(0,10);
const plus=(d,n)=>{const x=new Date(d+'T12:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
function blank(){const prev=JSON.parse(localStorage.getItem(KEY+'-biz')||'{}');return Object.assign({bizName:'',bizPhone:'',bizEmail:'',bizAddr:'',logo:'',custName:'',custContact:'',jobAddr:'',jobDesc:'',
estNo:'EST-'+Date.now().toString().slice(-6),estDate:today(),validUntil:plus(today(),30),labor:[{desc:'',hours:'',rate:''}],materials:[{desc:'',qty:'',cost:''}],other:[],
overheadPct:10,profitPct:20,mode:'markup',taxPct:0,taxOn:'materials',depositPct:0,terms:'Estimate valid until the date shown. Any changes to scope will be handled by written change order. Balance due upon completion.'},prev)}
let S=blank();
const cols={labor:[['desc','Description','text'],['hours','Hours','number'],['rate','Rate $/hr','number']],materials:[['desc','Material','text'],['qty','Qty','number'],['cost','Unit cost $','number']],other:[['desc','Equipment / other','text'],['qty','Qty','number'],['cost','Unit cost $','number']]};
function lineAmt(k,x){return k==='labor'?(+x.hours||0)*(+x.rate||0):(+x.qty||0)*(+x.cost||0)}
function renderItems(){for(const k in cols){const el=$('#'+k);el.innerHTML='';S[k].forEach((x,i)=>{const d=document.createElement('div');d.className='item';
d.innerHTML=cols[k].map(([f,l,t])=>`<label class="${f==='desc'?'desc':''}">${l}<input type="${t}" ${t==='number'?'step="any" inputmode="decimal"':''} data-k="${k}" data-i="${i}" data-c="${f}" value="${esc(x[f])}"></label>`).join('')+`<div class="amt">${money(lineAmt(k,x))}</div><button data-del="${k}" data-i="${i}" aria-label="Remove">✕</button>`;el.appendChild(d)})}}
function bindFields(){document.querySelectorAll('[data-f]').forEach(el=>{const f=el.dataset.f;if(el.type==='radio')el.checked=S[f]===el.value;else el.value=S[f]??''});
$('#logoPrev').innerHTML=S.logo?`<img src="${S.logo}" alt="logo">`:''}
function update(){const r=EstCalc.compute(S);const t=$('#totals');
$('#modeHelp').textContent=S.mode==='margin'?`Margin: price = cost ÷ (1 − ${S.profitPct||0}%). Profit is ${S.profitPct||0}% of the selling price.`:`Markup: price = cost × (1 + ${S.profitPct||0}%). Profit is ${S.profitPct||0}% of your cost.`;
if(r.error){t.innerHTML=`<span class="err">${r.error}</span>`;return}
t.innerHTML=`<span>Cost <b>${money(r.cost)}</b></span><span>Profit <b>${money(r.profit)}</b></span><span>Tax <b>${money(r.tax)}</b></span><span class="grand">Total <b>${money(r.total)}</b></span>${r.deposit?`<span>Deposit <b>${money(r.deposit)}</b></span>`:''}`;
document.querySelectorAll('.item').forEach(d=>{const i=d.querySelector('input');const k=i.dataset.k,x=S[k][+i.dataset.i];d.querySelector('.amt').textContent=money(lineAmt(k,x))});
renderPrint(r)}
function renderPrint(r){const f=r.factor*(1+(+S.overheadPct||0)/100);// spread overhead+profit into line prices so customer sees selling prices
const sec=(k,name)=>{const rows=S[k].filter(x=>x.desc||lineAmt(k,x));if(!rows.length)return'';return`<tr class="sec"><td colspan="4">${name}</td></tr>`+rows.map(x=>{const q=k==='labor'?x.hours:x.qty,u=(k==='labor'?+x.rate:+x.cost)*f;return`<tr><td>${esc(x.desc)}</td><td class="num">${esc(q)}${k==='labor'?' hr':''}</td><td class="num">${money(u)}</td><td class="num">${money(lineAmt(k,x)*f)}</td></tr>`}).join('')};
const fd=d=>d?new Date(d+'T12:00').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}):'';
$('#printDoc').innerHTML=`<div class="pd-head"><div class="pd-biz">${S.logo?`<img src="${S.logo}" alt="">`:''}<h1>${esc(S.bizName||'Your Business Name')}</h1><div>${esc(S.bizAddr)}</div><div>${esc(S.bizPhone)} ${S.bizEmail?'· '+esc(S.bizEmail):''}</div></div>
<div class="pd-title"><h2>ESTIMATE</h2><div># ${esc(S.estNo)}</div><div>Date: ${fd(S.estDate)}</div><div>Valid until: ${fd(S.validUntil)}</div></div></div>
<div class="pd-meta"><div><h3>Prepared for</h3><b>${esc(S.custName)}</b><div>${esc(S.custContact)}</div></div><div><h3>Job site</h3><div>${esc(S.jobAddr)}</div></div></div>
${S.jobDesc?`<div><h3 style="font-size:9pt;color:#5b6573;margin:0">SCOPE OF WORK</h3><div style="white-space:pre-wrap">${esc(S.jobDesc)}</div></div>`:''}
<table class="pd"><thead><tr><th>Description</th><th class="num">Qty</th><th class="num">Unit price</th><th class="num">Amount</th></tr></thead><tbody>${sec('labor','Labor')}${sec('materials','Materials')}${sec('other','Equipment & Other')}</tbody></table>
<div class="pd-tot"><div><span>Subtotal</span><span>${money(r.price)}</span></div>${r.tax?`<div><span>Sales tax (${S.taxPct}% on ${S.taxOn})</span><span>${money(r.tax)}</span></div>`:''}<div class="g"><span>Total</span><span>${money(r.total)}</span></div>
${r.deposit?`<div><span>Deposit due (${S.depositPct}%)</span><span>${money(r.deposit)}</span></div><div><span>Balance on completion</span><span>${money(r.balance)}</span></div>`:''}</div>
${S.terms?`<div class="pd-terms"><b>Terms</b>\n${esc(S.terms)}</div>`:''}<div class="pd-sign"><div>Customer acceptance signature / date</div><div>Contractor signature / date</div></div>`}
document.addEventListener('input',e=>{const el=e.target;if(el.dataset.k){S[el.dataset.k][+el.dataset.i][el.dataset.c]=el.value}else if(el.dataset.f){S[el.dataset.f]=el.value}update()});
document.addEventListener('change',e=>{if(e.target.type==='radio'&&e.target.dataset.f){S[e.target.dataset.f]=e.target.value;update()}});
document.addEventListener('click',e=>{const a=e.target.dataset.add,d=e.target.dataset.del;if(a){S[a].push(a==='labor'?{desc:'',hours:'',rate:''}:{desc:'',qty:'',cost:''});renderItems();update()}if(d){S[d].splice(+e.target.dataset.i,1);renderItems();update()}});
$('#logoFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement('canvas'),s=Math.min(1,300/img.width);c.width=img.width*s;c.height=img.height*s;c.getContext('2d').drawImage(img,0,0,c.width,c.height);S.logo=c.toDataURL('image/png');bindFields();update()};img.src=rd.result};rd.readAsDataURL(f)};
const all=()=>JSON.parse(localStorage.getItem(KEY)||'{}');
function refreshList(){const a=all();$('#savedList').innerHTML='<option value="">— Load a saved estimate —</option>'+Object.keys(a).sort().reverse().map(k=>`<option>${esc(k)}</option>`).join('')}
$('#saveBtn').onclick=()=>{const a=all();const name=`${S.estNo} – ${S.custName||'No customer'}`;a[name]=S;try{localStorage.setItem(KEY,JSON.stringify(a));localStorage.setItem(KEY+'-biz',JSON.stringify({bizName:S.bizName,bizPhone:S.bizPhone,bizEmail:S.bizEmail,bizAddr:S.bizAddr,logo:S.logo,terms:S.terms}));refreshList();$('#savedList').value=name;alert('Saved: '+name)}catch(err){alert('Could not save (storage full?)')}};
$('#loadBtn').onclick=()=>{const k=$('#savedList').value;if(!k)return;S=JSON.parse(JSON.stringify(all()[k]));init()};
$('#delBtn').onclick=()=>{const k=$('#savedList').value;if(!k||!confirm('Delete '+k+'?'))return;const a=all();delete a[k];localStorage.setItem(KEY,JSON.stringify(a));refreshList()};
$('#newBtn').onclick=()=>{if(confirm('Start a new estimate? Unsaved changes will be lost.')){S=blank();init()}};
function init(){renderItems();bindFields();update()}
if(location.hash==='#demo'){Object.assign(S,{bizName:'Amos Renovation Co.',bizPhone:'(555) 201-4400',bizEmail:'office@example.com',bizAddr:'123 Main St, Springfield · Lic #45821',custName:'Linda Parker',custContact:'(555) 330-1188',jobAddr:'48 Oak Ridge Dr, Springfield',jobDesc:'Remove and replace rotted rear deck boards and railing (12x16 deck). Haul away debris.',labor:[{desc:'Lead carpenter',hours:16,rate:65},{desc:'Helper',hours:16,rate:35}],materials:[{desc:'5/4x6 treated deck boards 16ft',qty:24,cost:18.5},{desc:'Railing kit',qty:3,cost:89},{desc:'Deck screws (box)',qty:2,cost:42}],other:[{desc:'Dumpster rental',qty:1,cost:325}],taxPct:7.25,depositPct:30})}
refreshList();init();
