// Pure math, shared by app and tests
(function(root){
function r2(n){return Math.round((n+Number.EPSILON)*100)/100}
function compute(s){
  const sum=(arr,f)=>arr.reduce((a,x)=>a+f(x),0);
  const labor=sum(s.labor||[],x=>(+x.hours||0)*(+x.rate||0));
  const materials=sum(s.materials||[],x=>(+x.qty||0)*(+x.cost||0));
  const other=sum(s.other||[],x=>(+x.qty||0)*(+x.cost||0));
  const direct=labor+materials+other;
  const overhead=direct*(+s.overheadPct||0)/100;
  const cost=direct+overhead;
  const p=(+s.profitPct||0)/100;
  let price;
  if(s.mode==='margin'){ if(p>=1) return {error:'Margin must be under 100%'}; price=cost/(1-p);} else price=cost*(1+p);
  const profit=price-cost;
  const factor=cost>0?price/cost:1;
  const t=(+s.taxPct||0)/100;
  // tax on materials: taxed at their marked-up selling price share
  const taxBase=s.taxOn==='total'?price:materials*(1+(+s.overheadPct||0)/100)*factor;
  const tax=taxBase*t;
  const total=price+tax;
  const deposit=total*(+s.depositPct||0)/100;
  return {labor:r2(labor),materials:r2(materials),other:r2(other),direct:r2(direct),overhead:r2(overhead),cost:r2(cost),price:r2(price),profit:r2(profit),factor,taxBase:r2(taxBase),tax:r2(tax),total:r2(total),deposit:r2(deposit),balance:r2(total-deposit)};
}
root.EstCalc={compute,r2};
if(typeof module!=='undefined')module.exports={compute,r2};
})(typeof window!=='undefined'?window:globalThis);
