/** Exact, rational witnesses. No numerical limit or completeness detector.
 * Arithmetic selects the dyadic brackets using BigInt cross-products.
 * Conversion to Number is for plotting/approximate labels ONLY.
 */
export const completenessNodes = [
 {id:'sup',short:'上确界',name:'上确界原理',code:'LUB',question:'上界有很多，最小的那个在哪里？'},
 {id:'mono',short:'单调有界',name:'单调有界定理',code:'MCT',question:'一直前进却不越界，一定有终点吗？'},
 {id:'nested',short:'闭区间套',name:'闭区间套定理',code:'NIP',question:'每一层都非空，无限层还剩下什么？'},
 {id:'bw',short:'收敛子列',name:'Bolzano–Weierstrass 定理',code:'BW',question:'整体来回跳，能选出一条收敛的路吗？'},
 {id:'cauchy',short:'Cauchy 完备',name:'Cauchy 完备性',code:'CC',question:'彼此越来越近，终点就一定在这里吗？'}
];
export const completenessEdges = [
 {id:'sup-mono',from:'sup',to:'mono',verb:'取值域的上确界'},
 {id:'mono-nested',from:'mono',to:'nested',verb:'追踪左端点'},
 {id:'nested-bw',from:'nested',to:'bw',verb:'二分，保留无限多项'},
 {id:'bw-cauchy',from:'bw',to:'cauchy',verb:'让子列带回全列'},
 {id:'cauchy-sup',from:'cauchy',to:'sup',verb:'二分夹出最小上界'}
];
export const completenessTargets = {
 two:{id:'two',num:2n,den:1n,label:'√2',parameter:'2',rational:false,description:'经典缺失点'},
 three:{id:'three',num:3n,den:1n,label:'√3',parameter:'3',rational:false,description:'同一机制，不同位置'},
 rational:{id:'rational',num:9n,den:4n,label:'3/2',parameter:'9/4',rational:true,description:'有理终点 · 正常对照'}
};
export function cpTarget(id){return completenessTargets[id]??completenessTargets.two;}
export function cpNode(id){return completenessNodes.find(n=>n.id===id)??completenessNodes[0];}
export function cpEdge(id){return completenessEdges.find(e=>e.id===id)??completenessEdges[0];}
export function cpGcd(a,b){a=a<0n?-a:a;b=b<0n?-b:b;while(b){[a,b]=[b,a%b];}return a;}
export function rational(p,q=1n){p=BigInt(p);q=BigInt(q);if(!q)throw new RangeError('分母不能为零');if(q<0n){p=-p;q=-q;}const g=cpGcd(p,q);return {p:p/g,q:q/g};}
export function radd(a,b){return rational(a.p*b.q+b.p*a.q,a.q*b.q);}
export function rsub(a,b){return rational(a.p*b.q-b.p*a.q,a.q*b.q);}
export function rmul(a,b){return rational(a.p*b.p,a.q*b.q);}
export function rdiv(a,b){return rational(a.p*b.q,a.q*b.p);}
export function rcompare(a,b){const d=a.p*b.q-b.p*a.q;return d>0n?1:d<0n?-1:0;}
export function rabs(a){return rational(a.p<0n?-a.p:a.p,a.q);}
export function rnumber(a){return Number(a.p)/Number(a.q);}
export function rtext(a){return a.q===1n?String(a.p):`${a.p}/${a.q}`;}
export function parseRational(text){
 const s=String(text).trim();if(!/^[+-]?\d{1,8}(?:\/\d{1,8}|\.\d{1,8})?$/.test(s))return null;
 try{if(s.includes('/')){const [p,q]=s.split('/');return rational(p,q);}if(s.includes('.')){const [p,f]=s.split('.');const neg=p.startsWith('-');const q=10n**BigInt(f.length);return rational(BigInt(p)*q+(neg?-1n:1n)*BigInt(f),q);}return rational(s);}catch{return null;}
}
export function exactBrackets(targetId='two',steps=8){
 if(!Number.isInteger(steps)||steps<0||steps>512)throw new RangeError('构造层数必须是 0 到 512 的整数');
 const d=cpTarget(targetId);const rows=[];let p=1n,q=1n;
 for(let n=0;n<=steps;n++){
  rows.push({n,a:rational(p,q),b:rational(p+1n,q),width:rational(1n,q),denominator:q,lowerNumerator:p,
   residual:rational(d.num*q*q-d.den*p*p,d.den*q*q),hit:d.den*p*p===d.num*q*q});
  const mid=2n*p+1n,den=2n*q;
  p=d.den*mid*mid<=d.num*den*den?mid:2n*p;q=den;
 }
 return rows;
}
export function bracketAt(target,n){return exactBrackets(target,n)[n];}
export function squareCompare(q,target){const t=cpTarget(target);return rcompare(rmul(q,q),rational(t.num,t.den));}
/** Algebraic witness for failure of an alleged supremum. Works without √d. */
export function upperBoundWitness(q,target){
 const d=cpTarget(target),D=rational(d.num,d.den),zero=rational(0),one=rational(1),two=rational(2);
 if(rcompare(q,zero)<0)return {kind:'not-upper',candidate:q,witness:zero};
 const cmp=squareCompare(q,target);
 if(cmp<0){const gap=rsub(D,rmul(q,q));const h0=rdiv(gap,rmul(two,radd(rmul(two,q),one)));const h=rcompare(h0,one)<0?h0:one;return {kind:'not-upper',candidate:q,witness:radd(q,h),h};}
 if(cmp>0)return {kind:'not-least',candidate:q,witness:rdiv(radd(q,rdiv(D,q)),two)};
 return {kind:'least-upper',candidate:q,witness:q};
}
export function cauchyCertificate(target,N,e=5,mOffset=3,nOffset=47){
 if(![N,e,mOffset,nOffset].every(Number.isInteger)||N<0||e<0||e>32||mOffset<0||nOffset<0||N+Math.max(mOffset,nOffset)>512)throw new RangeError('非法 Cauchy 参数');
 const rows=exactBrackets(target,N+Math.max(mOffset,nOffset));
 const m=N+mOffset,n=N+nOffset,a=rows[m].a,b=rows[n].a,delta=rabs(rsub(a,b)),epsilon=rational(1n,2n**BigInt(e)),bound=rows[N].width;
 return {m,n,a,b,delta,epsilon,bound,certified:rcompare(bound,epsilon)<0,suggestedN:e+1};
}
export function subsequenceData(target,N,parity='all'){
 return exactBrackets(target,N).map(r=>({index:r.n,value:r.n%2?rational(-r.a.p,r.a.q):r.a,selected:parity==='all'||(parity==='even'?r.n%2===0:r.n%2===1)}));
}
export function implicationPath(from,to){
 if(!completenessNodes.some(n=>n.id===from)||!completenessNodes.some(n=>n.id===to))return [];
 const path=[];let cur=from;while(cur!==to&&path.length<5){const edge=completenessEdges.find(e=>e.from===cur);path.push(edge.id);cur=edge.to;}return path;
}
/** Universal theorem status != a single witness's behaviour. */
export function domainVerdict(domain,target){const t=cpTarget(target);return {universal:domain==='R',exampleHasLimit:domain==='R'||t.rational,ambientLabel:t.label,limitInQ:t.rational};}
export function completenessCSV(s){
 const rows=exactBrackets(s.target,s.n);return '# MA Playground v1.3; exact finite rational construction, NOT an infinite-process proof\n'+`# domain=${s.domain}; d=${cpTarget(s.target).parameter}; a_n^2<=d<b_n^2; width=2^-n; decimals only for display\n`+'n,a_n,b_n,width,d_minus_a_squared,exact_root_hit\n'+rows.map(r=>[r.n,rtext(r.a),rtext(r.b),rtext(r.width),rtext(r.residual),r.hit].join(',')).join('\n')+'\n';
}
