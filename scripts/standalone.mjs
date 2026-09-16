/** Bundle this dependency-free, local named-export module graph into one HTML file.
 * Not a general-purpose JS bundler: reject unsupported imports instead of guessing.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
const order = ['math','relations-math','relations-state','field-math','field-state','state','icons','plots','content','relations-plots','relations-content','relations-lab','field-plots','field-content','field-lab','app'];
export async function makeStandalone(root, out) {
  let js='(() => {\n"use strict";\nconst __modules = {};\n';
  for (const name of order) {
    let code=await readFile(`${root}/src/${name}.js`,'utf8');
    const exported=[...code.matchAll(/^export\s+(?:async\s+)?(?:function|class|const|let)\s+(\w+)/gm)].map(m=>m[1]);
    code=code.replace(/^import\s+\{([^}]+)\}\s+from\s+['"]\.\/([\w-]+)\.js['"];?$/gm,(_,names,dep)=>{
      if(order.indexOf(dep)>=order.indexOf(name))throw new Error(`Module order violation: ${name} -> ${dep}`);
      if(names.includes(' as '))throw new Error('Aliased imports need a real bundler');
      return `const {${names}} = __modules["${dep}"];`;
    });
    if(/^import\s/m.test(code))throw new Error(`Unsupported import in ${name}`);
    code=code.replace(/^export\s+/gm,'');
    js+=`__modules["${name}"] = (() => {\n${code}\nreturn {${exported.join(',')}};\n})();\n`;
  }
  js+='})();';
  const check=spawnSync(process.execPath,['--check','--input-type=commonjs'],{input:js,encoding:'utf8'});
  if(check.status)throw new Error(check.stderr);
  let html=await readFile(`${root}/index.html`,'utf8');
  const css=await readFile(`${root}/styles/app.css`,'utf8');
  const fieldCss=await readFile(`${root}/styles/fields.css`,'utf8');
  const relationsCss=await readFile(`${root}/styles/relations.css`,'utf8');
  const favicon=await readFile(`${root}/assets/favicon.svg`,'utf8');
  html=html.replace('<link rel="stylesheet" href="./styles/app.css">',`<style>${css}\n${fieldCss}\n${relationsCss}</style>`)
    .replace('<link rel="stylesheet" href="./styles/fields.css">','')
    .replace('<link rel="stylesheet" href="./styles/relations.css">','')
    .replace('<script type="module" src="./src/app.js"></script>','')
    .replace('href="./assets/favicon.svg"',`href="data:image/svg+xml,${encodeURIComponent(favicon)}"`)
    .replace('</body>',`<script>${js.replace(/<\/script/gi,'<\\/script')}</script>\n</body>`);
  await writeFile(`${out}/standalone.html`,html);
}
