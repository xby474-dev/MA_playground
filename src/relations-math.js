/** Authored finite catalogue. Booleans are mathematical conclusions, NEVER inferred
 * from plot samples. Every conclusion is justified in relations-content/docs.
 * P: both partials at O. C: continuous at O. D: Frechet differentiable at O.
 * S: partials exist on an open neighbourhood and are continuous at O.
 */
export const properties = [
  { id:'P', symbol:'P', name:'偏导存在', short:'两个坐标方向', definition:'只要求 fₓ(0,0) 和 fᵧ(0,0) 两个双侧极限存在。不意味着邻域内处处有偏导，也不代表其他方向。' },
  { id:'C', symbol:'C', name:'连续', short:'所有趋近方式', definition:'对每个 ε > 0，存在 δ > 0，使得 ‖h‖ < δ 时 |f(h) − f(0)| < ε。这里必须覆盖所有附近的点。' },
  { id:'D', symbol:'D', name:'可微', short:'统一的线性近似', definition:'存在一个线性映射 L，使 |f(h) − f(0) − L(h)| / ‖h‖ → 0。如果两个偏导存在，L 只能是 fₓ(0)x + fᵧ(0)y。' },
  { id:'S', symbol:'C∂', name:'偏导连续', short:'偏导在原点连续', definition:'两个偏导先要在原点的某个开邻域内都存在，再要求它们在原点连续。这不是只知道原点的两个偏导数，也不额外要求邻域内每一点的偏导都连续。' }
];
const verdict = (P,C,D,S,neighbor,bounded) => ({P,C,D,S,neighbor,bounded});
export const models = {
  bowl: {name:'圆碗', formula:'x² + y²', group:'光滑正例', gradient:[0,0], properties:verdict(true,true,true,true,true,true), boundLabel:'精确上确界：ρ', boundKind:'exact'},
  saddle:{name:'马鞍',formula:'xy',group:'光滑正例',gradient:[0,0],properties:verdict(true,true,true,true,true,true),boundLabel:'精确上确界：ρ / 2',boundKind:'exact'},
  wave:{name:'倾斜波面',formula:'sin x cos y',group:'光滑正例',gradient:[1,0],properties:verdict(true,true,true,true,true,true),boundLabel:'统一上界：2ρ² / 3',boundKind:'bound'},
  quadratic:{name:'斜向椭圆碗',formula:'x² + xy + y²',group:'光滑正例',gradient:[0,0],properties:verdict(true,true,true,true,true,true),boundLabel:'精确上确界：3ρ / 2',boundKind:'exact'},
  ratio:{name:'轴上安静，斜向跳变',formula:'xy / (x² + y²)',group:'经典反例',extension:'f(0,0) = 0',gradient:[0,0],properties:verdict(true,false,false,false,true,false),boundLabel:'精确上确界：1 / (2ρ)',boundKind:'exact'},
  absolute:{name:'有尖角的屋顶',formula:'|x| + |y|',group:'经典反例',gradient:null,properties:verdict(false,true,false,false,false,false),boundLabel:'相对高度上确界：√2（非微分误差）',boundKind:'reference'},
  oscillation:{name:'越平坦，斜率越振荡',formula:'x² sin(1/x)',group:'经典反例',extension:'x = 0 时 f(0,y) = 0',gradient:[0,0],properties:verdict(true,true,true,false,true,true),boundLabel:'统一上界：ρ',boundKind:'bound'},
  cone:{name:'连续 + 偏导，仍不够',formula:'xy / √(x² + y²)',group:'关键桥梁',extension:'f(0,0) = 0',gradient:[0,0],properties:verdict(true,true,false,false,true,true),boundLabel:'精确上确界：1 / 2',boundKind:'exact'},
  ridge:{name:'闯关 A · 倾斜脊面',formula:'x³ / (x² + y²)',group:'迁移挑战',extension:'f(0,0) = 0',gradient:[1,0],properties:verdict(true,true,false,false,true,true),boundLabel:'精确上确界：2 / (3√3)',boundKind:'exact'},
  rational:{name:'闯关 B · 有分式也能光滑',formula:'x²y² / (x² + y²)',group:'迁移挑战',extension:'f(0,0) = 0',gradient:[0,0],properties:verdict(true,true,true,true,true,true),boundLabel:'精确上确界：ρ / 4',boundKind:'exact'},
  radial:{name:'闯关 C · 径向振荡',formula:'(x² + y²) sin(1/√(x² + y²))',group:'迁移挑战',extension:'f(0,0) = 0',gradient:[0,0],properties:verdict(true,true,true,false,true,true),boundLabel:'统一上界：ρ',boundKind:'bound'}
};
export const modelIds = Object.keys(models);
export const relations = [
  {id:'s-d',from:'S',to:'D',kind:'theorem',label:'偏导连续 → 可微',short:'连续偏导给出线性近似',example:'bowl',pair:'oscillation'},
  {id:'d-p',from:'D',to:'P',kind:'theorem',label:'可微 → 偏导存在',short:'让位移只沿坐标轴',example:'wave',pair:'cone'},
  {id:'d-c',from:'D',to:'C',kind:'theorem',label:'可微 → 连续',short:'线性项与余项一起消失',example:'quadratic',pair:'cone'},
  {id:'d-s',from:'D',to:'S',kind:'nonimplication',label:'可微 ⇏ 偏导连续',short:'函数平坦，导数仍可振荡',example:'oscillation',pair:'bowl'},
  {id:'p-d',from:'P',to:'D',kind:'nonimplication',label:'偏导存在 ⇏ 可微',short:'连续与偏导同时成立也不够',example:'cone',pair:'wave'},
  {id:'c-d',from:'C',to:'D',kind:'nonimplication',label:'连续 ⇏ 可微',short:'接近函数值，不等于一阶精确',example:'cone',pair:'quadratic'},
  {id:'p-c',from:'P',to:'C',kind:'nonimplication',label:'偏导存在 ⇏ 连续',short:'坐标轴看不到斜向跳变',example:'ratio',pair:'saddle'},
  {id:'c-p',from:'C',to:'P',kind:'nonimplication',label:'连续 ⇏ 偏导存在',short:'函数值连续，斜率可以有尖角',example:'absolute',pair:'bowl'},
  {id:'bounded-c',from:'P',to:'C',kind:'theorem',extra:'bounded',label:'邻域内偏导存在且有界 → 连续',short:'补上教材箭头上的条件',example:'oscillation',pair:'ratio'}
];
export function getRelation(id) { return relations.find(r=>r.id===id) ?? relations[0]; }
export function getModel(id) { return models[id] ?? models.bowl; }
export function value(id,x,y) {
  const r=Math.hypot(x,y),r2=x*x+y*y;
  switch(id){
    case 'bowl':return r2;
    case 'saddle':return x*y;
    case 'wave':return Math.sin(x)*Math.cos(y);
    case 'quadratic':return r2+x*y;
    case 'ratio':return r===0?0:(x/r)*(y/r);
    case 'absolute':return Math.abs(x)+Math.abs(y);
    case 'oscillation':return x===0?0:x*x*Math.sin(1/x);
    case 'cone':return r===0?0:x*y/r;
    case 'ridge':return r===0?0:x*(x/r)**2;
    case 'rational':return r===0?0:(x*y/r)**2;
    case 'radial':return r===0?0:r2*Math.sin(1/r);
    default:throw new RangeError(`Unknown model: ${id}`);
  }
}
export function partials(id,x,y) {
  const r=Math.hypot(x,y),u=r?x/r:0,v=r?y/r:0;
  switch(id){
    case 'bowl':return [2*x,2*y];
    case 'saddle':return [y,x];
    case 'wave':return [Math.cos(x)*Math.cos(y),-Math.sin(x)*Math.sin(y)];
    case 'quadratic':return [2*x+y,x+2*y];
    case 'ratio':return r===0?[0,0]:[v*(v*v-u*u)/r,u*(u*u-v*v)/r];
    case 'absolute':return [x===0?null:Math.sign(x),y===0?null:Math.sign(y)];
    case 'oscillation':return [x===0?0:2*x*Math.sin(1/x)-Math.cos(1/x),0];
    case 'cone':return r===0?[0,0]:[v**3,u**3];
    case 'ridge':return r===0?[1,0]:[u*u*(u*u+3*v*v),-2*u**3*v];
    case 'rational':return r===0?[0,0]:[2*x*v**4,2*y*u**4];
    case 'radial':return r===0?[0,0]:[2*x*Math.sin(1/r)-u*Math.cos(1/r),2*y*Math.sin(1/r)-v*Math.cos(1/r)];
    default:throw new RangeError(`Unknown model: ${id}`);
  }
}
export function direction(rho,degrees,sign=1) {
  const a=degrees*Math.PI/180;
  // Exact axes avoid fake discontinuities caused by cos(pi/2) roundoff.
  const c=Math.abs(Math.cos(a))<1e-14?0:Math.cos(a), s=Math.abs(Math.sin(a))<1e-14?0:Math.sin(a);
  return {x:sign*rho*c,y:sign*rho*s};
}
function sinMinusX(x){if(Math.abs(x)<.001){const z=x*x;return x*z*(-1/6+z*(1/120-z/5040));}return Math.sin(x)-x;}
export function linear(id,x,y) {const g=getModel(id).gradient;return g?g[0]*x+g[1]*y:null;}
export function residual(id,x,y) {
  const L=linear(id,x,y);if(L===null)return null;
  if(id==='wave')return sinMinusX(x)*Math.cos(y)-2*x*Math.sin(y/2)**2;
  if(id==='ridge'){const r=Math.hypot(x,y);return r? -x*(y/r)**2:0;}
  return value(id,x,y)-L;
}
export function sample(id,rho,angle,sign=1) {
  if(!(rho>0)||!Number.isFinite(rho))throw new RangeError('rho must be finite and positive');
  const {x,y}=direction(rho,angle,sign),f=value(id,x,y),L=linear(id,x,y),R=residual(id,x,y);
  const [fx,fy]=partials(id,x,y);
  return {rho,x,y,f,L,R,raw:R===null?null:Math.abs(R),ratio:R===null?null:Math.abs(R)/rho,reference:Math.abs(f)/rho,fx,fy,quotient:f/(rho*sign)};
}
export function uniformBound(id,rho) {
  switch(id){case 'bowl':case 'oscillation':case 'radial':return rho;case 'saddle':return rho/2;case 'wave':return 2*rho*rho/3;case 'quadratic':return 1.5*rho;case 'ratio':return .5/rho;case 'absolute':return Math.SQRT2;case 'cone':return .5;case 'ridge':return 2/(3*Math.sqrt(3));case 'rational':return rho/4;default:throw new RangeError('Unknown bound');}
}
export function relationVerdict(relationId,modelId) {
  const r=getRelation(relationId),p=getModel(modelId).properties;
  const premise=p[r.from] && (!r.extra||(p.neighbor&&p.bounded)),conclusion=p[r.to];
  return {premise,conclusion,role:!premise?'inapplicable':conclusion?'compatible':'counterexample'};
}
export function sequencePair(id,n) {
  n=Math.max(1,Math.floor(n));
  if(id==='oscillation'||id==='radial') {
    const a=1/(2*Math.PI*n),b=1/((2*n+1)*Math.PI);
    return {a:{x:a,y:0,fx:partials(id,a,0)[0],exact:-1},b:{x:b,y:0,fx:partials(id,b,0)[0],exact:1},origin:0};
  }
  if(id==='ratio')return {a:{x:0,y:1/n,fx:n,exact:n},b:{x:0,y:-1/n,fx:-n,exact:-n},origin:0};
  const a=direction(1/n,45),b=direction(1/n,225);
  return {a:{...a,fx:partials(id,a.x,a.y)[0]},b:{...b,fx:partials(id,b.x,b.y)[0]},origin:getModel(id).gradient?.[0]??null};
}
export function slopeQuotients(id,t) {
  if(!(t>0))throw new RangeError('Use positive t');
  return {xPlus:value(id,t,0)/t,xMinus:value(id,-t,0)/(-t),yPlus:value(id,0,t)/t,yMinus:value(id,0,-t)/(-t)};
}
export function relationRows(s) {return Array.from({length:101},(_,i)=>({q:i/25,...sample(s.fn,10**(-i/25),s.angle,s.sign),uniform_bound:uniformBound(s.fn,10**(-i/25))}));}
/** Split the discontinuous slice at the isolated point. Never fill in a false limit. */
export function sliceSegments(id,angle,extent,count=160) {
  const segments=[[]];
  for(let i=0;i<=count;i++){
    const t=extent*(2*i/count-1);
    if(id==='ratio'&&i===count/2){segments.push([]);continue;}
    const p=direction(Math.abs(t),angle,t<0?-1:1);segments.at(-1).push({t,z:value(id,p.x,p.y),L:linear(id,p.x,p.y)});
  }
  return segments.filter(a=>a.length>1);
}
export function planeLabel(id) {
  const m=getModel(id);if(!m.gradient)return '未定义：两个偏导不同时存在';
  return `${m.properties.D?'切平面':'候选平面（不是切平面）'}：z = ${m.gradient[0]===1?'x':'0'}`;
}
